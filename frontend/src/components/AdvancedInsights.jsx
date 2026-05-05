import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart, Line, BarChart, Bar, ComposedChart, CartesianGrid,
  XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ReferenceLine, ResponsiveContainer
} from "recharts";

function AdvancedInsights({ result, city }) {
  // Safety checks
  if (!result || result.success === false) {
    return null;
  }

  const animationStyles = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fadeIn {
      animation: fadeIn 0.5s ease-out forwards;
    }
  `;

  const [visibleSteps, setVisibleSteps] = useState([false, false, false, false]);
  const [history, setHistory] = useState([]);
  const [featureCount, setFeatureCount] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  // Animate ML Pipeline steps sequentially
  useEffect(() => {
    const timings = [600, 1200, 1800, 2400];
    const timeouts = timings.map((delay, index) => {
      return setTimeout(() => {
        setVisibleSteps((prev) => {
          const newSteps = [...prev];
          newSteps[index] = true;
          return newSteps;
        });
      }, delay);
    });
    return () => timeouts.forEach((t) => clearTimeout(t));
  }, []);

  // Fetch history data for Step 1
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/history/${city}`);
        if (response.data.success && response.data.data) {
          setHistory(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setHistory([]);
      }
    };
    if (city) {
      fetchHistory();
    }
  }, [city]);

  // Animate feature count from 0 to 59
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.ceil(59 / 20); // Complete in ~20 frames (~1 second)
      if (current >= 59) {
        current = 59;
        clearInterval(interval);
      }
      setFeatureCount(current);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Animate progress bar from 0 to 100 over 1.5 seconds
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 100 / 30; // Complete in ~1.5 seconds
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
      }
      setProgressPercent(current);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const af = result.all_features || {};

  // Extract feature values for Section C (Plain English Explanation)
  const tmax = (af.TMAX || 0).toFixed(1);
  const prcp = (af.PRCP || 0).toFixed(1);
  const tmaxAnom = (af.TMAX_ANOM || 0).toFixed(2);
  const tminAnom = (af.TMIN_ANOM || 0).toFixed(2);
  const cum7 = (af.PRCP_CUM7 || 0).toFixed(1);
  const consecHot = Math.round(af.CONSEC_HOT || 0);
  const season = Math.round(af.SEASON || 0);
  const seasonNames = [
    "Winter",
    "Pre-monsoon",
    "Monsoon",
    "Post-monsoon",
  ];

  // Generate explanation sentences
  const explanationSentences = [
    `Today's maximum temperature is ${tmax}°C — ${
      parseFloat(tmaxAnom) > 0
        ? `${tmaxAnom}°C above the historical average for ${city} this month, increasing heatwave risk.`
        : `${Math.abs(tmaxAnom)}°C below the historical average for ${city} this month.`
    }`,

    `The last 7 days recorded ${cum7}mm of rainfall. ${
      parseFloat(cum7) > 50
        ? "Soil saturation is elevated — flash flood risk increases with any additional rainfall."
        : parseFloat(cum7) > 20
        ? "Moderate recent rainfall noted."
        : "Ground conditions remain predominantly dry."
    }`,

    consecHot > 3
      ? `⚠️ ${consecHot} consecutive hot days detected — this pattern meets the meteorological definition of a heatwave.`
      : consecHot > 0
      ? `${consecHot} warm day(s) in sequence — no sustained heat streak yet.`
      : `No consecutive heat pattern detected in recent history.`,

    `Current season: ${seasonNames[season]}. ${
      season === 2
        ? "Peak monsoon period — heavy rainfall events are most frequent during these months across Indian stations."
        : season === 1
        ? "Pre-monsoon period — temperatures are rising and heatwave probability increases significantly."
        : season === 0
        ? "Winter season — cold wave risk is elevated, particularly in northern stations."
        : "Post-monsoon transition — conditions generally moderating."
    }`,
  ];

  // Compute risk values for Section A Step 4 gauge
  const heavyRain =
    Math.min((af.PRCP || 0) / 50, 1) * result.probability * 100;
  const heatwave =
    (af.TMAX_ANOM || 0) > 0
      ? ((af.TMAX_ANOM || 0) / 3) * result.probability * 100
      : 0;
  const coldWave =
    (af.TMIN_ANOM || 0) < 0
      ? (Math.abs(af.TMIN_ANOM || 0) / 3) * result.probability * 100
      : 0;

  const riskColor = (v) =>
    v < 5
      ? "text-green-400 border-green-800"
      : v < 20
      ? "text-yellow-400 border-yellow-800"
      : "text-red-400 border-red-800";

  // Gauge SVG implementation
  const RADIUS = 80;
  const cx = 110;
  const cy = 100;
  const circumference = Math.PI * RADIUS;
  const pct = Math.min(result.probability * 100, 100);
  const filled = (pct / 100) * circumference;
  const offset = circumference - filled;

  const gaugeColor =
    pct < 20 ? "#22c55e" : pct < 50 ? "#f59e0b" : "#ef4444";

  // ==================== RENDER ====================
  try {
    return (
      <div className="space-y-6 mt-6">
        {/* ========== SECTION A: ML PIPELINE STEPS ========== */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
          {/* Step 1: Data Collection */}
          {visibleSteps[0] && (
            <div className="border border-gray-700 rounded-lg p-4 bg-black/40 animate-fadeIn">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-3">
                    Data Collection
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Left: OpenWeather API */}
                    <div className="bg-gray-800 rounded p-3">
                      <p className="text-xs text-gray-400 mb-2">
                        OpenWeather API
                      </p>
                      <p className="text-white text-sm">
                        <span className="font-mono">
                          {result.weather?.temp || 0}°C
                        </span>
                      </p>
                      <p className="text-white text-sm">
                        <span className="font-mono">
                          {result.weather?.rain || 0}mm
                        </span>
                      </p>
                    </div>
                    {/* Right: Historical Context */}
                    <div className="bg-gray-800 rounded p-3">
                      <p className="text-xs text-gray-400 mb-2">
                        Historical Context
                      </p>
                      {history.length >= 3 ? (
                        <>
                          <div
                            style={{
                              width: "100%",
                              height: "40px",
                              marginBottom: "4px",
                            }}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={history.slice(-10)}>
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#374151"
                                />
                                <Line
                                  type="monotone"
                                  dataKey="tmax"
                                  stroke="#f97316"
                                  strokeWidth={2}
                                  dot={false}
                                  isAnimationActive={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="text-xs text-gray-300">
                            Last 10 days used for lag & rolling features
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-gray-300">
                          10 days of station data loaded
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-green-400 text-xl">✓</div>
              </div>
            </div>
          )}

          {/* Step 2: Feature Engineering */}
          {visibleSteps[1] && (
            <div className="border border-gray-700 rounded-lg p-4 bg-black/40 animate-fadeIn">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-3">
                    Feature Engineering
                  </h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Building {featureCount} features from raw inputs...
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Season */}
                    <div className="bg-gray-800 rounded p-2">
                      <p className="text-gray-400">Season</p>
                      <p className="text-white font-mono">
                        {
                          [
                            "Winter ❄️",
                            "Pre-monsoon 🌤️",
                            "Monsoon 🌧️",
                            "Post-monsoon 🍂",
                          ][season]
                        }
                      </p>
                    </div>
                    {/* Temperature Anomaly */}
                    <div className="bg-gray-800 rounded p-2">
                      <p className="text-gray-400">Temp Anomaly</p>
                      <p
                        className={`font-mono ${
                          parseFloat(tmaxAnom) > 0
                            ? "text-orange-400"
                            : "text-blue-400"
                        }`}
                      >
                        {parseFloat(tmaxAnom) > 0
                          ? `↑ ${tmaxAnom}σ`
                          : `↓ ${tmaxAnom}σ`}
                      </p>
                    </div>
                    {/* 7-Day Rain */}
                    <div className="bg-gray-800 rounded p-2">
                      <p className="text-gray-400">7-Day Rain</p>
                      <p className="text-white font-mono">{cum7}mm</p>
                    </div>
                    {/* Consecutive Hot Days */}
                    <div className="bg-gray-800 rounded p-2">
                      <p className="text-gray-400">Hot Days</p>
                      <p className="text-white font-mono">{consecHot} days</p>
                    </div>
                  </div>
                </div>
                <div className="text-green-400 text-xl">✓</div>
              </div>
            </div>
          )}

          {/* Step 3: XGBoost Model */}
          {visibleSteps[2] && (
            <div className="border border-gray-700 rounded-lg p-4 bg-black/40 animate-fadeIn">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-3">
                    XGBoost Model: 500 Trees Voted
                  </h4>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded h-3 mb-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-1500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Pie Chart */}
                  <div style={{ width: "100%", maxWidth: "200px", margin: "0 auto 12px" }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "Normal",
                              value: Math.round(
                                (1 - result.probability) * 500
                              ),
                              fill: "#22c55e",
                            },
                            {
                              name: "Extreme",
                              value: Math.round(result.probability * 500),
                              fill: "#ef4444",
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          dataKey="value"
                          label={{
                            value: `${Math.round(
                              result.probability * 500
                            )} / 500 flagged`,
                            position: "center",
                            fill: "white",
                            fontSize: 12,
                          }}
                        >
                          <Cell fill="#22c55e" />
                          <Cell fill="#ef4444" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <p className="text-xs text-gray-300 text-center mb-1">
                    <span className="text-red-400">
                      {Math.round(result.probability * 500)} trees
                    </span>{" "}
                    voted EXTREME
                  </p>
                  <p className="text-xs text-gray-300 text-center">
                    <span className="text-green-400">
                      {Math.round((1 - result.probability) * 500)} trees
                    </span>{" "}
                    voted NORMAL
                  </p>
                </div>
                <div className="text-green-400 text-xl">✓</div>
              </div>
            </div>
          )}

          {/* Step 4: Risk Assessment Gauge */}
          {visibleSteps[3] && (
            <div className="border border-gray-700 rounded-lg p-4 bg-black/40 animate-fadeIn">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
                  4
                </div>

                <h4 className="text-white font-semibold">Risk Assessment</h4>

                {/* SVG Gauge */}
                <svg
                  viewBox="0 0 220 120"
                  width="100%"
                  maxWidth="280px"
                  style={{ maxWidth: "280px", margin: "0 auto" }}
                >
                  {/* Background arc */}
                  <path
                    d="M 30 100 A 80 80 0 0 1 190 100"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  {/* Colored fill arc */}
                  <path
                    d="M 30 100 A 80 80 0 0 1 190 100"
                    fill="none"
                    stroke={gaugeColor}
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 1.5s ease" }}
                  />
                  {/* Center text - probability */}
                  <text
                    x="110"
                    y="85"
                    textAnchor="middle"
                    fill="white"
                    fontSize="20"
                    fontWeight="bold"
                  >
                    {pct < 1 ? pct.toFixed(3) : pct.toFixed(1)}%
                  </text>
                  {/* Risk label */}
                  <text
                    x="110"
                    y="105"
                    textAnchor="middle"
                    fill={gaugeColor}
                    fontSize="11"
                    fontWeight="600"
                  >
                    {pct < 20
                      ? "LOW RISK"
                      : pct < 50
                      ? "MODERATE"
                      : "HIGH RISK"}
                  </text>
                  {/* Scale labels */}
                  <text x="26" y="118" fill="#9ca3af" fontSize="10">
                    0%
                  </text>
                  <text x="96" y="30" fill="#9ca3af" fontSize="10">
                    50%
                  </text>
                  <text x="180" y="118" fill="#9ca3af" fontSize="10">
                    100%
                  </text>
                </svg>

                {/* Risk Cards */}
                <div className="grid grid-cols-3 gap-2 w-full">
                  <div
                    className={`border rounded p-2 text-center text-xs ${riskColor(
                      heavyRain
                    )}`}
                  >
                    <div>🌧️</div>
                    <p className="font-semibold">Heavy Rain</p>
                    <p>{heavyRain.toFixed(1)}% risk</p>
                  </div>
                  <div
                    className={`border rounded p-2 text-center text-xs ${riskColor(
                      heatwave
                    )}`}
                  >
                    <div>🌡️</div>
                    <p className="font-semibold">Heatwave</p>
                    <p>{heatwave.toFixed(1)}% risk</p>
                  </div>
                  <div
                    className={`border rounded p-2 text-center text-xs ${riskColor(
                      coldWave
                    )}`}
                  >
                    <div>❄️</div>
                    <p className="font-semibold">Cold Wave</p>
                    <p>{coldWave.toFixed(1)}% risk</p>
                  </div>
                </div>
              </div>

              <div className="text-green-400 text-xl text-right">✓</div>
            </div>
          )}
        </div>

        {/* ========== SECTION B: HISTORICAL WEATHER CHART ========== */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-2">
            Last 10 Days — Data Used by Model
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Powers lag features · rolling averages · anomaly scores
          </p>

          {history.length < 3 && (
            <div className="bg-yellow-900/30 border border-yellow-700 rounded p-3 mb-4 text-xs text-yellow-300">
              ℹ️ Limited history available — model used Open-Meteo bootstrap data for context features
            </div>
          )}

          <div style={{ width: "100%", height: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={
                  history.length > 0
                    ? history.slice(-10)
                    : [
                        { date: "N/A", tavg: 25, prcp: 0 },
                      ]
                }
              >
                <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) =>
                    value && new Date(value).toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis
                  yAxisId="left"
                  stroke="#9ca3af"
                  tick={{ fontSize: 10 }}
                  label={{
                    value: "°C",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#9ca3af",
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#9ca3af"
                  tick={{ fontSize: 10 }}
                  label={{
                    value: "mm",
                    angle: 90,
                    position: "insideRight",
                    fill: "#9ca3af",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => value?.toFixed(1) || 0}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="tavg"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  name="Avg Temp"
                />
                <Bar
                  yAxisId="right"
                  dataKey="prcp"
                  fill="#3b82f6"
                  opacity={0.5}
                  name="Rainfall"
                />
                <ReferenceLine
                  yAxisId="left"
                  y={35}
                  stroke="#ef4444"
                  strokeDasharray="4 2"
                  label={{
                    value: "Heat Threshold",
                    fill: "#ef4444",
                    fontSize: 10,
                    position: "right",
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ========== SECTION C: PLAIN ENGLISH EXPLANATION ========== */}
        <div className="bg-gray-900 border border-gray-700 border-l-4 border-l-amber-500 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 italic">
            Why this prediction?
          </h3>
          <div className="space-y-3">
            {explanationSentences.map((sentence, idx) => (
              <p key={idx} className="text-gray-300 text-sm italic leading-relaxed">
                {sentence}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (err) {
    console.error("Error rendering AdvancedInsights:", err);
    return null;
  }
}

export default AdvancedInsights;
