"""
weather_history.py - Historical weather data management and feature engineering

Purpose:
- Store historical weather observations (30 days per city)
- Bootstrap historical data from Open-Meteo (no API key required)
- Build engineered features for XGBoost model prediction
- Reconstruction of training-time feature engineering at inference time

Author: Climate AI
"""

import json
import os
from pathlib import Path
from datetime import datetime, timedelta
import numpy as np
from urllib.request import urlopen
from urllib.parse import urlencode
import math

# ============================================================================
# CITY COORDINATES (lat, lon, elevation_m)
# ============================================================================

CITY_COORDS = {
    # Major Indian Cities
    "Mumbai": (19.0760, 72.8777, 14),
    "Delhi": (28.7041, 77.1025, 216),
    "Bangalore": (12.9716, 77.5946, 920),
    "Hyderabad": (17.3850, 78.4867, 505),
    "Chennai": (13.0827, 80.2707, 7),
    "Kolkata": (22.5726, 88.3639, 9),
    "Pune": (18.5204, 73.8567, 560),
    "Ahmedabad": (23.0225, 72.5714, 53),
    "Jaipur": (26.9124, 75.7873, 431),
    "Lucknow": (26.8467, 80.9462, 129),
    "Chandigarh": (30.7333, 76.7794, 320),
    "Indore": (22.7196, 75.8577, 553),
    "Goa": (15.2993, 73.8243, 50),
    "Coimbatore": (11.0061, 76.9560, 411),
    "Surat": (21.1458, 72.8326, 13),
    "Nagpur": (21.1458, 79.0882, 310),
    "Bhopal": (23.1815, 77.4104, 499),
    "Vadodara": (22.3072, 73.1812, 39),
    "Patna": (25.5941, 85.1376, 53),
    "Ranchi": (23.3441, 85.3096, 651),
    "Srinagar": (34.0837, 74.7973, 1730),
    "Leh": (34.1526, 77.5771, 3524),
    "Shimla": (31.7775, 77.1577, 2202),
    "Darjeeling": (27.0360, 88.2605, 2050),
    "Ooty": (11.4102, 76.6955, 2240),
}

# ============================================================================
# MONTHLY CLIMATOLOGY (for Z-score baseline in feature engineering)
# ============================================================================

