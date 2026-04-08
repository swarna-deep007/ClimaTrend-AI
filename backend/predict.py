import pandas as pd
import joblib

# ================================
# LOAD MODELS
# ================================
india_temp_model = joblib.load("models/india_temp_sarima_model.pkl")
india_rain_model = joblib.load("models/india_rain_sarima_model.pkl")
japan_temp_model = joblib.load("models/japan_temp_sarima_model.pkl")
japan_rain_model = joblib.load("models/japan_rain_sarima_model.pkl")


# ================================
# GENERATE FORECAST SERIES
# ================================
def generate_series(model):
    forecast = model.get_forecast(steps=5*12)
    index = pd.date_range(start="2025-01-31", periods=5*12, freq="ME")
    return pd.Series(forecast.predicted_mean.values, index=index)


india_temp_series = generate_series(india_temp_model)
india_rain_series = generate_series(india_rain_model)
japan_temp_series = generate_series(japan_temp_model)
japan_rain_series = generate_series(japan_rain_model)


# ================================
# HELPER FUNCTIONS
# ================================
def f_to_c(f):
    return round((f - 32) * 5 / 9, 2)


def get_seasonal_factor(month, prediction_type):
    """
    Returns seasonal adjustment factor based on month and prediction type
    - Monsoon months (Jun-Sep): Higher rainfall
    - Summer months (Mar-May): Higher temperature
    - Winter months (Nov-Feb): Lower temperature
    """
    if prediction_type == "temperature":
        # Summer months (March-May): +2°C to +3°C increase
        if month in [3, 4, 5]:
            return 2.5
        # Winter months (November-February): -1.5°C decrease
        elif month in [11, 12, 1, 2]:
            return -1.5
        # Moderate in other months
        else:
            return 0.0
    else:  # rainfall
        # Monsoon months (June-September): +40% more rainfall
        if month in [6, 7, 8, 9]:
            return 40.0  # mm
        # Post-monsoon (Oct): +15mm
        elif month == 10:
            return 15.0
        # Summer (Mar-May): -30% less rainfall
        elif month in [3, 4, 5]:
            return -30.0
        # Winter (Nov-Feb): low rainfall
        elif month in [11, 12, 1, 2]:
            return -20.0
        else:
            return 0.0


def get_daily_variation(day_of_month, prediction_type):
    """
    Add realistic daily variation within a month
    Different days should have slightly different values
    """
    # Create variation from 0.5 to 1.5 depending on day
    normalized_day = (day_of_month - 1) / 30.0  # 0 to 1
    
    if prediction_type == "temperature":
        # Temperature variation: ±0.5°C within month
        return round((normalized_day - 0.5) * 1.0, 2)
    else:  # rainfall
        # Rainfall variation: ±5mm within month
        return round((normalized_day - 0.5) * 10.0, 2)


# ================================
# CITY OFFSETS - MORE REALISTIC & DIVERSE
# Based on real climate differences from country average
# ================================
CITY_TEMP_OFFSETS = {
    # India - Coastal, Plains, Plateau, Himalayan
    "mumbai":    +2.5,      # Coastal
    "delhi":     +4.0,      # Northern Plains
    "chennai":   +3.0,      # Southern Coastal
    "kolkata":   +1.5,      # Eastern
    "bangalore": -3.0,      # Plateau
    "hyderabad": +2.0,      # Deccan
    "jaipur":    +5.0,      # Desert
    "shimla":    -12.0,     # Himalayan
    "pune":      -1.0,      # Western Ghats
    "ahmedabad": +4.5,      # Gujarat
    "indore":    +2.5,      # Central
    "lucknow":   +3.5,      # Northern
    "kochi":     +1.0,      # Kerala Coast
    "goa":       +2.0,      # Western Coast
    "varanasi":  +2.5,      # Northern Plains
    "patna":     +1.0,      # Eastern Plains
    "chandigarh": +3.0,     # Foothills
    "thiruvananthapuram": -1.0,  # Southern Tip
    "nagpur":    +3.0,      # Central
    "surat":     +3.5,      # Gujarat Coast
    # Japan - Northern, Central, Southern, Islands
    "tokyo":     0.0,       # Central
    "osaka":     +1.0,      # Western
    "sapporo":   -6.0,      # Northern
    "fukuoka":   +1.5,      # Southern
    "kyoto":     +0.5,      # Central
    "nagoya":    +0.5,      # Central
    "yokohama":  -0.5,      # Central Coast
    "kobe":      +1.0,      # Western Coast
    "hakodate":  -5.5,      # Northern Coast
    "hiroshima": +1.5,      # Southern
    "sendai":    -2.0,      # Northern
    "kawasaki":  0.0,       # Central
}

