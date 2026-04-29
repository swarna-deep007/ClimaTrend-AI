# Backend Setup Guide

## Prerequisites

Make sure you have installed the required Python packages:

```bash
cd backend
pip install fastapi uvicorn requests joblib pandas numpy scikit-learn
```

## Starting the Backend Server

### Step 1: Activate Virtual Environment (if applicable)

```bash
# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### Step 2: Start the Backend Server

```bash
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

You should see output like:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete
```

### Step 3: Verify Backend is Running

Visit in your browser:
- http://127.0.0.1:8000 (should return `{"message": "Climate AI Backend Running"}`)
- http://127.0.0.1:8000/docs (FastAPI interactive documentation)

## Backend API Endpoints

### 1. Get Cities
- **Method**: POST
- **URL**: `http://127.0.0.1:8000/get-cities`
- **Body**: `{"country": "India"}`

### 2. Weather Prediction (Existing)
- **Method**: POST
- **URL**: `http://127.0.0.1:8000/predict-weather`
- **Body**: `{"country": "India", "city": "Kolkata", "date": "2026-05-25", "prediction_type": "rainfall"}`

### 3. Advanced Extreme Weather Prediction (New)
- **Method**: POST
- **URL**: `http://127.0.0.1:8000/api/advanced-predict`
- **Body**: `{"city": "Kolkata", "date": "2026-05-25"}`
- **Response**:
  ```json
  {
    "success": true,
    "probability": 0.82,
    "isExtreme": true,
    "riskType": "Heatwave",
    "weather": {
      "temp": 41.5,
      "rain": 5.2
    },
    "city": "Kolkata",
    "date": "2026-05-25"
  }
  ```

## Troubleshooting

### "Connection Refused" Error
- Make sure backend is running on port 8000
- Check if port 8000 is already in use: `netstat -an | grep 8000`
- Change port if needed: `uvicorn main:app --port 8001 --host 127.0.0.1`

### "Models not loaded" Error
- Verify model files exist in `backend/models/`:
  - `xgb_model.pkl`
  - `feature_cols.pkl`
  - `threshold.pkl`
- Check file permissions

### "No forecast data available" Error
- City name might be incorrect
- Try common city names: Kolkata, Mumbai, Delhi, Bangalore

### "Can read properties of undefined" Error
- Check backend error logs in terminal
- Ensure response includes `weather` object
- Verify API returns `success: true`

## Development Notes

- Backend uses FastAPI framework
- Models are loaded at startup via joblib
- Forecast data comes from OpenWeather API (free tier)
- Ensure `requests` package is installed for API calls