MONTHLY_CLIMATOLOGY = {
    "Mumbai": {
        1: {"tmax": 32.2, "tmin": 19.5, "prcp": 0.0, "tmax_std": 1.5, "tmin_std": 2.0, "prcp_std": 0.1},
        2: {"tmax": 34.1, "tmin": 21.0, "prcp": 0.0, "tmax_std": 1.8, "tmin_std": 1.8, "prcp_std": 0.1},
        3: {"tmax": 35.0, "tmin": 24.0, "prcp": 0.3, "tmax_std": 1.8, "tmin_std": 1.5, "prcp_std": 0.5},
        4: {"tmax": 35.0, "tmin": 24.0, "prcp": 0.1, "tmax_std": 1.8, "tmin_std": 1.5, "prcp_std": 0.5},
        5: {"tmax": 33.5, "tmin": 26.0, "prcp": 8.0, "tmax_std": 2.0, "tmin_std": 1.5, "prcp_std": 12.0},
        6: {"tmax": 30.0, "tmin": 25.5, "prcp": 52.0, "tmax_std": 2.0, "tmin_std": 1.5, "prcp_std": 40.0},
        7: {"tmax": 29.5, "tmin": 25.2, "prcp": 68.0, "tmax_std": 1.8, "tmin_std": 1.2, "prcp_std": 45.0},
        8: {"tmax": 29.0, "tmin": 25.0, "prcp": 60.0, "tmax_std": 1.8, "tmin_std": 1.2, "prcp_std": 42.0},
        9: {"tmax": 30.5, "tmin": 24.5, "prcp": 45.0, "tmax_std": 1.8, "tmin_std": 1.3, "prcp_std": 35.0},
        10: {"tmax": 32.5, "tmin": 23.0, "prcp": 8.0, "tmax_std": 1.6, "tmin_std": 1.5, "prcp_std": 10.0},
        11: {"tmax": 33.0, "tmin": 21.0, "prcp": 1.0, "tmax_std": 1.5, "tmin_std": 1.8, "prcp_std": 2.0},
        12: {"tmax": 32.0, "tmin": 19.8, "prcp": 0.0, "tmax_std": 1.4, "tmin_std": 2.0, "prcp_std": 0.1},
    },
    "Delhi": {
        1: {"tmax": 21.5, "tmin": 9.0, "prcp": 0.3, "tmax_std": 2.0, "tmin_std": 2.2, "prcp_std": 0.8},
        2: {"tmax": 24.4, "tmin": 11.5, "prcp": 0.2, "tmax_std": 2.2, "tmin_std": 2.2, "prcp_std": 0.6},
        3: {"tmax": 31.0, "tmin": 16.5, "prcp": 0.1, "tmax_std": 2.5, "tmin_std": 2.0, "prcp_std": 0.4},
        4: {"tmax": 37.0, "tmin": 22.0, "prcp": 0.2, "tmax_std": 2.8, "tmin_std": 2.0, "prcp_std": 0.5},
        5: {"tmax": 39.5, "tmin": 26.5, "prcp": 1.8, "tmax_std": 2.5, "tmin_std": 1.8, "prcp_std": 4.0},
        6: {"tmax": 38.0, "tmin": 27.5, "prcp": 10.5, "tmax_std": 2.5, "tmin_std": 1.8, "prcp_std": 15.0},
        7: {"tmax": 35.0, "tmin": 26.5, "prcp": 17.5, "tmax_std": 2.2, "tmin_std": 1.5, "prcp_std": 20.0},
        8: {"tmax": 34.5, "tmin": 25.8, "prcp": 15.0, "tmax_std": 2.2, "tmin_std": 1.5, "prcp_std": 18.0},
        9: {"tmax": 33.5, "tmin": 24.5, "prcp": 10.0, "tmax_std": 2.0, "tmin_std": 1.6, "prcp_std": 14.0},
        10: {"tmax": 31.5, "tmin": 18.5, "prcp": 1.2, "tmax_std": 2.0, "tmin_std": 1.8, "prcp_std": 2.5},
        11: {"tmax": 28.0, "tmin": 13.0, "prcp": 0.1, "tmax_std": 2.2, "tmin_std": 2.2, "prcp_std": 0.5},
        12: {"tmax": 23.0, "tmin": 9.8, "prcp": 0.1, "tmax_std": 1.8, "tmin_std": 2.2, "prcp_std": 0.4},
    },
}

# ============================================================================
# CLIMATOLOGY (fallback averages for when bootstrap fails)
# ============================================================================

CLIMATOLOGY_FALLBACK = {
    "Mumbai": {"tmax": 32.5, "tmin": 24.2, "tavg": 28.4, "prcp": 8.5},
    "Delhi": {"tmax": 32.4, "tmin": 19.6, "tavg": 26.0, "prcp": 1.2},
    "Bangalore": {"tmax": 28.8, "tmin": 18.5, "tavg": 23.6, "prcp": 5.4},
    "Hyderabad": {"tmax": 32.1, "tmin": 21.4, "tavg": 26.8, "prcp": 4.3},
    "Chennai": {"tmax": 32.2, "tmin": 24.7, "tavg": 28.5, "prcp": 9.2},
    "Kolkata": {"tmax": 31.8, "tmin": 22.6, "tavg": 27.2, "prcp": 11.3},
    "Pune": {"tmax": 29.5, "tmin": 17.2, "tavg": 23.4, "prcp": 4.1},
    "Ahmedabad": {"tmax": 33.6, "tmin": 20.3, "tavg": 26.9, "prcp": 1.9},
    "Jaipur": {"tmax": 33.5, "tmin": 18.9, "tavg": 26.2, "prcp": 0.8},
    "Lucknow": {"tmax": 31.9, "tmin": 18.4, "tavg": 25.2, "prcp": 2.8},
}

# Folder for storing city weather history
HISTORY_DIR = Path(__file__).parent / "city_history"


# ============================================================================
# HISTORY STORAGE FUNCTIONS
# ============================================================================

def ensure_history_dir():
    """Ensure city_history directory exists"""
    try:
        HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        print(f"Warning: Could not create history directory: {e}")


def get_city_history_path(city):
    """Get JSON file path for a city"""
    ensure_history_dir()
    safe_name = city.lower().replace(" ", "_").replace("-", "_")
    return HISTORY_DIR / f"{safe_name}.json"


def load_history(city):
    """
    Load historical weather for a city (max 30 days)
    Returns: list of dicts [{"date": "2026-05-01", "tmax": 32.1, ...}]
    """
    try:
        filepath = get_city_history_path(city)
        if not filepath.exists():
            return []
        
        with open(filepath, "r") as f:
            data = json.load(f)
        
        # Ensure list, return last 30 entries
        if isinstance(data, list):
            return sorted(data[-30:], key=lambda x: x.get("date", ""))
        return []
    except Exception as e:
        print(f"Warning: Error loading history for {city}: {e}")
        return []


def save_daily_record(city, tmax, tmin, tavg, prcp):
    """
    Save or update today's weather record
    - Deduplicates by date (overwrites if date already exists)
    - Keeps only last 30 entries
    
    Args:
        city: City name
        tmax: Max temperature (°C)
        tmin: Min temperature (°C)
        tavg: Average temperature (°C)
        prcp: Precipitation (mm)
    """
    try:
        today = datetime.now().date().isoformat()
        
        # Load existing history
        history = load_history(city)
        
        # Remove today's entry if it exists (deduplicate)
        history = [h for h in history if h.get("date") != today]
        
        # Append new record
        history.append({
            "date": today,
            "tmax": float(tmax),
            "tmin": float(tmin),
            "tavg": float(tavg),
            "prcp": float(prcp)
        })
        
        # Keep only last 30 days
        history = history[-30:]
        
        # Save to file
        filepath = get_city_history_path(city)
        with open(filepath, "w") as f:
            json.dump(history, f, indent=2)
        
        return True
    except Exception as e:
        print(f"Warning: Error saving history for {city}: {e}")
        return False


# ============================================================================
# OPEN-METEO BOOTSTRAP FUNCTION
# ============================================================================

def bootstrap_from_open_meteo(city, lat, lon, days=10):
    """
    Fetch historical weather from Open-Meteo (no API key required)
    
    Args:
        city: City name (for reference)
        lat, lon: Latitude and longitude
        days: Number of days to fetch (default 10, max depends on Open-Meteo)
    
    Returns:
        list of dicts: [{"date": "2026-04-20", "tmax": 32.1, ...}]
        or empty list if fails
    """
    try:
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        params = {
            "latitude": lat,
            "longitude": lon,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "daily": "temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum",
            "timezone": "auto"
        }
        
        url = f"https://archive-api.open-meteo.com/v1/archive?{urlencode(params)}"
        
        with urlopen(url, timeout=10) as response:
            data = json.loads(response.read().decode())
        
        daily = data.get("daily", {})
        dates = daily.get("time", [])
        tmax_list = daily.get("temperature_2m_max", [])
        tmin_list = daily.get("temperature_2m_min", [])
        tavg_list = daily.get("temperature_2m_mean", [])
        prcp_list = daily.get("precipitation_sum", [])
        
        if not dates:
            return []
        
        result = []
        for i, date_str in enumerate(dates):
            record = {
                "date": date_str,
                "tmax": float(tmax_list[i]) if i < len(tmax_list) else 0,
                "tmin": float(tmin_list[i]) if i < len(tmin_list) else 0,
                "tavg": float(tavg_list[i]) if i < len(tavg_list) else 0,
                "prcp": float(prcp_list[i]) if i < len(prcp_list) else 0
            }
            result.append(record)
        
        print(f"✓ Bootstrapped {len(result)} days from Open-Meteo for {city}")
        return result
    
    except Exception as e:
        print(f"Warning: Open-Meteo bootstrap failed for {city}: {e}")
        return []


