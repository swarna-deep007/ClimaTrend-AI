# Backend Setup Guide

## Prerequisites

### 1. Python Requirements

Make sure you have Python 3.8+ installed, then install required packages:

```bash
cd backend
pip install fastapi uvicorn requests joblib pandas numpy scikit-learn xgboost python-dotenv
```

### 2. Environment Variables

Create a `.env` file in the `backend/` directory with:

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and add your OpenWeather API key
OPENWEATHER_API_KEY=your_api_key_here
```

**Note:** Never commit `.env` files with real secrets. The `.env` is in `.gitignore`.

---

## Starting the Backend Server

### Step 1: Create/Activate Virtual Environment (Recommended)

```bash
# Create virtual environment (one-time)
python -m venv venv

# Windows - Activate
.\venv\Scripts\activate

# macOS/Linux - Activate
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
✓ Models loaded successfully from C:\...\backend\models
Application startup complete
```

### Step 3: Verify Backend is Running

Visit in your browser:
- http://127.0.0.1:8000 (should return `{"message": "Climate AI Backend Running"}`)
- http://127.0.0.1:8000/docs (FastAPI interactive documentation with Swagger UI)

---

## Backend API Endpoints

### 1. Get Cities
- **Method**: POST
- **URL**: `http://127.0.0.1:8000/get-cities`
- **Body**: `{"country": "India"}`
- **Response**: List of available cities

### 2. Weather Prediction (Existing - SARIMA)
- **Method**: POST
- **URL**: `http://127.0.0.1:8000/predict-weather`
- **Body**: `{"country": "India", "city": "Kolkata", "date": "2026-05-25", "prediction_type": "rainfall"}`
- **Response**: Weather forecast object

### 3. Advanced Extreme Weather Prediction (New - XGBoost)
- **Method**: POST
- **URL**: `http://127.0.0.1:8000/api/advanced-predict`
- **Body**: `{"city": "Mumbai", "date": "2026-05-15"}`
- **Response**:
  ```json
  {
    "success": true,
    "probability": 0.76,
    "isExtreme": true,
    "riskType": "Heavy Rain",
    "weather": {
      "temp": 32.4,
      "rain": 45.2
    },
    "city": "Mumbai",
    "date": "2026-05-15"
  }
  ```

**Supported Cities (India):**
Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, Lucknow, Chandigarh, Indore, Goa, Coimbatore, Surat, Nagpur, Bhopal, Vadodara, Patna, Ranchi, Srinagar, Leh, Shimla, Darjeeling, Ooty

---

## New Features: Weather History & Feature Engineering

### What's New?

The Advanced Extreme Weather Prediction now uses **historical weather context** to reconstruct engineered features at inference time, exactly as they were during model training.

### Weather History Module (`weather_history.py`)

This module manages:

1. **Local Weather Storage** (`backend/city_history/`)
   - One JSON file per city (auto-created)
   - Stores last 30 days of weather observations
   - Automatically deduplicated by date

2. **Automatic Bootstrap** (First Prediction)
   - If less than 3 days of history exist:
     - Fetches 10 days from Open-Meteo API (no key needed)
     - Falls back to climatology averages if API fails
   - Ensures model has context from day 1

3. **Feature Engineering** (Automatic)
   - Computes 100+ engineered features including:
     - Rolling averages & sums (3, 7, 14, 30-day windows)
     - Z-scores (anomaly detection)
     - Lag features (previous day values)
     - Consecutive event counters
     - Cyclical calendar encoding
     - Geographic features
   - **Matches exact training-time feature engineering**

### How It Works

```
User Request → Fetch Forecast → Build History
     ↓
Load Historical Data ← Bootstrap if needed (Open-Meteo)
     ↓
Engineer Features (100+ computed features)
     ↓
XGBoost Prediction
     ↓
Save Prediction to History
```

### Folder Structure

```
backend/
├── models/              # Pre-trained models (in Git, gitignored in later versions)
│   ├── xgb_model.pkl
│   ├── feature_cols.pkl
│   └── threshold.pkl
├── city_history/        # Local weather data (NOT in Git - .gitignore)
│   ├── mumbai.json      # Auto-created per city
│   ├── delhi.json
│   └── ...
├── weather_history.py   # New module (in Git)
├── advanced_predict.py  # Updated with feature engineering
├── main.py
├── .env                 # Local - NOT in Git
├── .env.example         # Template - in Git
└── requirements.txt
```

