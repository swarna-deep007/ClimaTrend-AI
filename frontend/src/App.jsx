import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { useEffect, useState } from 'react';
import Home from './pages/Home';
import Predict from './pages/Predict';
import Contact from './pages/Contact';
import About from './pages/About';

function App() {
  const [mouseTrail, setMouseTrail] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const particle = {
        id: Math.random(),
        x: e.clientX,
        y: e.clientY,
        createdAt: Date.now(),
      };

      setMouseTrail(prev => {
        const newTrail = [...prev, particle];
        // Keep only last 15 particles
        return newTrail.slice(-15);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Clean up old particles
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setMouseTrail(prev => prev.filter(p => now - p.createdAt < 800));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider>
      {/* Mouse Trail Effect */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>
        {mouseTrail.map((particle) => {
          const age = (Date.now() - particle.createdAt) / 800; // 0 to 1
          const opacity = 1 - age;
          return (
            <div
              key={particle.id}
              style={{
                position: 'absolute',
                left: particle.x,
                top: particle.y,
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, rgba(0, 212, 255, ${opacity * 0.8}), rgba(124, 58, 237, ${opacity * 0.6}))`,
                boxShadow: `0 0 ${10 * (1 - age) + 5}px rgba(0, 212, 255, ${opacity * 0.6})`,
                transform: `translate(-50%, -50%) scale(${1 - age * 0.5})`,
                backdropFilter: 'blur(2px)',
              }}
            />
          );
        })}
      </div>

      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;