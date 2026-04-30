# 🌍 ClimaTrend-AI: Intelligent Climate & Extreme Weather Prediction System

> *“From patterns to predictions — AI that understands climate.”*

ClimaTrend-AI is an advanced weather intelligence platform that combines **time-series forecasting, machine learning, and real-time weather APIs** to predict both **climate trends** and **extreme weather events**.

This project goes beyond basic forecasting by integrating **domain knowledge + AI models** to deliver realistic, explainable, and actionable predictions.

---

## 🚀 Key Features

### 🌡️ Climate Forecasting (SARIMA)

* Uses **SARIMA (Seasonal ARIMA)** for long-term trend prediction
* Captures **seasonality, trends, and cyclic patterns**
* Generates smooth forecasts for future dates

---

### ⚡ Extreme Weather Detection (XGBoost + API)

* Real-time prediction using **OpenWeather API**
* Machine learning model (**XGBoost**) detects:

  * Heavy Rain 🌧️
  * Heatwaves 🔥
  * Cold Waves ❄️
* Combines **model prediction + domain thresholds**

---

### 🌆 Smart City-Level Adjustments

* Enhances predictions using **city-specific climate behavior**
* Examples:

  * Delhi → hotter (+4°C)
  * Shimla → colder (-12°C)
  * Mumbai → higher rainfall

---

### 📅 Date-Aware Predictions

* Supports user-selected dates
* Ensures predictions remain **seasonally consistent**

---

### 📊 Interactive Visualization

* Forecast trends for upcoming months
* Helps understand long-term climate behavior

---

### 🌐 Full-Stack Application

* Clean UI with React
* Fast backend using FastAPI
* Integrated AI + API pipeline

---

## 🧠 How It Works

### 1️⃣ Time-Series Modeling (SARIMA)

* Trained on historical climate datasets
* Learns:

  * Seasonality
  * Trends
  * Cyclical patterns

---

### 2️⃣ Real-Time Weather Integration

* Fetches live forecast data from OpenWeather API
* Extracts:

  * Temperature
  * Rainfall
  * Derived features

---

### 3️⃣ Feature Engineering

* Creates advanced features like:

  * Temperature range
  * Month encoding (sin/cos)
  * Day-of-year

---

### 4️⃣ Machine Learning Prediction

* XGBoost model predicts probability of extreme events
* Outputs:

  * Risk type
  * Probability
  * Severity

---

### 5️⃣ Domain Logic Layer

* Overrides model using real-world thresholds:

  * Rain > 100 mm → Heavy Rain
  * Temp > 40°C → Heatwave
  * Temp < 5°C → Cold Wave

---

### 🧮 Final Pipeline

```
Forecast Data → Feature Engineering → ML Model → Domain Logic → Final Prediction
```

---

## 🏗️ Tech Stack

### Frontend

* React.js
* Tailwind CSS

### Backend

* FastAPI (Python)
* Pandas, NumPy
* Joblib

### Machine Learning

* SARIMA (statsmodels)
* XGBoost

### APIs

* OpenWeather API

---

## 📂 Project Structure

```
climate-ai/
│
├── frontend/                  # React frontend
│   └── src/pages/
│       └── AdvancedPredict.jsx
│
├── backend/
│   ├── models/               # Trained ML models
│   │   ├── xgb_model.pkl
│   │   ├── feature_cols.pkl
│   │   └── threshold.pkl
│   │
│   ├── predict.py            # SARIMA prediction logic
│   ├── advanced_predict.py   # Extreme weather detection
│   └── main.py               # FastAPI routes
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/climate-ai.git
cd climate-ai
```

---

### 2️⃣ Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file:

```env
OPENWEATHER_API_KEY=your_api_key_here
```

Run server:

```bash
python main.py
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Security Note

* API keys are stored using **environment variables (.env)**
* `.env` is excluded from version control
* Ensures secure and production-ready configuration

---

## 📊 Sample Output

**Input:** `Mumbai, 2026-05-15`

**Output:**

* Temperature: 32°C
* Rainfall: 85 mm
* Risk Type: Heavy Rain
* Probability: 0.87

---

## 📌 Limitations

* SARIMA trained on **aggregated datasets**
* Forecast limited to **5-day API range for extreme prediction**
* Some city adjustments are heuristic-based

---

## 🔮 Future Improvements

* City-specific ML models
* LSTM / deep learning models
* Real-time alert system
* Interactive dashboards
* Geo-spatial modeling (lat/lon based predictions)

---

## 🧑‍💻 Author

**Swarnadeep Banerjee**
AI Enthusiast | Full-Stack Developer | Problem Solver

---

## ⭐ Final Thought

> *“Prediction becomes powerful when data meets domain knowledge.”*

If you found this project interesting, consider giving it a ⭐!