# ============================================================================
# FEATURE BUILDING FUNCTION
# ============================================================================

def build_features(city, lat, lon, elev, predict_tmax, predict_tmin, predict_tavg, 
                   predict_prcp, predict_date, feature_cols_list):
    """
    Reconstruct engineered features using historical context
    
    This function replicates the feature engineering done during model training.
    It builds ALL features that the XGBoost model expects and returns them in
    the correct order.
    
    Args:
        city: City name
        lat, lon: Latitude, longitude
        elev: Elevation in meters
        predict_tmax, predict_tmin, predict_tavg, predict_prcp: Forecast for prediction date
        predict_date: Forecast date string (YYYY-MM-DD)
        feature_cols_list: List of feature column names from model
    
    Returns:
        dict: Feature name -> value mapping for all features in feature_cols_list
    """
    
    features = {}
    
    try:
        # Load or bootstrap history
        history = load_history(city)
        
        if len(history) < 3:
            # Bootstrap from Open-Meteo if not enough history
            bootstrapped = bootstrap_from_open_meteo(city, lat, lon, days=10)

            if bootstrapped:
                history.extend(bootstrapped)

                # Sort and keep last 30 days
                history = sorted(history, key=lambda x: x["date"])[-30:]

                # Save updated history to JSON file
                filepath = get_city_history_path(city)
                with open(filepath, "w") as f:
                    json.dump(history, f, indent=2)
            else:
                # Fallback: fill with climatology
                clim = CLIMATOLOGY_FALLBACK.get(city, {})
                history = [
                    {
                        "date": (datetime.now().date() - timedelta(days=i)).isoformat(),
                        "tmax": clim.get("tmax", 30),
                        "tmin": clim.get("tmin", 20),
                        "tavg": clim.get("tavg", 25),
                        "prcp": clim.get("prcp", 5)
                    }
                    for i in range(10, 0, -1)
                ]
        
        # Extract arrays from history (sorted by date, newest last)
        history = sorted(history, key=lambda x: x.get("date", ""))
        
        dates = [h.get("date", "") for h in history]
        tmax_arr = np.array([h.get("tmax", 30) for h in history])
        tmin_arr = np.array([h.get("tmin", 20) for h in history])
        tavg_arr = np.array([h.get("tavg", 25) for h in history])
        prcp_arr = np.array([h.get("prcp", 0) for h in history])
        
        # ====================================================================
        # BASE FEATURES (from forecast)
        # ====================================================================
        
        features["PRCP"] = float(predict_prcp)
        features["TMAX"] = float(predict_tmax)
        features["TMIN"] = float(predict_tmin)
        features["TAVG"] = float(predict_tavg)
        features["TRANGE"] = float(predict_tmax - predict_tmin)
        
        # ====================================================================
        # CUMULATIVE FEATURES (n-day sums)
        # ====================================================================
        
        for window in [3, 7, 14, 30]:
            col_name = f"PRCP_CUM{window}"
            features[col_name] = float(np.sum(prcp_arr[-window:]) if len(prcp_arr) >= window else np.sum(prcp_arr))
        
        # ====================================================================
        # ROLLING MEAN FEATURES
        # ====================================================================
        
        for window in [3, 7, 14, 30]:
            # Precipitation rolling means (NO underscore before MEAN)
            col_name = f"PRCP_ROLL{window}MEAN"
            features[col_name] = float(np.mean(prcp_arr[-window:]) if len(prcp_arr) >= window else np.mean(prcp_arr))
            
            # Tmax rolling means
            col_name = f"TMAX_ROLL{window}MEAN"
            features[col_name] = float(np.mean(tmax_arr[-window:]) if len(tmax_arr) >= window else np.mean(tmax_arr))
            
            # Tmin rolling means
            col_name = f"TMIN_ROLL{window}MEAN"
            features[col_name] = float(np.mean(tmin_arr[-window:]) if len(tmin_arr) >= window else np.mean(tmin_arr))
            
            # Trange rolling means
            trange_arr = tmax_arr - tmin_arr
            col_name = f"TRANGE_ROLL{window}MEAN"
            features[col_name] = float(np.mean(trange_arr[-window:]) if len(trange_arr) >= window else np.mean(trange_arr))
        
        # ====================================================================
        # ROLLING STD FEATURES
        # ====================================================================
        
        for window in [3, 7, 14, 30]:
            # Precipitation rolling std (NO underscore before STD)
            col_name = f"PRCP_ROLL{window}STD"
            features[col_name] = float(np.std(prcp_arr[-window:]) if len(prcp_arr) >= window else 0)
            
            # Tmax rolling std
            col_name = f"TMAX_ROLL{window}STD"
            features[col_name] = float(np.std(tmax_arr[-window:]) if len(tmax_arr) >= window else 0)
            
            # Tmin rolling std
            col_name = f"TMIN_ROLL{window}STD"
            features[col_name] = float(np.std(tmin_arr[-window:]) if len(tmin_arr) >= window else 0)
        
        # ====================================================================
        # LAG FEATURES (previous days - ONLY use 1, 3, 7)
        # ====================================================================
        
        for lag in [1, 3, 7]:
            idx = -lag
            
            col_name = f"PRCP_LAG{lag}"
            features[col_name] = float(prcp_arr[idx] if len(prcp_arr) >= lag else 0)
            
            col_name = f"TMAX_LAG{lag}"
            features[col_name] = float(tmax_arr[idx] if len(tmax_arr) >= lag else 30)
            
            col_name = f"TMIN_LAG{lag}"
            features[col_name] = float(tmin_arr[idx] if len(tmin_arr) >= lag else 20)
        
        # ====================================================================
        # Z-SCORE FEATURES (anomaly detection)
        # ====================================================================
        # Use monthly climatology baseline for Z-scores, with rolling-window fallback
        
        predict_dt = datetime.strptime(predict_date, "%Y-%m-%d")
        month_int = predict_dt.month
        city_clim = MONTHLY_CLIMATOLOGY.get(city, {})
        month_clim = city_clim.get(month_int, {})
        
        if month_clim:
            # Use monthly climatology for anomaly scores (NOT ZSCORE - must be ANOM)
            features["TMAX_ANOM"] = float((predict_tmax - month_clim["tmax"]) / max(month_clim["tmax_std"], 0.1))
            features["TMIN_ANOM"] = float((predict_tmin - month_clim["tmin"]) / max(month_clim["tmin_std"], 0.1))
            features["PRCP_ANOM"] = float((predict_prcp - month_clim["prcp"]) / max(month_clim["prcp_std"], 0.1))
        else:
            # Fallback to rolling-window logic
            if len(tmax_arr) > 0:
                tmax_mean = np.mean(tmax_arr)
                tmax_std = np.std(tmax_arr)
                features["TMAX_ANOM"] = float((predict_tmax - tmax_mean) / (tmax_std + 1e-6))
            else:
                features["TMAX_ANOM"] = 0
            
            if len(tmin_arr) > 0:
                tmin_mean = np.mean(tmin_arr)
                tmin_std = np.std(tmin_arr)
                features["TMIN_ANOM"] = float((predict_tmin - tmin_mean) / (tmin_std + 1e-6))
            else:
                features["TMIN_ANOM"] = 0
            
            if len(prcp_arr) > 0:
                prcp_mean = np.mean(prcp_arr)
                prcp_std = np.std(prcp_arr)
                features["PRCP_ANOM"] = float((predict_prcp - prcp_mean) / (prcp_std + 1e-6))
            else:
                features["PRCP_ANOM"] = 0
        
        # ====================================================================
        # CONSECUTIVE DAY FEATURES
        # ====================================================================
        
        # Count consecutive rainy days (prcp > 0)
        consec_rain = 0
        for val in reversed(prcp_arr):
            if val > 0:
                consec_rain += 1
            else:
                break
        features["CONSEC_RAIN"] = float(consec_rain)
        
        # Count consecutive hot days (tmax > 90th percentile)
        if len(tmax_arr) > 0:
            threshold_hot = np.percentile(tmax_arr, 90)
            consec_hot = 0
            for val in reversed(tmax_arr):
                if val > threshold_hot:
                    consec_hot += 1
                else:
                    break
            features["CONSEC_HOT"] = float(consec_hot)
        else:
            features["CONSEC_HOT"] = 0
        
        # Count consecutive cold days (tmin < 10th percentile)
        if len(tmin_arr) > 0:
            threshold_cold = np.percentile(tmin_arr, 10)
            consec_cold = 0
            for val in reversed(tmin_arr):
                if val < threshold_cold:
                    consec_cold += 1
                else:
                    break
            features["CONSEC_COLD"] = float(consec_cold)
        else:
            features["CONSEC_COLD"] = 0
        
        # ====================================================================
        # CALENDAR FEATURES (cyclical encoding)
        # ====================================================================
        
        # Note: predict_dt already defined above in Z-score section
        month = predict_dt.month
        doy = predict_dt.timetuple().tm_yday
        year = predict_dt.year
        
        features["MONTH"] = float(month)
        features["DOY"] = float(doy)
        features["YEAR"] = float(year)
        
        # Cyclical encoding for month (1-12)
        features["SIN_MONTH"] = float(np.sin(2 * np.pi * month / 12))
        features["COS_MONTH"] = float(np.cos(2 * np.pi * month / 12))
        
        # Cyclical encoding for day of year (1-365)
        features["SIN_DOY"] = float(np.sin(2 * np.pi * doy / 365))
        features["COS_DOY"] = float(np.cos(2 * np.pi * doy / 365))
        
        # Season (India-specific encoding: 0=Winter, 1=Pre-monsoon, 2=Monsoon, 3=Post-monsoon)
        season_map = {
            12: 0, 1: 0, 2: 0,        # Winter
            3: 1, 4: 1, 5: 1,        # Pre-monsoon
            6: 2, 7: 2, 8: 2, 9: 2,  # Monsoon
            10: 3, 11: 3              # Post-monsoon
        }
        features["SEASON"] = float(season_map[month])
        
        # ====================================================================
        # GEOGRAPHY FEATURES
        # ====================================================================
        
        features["LATITUDE"] = float(lat)
        features["LONGITUDE"] = float(lon)
        features["ELEVATION"] = float(elev)
        
        # ====================================================================
        # PLACEHOLDER FEATURES (required by model)
        # ====================================================================
        
        features["COUNTRY_ENC"] = 0.0  # India
        features["SNWD"] = 0.0  # Snow depth (not applicable in India)
        
        # ====================================================================
        # BACKUP: Create feature vector in required order
        # ====================================================================
        
        # Ensure all required features exist with defaults
        for col in feature_cols_list:
            if col not in features:
                features[col] = 0.0
        
        return features
    
    except Exception as e:
        print(f"Error building features for {city}: {e}")
        # Return minimal feature dict with all zeros
        return {col: 0.0 for col in feature_cols_list}


# ============================================================================
# UTILITY FUNCTION: CONVERT DICT TO ORDERED ARRAY
# ============================================================================

def features_dict_to_array(features_dict, feature_cols_list):
    """
    Convert features dictionary to ordered numpy array for model input
    
    Args:
        features_dict: Dict of feature_name -> value
        feature_cols_list: List of column names in required order
    
    Returns:
        np.array: [N x 1] array in correct feature order
    """
    try:
        vector = [features_dict.get(col, 0.0) for col in feature_cols_list]
        return np.array([vector])
    except Exception as e:
        print(f"Error converting features to array: {e}")
        return np.zeros((1, len(feature_cols_list)))