CITY_RAIN_OFFSETS = {
    # India
    "mumbai":    +80.0,     # Heavy Monsoon
    "chennai":   +30.0,     # Monsoon
    "kolkata":   +40.0,     # Monsoon
    "bangalore": +20.0,     # Moderate
    "delhi":     -10.0,     # Low
    "jaipur":    -20.0,     # Very Low (Desert)
    "shimla":    +10.0,     # Moderate
    "hyderabad": +10.0,     # Moderate
    "pune":      +15.0,     # Moderate
    "ahmedabad": -15.0,     # Very Low
    "indore":    +5.0,      # Low-Moderate
    "lucknow":   +8.0,      # Low-Moderate
    "kochi":     +120.0,    # Very Heavy (Monsoon)
    "goa":       +100.0,    # Heavy Monsoon
    "varanasi":  +12.0,     # Low-Moderate
    "patna":     +15.0,     # Low-Moderate
    "chandigarh": +5.0,     # Low
    "thiruvananthapuram": +90.0,  # Heavy Monsoon
    "nagpur":    +8.0,      # Low-Moderate
    "surat":     +50.0,     # Moderate-High
    # Japan
    "tokyo":     +15.0,     # Moderate
    "osaka":     +10.0,     # Moderate
    "sapporo":   -5.0,      # Low (Snow Region)
    "fukuoka":   +10.0,     # Moderate
    "kyoto":     +5.0,      # Moderate
    "nagoya":    +5.0,      # Moderate
    "yokohama":  +10.0,     # Moderate
    "kobe":      +8.0,      # Moderate
    "hakodate":  -10.0,     # Low (Snow Region)
    "hiroshima": +12.0,     # Moderate-High
    "sendai":    -8.0,      # Low
    "kawasaki":  +12.0,     # Moderate
}

# ================================
# GET AVAILABLE CITIES BY COUNTRY
# ================================
def get_cities(country):
    """Returns sorted list of available cities for a country"""
    country = country.lower()
    india_cities = ['Ahmedabad', 'Bangalore', 'Chandigarh', 'Chennai', 'Delhi', 'Goa', 'Hyderabad', 'Indore', 'Jaipur', 'Kochi', 'Kolkata', 'Lucknow', 'Mumbai', 'Nagpur', 'Patna', 'Pune', 'Shimla', 'Surat', 'Thiruvananthapuram', 'Varanasi']
    japan_cities = ['Fukuoka', 'Hakodate', 'Hiroshima', 'Kawasaki', 'Kobe', 'Kyoto', 'Nagoya', 'Osaka', 'Sapporo', 'Sendai', 'Tokyo', 'Yokohama']
    
    if country == 'india':
        return sorted(india_cities)
    elif country == 'japan':
        return sorted(japan_cities)
    return []


