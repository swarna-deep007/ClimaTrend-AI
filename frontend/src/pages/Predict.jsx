import { useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';

function Predict() {
  const [form, setForm] = useState({
    predictionType: "rainfall",
    country: "India",
    city: "",
    date: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTrendPreview, setShowTrendPreview] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorValue, setSimulatorValue] = useState(0);

  // Generate AI Insights based on prediction
  const generateAIInsights = (prediction) => {
    const { prediction_type, value, classification, location } = prediction;
    const insights = [];
    const suggestions = [];

    // Extract numeric value from string (handles "50 mm", "50.5", etc.)
    const numValue = parseFloat(value.toString().replace(/[^\d.-]/g, '')) || 0;

    if (prediction_type === "temperature") {
      if (numValue > 40) {
        insights.push("🔥 Temperature is exceptionally high for this region");
        insights.push("⚠️ Heatwave conditions detected");
        suggestions.push("Stay hydrated throughout the day");
        suggestions.push("Avoid outdoor exposure during peak hours (11 AM - 4 PM)");
        suggestions.push("Use sunscreen and protective clothing");
      } else if (numValue > 35) {
        insights.push("🌡️ Temperature is unusually high for this month");
        suggestions.push("Stay well-hydrated");
        suggestions.push("Limit outdoor activities");
      } else if (numValue < 0) {
        insights.push("❄️ Freezing temperatures detected");
        insights.push("Winter conditions warning");
        suggestions.push("Bundle up in warm clothing");
        suggestions.push("Be cautious of icy conditions");
      } else if (numValue < 5) {
        insights.push("🧊 Temperature is below normal for this season");
        suggestions.push("Wear warm layers");
        suggestions.push("Check heating systems");
      } else {
        insights.push("✅ Temperature within normal range");
        suggestions.push("Normal weather conditions expected");
      }
    } else if (prediction_type === "rainfall") {
      if (numValue > 100) {
        insights.push("🌊 Heavy rainfall predicted");
        insights.push("⚠️ Flood risk warning");
        suggestions.push("Avoid low-lying areas");
        suggestions.push("Check drainage systems");
        suggestions.push("Stock up on necessities");
      } else if (numValue > 50) {
        insights.push("🌧️ Moderate to heavy rainfall expected");
        suggestions.push("Carry an umbrella");
        suggestions.push("Drive carefully on wet roads");
      } else if (numValue > 10) {
        insights.push("🌦️ Light to moderate rainfall expected");
        suggestions.push("Umbrella recommended");
      } else if (numValue > 0) {
        insights.push("🌧️ Minimal rainfall expected");
        suggestions.push("Light drizzle possible");
      } else {
        insights.push("☀️ No rainfall expected - Clear conditions");
        suggestions.push("Perfect day for outdoor activities");
      }
    } else if (prediction_type === "snowfall") {
      if (numValue > 30) {
        insights.push("❄️ Heavy snowfall warning");
        insights.push("🚨 Severe weather conditions expected");
        suggestions.push("Avoid travel if possible");
        suggestions.push("Stock emergency supplies");
        suggestions.push("Keep snow removal equipment ready");
      } else if (numValue > 10) {
        insights.push("🌨️ Significant snowfall predicted");
        suggestions.push("Plan extra travel time");
        suggestions.push("Use winter tires");
      } else if (numValue > 0) {
        insights.push("❄️ Light snow expected");
        suggestions.push("Dress warmly for outdoor activities");
      } else {
        insights.push("No snowfall expected");
      }
    }

    // Add classification-based insight
    if (classification === "Extreme") {
      if (!insights.some(i => i.includes("⚠️"))) {
        insights.push("⚠️ Extreme weather conditions detected");
      }
      suggestions.unshift("Monitor weather updates continuously");
    }

    return { insights, suggestions };
  };

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/predict-weather",
        {
          country: form.country,
          city: form.city,
          date: form.date,
          prediction_type: form.predictionType,
        }
      );

      // Add prediction_type to result so AI Insights can use it
      setResult({
        ...response.data,
        prediction_type: form.predictionType
      });
    } catch (error) {
      console.error(error);
      alert("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  const styles = `
    @keyframes rotate3d {
      0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
      100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px) translateX(0px); }
      25% { transform: translateY(-30px) translateX(20px); }
      50% { transform: translateY(-60px) translateX(-20px); }
      75% { transform: translateY(-30px) translateX(30px); }
    }
    
    @keyframes pulse3d {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }
    
    @keyframes moveLeft {
      0%, 100% { transform: translateX(0) translateY(0); }
      50% { transform: translateX(-50px) translateY(30px); }
    }
    
    @keyframes moveRight {
      0%, 100% { transform: translateX(0) translateY(0); }
      50% { transform: translateX(50px) translateY(-30px); }
    }
    
    .animated-bg {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 0;
    }
    
    .floating-cube {
      position: absolute;
      width: 80px;
      height: 80px;
      animation: rotate3d 8s linear infinite;
    }
    
    .sphere {
      position: absolute;
      border-radius: 50%;
      animation: pulse3d 4s ease-in-out infinite;
    }
    
    .particle {
      position: absolute;
      border-radius: 50%;
      animation: float 8s ease-in-out infinite;
    }
    
    .animated-bg {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      overflow: hidden;
      z-index: 0;
    }
    
    .floating-cube {
      position: absolute;
      width: 80px;
      height: 80px;
      border: 2px solid rgba(0, 212, 255, 0.5);
      animation: rotate3d 8s linear infinite;
    }
    
    .sphere {
      position: absolute;
      border-radius: 50%;
      border: 2px solid rgba(124, 58, 237, 0.4);
      animation: pulse3d 4s ease-in-out infinite;
    }
    
    .particle {
      position: absolute;
      border-radius: 50%;
      background: rgba(0, 212, 255, 0.2);
      animation: float 8s ease-in-out infinite;
    }
    
    .content-wrapper {
      position: relative;
      z-index: 10;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
  `;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', color: 'white' }}>
      <style>{styles}</style>
      
      {/* Animated Background */}
      <div className="animated-bg">
        {/* Floating Cubes */}
        <div className="floating-cube" style={{ top: '10%', left: '10%', animation: 'rotate3d 10s linear infinite' }} />
        <div className="floating-cube" style={{ top: '60%', right: '15%', width: '120px', height: '120px', animation: 'rotate3d 12s linear infinite reverse' }} />
        <div className="floating-cube" style={{ bottom: '20%', left: '20%', width: '60px', height: '60px', animation: 'rotate3d 8s linear infinite' }} />
        
        {/* Spheres */}
        <div className="sphere" style={{ width: '150px', height: '150px', top: '15%', right: '20%', animation: 'pulse3d 5s ease-in-out infinite' }} />
        <div className="sphere" style={{ width: '100px', height: '100px', bottom: '30%', left: '10%', animation: 'pulse3d 4s ease-in-out infinite' }} />
        
        {/* Floating Particles */}
        <div className="particle" style={{ width: '30px', height: '30px', top: '30%', left: '15%', animation: 'float 6s ease-in-out infinite' }} />
        <div className="particle" style={{ width: '20px', height: '20px', top: '50%', right: '10%', animation: 'float 8s ease-in-out infinite 1s' }} />
        <div className="particle" style={{ width: '25px', height: '25px', bottom: '40%', left: '50%', animation: 'float 7s ease-in-out infinite 2s' }} />
        
        {/* Moving Shapes */}
        <div style={{ position: 'absolute', width: '200px', height: '200px', top: '5%', left: '5%', border: '3px solid rgba(0, 212, 255, 0.2)', borderRadius: '20%', animation: 'moveLeft 10s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: '150px', height: '150px', bottom: '10%', right: '10%', border: '3px solid rgba(124, 58, 237, 0.2)', borderRadius: '30%', animation: 'moveRight 12s ease-in-out infinite' }} />
        
        {/* Gradient Overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 80% 80%, rgba(124, 58, 237, 0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
      </div>

      {/* Content */}
      <div className="content-wrapper">
        <div style={{ maxWidth: '28rem', width: '100%' }}>
          {/* Back to Home */}
          <Link to="/" style={{ color: '#00d4ff', textDecoration: 'none', marginBottom: '16px', display: 'inline-block', fontSize: '1rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#7c3aed'} onMouseLeave={(e) => e.target.style.color = '#00d4ff'}>
            ← Back to Home
          </Link>

          {/* Title */}
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '40px', textAlign: 'center' }}>
            Weather Prediction 🌦️
          </h1>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ backgroundColor: 'rgba(30, 30, 50, 0.9)', padding: '24px', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0, 212, 255, 0.2)', border: '1px solid rgba(0, 212, 255, 0.2)', backdropFilter: 'blur(10px)' }}
          >
            {/* Prediction Type */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px', color: '#00d4ff' }}>Prediction Type</label>
              <select
                name="predictionType"
                value={form.predictionType}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f3460', border: '2px solid rgba(0, 212, 255, 0.3)', color: 'white', fontSize: '1rem' }}
              >
                <option value="rainfall">Rainfall</option>
                <option value="temperature">Temperature</option>
                <option value="snowfall">Snowfall</option>
              </select>
            </div>

            {/* Country */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px', color: '#00d4ff' }}>Country</label>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f3460', border: '2px solid rgba(0, 212, 255, 0.3)', color: 'white', fontSize: '1rem' }}
              >
                <option value="India">India</option>
                <option value="Japan">Japan</option>
              </select>
            </div>

            {/* City */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px', color: '#00d4ff' }}>City</label>
              <input
                type="text"
                name="city"
                placeholder="Enter city"
                value={form.city}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f3460', border: '2px solid rgba(0, 212, 255, 0.3)', color: 'white', fontSize: '1rem' }}
                required
              />
            </div>

            {/* Date */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px', color: '#00d4ff' }}>Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f3460', border: '2px solid rgba(0, 212, 255, 0.3)', color: 'white', fontSize: '1rem' }}
                required
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              style={{ width: '100%', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', color: 'white', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={(e) => { e.target.style.transform = 'scale(1.02)'; e.target.style.boxShadow = '0 12px 32px rgba(0, 212, 255, 0.4)'; }}
              onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = 'none'; }}
            >
              {loading ? "Predicting..." : "Predict"}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div style={{ marginTop: '24px' }}>
              {/* Prediction Result Card */}
              <div style={{ marginBottom: '20px', backgroundColor: 'rgba(30, 30, 50, 0.9)', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '2px solid rgba(124, 58, 237, 0.5)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 24px rgba(124, 58, 237, 0.2)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px', color: '#7c3aed' }}>📊 Prediction Result</h2>
                <p style={{ color: '#b0b0b0', marginBottom: '8px', fontSize: '0.95rem' }}>📍 {result.location}</p>
                <p style={{ color: '#b0b0b0', marginBottom: '16px', fontSize: '0.95rem' }}>📅 {result.date}</p>
                <p style={{ fontSize: '2rem', marginTop: '16px', color: '#00d4ff', fontWeight: 'bold' }}>{result.value}</p>
                <p style={{ marginTop: '12px', fontWeight: 'bold', padding: '8px', borderRadius: '8px', backgroundColor: result.classification === "Extreme" ? 'rgba(255, 107, 107, 0.2)' : 'rgba(0, 212, 255, 0.15)', color: result.classification === "Extreme" ? '#ff6b6b' : '#00d4ff' }}>
                  {result.classification === "Extreme" ? '🚨' : '✓'} {result.classification}
                </p>
              </div>

              {/* AI Insights Panel */}
              {(() => {
                const { insights, suggestions } = generateAIInsights(result);
                return (
                  <div style={{ backgroundColor: 'rgba(124, 58, 237, 0.15)', padding: '24px', borderRadius: '12px', border: '2px solid rgba(124, 58, 237, 0.4)', backdropFilter: 'blur(10px)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🧠 AI Insights
                    </h3>

                    {/* Key Insights */}
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#00d4ff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Key Observations</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {insights.map((insight, idx) => (
                          <div key={idx} style={{ backgroundColor: 'rgba(30, 30, 50, 0.8)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #00d4ff', color: '#b0b0b0', fontSize: '0.95rem' }}>
                            {insight}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#00d4ff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💡 Recommendations</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {suggestions.map((suggestion, idx) => (
                          <div key={idx} style={{ backgroundColor: 'rgba(30, 30, 50, 0.8)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #00d4ff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '1.25rem' }}>✓</span>
                            <span style={{ color: '#b0b0b0', fontSize: '0.95rem' }}>{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
                      <button
                        onClick={() => setShowTrendPreview(!showTrendPreview)}
                        style={{ backgroundColor: 'rgba(0, 212, 255, 0.2)', border: '2px solid #00d4ff', color: '#00d4ff', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' }}
                        onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(0, 212, 255, 0.4)'; e.target.style.boxShadow = '0 0 12px rgba(0, 212, 255, 0.4)'; }}
                        onMouseLeave={(e) => { e.target.style.backgroundColor = 'rgba(0, 212, 255, 0.2)'; e.target.style.boxShadow = 'none'; }}
                      >
                        📊 View Future Trend
                      </button>
                      <button
                        onClick={() => setShowSimulator(!showSimulator)}
                        style={{ backgroundColor: 'rgba(124, 58, 237, 0.2)', border: '2px solid #7c3aed', color: '#7c3aed', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' }}
                        onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(124, 58, 237, 0.4)'; e.target.style.boxShadow = '0 0 12px rgba(124, 58, 237, 0.4)'; }}
                        onMouseLeave={(e) => { e.target.style.backgroundColor = 'rgba(124, 58, 237, 0.2)'; e.target.style.boxShadow = 'none'; }}
                      >
                        🧪 What If Simulator
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Climate Trend Preview */}
              {showTrendPreview && result && result.trend && (
                <div style={{ marginTop: '20px', backgroundColor: 'rgba(0, 212, 255, 0.1)', padding: '24px', borderRadius: '12px', border: '2px solid rgba(0, 212, 255, 0.4)', backdropFilter: 'blur(10px)' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', color: '#00d4ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📈 Climate Trend Preview (Next 6 Months)
                  </h3>
                  
                  {/* Simple Line Chart */}
                  <div style={{ marginBottom: '20px', position: 'relative', height: '200px', backgroundColor: 'rgba(30, 30, 50, 0.5)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
                    <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                      {/* Grid lines */}
                      {[...Array(5)].map((_, i) => (
                        <line key={`grid-${i}`} x1="0" y1={`${(i / 4) * 100}%`} x2="100%" y2={`${(i / 4) * 100}%`} stroke="rgba(0, 212, 255, 0.1)" strokeWidth="1" />
                      ))}
                      
                      {/* Line path */}
                      {result.trend.length > 0 && (() => {
                        const minVal = Math.min(...result.trend.map(d => d.value));
                        const maxVal = Math.max(...result.trend.map(d => d.value));
                        const range = maxVal - minVal || 1;
                        const points = result.trend.map((d, i) => {
                          const x = (i / (result.trend.length - 1 || 1)) * 100;
                          const y = 100 - ((d.value - minVal) / range) * 100;
                          return `${x},${y}`;
                        });
                        return (
                          <>
                            <polyline points={points.join(' ')} fill="none" stroke="#00d4ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            {result.trend.map((d, i) => {
                              const x = (i / (result.trend.length - 1 || 1)) * 100;
                              const y = 100 - ((d.value - minVal) / range) * 100;
                              return (
                                <circle key={`dot-${i}`} cx={`${x}%`} cy={`${y}%`} r="4" fill="#7c3aed" stroke="#00d4ff" strokeWidth="2" />
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>
                  </div>

                  {/* Trend Data Table */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {result.trend.map((item, idx) => (
                      <div key={idx} style={{ backgroundColor: 'rgba(30, 30, 50, 0.8)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #00d4ff' }}>
                        <p style={{ color: '#b0b0b0', fontSize: '0.9rem', marginBottom: '4px' }}>{item.month}</p>
                        <p style={{ color: '#00d4ff', fontSize: '1.25rem', fontWeight: 'bold' }}>{item.value} {result.unit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What If Simulator */}
              {showSimulator && result && result.prediction_type && (
                <div style={{ marginTop: '20px', backgroundColor: 'rgba(124, 58, 237, 0.1)', padding: '24px', borderRadius: '12px', border: '2px solid rgba(124, 58, 237, 0.4)', backdropFilter: 'blur(10px)' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🧪 What If Simulator
                  </h3>

                  {(() => {
                    const originalValue = result.numeric_value;
                    const adjustedValue = originalValue + simulatorValue;
                    
                    // Determine classification for adjusted value
                    let adjustedClassification = 'Normal';
                    if (result.prediction_type === 'temperature') {
                      if (adjustedValue > 45) adjustedClassification = 'Extreme';
                      else if (adjustedValue > 30) adjustedClassification = 'Moderate';
                    } else {
                      if (adjustedValue > 100) adjustedClassification = 'Extreme';
                      else if (adjustedValue > 20) adjustedClassification = 'Moderate';
                    }

                    const changeText = simulatorValue > 0 ? `+${simulatorValue}` : `${simulatorValue}`;
                    const riskChanged = adjustedClassification !== result.classification;

                    return (
                      <div>
                        <p style={{ color: '#b0b0b0', marginBottom: '16px' }}>
                          Adjust {result.prediction_type === 'temperature' ? 'temperature' : 'rainfall'} to see how it affects the classification:
                        </p>

                        {/* Slider */}
                        <div style={{ marginBottom: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ color: '#7c3aed', fontWeight: '600' }}>
                              {result.prediction_type === 'temperature' ? 'Temperature Adjustment (°C)' : 'Rainfall Adjustment (mm)'}
                            </label>
                            <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>{changeText} {result.unit}</span>
                          </div>
                          <input
                            type="range"
                            min={result.prediction_type === 'temperature' ? '-15' : '-50'}
                            max={result.prediction_type === 'temperature' ? '15' : '50'}
                            value={simulatorValue}
                            onChange={(e) => setSimulatorValue(parseFloat(e.target.value))}
                            style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'linear-gradient(90deg, #ff6b6b, #00d4ff, #7c3aed)', cursor: 'pointer' }}
                          />
                        </div>

                        {/* Comparison Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                          {/* Original */}
                          <div style={{ backgroundColor: 'rgba(30, 30, 50, 0.8)', padding: '16px', borderRadius: '8px', border: '2px solid rgba(0, 212, 255, 0.3)' }}>
                            <p style={{ color: '#b0b0b0', fontSize: '0.9rem', marginBottom: '8px' }}>Current Scenario</p>
                            <p style={{ fontSize: '1.5rem', color: '#00d4ff', fontWeight: 'bold', marginBottom: '8px' }}>{originalValue} {result.unit}</p>
                            <p style={{ padding: '8px', borderRadius: '6px', backgroundColor: result.classification === 'Extreme' ? 'rgba(255, 107, 107, 0.2)' : 'rgba(0, 212, 255, 0.15)', color: result.classification === 'Extreme' ? '#ff6b6b' : '#00d4ff', fontWeight: '600' }}>
                              {result.classification}
                            </p>
                          </div>

                          {/* Adjusted */}
                          <div style={{ backgroundColor: 'rgba(30, 30, 50, 0.8)', padding: '16px', borderRadius: '8px', border: `2px solid ${riskChanged ? '#ff6b6b' : 'rgba(0, 212, 255, 0.3)'}`, boxShadow: riskChanged ? '0 0 16px rgba(255, 107, 107, 0.3)' : 'none' }}>
                            <p style={{ color: '#b0b0b0', fontSize: '0.9rem', marginBottom: '8px' }}>If {result.prediction_type} {simulatorValue > 0 ? 'increases' : 'decreases'} by {Math.abs(simulatorValue)}</p>
                            <p style={{ fontSize: '1.5rem', color: '#7c3aed', fontWeight: 'bold', marginBottom: '8px' }}>{adjustedValue.toFixed(2)} {result.unit}</p>
                            <p style={{ padding: '8px', borderRadius: '6px', backgroundColor: adjustedClassification === 'Extreme' ? 'rgba(255, 107, 107, 0.2)' : adjustedClassification === 'Moderate' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(0, 212, 255, 0.15)', color: adjustedClassification === 'Extreme' ? '#ff6b6b' : adjustedClassification === 'Moderate' ? '#ffc107' : '#00d4ff', fontWeight: '600' }}>
                              {adjustedClassification} {riskChanged && '⚠️ CHANGED'}
                            </p>
                          </div>
                        </div>

                        {/* Insight Message */}
                        {riskChanged && (
                          <div style={{ backgroundColor: adjustedClassification === 'Extreme' ? 'rgba(255, 107, 107, 0.15)' : 'rgba(255, 193, 7, 0.15)', padding: '16px', borderRadius: '8px', border: `1px solid ${adjustedClassification === 'Extreme' ? 'rgba(255, 107, 107, 0.4)' : 'rgba(255, 193, 7, 0.4)'}` }}>
                            <p style={{ color: adjustedClassification === 'Extreme' ? '#ff6b6b' : '#ffc107', fontWeight: '600' }}>
                              🔔 If {result.prediction_type} {simulatorValue > 0 ? 'increases' : 'decreases'} by {Math.abs(simulatorValue)} {result.unit}, the risk classification would become <strong>{adjustedClassification}</strong>
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Predict;