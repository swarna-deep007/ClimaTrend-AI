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
# MAIN FUNCTION
# ================================
def predict_weather(data):
    try:
        country = data.country.lower()
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

        # Get value
        if date in series:
            value = series[date]
        else:
            value = series.iloc[-1]

        value = round(float(value), 2)

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
                trend_value = round(float(series[trend_date]), 2)
            else:
                trend_value = round(float(series.iloc[min(i, len(series)-1)]), 2)
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