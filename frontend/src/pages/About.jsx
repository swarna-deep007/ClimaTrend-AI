import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function About() {
  const [scrollY, setScrollY] = useState(0);
  const [activeFlow, setActiveFlow] = useState(0);
  const [animateStages, setAnimateStages] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredTech, setHoveredTech] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Trigger flow animation on mount
    setTimeout(() => setAnimateStages(true), 500);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

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

    @keyframes flowIn {
      0% {
        opacity: 0;
        transform: translateY(40px) scale(0.8);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes connectionLine {
      0% {
        stroke-dashoffset: 1000;
      }
      100% {
        stroke-dashoffset: 0;
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

    @keyframes slideInUp {
      0% {
        opacity: 0;
        transform: translateY(60px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInScale {
      0% {
        opacity: 0;
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes dataFlow {
      0%, 100% {
        opacity: 0;
        offset-distance: 0%;
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0;
        offset-distance: 100%;
      }
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
  `;

  const flowStages = [
    {
      icon: '📥',
      title: 'Input',
      description: 'Weather parameters & location data collection',
      color: '#00d4ff'
    },
    {
      icon: '🗂️',
      title: 'Data',
      description: 'NOAA NCEI datasets with 30+ years history',
      color: '#7c3aed'
    },
    {
      icon: '🧠',
      title: 'Model',
      description: 'Machine learning algorithms processing',
      color: '#ff6b6b'
    },
    {
      icon: '🎯',
      title: 'Prediction',
      description: 'Extreme weather forecasting accuracy',
      color: '#ffc107'
    },
    {
      icon: '💡',
      title: 'Insight',
      description: 'Actionable recommendations for safety',
      color: '#00d4ff'
    }
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', color: 'white', overflow: 'hidden' }}>
      <style>{styles}</style>

      {/* Animated Background */}
      <div className="animated-bg">
        <div className="floating-cube" style={{ top: '10%', left: '10%', animation: 'rotate3d 10s linear infinite' }} />
        <div className="floating-cube" style={{ top: '60%', right: '15%', width: '120px', height: '120px', animation: 'rotate3d 12s linear infinite reverse' }} />
        <div className="floating-cube" style={{ bottom: '20%', left: '20%', width: '60px', height: '60px', animation: 'rotate3d 8s linear infinite' }} />
        
        <div className="sphere" style={{ width: '150px', height: '150px', top: '15%', right: '20%', animation: 'pulse3d 5s ease-in-out infinite' }} />
        <div className="sphere" style={{ width: '100px', height: '100px', bottom: '30%', left: '10%', animation: 'pulse3d 4s ease-in-out infinite' }} />
        
        <div className="particle" style={{ width: '30px', height: '30px', top: '30%', left: '15%', animation: 'float 6s ease-in-out infinite' }} />
        <div className="particle" style={{ width: '20px', height: '20px', top: '50%', right: '10%', animation: 'float 8s ease-in-out infinite 1s' }} />
        <div className="particle" style={{ width: '25px', height: '25px', bottom: '40%', left: '50%', animation: 'float 7s ease-in-out infinite 2s' }} />
        
        <div style={{ position: 'absolute', width: '200px', height: '200px', top: '5%', left: '5%', border: '3px solid rgba(0, 212, 255, 0.2)', borderRadius: '20%', animation: 'moveLeft 10s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: '150px', height: '150px', bottom: '10%', right: '10%', border: '3px solid rgba(124, 58, 237, 0.2)', borderRadius: '30%', animation: 'moveRight 12s ease-in-out infinite' }} />
        
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 80% 80%, rgba(124, 58, 237, 0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px' }}>
            <Link to="/" style={{ color: '#00d4ff', textDecoration: 'none', marginBottom: '30px', display: 'inline-block', fontSize: '1rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#7c3aed'} onMouseLeave={(e) => e.target.style.color = '#00d4ff'}>
              ← Back to Home
            </Link>

            <h1 style={{ 
              fontSize: '3.5rem', 
              fontWeight: 'bold', 
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', 
              backgroundClip: 'text', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent', 
              marginBottom: '24px',
              animation: 'slideInUp 1s ease-out'
            }}>
              ClimaTrend AI 🌦️
            </h1>

            <p style={{ 
              fontSize: '1.4rem', 
              color: '#b0b0b0', 
              marginBottom: '32px',
              animation: 'slideInUp 1s ease-out 0.2s both',
              lineHeight: '1.8'
            }}>
              Predicting Extreme Weather Events with Machine Learning
            </p>

            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              animation: 'slideInUp 1s ease-out 0.4s both'
            }}>
              <Link 
                to="/predict" 
                style={{ 
                  padding: '14px 32px', 
                  background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', 
                  border: 'none', 
                  borderRadius: '8px', 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: '1rem', 
                  cursor: 'pointer', 
                  textDecoration: 'none',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)'
                }}
                onMouseEnter={(e) => { 
                  e.target.style.transform = 'scale(1.05)'; 
                  e.target.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.6)'; 
                }}
                onMouseLeave={(e) => { 
                  e.target.style.transform = 'scale(1)'; 
                  e.target.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.3)'; 
                }}
              >
                Try Predictions 🎯
              </Link>
              <Link 
                to="/contact" 
                style={{ 
                  padding: '14px 32px', 
                  background: 'rgba(124, 58, 237, 0.2)', 
                  border: '2px solid rgba(124, 58, 237, 0.5)', 
                  borderRadius: '8px', 
                  color: '#7c3aed', 
                  fontWeight: 'bold', 
                  fontSize: '1rem', 
                  cursor: 'pointer', 
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { 
                  e.target.style.background = 'rgba(124, 58, 237, 0.3)'; 
                  e.target.style.boxShadow = '0 0 20px rgba(124, 58, 237, 0.4)'; 
                }}
                onMouseLeave={(e) => { 
                  e.target.style.background = 'rgba(124, 58, 237, 0.2)'; 
                  e.target.style.boxShadow = 'none'; 
                }}
              >
                Get in Touch 📧
              </Link>
            </div>
          </div>
        </div>

        {/* How AI Thinks Section */}
        <div style={{ padding: '80px 24px', backgroundColor: 'rgba(0, 0, 0, 0.3)', position: 'relative' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            textAlign: 'center', 
            marginBottom: '60px',
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'slideInUp 1s ease-out'
          }}>
            🧠 How AI Thinks
          </h2>

          {/* Flow diagram */}
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <svg width="100%" height="300" style={{ marginBottom: '40px', overflow: 'visible' }}>
              {/* Connection lines with animation */}
              {[0, 1, 2, 3].map((i) => (
                <g key={`line-${i}`}>
                  <line
                    x1={`${15 + i * 20}%`}
                    y1="50%"
                    x2={`${35 + i * 20}%`}
                    y2="50%"
                    stroke="#00d4ff"
                    strokeWidth="3"
                    opacity={animateStages ? 0.8 : 0.2}
                    style={{
                      animation: animateStages ? `connectionLine 2s ease-in-out ${i * 0.3}s forwards` : 'none',
                      strokeDasharray: '50',
                      strokeDashoffset: animateStages ? 0 : 50
                    }}
                    strokeLinecap="round"
                  />
                  {/* Arrow */}
                  <polygon
                    points={`${33 + i * 20}%,50% ${31 + i * 20}%,48% ${31 + i * 20}%,52%`}
                    fill="#00d4ff"
                    opacity={animateStages ? 0.8 : 0.2}
                    style={{
                      animation: animateStages ? `contentIn 2s ease-in-out ${(i + 1) * 0.3}s forwards` : 'none'
                    }}
                  />
                </g>
              ))}
            </svg>

            {/* Flow stages */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px', marginBottom: '60px' }}>
              {flowStages.map((stage, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    padding: '32px 24px',
                    borderRadius: '14px',
                    border: `2px solid ${stage.color}`,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    animation: animateStages ? `flowIn 0.6s ease-out ${idx * 0.15}s both` : 'none',
                    boxShadow: `0 0 20px ${stage.color}40`,
                    opacity: animateStages ? 1 : 0,
                    transform: animateStages ? 'translateY(0)' : 'translateY(40px)',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)';
                    e.currentTarget.style.boxShadow = `0 0 40px ${stage.color}60, 0 20px 40px rgba(0, 0, 0, 0.3)`;
                    e.currentTarget.style.borderColor = stage.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = `0 0 20px ${stage.color}40`;
                    e.currentTarget.style.borderColor = stage.color;
                  }}
                >
                  {/* Background glow */}
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    background: `radial-gradient(circle at center, ${stage.color}15 0%, transparent 70%)`,
                    pointerEvents: 'none'
                  }} />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{stage.icon}</div>
                    <h3 style={{ color: stage.color, fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 12px 0' }}>
                      {stage.title}
                    </h3>
                    <p style={{ color: '#b0b0b0', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
                      {stage.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Overview Section */}
        <div style={{ padding: '80px 24px', position: 'relative' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ 
              fontSize: '2.2rem', 
              marginBottom: '40px',
              color: '#00d4ff',
              animation: 'slideInUp 1s ease-out'
            }}>
              📊 Project Overview
            </h2>

            <div style={{ display: 'grid', gap: '24px' }}>
              {[
                {
                  icon: '🌤️',
                  title: 'Extreme Weather Prediction',
                  desc: 'Advanced machine learning models designed to forecast dangerous conditions like heavy rainfall, heatwaves, and snowstorms with high accuracy.'
                },
                {
                  icon: '📈',
                  title: 'Data-Driven Analysis',
                  desc: 'Built on NOAA\'s NCEI Daily Summaries dataset containing 30+ years of historical weather data including precipitation, temperature, and snowfall.'
                },
                {
                  icon: '🛡️',
                  title: 'Climate Resilience',
                  desc: 'Enables disaster preparedness and informed decision-making for communities vulnerable to extreme weather events.'
                },
                {
                  icon: '🔬',
                  title: 'Research-Backed',
                  desc: 'Leverages rigorous machine learning techniques to analyze historical patterns and generate reliable future predictions.'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.7)',
                    padding: '28px 32px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    animation: `slideInUp 0.8s ease-out ${0.1 + idx * 0.1}s both`,
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'flex-start'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.9)';
                    e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateX(8px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.7)';
                    e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ fontSize: '2.5rem' }}>{item.icon}</div>
                  <div>
                    <h3 style={{ color: '#7c3aed', fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                      {item.title}
                    </h3>
                    <p style={{ color: '#b0b0b0', fontSize: '0.95rem', margin: 0, lineHeight: '1.6' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Source Section */}
        <div style={{ padding: '80px 24px', backgroundColor: 'rgba(0, 0, 0, 0.3)', position: 'relative' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ 
              fontSize: '2.2rem', 
              marginBottom: '40px',
              color: '#00d4ff',
              animation: 'slideInUp 1s ease-out'
            }}>
              📡 Data Sources
            </h2>

            <div style={{
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              padding: '40px 36px',
              borderRadius: '14px',
              border: '2px solid rgba(0, 212, 255, 0.3)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0, 212, 255, 0.1)',
              animation: 'slideInUp 0.8s ease-out'
            }}>
              <h3 style={{ color: '#00d4ff', fontSize: '1.4rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                🏛️ NOAA National Centres for Environmental Information (NCEI)
              </h3>
              
              <div style={{ color: '#b0b0b0', lineHeight: '2', fontSize: '1rem' }}>
                <p><strong>📍 Daily Summaries Dataset</strong></p>
                <p>
                  Access comprehensive weather observations from thousands of stations worldwide via{' '}
                  <a href="https://www.ncei.noaa.gov/maps/daily-summaries/" target="_blank" rel="noopener noreferrer" 
                    style={{ color: '#00d4ff', textDecoration: 'none', fontWeight: 'bold', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#7c3aed'}
                    onMouseLeave={(e) => e.target.style.color = '#00d4ff'}
                  >
                    NOAA NCEI Maps
                  </a>
                </p>
                
                <div style={{ marginTop: '24px', padding: '20px', borderLeft: '3px solid #00d4ff', backgroundColor: 'rgba(0, 212, 255, 0.05)' }}>
                  <p><strong>📊 Available Variables:</strong></p>
                  <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                    <li>🌧️ Precipitation (mm)</li>
                    <li>🌡️ Temperature (Min/Max in °C)</li>
                    <li>❄️ Snowfall (cm)</li>
                  </ul>
                </div>

                <div style={{ marginTop: '24px', padding: '20px', borderLeft: '3px solid #7c3aed', backgroundColor: 'rgba(124, 58, 237, 0.05)' }}>
                  <p><strong>⏱️ Time Period:</strong></p>
                  <p>30+ years of historical data from multiple stations, enabling robust model training and seasonal pattern analysis</p>
                </div>

                <div style={{ marginTop: '24px', padding: '20px', borderLeft: '3px solid #ffc107', backgroundColor: 'rgba(255, 193, 7, 0.05)' }}>
                  <p><strong>📥 Export Format:</strong></p>
                  <p>CSV files downloadable by station or region, making integration seamless for analysis pipelines</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div style={{ padding: '80px 24px', position: 'relative' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ 
              fontSize: '2.2rem', 
              marginBottom: '40px',
              color: '#00d4ff',
              animation: 'slideInUp 1s ease-out'
            }}>
              🛠️ Technology Stack
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {[
                { name: 'React', icon: '⚛️', desc: 'Frontend UI' },
                { name: 'Vite', icon: '⚡', desc: 'Build tool' },
                { name: 'Python', icon: '🐍', desc: 'Backend & ML' },
                { name: 'FastAPI', icon: '🚀', desc: 'API framework' },
                { name: 'Scikit-learn', icon: '📊', desc: 'ML algorithms' },
                { name: 'Pandas', icon: '🐼', desc: 'Data analysis' }
              ].map((tech, idx) => {
                const isHovered = hoveredTech === idx;
                const offsetX = isHovered ? (mousePos.x - window.innerWidth / 2) * 0.05 : 0;
                const offsetY = isHovered ? (mousePos.y - window.innerHeight / 2) * 0.05 : 0;
                
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'rgba(30, 41, 59, 0.7)',
                      padding: '24px',
                      borderRadius: '12px',
                      border: '1px solid rgba(124, 58, 237, 0.3)',
                      textAlign: 'center',
                      transition: isHovered ? 'none' : 'all 0.3s ease',
                      animation: `fadeInScale 0.6s ease-out ${idx * 0.08}s both`,
                      cursor: 'pointer',
                      transform: `translateX(${offsetX}px) translateY(${offsetY + (isHovered ? -8 : 0)}px)`,
                      willChange: 'transform'
                    }}
                    onMouseEnter={(e) => {
                      setHoveredTech(idx);
                      e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.9)';
                      e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.6)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 212, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      setHoveredTech(null);
                      e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.7)';
                      e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0) translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px', transition: isHovered ? 'transform 0.1s ease-out' : 'none', transform: isHovered ? 'scale(1.2) rotate(15deg)' : 'scale(1)' }}>{tech.icon}</div>
                    <h4 style={{ color: '#00d4ff', margin: '0 0 8px 0', fontWeight: 'bold' }}>{tech.name}</h4>
                    <p style={{ color: '#b0b0b0', fontSize: '0.85rem', margin: 0 }}>{tech.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div style={{ padding: '80px 24px', textAlign: 'center', borderTop: '1px solid rgba(0, 212, 255, 0.2)' }}>
          <h2 style={{ 
            fontSize: '2rem', 
            marginBottom: '32px',
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'slideInUp 1s ease-out'
          }}>
            Ready to Predict? 🚀
          </h2>

          <p style={{ color: '#b0b0b0', fontSize: '1.1rem', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
            Explore weather predictions for your region and help build a more resilient future
          </p>

          <Link 
            to="/predict" 
            style={{ 
              display: 'inline-block',
              padding: '16px 48px', 
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', 
              border: 'none', 
              borderRadius: '8px', 
              color: 'white', 
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              cursor: 'pointer', 
              textDecoration: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 0 30px rgba(0, 212, 255, 0.4)',
              animation: 'slideInUp 1s ease-out 0.2s both'
            }}
            onMouseEnter={(e) => { 
              e.target.style.transform = 'scale(1.08)'; 
              e.target.style.boxShadow = '0 0 50px rgba(0, 212, 255, 0.7)'; 
            }}
            onMouseLeave={(e) => { 
              e.target.style.transform = 'scale(1)'; 
              e.target.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.4)'; 
            }}
          >
            Get Started Now 🎯
          </Link>
        </div>
      </div>
    </div>
  );
}

export default About;
