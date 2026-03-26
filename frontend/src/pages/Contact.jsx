import { useState } from "react";
import { Link } from 'react-router-dom';

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // You can connect this to an email service like EmailJS or a backend endpoint
      console.log("Form submitted:", form);
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error(error);
      alert("Error sending message");
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

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: '32rem', width: '100%' }}>
          {/* Back to Home */}
          <Link to="/" style={{ color: '#00d4ff', textDecoration: 'none', marginBottom: '24px', display: 'inline-block', fontSize: '1rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#7c3aed'} onMouseLeave={(e) => e.target.style.color = '#00d4ff'}>
            ← Back to Home
          </Link>

          {/* Title */}
          <h1 style={{ fontSize: '2.75rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px', textAlign: 'center' }}>
            Get in Touch 💬
          </h1>
          <p style={{ fontSize: '1rem', color: '#b0b0b0', textAlign: 'center', marginBottom: '32px' }}>
            Have questions or want to collaborate? We'd love to hear from you!
          </p>

          {/* Success Message */}
          {submitted && (
            <div style={{ backgroundColor: 'rgba(0, 212, 255, 0.2)', border: '2px solid #00d4ff', padding: '16px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center', color: '#00d4ff' }}>
              ✓ Thank you! Your message has been sent successfully.
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ backgroundColor: 'rgba(30, 30, 50, 0.9)', padding: '32px', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0, 212, 255, 0.2)', border: '1px solid rgba(0, 212, 255, 0.2)', backdropFilter: 'blur(10px)' }}
          >
            {/* Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '500', marginBottom: '8px', color: '#00d4ff' }}>Name *</label>
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f3460', border: '2px solid rgba(0, 212, 255, 0.3)', color: 'white', fontSize: '1rem', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = '#00d4ff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(0, 212, 255, 0.3)'}
                required
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '500', marginBottom: '8px', color: '#00d4ff' }}>Email *</label>
              <input
                type="email"
                name="email"
                placeholder="your.email@example.com"
                value={form.email}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f3460', border: '2px solid rgba(0, 212, 255, 0.3)', color: 'white', fontSize: '1rem', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = '#00d4ff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(0, 212, 255, 0.3)'}
                required
              />
            </div>

            {/* Subject */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '500', marginBottom: '8px', color: '#00d4ff' }}>Subject *</label>
              <input
                type="text"
                name="subject"
                placeholder="What's this about?"
                value={form.subject}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f3460', border: '2px solid rgba(0, 212, 255, 0.3)', color: 'white', fontSize: '1rem', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = '#00d4ff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(0, 212, 255, 0.3)'}
                required
              />
            </div>

            {/* Message */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '500', marginBottom: '8px', color: '#00d4ff' }}>Message *</label>
              <textarea
                name="message"
                placeholder="Tell us your thoughts..."
                value={form.message}
                onChange={handleChange}
                rows="5"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f3460', border: '2px solid rgba(0, 212, 255, 0.3)', color: 'white', fontSize: '1rem', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s', resize: 'vertical', minHeight: '120px' }}
                onFocus={(e) => e.target.style.borderColor = '#00d4ff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(0, 212, 255, 0.3)'}
                required
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              style={{ width: '100%', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', color: 'white', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={(e) => { e.target.style.transform = 'scale(1.02)'; e.target.style.boxShadow = '0 12px 32px rgba(0, 212, 255, 0.4)'; }}
              onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = 'none'; }}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Message 📧"}
            </button>
          </form>

          {/* Contact Info */}
          <div style={{ marginTop: '32px', textAlign: 'center', color: '#b0b0b0' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Or reach out directly:</p>
            <p style={{ fontSize: '0.85rem', color: '#707070' }}>Email: swarnadeepbanerjee007@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;