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
# LOAD DATA (for dropdowns)
# ================================
india_temp = pd.read_csv("data/India_Temp_Clean.csv")
india_rain = pd.read_csv("data/India_Rainfall_Clean.csv")
japan_temp = pd.read_csv("data/Japan_Temp_Clean.csv")
japan_rain = pd.read_csv("data/Japan_Rainfall_Clean.csv")

# Add metadata
india_temp["country"] = "india"
india_rain["country"] = "india"
japan_temp["country"] = "japan"
japan_rain["country"] = "japan"

# Combine all
all_data = pd.concat([india_temp, india_rain, japan_temp, japan_rain])

# Create station metadata
station_df = all_data.groupby(["country", "NAME", "STATION"]).agg({
    "LATITUDE": "first",
    "LONGITUDE": "first",
    "ELEVATION": "first"
}).reset_index()

# ================================
# CREATE DATA-DRIVEN OFFSETS ✅
# ================================
def compute_station_offsets(df, value_col):
    country_avg = df[value_col].mean()
    station_avg = df.groupby("STATION")[value_col].mean()
    return (station_avg - country_avg).to_dict()

india_temp_offsets = compute_station_offsets(india_temp, "TAVG")
india_rain_offsets = compute_station_offsets(india_rain, "PRCP")
japan_temp_offsets = compute_station_offsets(japan_temp, "TAVG")
japan_rain_offsets = compute_station_offsets(japan_rain, "PRCP")

# ================================
# GENERATE FORECAST SERIES
# ================================
def generate_series(model):
    forecast = model.get_forecast(steps=5 * 12)
    index = pd.date_range(start="2025-01-31", periods=5 * 12, freq="ME")
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


def get_series(country, prediction_type):
    if country == "india" and prediction_type == "temperature":
        return india_temp_series, "°C"

    elif country == "india" and prediction_type == "rainfall":
        return india_rain_series, "mm"

    elif country == "japan" and prediction_type == "temperature":
        return japan_temp_series, "°C"

    elif country == "japan" and prediction_type == "rainfall":
        return japan_rain_series, "mm"

    else:
        return None, None


# ================================
# DROPDOWN APIs
# ================================
def get_cities(country, prediction_type):
    filtered = station_df[
        station_df["country"] == country.lower()
    ]
    return sorted(filtered["NAME"].unique().tolist())


def get_stations(country, city):
    filtered = station_df[
        (station_df["country"] == country.lower()) &
        (station_df["NAME"] == city)
    ]

    return filtered[["STATION", "LATITUDE", "LONGITUDE", "ELEVATION"]].to_dict(orient="records")


# ================================
# MAIN PREDICTION FUNCTION
# ================================
def predict_weather(data):
    try:
        country = data.country.lower()
        prediction_type = data.prediction_type.lower()
        city = data.city
        station_code = data.station_code

        # 🔹 Validate station
        station_row = station_df[
            (station_df["country"] == country) &
            (station_df["NAME"] == city) &
            (station_df["STATION"] == station_code)
        ]

        if station_row.empty:
            return {"error": "Invalid city or station selection"}

        station_info = station_row.iloc[0]

        # 🔹 Get model series
        series, unit = get_series(country, prediction_type)
        if series is None:
            return {"error": "Invalid selection"}

        # 🔹 Get station offset (KEY IMPROVEMENT 🔥)
        if country == "india" and prediction_type == "temperature":
            offset = india_temp_offsets.get(station_code, 0)

        elif country == "india" and prediction_type == "rainfall":
            offset = india_rain_offsets.get(station_code, 0)

        elif country == "japan" and prediction_type == "temperature":
            offset = japan_temp_offsets.get(station_code, 0)

        elif country == "japan" and prediction_type == "rainfall":
            offset = japan_rain_offsets.get(station_code, 0)

        else:
            offset = 0

        # 🔹 Date handling
        date = pd.to_datetime(data.date)
        date = date + pd.offsets.MonthEnd(0)

        # 🔹 Prediction value
        if date in series:
            value = float(series[date])
        else:
            value = float(series.iloc[-1])

        # 🔹 Apply offset properly
        if prediction_type == "temperature":
            value = f_to_c(value)
            value = round(value + offset, 2)
        else:
            value = round(value + offset, 2)

        # 🔹 Classification
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

        # 🔹 Trend data (6 months)
        trend_data = []
        for i in range(6):
            trend_date = date + pd.DateOffset(months=i)

            if trend_date in series.index:
                trend_value = float(series[trend_date])
            else:
                trend_value = float(series.iloc[min(i, len(series) - 1)])

            if prediction_type == "temperature":
                trend_value = f_to_c(trend_value)
                trend_value = round(trend_value + offset, 2)
            else:
                trend_value = round(trend_value + offset, 2)

            trend_data.append({
                "month": trend_date.strftime("%b %Y"),
                "value": trend_value
            })

        # 🔹 Final response
        return {
            "country": country,
            "city": city,
            "station_code": station_code,
            "coordinates": {
                "latitude": station_info["LATITUDE"],
                "longitude": station_info["LONGITUDE"],
                "elevation": station_info["ELEVATION"]
            },
            "date": data.date,
            "prediction_type": prediction_type,
            "value": f"{value} {unit}",
            "classification": classification,
            "trend": trend_data
        }

    except Exception as e:
        return {"error": str(e)}