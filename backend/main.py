from fastapi import FastAPI, Request
from pydantic import BaseModel
from predict import predict_weather, get_cities
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
