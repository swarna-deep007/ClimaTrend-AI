from fastapi import FastAPI, Request
from pydantic import BaseModel
from predict import predict_weather, get_cities
from advanced_predict import predict_extreme_weather
from fastapi.middleware.cors import CORSMiddleware

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
