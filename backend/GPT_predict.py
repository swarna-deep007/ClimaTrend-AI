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
# HELPERS
# ================================
def f_to_c(f):
    return round((f - 32) * 5 / 9, 2)


# 🔥 CITY VARIATION
def get_city_factor(city):
    city = city.lower()
    factor = sum(ord(c) for c in city) % 10
    return (factor - 5) * 0.8


# 🔥 MONTH VARIATION
def get_month_factor(date, prediction_type):
    month = date.month

    if prediction_type == "temperature":
        seasonal = {
            1: -3, 2: -2, 3: 0, 4: 2, 5: 4, 6: 5,
            7: 4, 8: 3, 9: 2, 10: 0, 11: -1, 12: -2
        }
    else:
        seasonal = {
            1: 0, 2: 1, 3: 2, 4: 5, 5: 20, 6: 80,
            7: 120, 8: 100, 9: 60, 10: 20, 11: 5, 12: 1
        }

    return seasonal.get(month, 0)


# 🔥 REGION FIX
def get_region_factor(city, prediction_type):
    city = city.lower()

    cold_regions = ["srinagar", "leh", "shimla", "manali"]
    hot_regions = ["delhi", "nagpur", "jaipur"]
    coastal = ["mumbai", "chennai", "kolkata"]

    if prediction_type == "temperature":
        if city in cold_regions:
            return -10
        elif city in hot_regions:
            return +3
        elif city in coastal:
            return -2

    else:
        if city in coastal:
            return +40
        elif city in cold_regions:
            return +10
        elif city in hot_regions:
            return -10

    return 0


# 🔥 DAY VARIATION (NEW FIX)
def get_day_factor(date, prediction_type):
    day = date.day

    if prediction_type == "temperature":
        return (day % 5) * 0.3   # small variation
    else:
        return (day % 5) * 1.5   # bigger for rainfall


# ================================
# MAIN FUNCTION
# ================================
def predict_weather(data):
    try:
        country = data.country.lower()
        prediction_type = data.prediction_type.lower()
        city = data.city.lower()

        # Convert date
        original_date = pd.to_datetime(data.date)
        date = original_date + pd.offsets.MonthEnd(0)

        # ================================
        # SELECT SERIES
        # ================================
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

        # ================================
        # BASE VALUE (MONTH LEVEL)
        # ================================
        if date in series:
            value = float(series[date])
        else:
            value = float(series.iloc[-1])

        # ================================
        # 🔥 APPLY ALL ADJUSTMENTS
        # ================================
        city_factor = get_city_factor(city)
        month_factor = get_month_factor(date, prediction_type)
        region_factor = get_region_factor(city, prediction_type)
        day_factor = get_day_factor(original_date, prediction_type)

        value = value + city_factor + month_factor + region_factor + day_factor
        value = round(value, 2)

        # ================================
        # UNIT CONVERSION
        # ================================
        if prediction_type == "temperature":
            value = f_to_c(value)

        # ================================
        # CLASSIFICATION
        # ================================
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

        # ================================
        # TREND DATA
        # ================================
        trend_data = []

        for i in range(6):
            trend_date = date + pd.DateOffset(months=i)

            if trend_date in series.index:
                trend_value = float(series[trend_date])
            else:
                trend_value = float(series.iloc[min(i, len(series)-1)])

            # Apply adjustments
            month_factor = get_month_factor(trend_date, prediction_type)
            region_factor = get_region_factor(city, prediction_type)
            city_factor = get_city_factor(city)
            day_factor = get_day_factor(trend_date, prediction_type)

            trend_value = trend_value + city_factor + month_factor + region_factor + day_factor
            trend_value = round(trend_value, 2)

            if prediction_type == "temperature":
                trend_value = f_to_c(trend_value)

            trend_data.append({
                "month": trend_date.strftime("%b %Y"),
                "value": trend_value
            })

        # ================================
        # FINAL RESPONSE
        # ================================
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