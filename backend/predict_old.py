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
# HELPER
# ================================
def f_to_c(f):
    return round((f - 32) * 5 / 9, 2)


# ================================
# CITY OFFSETS
# Based on real climate differences from country average
# ================================
CITY_TEMP_OFFSETS = {
    # India
    "mumbai":    +2.5,
    "delhi":     +4.0,
    "chennai":   +3.0,
    "kolkata":   +1.5,
    "bangalore": -3.0,
    "hyderabad": +2.0,
    "jaipur":    +5.0,
    "shimla":    -12.0,
    "pune":      -1.0,
    "ahmedabad": +4.5,
    # Japan
    "tokyo":     0.0,
    "osaka":     +1.0,
    "sapporo":   -6.0,
    "fukuoka":   +1.5,
    "kyoto":     +0.5,
    "nagoya":    +0.5,
}

CITY_RAIN_OFFSETS = {
    # India
    "mumbai":    +80.0,
    "chennai":   +30.0,
    "kolkata":   +40.0,
    "bangalore": +20.0,
    "delhi":     -10.0,
    "jaipur":    -20.0,
    "shimla":    +10.0,
    "hyderabad": +10.0,
    "pune":      +15.0,
    "ahmedabad": -15.0,
    # Japan
    "tokyo":     +15.0,
    "osaka":     +10.0,
    "sapporo":   -5.0,
    "fukuoka":   +10.0,
    "kyoto":     +5.0,
    "nagoya":    +5.0,
}


# ================================
# MAIN FUNCTION
# ================================
def predict_weather(data):
    try:
        country = data.country.lower()
        city_key = data.city.lower().strip()
        prediction_type = data.prediction_type.lower()

        # Convert date
        date = pd.to_datetime(data.date)
        date = date + pd.offsets.MonthEnd(0)

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

        # Get base value
        if date in series:
            value = series[date]
        else:
            value = series.iloc[-1]

        value = float(value)

        # ✅ Convert F to C + apply city offset
        if prediction_type == "temperature":
            value = f_to_c(value)
            value = round(value + CITY_TEMP_OFFSETS.get(city_key, 0.0), 2)
        else:
            value = round(value + CITY_RAIN_OFFSETS.get(city_key, 0.0), 2)

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

        # 🔹 Get next 6 months trend data
        trend_data = []
        for i in range(6):
            trend_date = date + pd.DateOffset(months=i)
            if trend_date in series.index:
                trend_value = float(series[trend_date])
            else:
                trend_value = float(series.iloc[min(i, len(series)-1)])

            # ✅ Convert and apply city offset in trend too
            if prediction_type == "temperature":
                trend_value = f_to_c(trend_value)
                trend_value = round(trend_value + CITY_TEMP_OFFSETS.get(city_key, 0.0), 2)
            else:
                trend_value = round(trend_value + CITY_RAIN_OFFSETS.get(city_key, 0.0), 2)

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