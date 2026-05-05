from fastapi import FastAPI, Request
from pydantic import BaseModel
from predict import predict_weather, get_cities
from advanced_predict import predict_extreme_weather
from fastapi.middleware.cors import CORSMiddleware

# 👇 NEW IMPORTS (SAFE ADDITION)
import os
import json

app = FastAPI()

# CORS CONFIGURATION
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WeatherRequest(BaseModel):
    country: str
    city: str
    date: str
    prediction_type: str

class AdvancedPredictRequest(BaseModel):
    city: str
    date: str

@app.get("/")
def home():
    return {"message": "Climate AI Backend Running"}

@app.post("/get-cities")
async def get_cities_endpoint(request: Request):
    """Get available cities for a country"""
    body = await request.json()
    country = body.get("country", "")
    return get_cities(country)

@app.post("/predict-weather")
def predict(data: WeatherRequest):
    return predict_weather(data)

@app.post("/api/advanced-predict")
def advanced_predict(data: AdvancedPredictRequest):
    """
    Advanced extreme weather prediction endpoint
    Uses OpenWeather forecast API + XGBoost model
    """
    try:
        result = predict_extreme_weather(data.city, data.date)
        return result
    except Exception as e:
        import traceback
        print(f"Error in /api/advanced-predict: {traceback.format_exc()}")
        return {
            "error": f"Server error: {str(e)}",
            "success": False,
            "detail": str(e)
        }

# ============================================================
# 🆕 NEW ENDPOINT (SAFE ADDITION - DOES NOT TOUCH ANYTHING)
# ============================================================

@app.get("/api/history/{city}")
def get_history(city: str):
    try:
        file_path = os.path.join("city_history", f"{city.lower()}.json")

        if not os.path.exists(file_path):
            return {
                "success": True,
                "data": [],
                "message": f"No history yet for {city}"
            }

        with open(file_path, "r") as f:
            data = json.load(f)

        return {
            "success": True,
            "data": data[-10:]
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }