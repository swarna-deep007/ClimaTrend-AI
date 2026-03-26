import { useState } from "react";
import axios from "axios";

function App() {
  const [form, setForm] = useState({
    predictionType: "rainfall",
    country: "India",
    city: "",
    date: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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

      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      
      {/* Title */}
      <h1 className="text-4xl font-bold text-blue-500 mb-10">
        Climate AI 🌦️
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-md space-y-4"
      >
        {/* Prediction Type */}
        <select
          name="predictionType"
          value={form.predictionType}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700"
        >
          <option value="rainfall">Rainfall</option>
          <option value="temperature">Temperature</option>
          <option value="snowfall">Snowfall</option>
        </select>

        {/* Country */}
        <select
          name="country"
          value={form.country}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700"
        >
          <option value="India">India</option>
          <option value="Japan">Japan</option>
        </select>

        {/* City */}
        <input
          type="text"
          name="city"
          placeholder="Enter city"
          value={form.city}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700"
          required
        />

        {/* Date */}
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700"
          required
        />

        {/* Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold"
        >
          {loading ? "Predicting..." : "Predict"}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="mt-6 bg-gray-800 p-4 rounded-xl w-full max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2">Prediction Result</h2>
          <p>{result.location}</p>
          <p>{result.date}</p>
          <p className="text-lg mt-2">{result.value}</p>
          <p
            className={`mt-1 font-bold ${
              result.classification === "Extreme"
                ? "text-red-500"
                : "text-green-400"
            }`}
          >
            {result.classification}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;