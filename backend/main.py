from fastapi import FastAPI
from pydantic import BaseModel
from predict import predict_weather
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ CORS CONFIGURATION
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (for development)
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
    return {"message": "Climate AI Backend Running 🚀"}

@app.post("/predict-weather")
def predict(data: WeatherRequest):
    return predict_weather(data)