---

## Troubleshooting

### "Connection Refused" Error
```
Error: Failed to connect to localhost:8000
```
**Solution:**
- Make sure backend is running: `uvicorn main:app --reload --host 127.0.0.1 --port 8000`
- Check if port 8000 is in use: `netstat -an | grep 8000`
- Use a different port: `uvicorn main:app --port 8001`

### "Models not loaded" Error
```
Error: Models not loaded. Please ensure model files exist in models/ directory
```
**Solution:**
- Verify `backend/models/` contains:
  - `xgb_model.pkl` ✓
  - `feature_cols.pkl` ✓
  - `threshold.pkl` ✓
- Check file permissions: `ls -la backend/models/`
- Restart backend server

### "City not found" Error
```
Error: City 'XYZ' not found in supported cities
```
**Solution:**
- Check [supported cities list](#supported-cities-india) above
- Use exact city name (case-insensitive)
- Common cities: Mumbai, Delhi, Bangalore, Hyderabad, Chennai

### "OPENWEATHER_API_KEY not set" Error
```
Error: Failed to fetch forecast - API key issue
```
**Solution:**
1. Check `.env` file exists: `cat backend/.env`
2. Verify key is set: `grep OPENWEATHER_API_KEY backend/.env`
3. Restart backend after editing `.env`

### "No forecast data available" Error
```
Error: No forecast data available for [city]
```
**Solution:**
- City name might be misspelled
- OpenWeather API might be down - check status
- Ensure API key is valid and hasn't expired

### "No history data" Warning (Expected)
```
Warning: Open-Meteo bootstrap failed for Mumbai
```
**This is OK!** The system falls back to:
1. Existing local history (if any)
2. Open-Meteo archive API (usually works)
3. Climatology averages (hardcoded for Indian cities)

---

## Environment Variables

### Backend Environment Variables (`.env`)

```bash
# Required
OPENWEATHER_API_KEY={YOUR_API}

# Optional (defaults shown)
BACKEND_PORT=8000
BACKEND_HOST=127.0.0.1
ENV=development
```

### Frontend Environment Variables (`.env`)

In `frontend/` folder:

```bash
# Required (Vite only exposes VITE_ prefixed vars)
VITE_OPENWEATHER_API_KEY={YOUR_API_CALL}

# Optional
VITE_BACKEND_URL=http://127.0.0.1:8000
```

---

## Security Best Practices

### ✓ DO:
- Store secrets in `.env` files (local only, not in Git)
- Use `.env.example` as a template for other developers
- Rotate API keys regularly
- Use environment-specific keys (dev vs prod)

### ✗ DON'T:
- Hardcode secrets in source files
- Commit `.env` to Git
- Share API keys via email/chat
- Use same key for dev and production

### Secret Cleanup (Already Done)
If you previously had hardcoded secrets, see: `GIT_SECRET_REMOVAL.md`

---

## Development Notes

- **Backend Framework**: FastAPI (async-ready, fast)
- **ML Framework**: XGBoost (for extreme weather classification)
- **Weather Data**: OpenWeather API + Open-Meteo archive
- **Configuration**: python-dotenv (12-factor app pattern)
- **Feature Engineering**: Dynamic at inference time (weather_history.py)
- **Model Input**: 100+ engineered features per prediction

### Performance

- Average prediction time: **200-500ms** (including API call)
- Breakdown:
  - OpenWeather API call: 100-300ms
  - Feature engineering: 50-100ms
  - Model prediction: 10-20ms
  - History I/O: 10-50ms

### Future Improvements

- [ ] Caching of forecast data (reduce API calls)
- [ ] Batch predictions (multiple cities at once)
- [ ] Model ensemble (combine multiple models)
- [ ] Real-time WebSocket predictions
- [ ] Database backend (replace JSON history with PostgreSQL)

---

## Support & Resources

- FastAPI Docs: https://fastapi.tiangolo.com/
- OpenWeather API: https://openweathermap.org/api
- Open-Meteo: https://open-meteo.com/
- XGBoost: https://xgboost.readthedocs.io/
- Environment vars: https://12factor.net/config

- Models are loaded at startup via joblib
- Forecast data comes from OpenWeather API (free tier)
- Ensure `requests` package is installed for API calls
