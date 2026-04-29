import joblib
import pandas as pd
import numpy as np
import requests
import os
from datetime import datetime, timedelta

from dotenv import load_dotenv
load_dotenv()


# ================================
# LOAD MODELS
# ================================
# Get the directory of this file
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BACKEND_DIR, "models")

try:
    xgb_model = joblib.load(os.path.join(MODELS_DIR, "xgb_model.pkl"))
    feature_cols = joblib.load(os.path.join(MODELS_DIR, "feature_cols.pkl"))
    threshold_val = joblib.load(os.path.join(MODELS_DIR, "threshold.pkl"))
    threshold = threshold_val if isinstance(threshold_val, (int, float)) else 0.5
    print(f"✓ Models loaded successfully from {MODELS_DIR}")
except Exception as e:
    print(f"✗ Error loading models from {MODELS_DIR}: {e}")
    import traceback
    traceback.print_exc()
    xgb_model = None
    feature_cols = None
    threshold = 0.5

# ================================
# CONSTANTS
# ================================
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
MAX_FORECAST_DAYS = 5

# ================================
# HELPER FUNCTIONS
# ================================
def get_day_of_year(date_str):
    """Convert date string to day of year"""
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    return date_obj.timetuple().tm_yday

def get_month(date_str):
    """Extract month from date string"""
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    return date_obj.month

def get_sin_cos_month(month):
    """Convert month to sin/cos for cyclical encoding"""
    sin_month = np.sin(2 * np.pi * month / 12)
    cos_month = np.cos(2 * np.pi * month / 12)
    return sin_month, cos_month

def validate_date(date_str):
    """Validate that date is within next 5 days"""
    try:
        selected_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        today = datetime.now().date()
        
        days_diff = (selected_date - today).days
        
        if days_diff < 0:
            return False, "Cannot select past dates"
        if days_diff > MAX_FORECAST_DAYS:
            return False, f"Forecast data unavailable beyond {MAX_FORECAST_DAYS} days"
        
        return True, ""
    except Exception as e:
        return False, f"Invalid date format: {str(e)}"

def fetch_forecast_data(city):
    """
    Fetch 5-day forecast from OpenWeather API
    Returns list of forecast entries
    """
    try:
        url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data.get("list", [])
    except Exception as e:
        raise Exception(f"Error fetching forecast: {str(e)}")

def find_matching_forecast(forecast_list, target_date):
    """
    Find forecast entry closest to target date
    Forecast API returns data every 3 hours
    """
    target_dt = datetime.strptime(target_date, "%Y-%m-%d")
    target_dt = target_dt.replace(hour=12, minute=0, second=0)  # noon
    
    best_match = None
    min_diff = float('inf')
    
    for entry in forecast_list:
        entry_dt = datetime.fromtimestamp(entry['dt'])
        diff = abs((entry_dt - target_dt).total_seconds())
        
        if diff < min_diff:
            min_diff = diff
            best_match = entry
    
    return best_match

def extract_features(forecast_entry, date_str):
    """
    Extract features from forecast entry
    Returns feature vector
    """
    if not forecast_entry:
        raise Exception("No forecast data available")
    
    # Extract weather metrics
    main = forecast_entry.get('main', {})
    rain_data = forecast_entry.get('rain', {})
    
    temp = main.get('temp', 0)
    temp_max = main.get('temp_max', 0)
    temp_min = main.get('temp_min', 0)
    prcp = rain_data.get('3h', 0)  # 3-hour rainfall
    
    # Calculate additional features
    month = get_month(date_str)
    doy = get_day_of_year(date_str)
    sin_month, cos_month = get_sin_cos_month(month)
    trange = temp_max - temp_min
    
    # Create feature dictionary
    features = {
        'PRCP': prcp,
        'TMAX': temp_max,
        'TMIN': temp_min,
        'TAVG': temp,
        'TRANGE': trange,
        'MONTH': month,
        'DOY': doy,
        'SIN_MONTH': sin_month,
        'COS_MONTH': cos_month
    }
    
    return features, temp, prcp

def build_feature_vector(features, feature_cols_list):
    """
    Build feature vector in correct order
    Fill missing features with 0
    """
    vector = []
    for col in feature_cols_list:
        vector.append(features.get(col, 0))
    return np.array([vector])

def apply_domain_logic(features, probability):
    """
    Apply safety overrides based on physical thresholds
    Domain logic takes precedence over model
    """
    prcp = features.get('PRCP', 0)
    tmax = features.get('TMAX', 0)
    tmin = features.get('TMIN', 0)
    
    # Override detection logic
    if prcp > 100:
        return {
            'riskType': 'Heavy Rain',
            'isExtreme': True,
            'probability': min(0.95, probability)
        }
    elif tmax > 40:
        return {
            'riskType': 'Heatwave',
            'isExtreme': True,
            'probability': min(0.95, probability)
        }
    elif tmin < 5:
        return {
            'riskType': 'Cold Wave',
            'isExtreme': True,
            'probability': min(0.95, probability)
        }
    
    # Determine risk type from probability threshold
    if probability >= threshold:
        # Infer risk type from features
        if prcp > 30:
            risk_type = 'Heavy Rain'
        elif tmax > 35:
            risk_type = 'Heatwave'
        elif tmin < 10:
            risk_type = 'Cold Wave'
        else:
            risk_type = 'Heavy Rain'
        
        return {
            'riskType': risk_type,
            'isExtreme': True,
            'probability': probability
        }
    else:
        return {
            'riskType': 'Normal',
            'isExtreme': False,
            'probability': probability
        }

# ================================
# MAIN PREDICTION FUNCTION
# ================================
def predict_extreme_weather(city, date):
    """
    Main function to predict extreme weather
    Returns prediction result
    """
    try:
        # Validate input
        is_valid, message = validate_date(date)
        if not is_valid:
            return {
                "error": message,
                "success": False
            }
        
        # Check if models are loaded
        if xgb_model is None or feature_cols is None:
            return {
                "error": "Models not loaded. Please ensure model files exist in models/ directory",
                "success": False
            }
        
        # Fetch forecast data
        forecast_list = fetch_forecast_data(city)
        if not forecast_list:
            return {
                "error": f"No forecast data available for {city}. Please check city name.",
                "success": False
            }
        
        # Find matching forecast entry
        forecast_entry = find_matching_forecast(forecast_list, date)
        if not forecast_entry:
            return {
                "error": "Cannot find matching forecast data for the selected date",
                "success": False
            }
        
        # Extract features
        features, temp, prcp = extract_features(forecast_entry, date)
        
        # Build feature vector
        feature_vector = build_feature_vector(features, feature_cols)
        
        # Get model prediction probability
        predictions_proba = xgb_model.predict_proba(feature_vector)
        extreme_probability = float(predictions_proba[0][1])  # Probability of extreme class
        
        # Apply domain logic
        result = apply_domain_logic(features, extreme_probability)
        
        # Build response
        return {
            "success": True,
            "probability": extreme_probability,
            "isExtreme": result['isExtreme'],
            "riskType": result['riskType'],
            "weather": {
                "temp": round(temp, 2),
                "rain": round(prcp, 2)
            },
            "city": city,
            "date": date
        }
    
    except Exception as e:
        import traceback
        print(f"Error in predict_extreme_weather: {traceback.format_exc()}")
        return {
            "error": f"Prediction error: {str(e)}",
            "success": False
        }
