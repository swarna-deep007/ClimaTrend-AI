# 🌍 Climate-AI: Intelligent Weather Prediction System

> *“We stitch patterns, AI predicts the future.”*

Climate-AI is an intelligent weather prediction system that uses time-series forecasting combined with smart climate-based adjustments to deliver realistic, location-aware predictions for temperature and rainfall.

Built with a focus on simplicity, explainability, and real-world behavior, this project demonstrates how AI can be enhanced with domain knowledge to produce meaningful results.

---

## 🚀 Features

✨ **AI-Based Forecasting**

* Uses SARIMA (Seasonal ARIMA) for time-series prediction
* Learns long-term climate trends and seasonality

🌆 **City-Level Predictions (Smart Enhancement)**

* Applies realistic city-based climate offsets
* Handles diverse regions like coastal, urban, and mountainous areas

📅 **Date-Aware Predictions**

* Supports predictions for any selected date
* Maintains seasonal consistency

📊 **Trend Visualization**

* Displays next 6 months of forecast data
* Smooth and continuous predictions

🌦️ **Dual Prediction Modes**

* 🌡️ Temperature Forecasting
* 🌧️ Rainfall Forecasting

---

## 🧠 How It Works

The system combines **machine learning + domain intelligence**:

### 1️⃣ Time-Series Forecasting

* SARIMA models are trained on historical climate data
* Captures trends, seasonality, and periodic patterns

### 2️⃣ City-Based Adjustments

* Each city has predefined offsets based on real-world climate behavior
* Example:

  * Delhi → hotter (+4°C)
  * Shimla → colder (-12°C)
  * Mumbai → higher rainfall (+80 mm)

### 3️⃣ Final Prediction

```
Final Prediction = SARIMA Output + City Offset
```

This hybrid approach ensures:

* Realistic predictions
* Better user experience
* Explainable AI behavior

---

## 🏗️ Tech Stack

**Frontend**

* React.js
* Tailwind CSS

**Backend**

* Python (FastAPI / Flask)
* Pandas
* Joblib

**Machine Learning**

* SARIMA (statsmodels)

---

## 📂 Project Structure

```
climate-ai/
│
├── frontend/              # React UI
├── backend/
│   ├── models/           # Trained SARIMA models
│   ├── predict.py        # Prediction logic
│   └── main.py           # API endpoints
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/climate-ai.git
cd climate-ai
```

### 2️⃣ Setup Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 3️⃣ Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📸 Sample Output

* Input: `Delhi, May 2025`
* Output:

  * Temperature: **36°C**
  * Classification: **Moderate**
  * Trend: Next 6 months forecast

---

## 📌 Limitations

* Current SARIMA model is trained at **country level**
* City-level variations are applied using **deterministic offsets**
* Daily granularity is approximated from monthly data

---

## 🔮 Future Improvements

* Train **city-specific models**
* Add **real-time weather API integration**
* Use **ML models with geo-features (latitude/longitude)**
* Add **confidence intervals & uncertainty**
* Improve UI with advanced analytics

---

## 🧑‍💻 Author

**Swarnadeep Banerjee**
Passionate about AI, full-stack development, and solving real-world problems.

---

## ⭐ Final Note

This project demonstrates that:

> *AI alone is powerful, but AI + domain knowledge is transformative.*

If you like this project, consider giving it a ⭐ on GitHub!

---
