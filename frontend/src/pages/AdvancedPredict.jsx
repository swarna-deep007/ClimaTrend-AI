import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';

function AdvancedPredict() {
  const [form, setForm] = useState({
    predictionType: "Rainfall",
    city: "Kolkata",
    date: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cities, setCities] = useState([]);

  // Indian cities
  const indianCities = [
    'Ahmedabad', 'Bangalore', 'Chandigarh', 'Chennai', 'Delhi', 'Goa',
    'Hyderabad', 'Indore', 'Jaipur', 'Kochi', 'Kolkata', 'Lucknow',
    'Mumbai', 'Nagpur', 'Patna', 'Pune', 'Shimla', 'Surat',
    'Thiruvananthapuram', 'Varanasi'
  ];

  useEffect(() => {
    setCities(indianCities);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const getMinMaxDate = () => {
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 5);
    const maxDateStr = maxDate.toISOString().split('T')[0];
    
    return { minDate, maxDateStr };
  };

  const validateDate = (selectedDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((selected - today) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      return { valid: false, message: "Cannot select past dates" };
    }
    if (daysDiff > 5) {
      return { valid: false, message: "Predictions available only for next 5 days" };
    }
    return { valid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!form.date) {
      setError("Please select a date");
      return;
    }

    const dateValidation = validateDate(form.date);
    if (!dateValidation.valid) {
      setError(dateValidation.message);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/advanced-predict",
        {
          city: form.city,
          date: form.date
        }
      );

      if (response.data.success === false) {
        setError(response.data.error || "Prediction failed");
        setResult(null);
      } else {
        setResult(response.data);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || "Error connecting to backend. Please ensure backend is running on http://127.0.0.1:8000";
      setError(errorMessage);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getEmojiByRisk = (riskType) => {
    const emojis = {
      "Heavy Rain": "🌊",
      "Heatwave": "🔥",
      "Cold Wave": "❄️",
      "Normal": "✅"
    };
    return emojis[riskType] || "📊";
  };

  const getAlertColor = (isExtreme) => {
    return isExtreme
      ? { bg: 'rgba(255, 107, 107, 0.2)', border: '#ff6b6b', text: '#ff6b6b' }
      : { bg: 'rgba(34, 197, 94, 0.2)', border: '#22c55e', text: '#22c55e' };
  };

  const { minDate, maxDateStr } = getMinMaxDate();

  const styles = `
    @keyframes rotate3d {
      0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
      100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
    }
    
    @keyframes glow {
      0%, 100% { filter: drop-shadow(0 0 15px rgba(255, 107, 107, 0.6)); }
      50% { filter: drop-shadow(0 0 25px rgba(255, 165, 0, 0.8)); }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px) translateX(0px); }
      25% { transform: translateY(-30px) translateX(20px); }
      50% { transform: translateY(-60px) translateX(-20px); }
      75% { transform: translateY(-30px) translateX(30px); }
    }
    
    @keyframes alertFlash {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .animated-bg {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1a0000 0%, #330000 50%, #660000 100%);
      overflow: hidden;
      z-index: 0;
    }
    
    .floating-cube {
      position: absolute;
      width: 80px;
      height: 80px;
      border: 2px solid rgba(255, 107, 107, 0.5);
      animation: rotate3d 8s linear infinite;
    }
    
    .alert-glow {
      animation: glow 2s ease-in-out infinite;
    }
    
    .particle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 107, 107, 0.2);
      animation: float 8s ease-in-out infinite;
    }
  `;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', color: 'white' }}>
      <style>{styles}</style>

      {/* Animated Background */}
      <div className="animated-bg">
        <div className="floating-cube" style={{ top: '10%', left: '10%', animation: 'rotate3d 10s linear infinite' }} />
        <div className="floating-cube" style={{ top: '60%', right: '15%', width: '120px', height: '120px', animation: 'rotate3d 12s linear infinite reverse' }} />
        <div className="floating-cube" style={{ bottom: '20%', left: '20%', width: '60px', height: '60px', animation: 'rotate3d 8s linear infinite' }} />
        
        <div className="particle" style={{ width: '30px', height: '30px', top: '30%', left: '15%', animation: 'float 6s ease-in-out infinite' }} />
        <div className="particle" style={{ width: '20px', height: '20px', top: '50%', right: '10%', animation: 'float 8s ease-in-out infinite 1s' }} />
        <div className="particle" style={{ width: '25px', height: '25px', bottom: '40%', left: '50%', animation: 'float 7s ease-in-out infinite 2s' }} />
        
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 20% 50%, rgba(255, 107, 107, 0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 80% 80%, rgba(255, 165, 0, 0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        {/* Back Button */}
        <Link to="/" style={{ position: 'absolute', top: '24px', left: '24px', color: '#ff6b35', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.2s', fontWeight: '600' }}
          onMouseEnter={(e) => e.target.style.color = '#ff8a50'}
          onMouseLeave={(e) => e.target.style.color = '#ff6b35'}>
          ← Back to Home
        </Link>

        {/* Main Container */}
        <div style={{ maxWidth: '32rem', width: '100%' }}>
          {/* Title */}
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #ff6b35, #ff1744)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px', textAlign: 'center' }}>
            Extreme Weather Alert 🚨
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#ff8a50', textAlign: 'center', marginBottom: '32px' }}>
            AI-powered risk detection for next 5 days
          </p>

          {/* Form Card */}
          <form onSubmit={handleSubmit} style={{ backgroundColor: 'rgba(30, 0, 0, 0.9)', padding: '32px', borderRadius: '16px', boxShadow: '0 20px 60px rgba(255, 107, 107, 0.2)', border: '2px solid rgba(255, 107, 107, 0.3)', backdropFilter: 'blur(10px)' }}>

            {/* Prediction Type */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px', color: '#ff6b35' }}>Prediction Type</label>
              <select
                name="predictionType"
                value={form.predictionType}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255, 107, 107, 0.1)', border: '2px solid rgba(255, 107, 107, 0.3)', color: 'white', fontSize: '1rem', cursor: 'pointer' }}
              >
                <option value="Rainfall">🌊 Heavy Rainfall</option>
                <option value="Heatwave">🔥 Heatwave</option>
                <option value="Cold Wave">❄️ Cold Wave</option>
              </select>
            </div>

            {/* City */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px', color: '#ff6b35' }}>City (India)</label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255, 107, 107, 0.1)', border: '2px solid rgba(255, 107, 107, 0.3)', color: 'white', fontSize: '1rem', cursor: 'pointer' }}
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px', color: '#ff6b35' }}>Date (Next 5 Days)</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                min={minDate}
                max={maxDateStr}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255, 107, 107, 0.1)', border: '2px solid rgba(255, 107, 107, 0.3)', color: 'white', fontSize: '1rem', cursor: 'pointer' }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div style={{ backgroundColor: 'rgba(255, 107, 107, 0.2)', border: '2px solid #ff6b6b', padding: '12px', borderRadius: '8px', marginBottom: '20px', color: '#ff6b6b', fontSize: '0.9rem', textAlign: 'center' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                background: loading ? 'rgba(255, 107, 107, 0.5)' : 'linear-gradient(135deg, #ff6b35, #ff1744)',
                border: 'none',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(255, 107, 107, 0.4)',
              }}
              onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.6)')}
              onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.4)')}
            >
              {loading ? "Analyzing..." : "Check Risk"}
            </button>
          </form>

          {/* Result Card */}
          {result && !loading && result.success !== false && result.weather && (
            <div style={{ marginTop: '32px', animation: 'fadeIn 0.5s ease-in' }}>
              <div style={{
                backgroundColor: getAlertColor(result.isExtreme).bg,
                border: `2px solid ${getAlertColor(result.isExtreme).border}`,
                padding: '24px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                textAlign: 'center',
                animation: result.isExtreme ? 'alertFlash 0.8s ease-in-out' : 'none'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
                  {getEmojiByRisk(result.riskType)}
                </div>
                
                <h2 style={{
                  fontSize: '1.75rem',
                  fontWeight: 'bold',
                  color: getAlertColor(result.isExtreme).text,
                  marginBottom: '8px'
                }}>
                  {result.isExtreme ? '⚠️ EXTREME RISK' : '✅ Normal Conditions'}
                </h2>

                <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '20px' }}>
                  {result.riskType}
                </p>

                {/* Risk Probability */}
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '0.9rem', color: '#ff8a50', marginBottom: '8px' }}>Risk Probability</p>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getAlertColor(result.isExtreme).text }}>
                    {(result.probability * 100).toFixed(1)}%
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '4px', marginTop: '12px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${result.probability * 100}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${result.isExtreme ? '#ff6b35' : '#22c55e'}, ${result.isExtreme ? '#ff1744' : '#16a34a'})`,
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>

                {/* Weather Data */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '12px', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.8rem', color: '#ff8a50', marginBottom: '4px' }}>Temperature</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                      {result.weather?.temp !== undefined ? `${result.weather.temp}°C` : 'N/A'}
                    </p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '12px', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.8rem', color: '#ff8a50', marginBottom: '4px' }}>Rainfall</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                      {result.weather?.rain !== undefined ? `${result.weather.rain}mm` : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                {result.isExtreme && (
                  <div style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #ff6b6b' }}>
                    <p style={{ fontSize: '0.85rem', color: '#ff8a50', marginBottom: '8px', fontWeight: '600' }}>⚡ Alert Recommendations:</p>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                      {result.riskType === 'Heatwave' && 'Stay hydrated, avoid outdoor activities during peak hours (11 AM - 4 PM), use sunscreen.'}
                      {result.riskType === 'Heavy Rain' && 'Avoid travel if possible, keep emergency supplies ready, check drainage systems.'}
                      {result.riskType === 'Cold Wave' && 'Use winter protective gear, limit outdoor exposure, monitor weather updates.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Analysis Details */}
              <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'rgba(30, 0, 0, 0.5)', borderRadius: '8px', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                <p style={{ margin: '0' }}>📍 {form.city} • 📅 {form.date}</p>
                <p style={{ margin: '4px 0 0 0' }}>🤖 XGBoost ML Model Analysis</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdvancedPredict;
