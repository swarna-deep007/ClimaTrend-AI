import { useState, useEffect } from "react";
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
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('result');
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("predictionHistory");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error loading history:", e);
      }
    }
  }, []);

  // Handle window resize to track mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("predictionHistory", JSON.stringify(history));
  }, [history]);

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

  // Remove a prediction from history
  const removePrediction = (id) => {
    setHistory(prev => prev.filter(p => p.id !== id));
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
      const resultData = {
        ...response.data,
        prediction_type: form.predictionType
      };
      setResult(resultData);

      // Add to prediction history (keep last 5)
      const newPrediction = {
        id: Date.now(),
        location: `${form.city}, ${form.country}`,
        value: resultData.value,
        unit: resultData.unit,
        classification: resultData.classification,
        predictionType: form.predictionType,
        timestamp: new Date().toLocaleString()
      };

      setHistory(prev => [newPrediction, ...prev].slice(0, 5));
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
      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <style>{`
          @media (max-width: 768px) {
            .history-sidebar {
              position: fixed;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.9);
              z-index: 999;
              padding: 20px;
              overflow-y: auto;
              display: ${showHistoryMobile ? 'flex' : 'none'};
              flex-direction: column;
            }
            .history-close-btn {
              align-self: flex-end;
              marginal-bottom: 16px;
              margin-bottom: 16px;
            }
          }
        `}</style>
        
        {/* Prediction History Sidebar - Desktop View */}
        <div className="history-sidebar" style={{ position: 'fixed', left: '24px', top: '24px', width: '280px', maxHeight: '70vh', backgroundColor: 'rgba(0, 212, 255, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0, 212, 255, 0.3)', backdropFilter: 'blur(10px)', overflowY: 'auto', zIndex: 11, display: !isMobile ? 'block' : 'none' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '12px', color: '#00d4ff', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0' }}>
            📜 Recent
          </h3>
          {history.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: '#707070', textAlign: 'center', padding: '20px 10px', fontStyle: 'italic' }}>
              No predictions yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {history.map((pred) => {
                const getEmoji = (type) => {
                  if (type === 'temperature') return '🌡️';
                  if (type === 'rainfall') return '🌧️';
                  if (type === 'snowfall') return '❄️';
                  return '📊';
                };

                return (
                  <div
                    key={pred.id}
                    style={{
                      backgroundColor: 'rgba(30, 30, 50, 0.7)',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 212, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(30, 30, 50, 0.95)';
                      e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 212, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(30, 30, 50, 0.7)';
                      e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '1rem' }}>{getEmoji(pred.predictionType)}</span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '0.8rem', color: '#b0b0b0', margin: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {pred.location}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#00d4ff', fontWeight: '600', margin: '2px 0 0 0' }}>
                          {pred.value}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePrediction(pred.id);
                      }}
                      style={{
                        background: 'rgba(255, 107, 107, 0.2)',
                        border: '1px solid rgba(255, 107, 107, 0.4)',
                        color: '#ff6b6b',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        padding: 0,
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.4)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.2)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      title="Remove prediction"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile History Icon Button */}
        {isMobile && (
          <button
            onClick={() => setShowHistoryMobile(!showHistoryMobile)}
            style={{
              position: 'fixed',
              left: '24px',
              top: '24px',
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: 'rgba(0, 212, 255, 0.2)',
              border: '2px solid rgba(0, 212, 255, 0.5)',
              color: '#00d4ff',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              zIndex: 997,
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 212, 255, 0.35)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.5)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 212, 255, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.3)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={`${history.length} predictions`}
          >
            📜
          </button>
        )}

        {/* Mobile History Modal */}
        {showHistoryMobile && isMobile && (
          <div style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 998,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#00d4ff', margin: 0 }}>📜 Recent Predictions</h3>
              <button
                onClick={() => setShowHistoryMobile(false)}
                style={{
                  background: 'rgba(255, 107, 107, 0.2)',
                  border: '1px solid rgba(255, 107, 107, 0.4)',
                  color: '#ff6b6b',
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  fontWeight: 'bold'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.4)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.2)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ✕
              </button>
            </div>

            {history.length === 0 ? (
              <div style={{ fontSize: '1rem', color: '#707070', textAlign: 'center', padding: '40px 20px', fontStyle: 'italic' }}>
                No predictions yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {history.map((pred) => {
                  const getEmoji = (type) => {
                    if (type === 'temperature') return '🌡️';
                    if (type === 'rainfall') return '🌧️';
                    if (type === 'snowfall') return '❄️';
                    return '📊';
                  };

                  return (
                    <div
                      key={pred.id}
                      style={{
                        backgroundColor: 'rgba(30, 41, 59, 0.8)',
                        padding: '16px',
                        borderRadius: '10px',
                        border: '1px solid rgba(0, 212, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <span style={{ fontSize: '1.5rem' }}>{getEmoji(pred.predictionType)}</span>
                        <div>
                          <p style={{ fontSize: '1rem', color: '#b0b0b0', margin: '0', fontWeight: '600' }}>
                            {pred.location}
                          </p>
                          <p style={{ fontSize: '0.9rem', color: '#00d4ff', fontWeight: '700', margin: '4px 0 0 0' }}>
                            {pred.value} {pred.unit}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#707070', margin: '2px 0 0 0' }}>
                            {pred.timestamp}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePrediction(pred.id);
                        }}
                        style={{
                          background: 'rgba(255, 107, 107, 0.2)',
                          border: '1px solid rgba(255, 107, 107, 0.4)',
                          color: '#ff6b6b',
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '1.3rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          padding: 0,
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.4)';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.2)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Remove prediction"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Main Form Section */}
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
            <div style={{ marginTop: '32px' }}>
              <style>{`
                .tab-nav-container {
                  display: flex;
                  justify-content: center;
                  flex-wrap: wrap;
                  gap: 8px;
                  margin-bottom: 28px;
                }
                
                .tab-button {
                  flex: 0 1 auto;
                  min-width: 0;
                }
                
                @media (max-width: 768px) {
                  .tab-nav-container {
                    gap: 6px !important;
                    padding: 10px !important;
                  }
                  .tab-button {
                    flex: 1 1 calc(50% - 6px) !important;
                    padding: 10px 8px !important;
                    font-size: 0.75rem !important;
                    white-space: normal !important;
                    word-break: break-word !important;
                    min-width: 0 !important;
                    text-align: center;
                  }
                }
                
                @media (max-width: 640px) {
                  .tab-nav-container {
                    gap: 4px !important;
                    padding: 8px !important;
                  }
                  .tab-button {
                    flex: 1 1 calc(50% - 4px) !important;
                    padding: 8px 6px !important;
                    font-size: 0.7rem !important;
                  }
                }
                
                @media (max-width: 480px) {
                  .tab-nav-container {
                    gap: 4px !important;
                  }
                  .tab-button {
                    flex: 1 1 calc(50% - 4px) !important;
                    padding: 6px 4px !important;
                    font-size: 0.65rem !important;
                  }
                }
              `}</style>
              {/* Enhanced Tab Navigation */}
              <div className="tab-nav-container" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '14px', border: '1px solid rgba(0, 212, 255, 0.2)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0, 212, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)' }}>
                {[
                  { id: 'result', label: '📊 Result', color: '#00d4ff', icon: '✨' },
                  { id: 'insights', label: '🧠 Insights', color: '#7c3aed', icon: '💡' },
                  { id: 'trend', label: '📈 Trend', color: '#00d4ff', icon: '📉', disabled: !result.trend },
                  { id: 'simulator', label: '🧪 Simulator', color: '#7c3aed', icon: '⚡', disabled: !result.prediction_type }
                ].map(tab => (
                  <button
                    className="tab-button"
                    key={tab.id}
                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '10px',
                      border: activeTab === tab.id ? `2px solid ${tab.color}` : '1px solid rgba(0, 212, 255, 0.1)',
                      backgroundColor: activeTab === tab.id ? `${tab.color}15` : tab.disabled ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                      color: activeTab === tab.id ? tab.color : tab.disabled ? '#505050' : '#b0b0b0',
                      cursor: tab.disabled ? 'not-allowed' : 'pointer',
                      fontWeight: activeTab === tab.id ? '700' : '600',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontSize: '0.95rem',
                      boxShadow: activeTab === tab.id ? `0 0 20px ${tab.color}60, inset 0 1px 0 rgba(255, 255, 255, 0.1)` : tab.disabled ? 'none' : 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      position: 'relative',
                      overflow: 'hidden',
                      opacity: tab.disabled ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.id && !tab.disabled) {
                        e.target.style.borderColor = tab.color;
                        e.target.style.color = tab.color;
                        e.target.style.backgroundColor = `${tab.color}10`;
                        e.target.style.boxShadow = `0 0 15px ${tab.color}40, inset 0 1px 0 rgba(255, 255, 255, 0.05)`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.id && !tab.disabled) {
                        e.target.style.borderColor = 'rgba(0, 212, 255, 0.1)';
                        e.target.style.color = '#b0b0b0';
                        e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                        e.target.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.05)';
                      }
                    }}
                    disabled={tab.disabled}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content with Smooth Animation */}
              <div style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                <style>{`
                  @keyframes fadeInUp {
                    from { 
                      opacity: 0; 
                      transform: translateY(20px);
                    }
                    to { 
                      opacity: 1; 
                      transform: translateY(0);
                    }
                  }
                  @keyframes slideIn {
                    from { 
                      opacity: 0;
                      transform: translateX(-10px);
                    }
                    to { 
                      opacity: 1;
                      transform: translateX(0);
                    }
                  }
                  @keyframes glow {
                    0%, 100% { 
                      box-shadow: 0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1);
                    }
                    50% { 
                      box-shadow: 0 0 30px rgba(0, 212, 255, 0.5), 0 0 60px rgba(0, 212, 255, 0.2);
                    }
                  }
                `}</style>

                {/* Result Tab - Modern Card Design */}
                {activeTab === 'result' && (
                  <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', padding: '32px', borderRadius: '18px', textAlign: 'center', border: '1px solid rgba(0, 212, 255, 0.3)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0, 212, 255, 0.15), 0 0 40px rgba(124, 58, 237, 0.1)', position: 'relative', overflow: 'hidden' }}>
                    {/* Gradient Background */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at top right, rgba(0, 212, 255, 0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '28px', color: '#00d4ff', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'center' }}>🎯 Prediction Result</h2>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                        <div style={{ backgroundColor: 'rgba(124, 58, 237, 0.15)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(124, 58, 237, 0.3)', backdropFilter: 'blur(10px)' }}>
                          <p style={{ color: '#b0b0b0', fontSize: '0.85rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📍 Location</p>
                          <p style={{ color: '#00d4ff', fontSize: '1.3rem', fontWeight: 'bold', margin: 0 }}>{result.location}</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(0, 212, 255, 0.15)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(0, 212, 255, 0.3)', backdropFilter: 'blur(10px)' }}>
                          <p style={{ color: '#b0b0b0', fontSize: '0.85rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📅 Date</p>
                          <p style={{ color: '#7c3aed', fontSize: '1.3rem', fontWeight: 'bold', margin: 0 }}>{result.date}</p>
                        </div>
                      </div>

                      {/* Main Value Display */}
                      <div style={{ backgroundColor: 'rgba(0, 212, 255, 0.08)', padding: '32px', borderRadius: '14px', border: '2px solid rgba(0, 212, 255, 0.4)', backdropFilter: 'blur(15px)', marginBottom: '24px', animation: 'glow 3s ease-in-out infinite' }}>
                        <p style={{ color: '#b0b0b0', fontSize: '0.9rem', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Predicted Value</p>
                        <p style={{ fontSize: '3.5rem', color: '#00d4ff', fontWeight: 'bold', margin: '0 0 8px 0', textShadow: '0 0 20px rgba(0, 212, 255, 0.5)' }}>{result.value}</p>
                        {/* <p style={{ color: '#707070', fontSize: '1rem', margin: 0 }}>{result.unit}</p> */}
                      </div>

                      {/* Risk Classification */}
                      <div style={{ 
                        padding: '16px', 
                        borderRadius: '12px', 
                        backgroundColor: result.classification === "Extreme" ? 'rgba(255, 107, 107, 0.15)' : result.classification === "Moderate" ? 'rgba(255, 193, 7, 0.15)' : 'rgba(0, 212, 255, 0.15)', 
                        color: result.classification === "Extreme" ? '#ff6b6b' : result.classification === "Moderate" ? '#ffc107' : '#00d4ff', 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem', 
                        border: `2px solid ${result.classification === "Extreme" ? 'rgba(255, 107, 107, 0.5)' : result.classification === "Moderate" ? 'rgba(255, 193, 7, 0.5)' : 'rgba(0, 212, 255, 0.5)'}`,
                        backdropFilter: 'blur(10px)',
                        boxShadow: `0 0 15px ${result.classification === "Extreme" ? 'rgba(255, 107, 107, 0.3)' : result.classification === "Moderate" ? 'rgba(255, 193, 7, 0.3)' : 'rgba(0, 212, 255, 0.3)'}`,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {result.classification === "Extreme" ? '🚨' : result.classification === "Moderate" ? '⚠️' : '✓'} Risk Level: {result.classification}
                      </div>
                    </div>
                  </div>
                )}

                {/* Insights Tab */}
                {activeTab === 'insights' && (() => {
                  const { insights, suggestions } = generateAIInsights(result);
                  return (
                    <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', padding: '32px', borderRadius: '18px', border: '1px solid rgba(124, 58, 237, 0.3)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(124, 58, 237, 0.15), 0 0 40px rgba(124, 58, 237, 0.1)', position: 'relative', overflow: 'hidden' }}>
                      {/* Gradient Background */}
                      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'radial-gradient(circle at top left, rgba(124, 58, 237, 0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
                      
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '28px', color: '#7c3aed', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', textTransform: 'uppercase', letterSpacing: '1px', textShadow: '0 0 20px rgba(124, 58, 237, 0.3)' }}>
                          💡 AI Insights & Analysis
                        </h3>

                        {/* Key Observations */}
                        <div style={{ marginBottom: '32px' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#00d4ff', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>🔍 Key Observations</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {insights.map((insight, idx) => (
                              <div 
                                key={idx} 
                                style={{ 
                                  backgroundColor: 'rgba(0, 212, 255, 0.08)', 
                                  padding: '16px 18px', 
                                  borderRadius: '12px', 
                                  borderLeft: '3px solid #00d4ff',
                                  border: '1px solid rgba(0, 212, 255, 0.2)',
                                  color: '#b0b0b0', 
                                  fontSize: '0.95rem',
                                  backdropFilter: 'blur(10px)',
                                  animation: `slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.1}s both`,
                                  boxShadow: '0 4px 15px rgba(0, 212, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                                  lineHeight: '1.6'
                                }}>
                                <span style={{ color: '#00d4ff', fontWeight: '600' }}>▸</span> {insight}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#7c3aed', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>⚡ Recommendations</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {suggestions.map((suggestion, idx) => (
                              <div 
                                key={idx} 
                                style={{ 
                                  backgroundColor: 'rgba(124, 58, 237, 0.08)', 
                                  padding: '16px 18px', 
                                  borderRadius: '12px',
                                  border: '1px solid rgba(124, 58, 237, 0.2)',
                                  display: 'flex', 
                                  alignItems: 'flex-start', 
                                  gap: '14px',
                                  backdropFilter: 'blur(10px)',
                                  animation: `slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${(idx + insights.length) * 0.1}s both`,
                                  boxShadow: '0 4px 15px rgba(124, 58, 237, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                                  transition: 'all 0.3s ease'
                                }}>
                                <span style={{ fontSize: '1.2rem', flexShrink: 0, color: '#7c3aed', fontWeight: 'bold', textShadow: '0 0 10px rgba(124, 58, 237, 0.5)' }}>✦</span>
                                <span style={{ color: '#b0b0b0', fontSize: '0.95rem', lineHeight: '1.6' }}>{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Trend Tab */}
                {activeTab === 'trend' && result.trend && (
                  <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', padding: '32px', borderRadius: '18px', border: '1px solid rgba(0, 212, 255, 0.3)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0, 212, 255, 0.15), 0 0 40px rgba(0, 212, 255, 0.1)', position: 'relative', overflow: 'hidden' }}>
                    {/* Gradient Background */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at bottom left, rgba(0, 212, 255, 0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '28px', color: '#00d4ff', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', textTransform: 'uppercase', letterSpacing: '1px', textShadow: '0 0 20px rgba(0, 212, 255, 0.3)' }}>
                        📊 6-Month Forecast Trend
                      </h3>
                      
                      {/* Enhanced Line Chart */}
                      <div style={{ marginBottom: '32px', position: 'relative', height: '260px', backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: '14px', padding: '24px', border: '1px solid rgba(0, 212, 255, 0.2)', backdropFilter: 'blur(10px)', boxShadow: 'inset 0 2px 10px rgba(0, 212, 255, 0.05)' }}>
                        <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                          {/* Grid lines */}
                          {[...Array(5)].map((_, i) => (
                            <line 
                              key={`grid-${i}`} 
                              x1="0" 
                              y1={`${(i / 4) * 100}%`} 
                              x2="100%" 
                              y2={`${(i / 4) * 100}%`} 
                              stroke="rgba(0, 212, 255, 0.15)" 
                              strokeWidth="1.5"
                              strokeDasharray="4,4"
                            />
                          ))}
                          
                          {/* Line path with glow */}
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
                                {/* Glow line */}
                                <polyline 
                                  points={points.join(' ')} 
                                  fill="none" 
                                  stroke="rgba(0, 212, 255, 0.2)" 
                                  strokeWidth="8" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                  filter="url(#glow)"
                                />
                                {/* Main line */}
                                <polyline 
                                  points={points.join(' ')} 
                                  fill="none" 
                                  stroke="#00d4ff" 
                                  strokeWidth="3" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                                {/* Data points */}
                                {result.trend.map((d, i) => {
                                  const x = (i / (result.trend.length - 1 || 1)) * 100;
                                  const y = 100 - ((d.value - minVal) / range) * 100;
                                  return (
                                    <g key={`dot-${i}`}>
                                      <circle 
                                        cx={`${x}%`} 
                                        cy={`${y}%`} 
                                        r="7" 
                                        fill="rgba(124, 58, 237, 0.8)" 
                                        stroke="#7c3aed" 
                                        strokeWidth="2"
                                        style={{ filter: 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.6))' }}
                                      />
                                    </g>
                                  );
                                })}
                              </>
                            );
                          })()}
                          {/* SVG Filter for glow effect */}
                          <defs>
                            <filter id="glow">
                              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            </filter>
                          </defs>
                        </svg>
                      </div>

                      {/* Trend Data Cards - Responsive Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
                        {result.trend.map((item, idx) => (
                          <div 
                            key={idx} 
                            style={{ 
                              backgroundColor: 'rgba(0, 212, 255, 0.08)', 
                              padding: '18px 16px', 
                              borderRadius: '12px', 
                              textAlign: 'center', 
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                              cursor: 'pointer', 
                              border: '1px solid rgba(0, 212, 255, 0.2)',
                              backdropFilter: 'blur(10px)',
                              animation: `slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.08}s both`,
                              boxShadow: '0 4px 15px rgba(0, 212, 255, 0.08)'
                            }} 
                            onMouseEnter={(e) => { 
                              e.currentTarget.style.backgroundColor = 'rgba(0, 212, 255, 0.15)';
                              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 212, 255, 0.2), 0 0 20px rgba(0, 212, 255, 0.1)';
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.4)';
                            }} 
                            onMouseLeave={(e) => { 
                              e.currentTarget.style.backgroundColor = 'rgba(0, 212, 255, 0.08)';
                              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.08)';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.2)';
                            }}>
                            <p style={{ color: '#b0b0b0', fontSize: '0.8rem', marginBottom: '8px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{item.month}</p>
                            <p style={{ color: '#00d4ff', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 4px 0', textShadow: '0 0 10px rgba(0, 212, 255, 0.3)' }}>{item.value}</p>
                            <p style={{ color: '#707070', fontSize: '0.75rem', margin: '0', fontWeight: '500' }}>{result.unit}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulator Tab */}
                {activeTab === 'simulator' && result.prediction_type && (
                  <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', padding: '32px', borderRadius: '18px', border: '1px solid rgba(124, 58, 237, 0.3)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(124, 58, 237, 0.15), 0 0 40px rgba(124, 58, 237, 0.1)', position: 'relative', overflow: 'hidden' }}>
                    {/* Gradient Background */}
                    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'radial-gradient(circle at bottom right, rgba(124, 58, 237, 0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '28px', color: '#7c3aed', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', textTransform: 'uppercase', letterSpacing: '1px', textShadow: '0 0 20px rgba(124, 58, 237, 0.3)' }}>
                        ⚡ Interactive What-If Simulator
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
                            <p style={{ color: '#b0b0b0', marginBottom: '28px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                              💡 Adjust {result.prediction_type === 'temperature' ? 'temperature (°C)' : 'rainfall (mm)'} to simulate different scenarios and see how it impacts the risk classification:
                            </p>

                            {/* Slider Section - Enhanced */}
                            <div style={{ marginBottom: '32px', backgroundColor: 'rgba(124, 58, 237, 0.08)', padding: '24px', borderRadius: '14px', border: '1px solid rgba(124, 58, 237, 0.2)', backdropFilter: 'blur(10px)', boxShadow: 'inset 0 2px 10px rgba(124, 58, 237, 0.05)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <label style={{ color: '#7c3aed', fontWeight: '700', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  {result.prediction_type === 'temperature' ? '🌡️ Temperature' : '💧 Rainfall'} Adjustment
                                </label>
                                <span style={{ color: '#00d4ff', fontWeight: 'bold', fontSize: '1.25rem', textShadow: '0 0 10px rgba(0, 212, 255, 0.3)' }}>{changeText} {result.unit}</span>
                              </div>
                              <input
                                type="range"
                                min={result.prediction_type === 'temperature' ? '-15' : '-50'}
                                max={result.prediction_type === 'temperature' ? '15' : '50'}
                                value={simulatorValue}
                                onChange={(e) => setSimulatorValue(parseFloat(e.target.value))}
                                style={{ 
                                  width: '100%', 
                                  height: '8px', 
                                  borderRadius: '4px', 
                                  background: 'linear-gradient(90deg, #ff6b6b 0%, #00d4ff 50%, #7c3aed 100%)', 
                                  cursor: 'pointer',
                                  outline: 'none',
                                  WebkitAppearance: 'none',
                                  boxShadow: '0 0 15px rgba(0, 212, 255, 0.3)'
                                }}
                              />
                              <style>{`
                                input[type="range"]::-webkit-slider-thumb {
                                  -webkit-appearance: none;
                                  appearance: none;
                                  width: 20px;
                                  height: 20px;
                                  border-radius: 50%;
                                  background: #7c3aed;
                                  cursor: pointer;
                                  box-shadow: 0 0 15px rgba(124, 58, 237, 0.6), 0 0 30px rgba(0, 212, 255, 0.3);
                                  border: 2px solid #00d4ff;
                                }
                                input[type="range"]::-moz-range-thumb {
                                  width: 20px;
                                  height: 20px;
                                  border-radius: 50%;
                                  background: #7c3aed;
                                  cursor: pointer;
                                  box-shadow: 0 0 15px rgba(124, 58, 237, 0.6), 0 0 30px rgba(0, 212, 255, 0.3);
                                  border: 2px solid #00d4ff;
                                }
                              `}</style>
                            </div>

                            {/* Comparison Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '24px' }}>
                              {/* Original */}
                              <div style={{ 
                                backgroundColor: 'rgba(0, 212, 255, 0.08)', 
                                padding: '22px', 
                                borderRadius: '14px', 
                                border: '1px solid rgba(0, 212, 255, 0.2)', 
                                transition: 'all 0.3s ease',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 4px 15px rgba(0, 212, 255, 0.08)'
                              }}>
                                <p style={{ color: '#b0b0b0', fontSize: '0.8rem', marginBottom: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📌 Current Scenario</p>
                                <p style={{ fontSize: '2.2rem', color: '#00d4ff', fontWeight: 'bold', marginBottom: '8px', textShadow: '0 0 15px rgba(0, 212, 255, 0.3)' }}>{originalValue}</p>
                                <p style={{ color: '#707070', marginBottom: '14px', fontSize: '0.9rem', fontWeight: '500' }}>{result.unit}</p>
                                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: result.classification === 'Extreme' ? 'rgba(255, 107, 107, 0.15)' : result.classification === 'Moderate' ? 'rgba(255, 193, 7, 0.15)' : 'rgba(0, 212, 255, 0.15)', color: result.classification === 'Extreme' ? '#ff6b6b' : result.classification === 'Moderate' ? '#ffc107' : '#00d4ff', fontWeight: '700', margin: 0, fontSize: '0.9rem', border: `1px solid ${result.classification === 'Extreme' ? 'rgba(255, 107, 107, 0.3)' : result.classification === 'Moderate' ? 'rgba(255, 193, 7, 0.3)' : 'rgba(0, 212, 255, 0.3)'}`, boxShadow: `0 0 10px ${result.classification === 'Extreme' ? 'rgba(255, 107, 107, 0.2)' : result.classification === 'Moderate' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(0, 212, 255, 0.2)'}` }}>
                                  {result.classification === "Extreme" ? '🚨' : result.classification === "Moderate" ? '⚠️' : '✅'} {result.classification}
                                </div>
                              </div>

                              {/* Adjusted */}
                              <div style={{ 
                                backgroundColor: 'rgba(124, 58, 237, 0.08)', 
                                padding: '22px', 
                                borderRadius: '14px', 
                                border: `1px solid ${riskChanged ? 'rgba(255, 107, 107, 0.4)' : 'rgba(124, 58, 237, 0.2)'}`, 
                                boxShadow: riskChanged ? '0 0 25px rgba(255, 107, 107, 0.2), 0 4px 15px rgba(124, 58, 237, 0.08)' : '0 4px 15px rgba(124, 58, 237, 0.08)',
                                transition: 'all 0.3s ease',
                                backdropFilter: 'blur(10px)',
                                animation: riskChanged ? 'glow 2s ease-in-out infinite' : 'none'
                              }}>
                                <p style={{ color: '#b0b0b0', fontSize: '0.8rem', marginBottom: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔮 Adjusted Scenario</p>
                                <p style={{ fontSize: '2.2rem', color: '#7c3aed', fontWeight: 'bold', marginBottom: '8px', textShadow: '0 0 15px rgba(124, 58, 237, 0.3)' }}>{adjustedValue.toFixed(1)}</p>
                                <p style={{ color: '#707070', marginBottom: '14px', fontSize: '0.9rem', fontWeight: '500' }}>{simulatorValue > 0 ? 'Increase' : 'Decrease'} by {Math.abs(simulatorValue)}</p>
                                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: adjustedClassification === 'Extreme' ? 'rgba(255, 107, 107, 0.15)' : adjustedClassification === 'Moderate' ? 'rgba(255, 193, 7, 0.15)' : 'rgba(0, 212, 255, 0.15)', color: adjustedClassification === 'Extreme' ? '#ff6b6b' : adjustedClassification === 'Moderate' ? '#ffc107' : '#00d4ff', fontWeight: '700', margin: 0, fontSize: '0.9rem', border: `1px solid ${adjustedClassification === 'Extreme' ? 'rgba(255, 107, 107, 0.3)' : adjustedClassification === 'Moderate' ? 'rgba(255, 193, 7, 0.3)' : 'rgba(0, 212, 255, 0.3)'}`, boxShadow: `0 0 10px ${adjustedClassification === 'Extreme' ? 'rgba(255, 107, 107, 0.2)' : adjustedClassification === 'Moderate' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(0, 212, 255, 0.2)'}` }}>
                                  {adjustedClassification === "Extreme" ? '🚨' : adjustedClassification === "Moderate" ? '⚠️' : '✅'} {adjustedClassification} {riskChanged && '⚡'}
                                </div>
                              </div>
                            </div>

                            {/* Impact Message - Enhanced */}
                            {riskChanged && (
                              <div style={{ 
                                backgroundColor: adjustedClassification === 'Extreme' ? 'rgba(255, 107, 107, 0.12)' : 'rgba(255, 193, 7, 0.12)', 
                                padding: '18px 20px', 
                                borderRadius: '12px', 
                                border: `2px solid ${adjustedClassification === 'Extreme' ? 'rgba(255, 107, 107, 0.4)' : 'rgba(255, 193, 7, 0.4)'}`,
                                boxShadow: `0 0 20px ${adjustedClassification === 'Extreme' ? 'rgba(255, 107, 107, 0.15)' : 'rgba(255, 193, 7, 0.15)'}`,
                                backdropFilter: 'blur(10px)',
                                animation: 'slideIn 0.5s ease-out'
                              }}>
                                <p style={{ color: adjustedClassification === 'Extreme' ? '#ff6b6b' : '#ffc107', fontWeight: '700', margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>
                                  ⚡ <strong>Impact Alert:</strong> If {result.prediction_type} {simulatorValue > 0 ? 'increases' : 'decreases'} by {Math.abs(simulatorValue)} {result.unit}, the risk classification would shift to <strong>{adjustedClassification}</strong>
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Predict;