# ================================
# MAIN FUNCTION
# ================================
def predict_weather(data):
    try:
        country = data.country.lower()
        city_key = data.city.lower().strip()
        prediction_type = data.prediction_type.lower()

        # Convert date - keep original date for monthly lookup
        date = pd.to_datetime(data.date)
        original_day = date.day
        original_month = date.month
        
        # For series lookup, use end of month
        date_for_lookup = date + pd.offsets.MonthEnd(0)

        # 🔹 Select correct series
        if country == "india" and prediction_type == "temperature":
            series = india_temp_series
            unit = "°C"

        elif country == "india" and prediction_type == "rainfall":
            series = india_rain_series
            unit = "mm"

        elif country == "japan" and prediction_type == "temperature":
            series = japan_temp_series
            unit = "°C"

        elif country == "japan" and prediction_type == "rainfall":
            series = japan_rain_series
            unit = "mm"

        else:
            return {
                "location": f"{data.country}, {data.city}",
                "date": data.date,
                "value": "N/A",
                "classification": "Not Available"
            }

        # Get base value from monthly series
        if date_for_lookup in series:
            value = series[date_for_lookup]
        else:
            value = series.iloc[-1]

        value = float(value)

        # ✅ Convert F to C + apply city offset
        if prediction_type == "temperature":
            value = f_to_c(value)
            value = round(value + CITY_TEMP_OFFSETS.get(city_key, 0.0), 2)
            
            # Add seasonal adjustment for realistic month-wise data
            seasonal_adj = get_seasonal_factor(original_month, prediction_type)
            value = round(value + seasonal_adj, 2)
            
            # Add daily variation within month
            daily_var = get_daily_variation(original_day, prediction_type)
            value = round(value + daily_var, 2)
        else:
            value = round(value + CITY_RAIN_OFFSETS.get(city_key, 0.0), 2)
            
            # Add seasonal adjustment for realistic month-wise rainfall
            seasonal_adj = get_seasonal_factor(original_month, prediction_type)
            value = round(value + seasonal_adj, 2)
            
            # Add daily variation within month
            daily_var = get_daily_variation(original_day, prediction_type)
            value = round(value + daily_var, 2)
            
            # Ensure rainfall is never negative
            value = max(0, value)

        # 🔹 Classification logic
        if prediction_type == "temperature":
            if value > 45:
                classification = "Extreme"
            elif value > 30:
                classification = "Moderate"
            else:
                classification = "Normal"
        else:
            if value > 100:
                classification = "Extreme"
            elif value > 20:
                classification = "Moderate"
            else:
                classification = "Normal"

        # 🔹 Get next 6 months trend data - WITH REALISTIC VARIATION
        trend_data = []
        for i in range(6):
            trend_date = date_for_lookup + pd.DateOffset(months=i)
            if trend_date in series.index:
                trend_value = float(series[trend_date])
            else:
                trend_value = float(series.iloc[min(i, len(series)-1)])

            # ✅ Convert and apply city offset in trend too
            if prediction_type == "temperature":
                trend_value = f_to_c(trend_value)
                trend_value = round(trend_value + CITY_TEMP_OFFSETS.get(city_key, 0.0), 2)
                
                # Add seasonal factor for trend month
                trend_month = trend_date.month
                seasonal_adj = get_seasonal_factor(trend_month, prediction_type)
                trend_value = round(trend_value + seasonal_adj, 2)
            else:
                trend_value = round(trend_value + CITY_RAIN_OFFSETS.get(city_key, 0.0), 2)
                
                # Add seasonal factor for trend month
                trend_month = trend_date.month
                seasonal_adj = get_seasonal_factor(trend_month, prediction_type)
                trend_value = round(trend_value + seasonal_adj, 2)
                
                # Ensure rainfall is never negative
                trend_value = max(0, trend_value)

            trend_data.append({
                "month": trend_date.strftime("%b %Y"),
                "value": trend_value
            })

        return {
            "location": f"{data.country}, {data.city}",
            "date": data.date,
            "value": f"{value} {unit}",
            "classification": classification,
            "prediction_type": prediction_type,
            "unit": unit,
            "numeric_value": value,
            "trend": trend_data
        }

    except Exception as e:
        return {
            "location": f"{data.country}, {data.city}",
            "date": data.date,
            "value": "Error",
            "classification": "Error",
            "debug": str(e)
        }
