# Quick Start Reference

## Installation & Setup (30 seconds)

### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env and add your OpenWeather API key

pip install fastapi uvicorn xgboost python-dotenv requests joblib pandas numpy
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env
# Edit .env and add your OpenWeather API key

npm install
npm run dev
```

---

## Getting API Keys

**OpenWeather Free:** https://openweathermap.org/api
- Sign up → View API Keys tab → Copy default key
- Rate limit: 1000 calls/day (free tier)
- Used by: Weather forecasting

---

## First Prediction

### cURL
```bash
curl -X POST http://127.0.0.1:8000/api/advanced-predict \
  -H "Content-Type: application/json" \
  -d '{"city": "Mumbai", "date": "2026-05-15"}'
```

### Python
```python
import requests

response = requests.post(
    "http://127.0.0.1:8000/api/advanced-predict",
    json={"city": "Mumbai", "date": "2026-05-15"}
)
print(response.json())
```

### Response
```json
{
  "success": true,
  "probability": 0.76,
  "isExtreme": true,
  "riskType": "Heavy Rain",
  "weather": {"temp": 32.4, "rain": 45.2},
  "city": "Mumbai",
  "date": "2026-05-15"
}
```

---

## Environment Variables

### Backend (`.env`)
```bash
OPENWEATHER_API_KEY=your_key_here
```

### Frontend (`.env`)
```bash
VITE_OPENWEATHER_API_KEY=your_key_here
VITE_BACKEND_URL=http://127.0.0.1:8000
```

✓ **Important:** Never commit `.env` files!

---

## Supported Cities (India)

Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, Lucknow, Chandigarh, Indore, Goa, Coimbatore, Surat, Nagpur, Bhopal, Vadodara, Patna, Ranchi, Srinagar, Leh, Shimla, Darjeeling, Ooty

---

## Common Issues & Solutions

### "API key not found"
```
Check backend/.env exists and has OPENWEATHER_API_KEY=...
Restart backend after editing .env
```

### "City not found"
```
City must be exact name from supported list (case-insensitive)
Feature uses Open-Meteo for bootstrap - case matters there
```

### "Models not loaded"
```
Verify backend/models/ has:
  - xgb_model.pkl
  - feature_cols.pkl
  - threshold.pkl
Restart backend
```

### "Cannot read properties of undefined"
```
Ensure response.success !== false before rendering
Check backend logs for actual error
```

---

## Architecture

```
Frontend (React)
    ↓
Backend API (FastAPI)
    ↓
Weather History (JSON, ~30 days)
    ↓
Feature Engineering (100+ features)
    ↓
XGBoost Model
    ↓
Domain Logic Safety Layer
    ↓
Response to Frontend
```

---

## File Locations

| Component | Location |
|-----------|----------|
| Backend App | `backend/main.py` |
| Models | `backend/models/` |
| Weather History | `backend/city_history/` (auto-created) |
| History Module | `backend/weather_history.py` |
| Frontend App | `frontend/src/` |
| Env Config | `backend/.env` / `frontend/.env` |

---

## What Happened

### Problem Solved
- ✗ Old: XGBoost received zero-filled features → bad predictions
- ✓ New: Features engineered from real historical context → accurate predictions

### Security Fixed
- ✗ Old: API keys hardcoded in source files
- ✓ New: All secrets moved to `.env` (Git-ignored)

### Feature Added
- Weather history auto-bootstrap from Open-Meteo
- 100+ engineered features replicated from training
- Automatic data accumulation (up to 30 days)

---

## Next: Remove Secrets from Git History

After LOCAL testing succeeds:

```bash
# See: GIT_SECRET_REMOVAL.md for detailed steps
# Quick version using BFG:

cd climate-ai
bfg --replace-text <(echo "e89da8bbba11b090de6cfc1e745b1d8c==>REDACTED") .
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force --all origin
```

---

## Full Documentation

- `REFACTOR_SUMMARY.md` - Complete overview
- `SETUP_BACKEND.md` - Backend detailed guide
- `SETUP_FRONTEND.md` - Frontend detailed guide
- `GIT_SECRET_REMOVAL.md` - Git history cleanup
- `weather_history.py` - Feature engineering reference

---

## Support

🐛 **Bug?** Check logs:
```bash
# Backend
cd backend && uvicorn main:app --reload

# Frontend
cd frontend && npm run dev
# Check browser console (F12)
```

📚 **How it works?**
- Open: `REFACTOR_SUMMARY.md`

🔐 **Security concerns?**
- Open: `GIT_SECRET_REMOVAL.md`

⚙️ **Configuration?**
- Backend: `SETUP_BACKEND.md`
- Frontend: `SETUP_FRONTEND.md`
