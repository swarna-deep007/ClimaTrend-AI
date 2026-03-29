import React, { useState, useEffect } from 'react';

function WeatherWidget() {
    const [open, setOpen] = useState(false);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const tick = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(tick);
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) { setLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                try {
                    const res = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature&wind_speed_unit=kmh`
                    );
                    const data = await res.json();
                    const c = data.current;
                    const geoRes = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
                    );
                    const geo = await geoRes.json();
                    const city = geo.address?.city || geo.address?.town || geo.address?.village || 'Your Location';
                    setWeather({
                        temp: Math.round(c.temperature_2m),
                        feelsLike: Math.round(c.apparent_temperature),
                        humidity: c.relative_humidity_2m,
                        wind: Math.round(c.wind_speed_10m),
                        code: c.weather_code,
                        city,
                    });
                } catch { }
                setLoading(false);
            },
            () => setLoading(false)
        );
    }, []);

    const getWeatherInfo = (code) => {
        if (code === 0)  return { label: 'Clear Sky',     icon: '☀️' };
        if (code <= 2)   return { label: 'Partly Cloudy', icon: '⛅' };
        if (code === 3)  return { label: 'Overcast',      icon: '☁️' };
        if (code <= 49)  return { label: 'Foggy',         icon: '🌫️' };
        if (code <= 59)  return { label: 'Drizzle',       icon: '🌦️' };
        if (code <= 69)  return { label: 'Rain',          icon: '🌧️' };
        if (code <= 79)  return { label: 'Snow',          icon: '❄️' };
        if (code <= 84)  return { label: 'Rain Showers',  icon: '🌧️' };
        if (code <= 94)  return { label: 'Snow Showers',  icon: '🌨️' };
        return                  { label: 'Thunderstorm',  icon: '⛈️' };
    };

    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
    const dateStr = time.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

    const { label, icon } = weather ? getWeatherInfo(weather.code) : { label: '', icon: '🌍' };

    const styles = `
        @keyframes expandDown {
            from { opacity: 0; transform: scaleY(0.6) translateY(-10px); }
            to   { opacity: 1; transform: scaleY(1)   translateY(0);     }
        }
        @keyframes scanline {
            0%   { top: 0%; }
            100% { top: 100%; }
        }
        @keyframes glowPulse {
            0%, 100% { box-shadow: 0 0 8px rgba(0,212,255,0.4); }
            50%       { box-shadow: 0 0 18px rgba(0,212,255,0.9); }
        }
        .weather-panel {
            animation: expandDown 0.35s cubic-bezier(0.23, 1, 0.32, 1) forwards;
            transform-origin: top center;
        }
        .weather-toggle-btn {
            animation: glowPulse 2.5s ease-in-out infinite;
        }
        .scanline {
            position: absolute;
            left: 0; width: 100%; height: 2px;
            background: linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent);
            animation: scanline 2s linear infinite;
            pointer-events: none;
        }
    `;

    const pill = {
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'rgba(0,212,255,0.08)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: '20px', padding: '5px 14px',
        fontSize: '0.8rem', color: '#b0b0b0', whiteSpace: 'nowrap',
    };

    return (
        <>
            <style>{styles}</style>

            {/* Floating toggle button */}
            <button
                className="weather-toggle-btn"
                onClick={() => setOpen(o => !o)}
                title="Live Weather"
                style={{
                    position: 'fixed', bottom: '32px', right: '32px',
                    zIndex: 1100,
                    width: '52px', height: '52px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))',
                    border: '1.5px solid rgba(0,212,255,0.5)',
                    backdropFilter: 'blur(12px)',
                    cursor: 'pointer', fontSize: '1.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                {loading ? '🌍' : icon}
            </button>

            {/* Weather panel */}
            {open && (
                <div
                    className="weather-panel"
                    style={{
                        position: 'fixed', bottom: '94px', right: '24px',
                        zIndex: 1099, width: '320px',
                        background: 'rgba(10,15,35,0.92)',
                        border: '1px solid rgba(0,212,255,0.25)',
                        borderRadius: '16px',
                        backdropFilter: 'blur(20px)',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.08)',
                    }}
                >
                    {/* scanline effect */}
                    <div className="scanline" />

                    {/* Header */}
                    <div style={{
                        padding: '14px 18px 10px',
                        borderBottom: '1px solid rgba(0,212,255,0.12)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'rgba(0,212,255,0.7)', textTransform: 'uppercase' }}>
                            ◈ Live Weather Feed
                        </span>
                        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>✕</button>
                    </div>

                    {loading ? (
                        <div style={{ padding: '28px', textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>
                            Acquiring signal…
                        </div>
                    ) : !weather ? (
                        <div style={{ padding: '28px', textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>
                            📍 Enable location access
                        </div>
                    ) : (
                        <div style={{ padding: '18px' }}>
                            {/* City + time */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#e0e0e0' }}>📍 {weather.city}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(124,58,237,0.8)', marginTop: '2px' }}>{label}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#00d4ff', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.05em' }}>{timeStr}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#666' }}>{dateStr}</div>
                                </div>
                            </div>

                            {/* Big temp */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <span style={{ fontSize: '2.5rem' }}>{icon}</span>
                                <span style={{ fontSize: '3rem', fontWeight: '700', color: '#00d4ff', lineHeight: 1 }}>{weather.temp}°</span>
                                <span style={{ fontSize: '0.85rem', color: '#888', alignSelf: 'flex-end', marginBottom: '6px' }}>Celsius</span>
                            </div>

                            {/* Pills */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                <span style={pill}>🌡️ Feels <b style={{ color: '#00d4ff', marginLeft: '4px' }}>{weather.feelsLike}°C</b></span>
                                <span style={pill}>💧 <b style={{ color: '#00d4ff' }}>{weather.humidity}%</b></span>
                                <span style={pill}>💨 <b style={{ color: '#00d4ff' }}>{weather.wind} km/h</b></span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default WeatherWidget;