import React from 'react'
import { Link } from 'react-router-dom';

function Home() {

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

    return (
        <div style={{ position: 'relative', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column' }}>
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

            {/* Content Wrapper */}
            <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Navbar */}
                <nav style={{ backgroundColor: 'rgba(26, 26, 46, 0.95)', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', position: 'sticky', top: 0, zIndex: 1000, backdropFilter: 'blur(10px)' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ClimaTrend AI 🌦️
                    </div>
                    <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                        <a href="#features" style={{ color: 'white', textDecoration: 'none', fontSize: '1rem', cursor: 'pointer', transition: 'color 0.3s', borderBottom: '2px solid transparent' }} onMouseEnter={(e) => e.target.style.color = '#00d4ff'} onMouseLeave={(e) => e.target.style.color = 'white'}>
                            Features
                        </a>
                        <Link
                            to="/about"
                            style={{ color: 'white', textDecoration: 'none', fontSize: '1rem', cursor: 'pointer', transition: 'color 0.3s' }}
                            onMouseEnter={(e) => e.target.style.color = '#00d4ff'}
                            onMouseLeave={(e) => e.target.style.color = 'white'}
                        >
                            About
                        </Link>
                        <Link
                            to="/predict"
                            style={{ backgroundColor: '#00d4ff', padding: '10px 24px', borderRadius: '24px', fontSize: '0.95rem', fontWeight: '600', textDecoration: 'none', color: '#1a1a2e', cursor: 'pointer', transition: 'transform 0.2s' }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            Try Now
                        </Link>
                    </div>
                </nav>

                {/* Hero Section */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '4.5rem', fontWeight: 'bold', marginBottom: '24px', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ClimaTrend AI
                    </h1>
                    <p style={{ fontSize: '1.5rem', marginBottom: '48px', maxWidth: '48rem', color: '#b0b0b0' }}>
                        Predict weather patterns with advanced AI. Get accurate forecasts for rainfall, temperature, and snowfall across different locations.
                    </p>

                    {/* Features */}
                    <div id="features" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px', marginBottom: '60px', maxWidth: '72rem', width: '100%' }}>
                        <div style={{ backgroundColor: 'rgba(30, 30, 50, 0.7)', border: '2px solid rgba(0, 212, 255, 0.3)', padding: '30px', borderRadius: '16px', transition: 'transform 0.3s, border-color 0.3s, background-color 0.3s', backdropFilter: 'blur(10px)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = '#00d4ff'; e.currentTarget.style.backgroundColor = 'rgba(0, 212, 255, 0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)'; e.currentTarget.style.backgroundColor = 'rgba(30, 30, 50, 0.7)'; }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🌧️</div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '12px', color: '#00d4ff' }}>Rainfall Prediction</h3>
                            <p style={{ fontSize: '0.95rem', color: '#b0b0b0' }}>Accurate rainfall forecasts to help with planning and agricultural decisions.</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(30, 30, 50, 0.7)', border: '2px solid rgba(124, 58, 237, 0.3)', padding: '30px', borderRadius: '16px', transition: 'transform 0.3s, border-color 0.3s, background-color 0.3s', backdropFilter: 'blur(10px)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)'; e.currentTarget.style.backgroundColor = 'rgba(30, 30, 50, 0.7)'; }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🌡️</div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '12px', color: '#7c3aed' }}>Temperature Analysis</h3>
                            <p style={{ fontSize: '0.95rem', color: '#b0b0b0' }}>Predict temperature changes and trends for your location with precision.</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(30, 30, 50, 0.7)', border: '2px solid rgba(0, 212, 255, 0.3)', padding: '30px', borderRadius: '16px', transition: 'transform 0.3s, border-color 0.3s, background-color 0.3s', backdropFilter: 'blur(10px)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = '#00d4ff'; e.currentTarget.style.backgroundColor = 'rgba(0, 212, 255, 0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)'; e.currentTarget.style.backgroundColor = 'rgba(30, 30, 50, 0.7)'; }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>❄️</div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '12px', color: '#00d4ff' }}>Snowfall Forecasting</h3>
                            <p style={{ fontSize: '0.95rem', color: '#b0b0b0' }}>Stay ahead of winter weather with precise snowfall predictions.</p>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Link
                            to="/predict"
                            style={{ backgroundColor: 'linear-gradient(135deg, #00d4ff, #7c3aed)', padding: '16px 48px', borderRadius: '30px', fontSize: '1.125rem', fontWeight: '600', textDecoration: 'none', color: 'white', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 8px 24px rgba(0, 212, 255, 0.3)' }}
                            onMouseEnter={(e) => { e.target.style.transform = 'scale(1.08)'; e.target.style.boxShadow = '0 12px 32px rgba(0, 212, 255, 0.5)'; }}
                            onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 8px 24px rgba(0, 212, 255, 0.3)'; }}
                        >
                            Get Started 🚀
                        </Link>
                        <Link
                            to="/about"
                            style={{
                                position: 'relative',
                                padding: '16px 48px',
                                borderRadius: '30px',
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                textDecoration: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                background: 'linear-gradient(135deg, #7c3aed, #db2777)',
                                boxShadow: '0 8px 24px rgba(124, 58, 237, 0.35)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                display: 'inline-block',
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.08)';
                                e.target.style.boxShadow = '0 12px 32px rgba(219, 39, 119, 0.55)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.35)';
                            }}
                        >
                            Discover More ✨
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <footer style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', borderTop: '2px solid #00d4ff33', padding: '60px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', backdropFilter: 'blur(10px)' }}>
                    <div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px', color: '#00d4ff' }}>ClimaTrend AI</h4>
                        <p style={{ fontSize: '0.95rem', color: '#b0b0b0', lineHeight: '1.6' }}>Advanced weather prediction powered by artificial intelligence. Making climate data accessible and actionable for everyone.</p>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', color: '#00d4ff' }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: '#b0b0b0', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#00d4ff'} onMouseLeave={(e) => e.target.style.color = '#b0b0b0'}>Home</a></li>
                            <li style={{ marginBottom: '12px' }}><a href="#features" style={{ color: '#b0b0b0', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#00d4ff'} onMouseLeave={(e) => e.target.style.color = '#b0b0b0'}>Features</a></li>
                            <li style={{ marginBottom: '12px' }}><Link to="/predict" style={{ color: '#b0b0b0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#00d4ff'} onMouseLeave={(e) => e.target.style.color = '#b0b0b0'}>Predictions</Link></li>
                            <li><Link to="/contact" style={{ color: '#b0b0b0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#00d4ff'} onMouseLeave={(e) => e.target.style.color = '#b0b0b0'}>Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', color: '#00d4ff' }}>Technology</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: '#b0b0b0', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#00d4ff'} onMouseLeave={(e) => e.target.style.color = '#b0b0b0'}>Machine Learning</a></li>
                            <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: '#b0b0b0', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#00d4ff'} onMouseLeave={(e) => e.target.style.color = '#b0b0b0'}>API Documentation</a></li>
                            <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: '#b0b0b0', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#00d4ff'} onMouseLeave={(e) => e.target.style.color = '#b0b0b0'}>Privacy Policy</a></li>
                            <li><a href="#" style={{ color: '#b0b0b0', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#00d4ff'} onMouseLeave={(e) => e.target.style.color = '#b0b0b0'}>Terms of Service</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', color: '#00d4ff' }}>Follow Us</h4>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <a href="#" style={{ fontSize: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>🐦</a>
                            <a href="#" style={{ fontSize: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>📘</a>
                            <a href="#" style={{ fontSize: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>💼</a>
                            <a href="#" style={{ fontSize: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>📧</a>
                        </div>
                    </div>
                </footer>

                {/* Copyright */}
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', padding: '20px', textAlign: 'center', borderTop: '1px solid #00d4ff1a', fontSize: '0.9rem', color: '#b0b0b0' }}>
                    <p>© 2026 ClimaTrend AI. All rights reserved. | Powered by Advanced Machine Learning</p>
                    <p>Built By <a href="https://www.linkedin.com/in/swarnadeep-banerjee-371827247/" target="_blank" rel="noopener noreferrer" style={{ color: '#00d4ff', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#7c3aed'} onMouseLeave={(e) => e.target.style.color = '#00d4ff'}>Swarnadeep</a>.</p>
                </div>
            </div>
        </div>
    );
}

export default Home