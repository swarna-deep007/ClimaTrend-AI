import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import axios from "axios";

// 🔥 dynamic glow marker
const createGlowIcon = (color) =>
  new L.DivIcon({
    className: "",
    html: `
      <div style="
        width: 14px;
        height: 14px;
        background: ${color};
        border-radius: 50%;
        box-shadow: 0 0 15px ${color}, 0 0 30px ${color};
        animation: pulse 1.5s infinite;
      "></div>
    `
  });

export default function Live() {
  const [filter, setFilter] = useState("All");
  const [climateEvents, setClimateEvents] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Use environment variable for API key (VITE_OPENWEATHER_API_KEY in .env)
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "";

  const gridPoints = [
    [28.6, 77.2], [19.0, 72.8], [35.6, 139.6], [1.3, 103.8],
    [25.2, 55.3], [24.7, 46.7],
    [30.0, 31.2], [25.0, 13.0], [0.3, 32.5],
    [48.8, 2.3], [51.5, -0.1], [55.7, 37.6],
    [40.7, -74.0], [34.0, -118.2], [49.2, -123.1],
    [-3.4, -62.2], [-23.5, -46.6], [-34.6, -58.4],
    [64.1, -21.9], [69.6, 18.9], [-75.2, 0.0],
    [-33.8, 151.2], [-25.3, 133.7]
  ];

  const fetchData = async () => {
    try {
      const results = await Promise.all(
        gridPoints.map(async ([lat, lng]) => {
          try {
            const res = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`
            );

            const temp = res.data.main.temp;
            const weather = res.data.weather[0].main;
            const rain = res.data.rain?.["1h"] || 0;

            let type = null;

            if (temp >= 35) type = "Heatwave";
            else if (temp <= 2 && weather.includes("Snow")) type = "Snow";
            else if (weather.includes("Rain") && rain >= 3) type = "Rainfall";

            if (!type) return null;

            const color =
              type === "Heatwave"
                ? "#ff3b3b"
                : type === "Rainfall"
                ? "#00d4ff"
                : "#a78bfa";

            return {
              lat,
              lng,
              city: res.data.name || "Unknown",
              temp,
              weather,
              type,
              icon: createGlowIcon(color)
            };

          } catch {
            return null;
          }
        })
      );

      setClimateEvents(results.filter(Boolean));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents =
    filter === "All"
      ? climateEvents
      : climateEvents.filter((e) => e.type === filter);

  return (
    <div className="bg-slate-900 text-white min-h-screen relative">

      {/* BACK */}
      <div className="absolute top-6 left-6 z-[1000]">
        <Link to="/" className="px-4 py-2 rounded-full text-sm bg-slate-800 hover:bg-slate-700 border border-white/10">
          ← Back to Home
        </Link>
      </div>

      {/* HEADER */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
          🌍 Advanced Climate Monitor
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Real-time extreme weather detection (global scan)
        </p>
      </div>

      {/* 🔘 FILTER ICON BUTTON */}
      <div className="absolute top-28 left-6 z-[1000]">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 shadow-lg"
        >
          ⚙️
        </button>
      </div>

      {/* 📦 FILTER PANEL (TOGGLE) */}
      {showFilters && (
        <div className="absolute top-40 left-6 z-[1000] bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-cyan-400/20 w-44 shadow-xl">
          <p className="mb-3 text-sm font-semibold text-gray-300">Filters</p>

          {["All", "Heatwave", "Rainfall", "Snow"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`w-full mb-2 px-3 py-1 rounded-md text-sm ${
                filter === type
                  ? "bg-gradient-to-r from-cyan-400 to-purple-600"
                  : "bg-slate-800 hover:bg-slate-700"
              }`}
            >
              {type === "Heatwave" && "🔥"}
              {type === "Rainfall" && "🌧"}
              {type === "Snow" && "❄"}
              {type === "All" && "🌐"} {type}
            </button>
          ))}
        </div>
      )}

      {/* ALERT */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-slate-900/80 px-4 py-2 rounded-lg text-sm border border-white/10">
        🌐 Global scanning active (extreme events only)
      </div>

      {/* MAP */}
      <div className="h-[80vh] mx-6 mt-6 rounded-2xl overflow-hidden border border-white/10">

        <MapContainer center={[20, 0]} zoom={2} zoomControl={false} className="h-full w-full">

          {/* ✅ BETTER MAP STYLE */}
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" />

          <ZoomControl position="bottomright" />

          {filteredEvents.map((event, i) => (
            <Marker key={i} position={[event.lat, event.lng]} icon={event.icon}>
              <Popup>
                <b>{event.city}</b><br />
                {event.type}<br />
                {event.temp}°C<br />
                {event.weather}
              </Popup>
            </Marker>
          ))}

        </MapContainer>
      </div>
    </div>
  );
}