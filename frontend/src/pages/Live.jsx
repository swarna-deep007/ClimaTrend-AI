import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";

// 🌍 REALISTIC GLOBAL EVENTS
const climateEvents = [
  { lat: 23.4, lng: 55.3, type: "Heatwave", value: "48°C", city: "UAE Desert" },
  { lat: 25.0, lng: 13.0, type: "Heatwave", value: "50°C", city: "Sahara Desert" },

  { lat: -75.2, lng: 0.0, type: "Snow", value: "-35°C Blizzard", city: "Antarctica" },

  { lat: -3.4, lng: -62.2, type: "Rainfall", value: "120mm", city: "Amazon Rainforest" },
  { lat: 19.0, lng: 72.8, type: "Rainfall", value: "95mm", city: "Mumbai" },

  { lat: 64.1, lng: -21.9, type: "Snow", value: "Heavy Snow", city: "Iceland" },

  { lat: 35.6, lng: 139.6, type: "Rainfall", value: "Typhoon Alert", city: "Tokyo" },
  { lat: 40.7, lng: -74.0, type: "Snow", value: "Storm", city: "New York" }
];

// 🔥 GLOW MARKER
const glowIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width: 14px;
      height: 14px;
      background: #00d4ff;
      border-radius: 50%;
      box-shadow: 0 0 12px #00d4ff, 0 0 25px #7c3aed;
      animation: pulse 1.5s infinite;
    "></div>
  `
});

export default function Live() {
  const [filter, setFilter] = useState("All");

  const filteredEvents =
    filter === "All"
      ? climateEvents
      : climateEvents.filter((e) => e.type === filter);

  return (
    <div className="bg-slate-900 text-white min-h-screen relative">

      {/* 🔙 BACK BUTTON */}
      <div className="absolute top-6 left-6 z-[1000]">
        <Link
          to="/"
          className="px-4 py-2 rounded-full text-sm 
          bg-slate-800 hover:bg-slate-700 
          border border-white/10 transition"
        >
          ← Back to Home
        </Link>
      </div>

      {/* HEADER */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
          🌍 Live Climate Map
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Real-time visualization of global climate conditions
        </p>
      </div>

      {/* FILTER PANEL */}
      <div className="absolute top-28 left-8 z-[1000] 
        bg-slate-900/80 backdrop-blur-md p-4 rounded-xl 
        shadow-[0_0_20px_rgba(0,212,255,0.2)] 
        border border-cyan-400/20 w-40">

        <p className="mb-3 text-sm font-semibold text-gray-300">Filters</p>

        {["All", "Heatwave", "Rainfall", "Snow"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`w-full mb-2 px-3 py-1 rounded-md text-sm transition-all 
              ${
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

      {/* GLOBAL ALERT BAR */}
      <div className="absolute bottom-6 left-6 z-[1000] 
        bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-lg text-sm 
        border border-white/10">
        🔥 Global Alert: Extreme heat in Sahara | Snowstorm in Antarctica
      </div>

      {/* MAP WRAPPER */}
      <div className="h-[80vh] mx-6 mt-6 rounded-2xl overflow-hidden 
        shadow-[0_0_60px_rgba(0,212,255,0.2)] border border-white/10">

        <MapContainer
          center={[20, 0]}
          zoom={2}
          zoomControl={false}   // ❗ we control position manually
          className="h-full w-full"
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

          {/* ✅ Zoom control moved */}
          <ZoomControl position="bottomright" />

          {/* MARKERS */}
          {filteredEvents.map((event, i) => (
            <Marker key={i} position={[event.lat, event.lng]} icon={glowIcon}>
              <Popup>
                <div className="text-sm">
                  <b>{event.city}</b><br />
                  {event.type}<br />
                  {event.value}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

      </div>
    </div>
  );
}