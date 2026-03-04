import "./App.css";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

function App() {
  
   
  useEffect(() => {
  fetch("http://localhost:5000/api/sentiment")
    .then(res => res.json())
    .then(data => {
      setPositive(data.positive || 0);
      setNeutral(data.neutral || 0);
      setNegative(data.negative || 0);
      setTrend(data.trend || []);
    });
}, []);
    const [sentiment, setSentiment] = useState({
    positive: 0,
    neutral: 0,
    negative: 0,
    trend: [],
    });
  // 🔹 Fetch data from backend
  useEffect(() => {
  const fetchData = () => {
    fetch("http://localhost:5000/api/sentiment")
      .then(res => res.json())
      .then(data => {
        setSentiment({
          positive: data.positive || 0,
          neutral: data.neutral || 0,
          negative: data.negative || 0,
          trend: data.trend || [],
        });
      });
  };

  fetchData(); // first load

  const interval = setInterval(fetchData, 5000); // refresh every 5 sec

  return () => clearInterval(interval); // cleanup
}, []);
  // 3️⃣ Chart Data
  const trendData = {
    labels: sentiment.trend.map((_, i) => `Point ${i + 1}`),
    datasets: [
      {
        label: "EV Sentiment Trend",
        data: sentiment.trend,
        borderColor: "#2563eb",
        tension: 0.4,
      },
    ],
  };
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          background: "#111827",
          color: "white",
          padding: "20px",
        }}
      >
        <h2>AI Market Dashboard</h2>
        <p>Overview</p>
        <p>Market Trends</p>
        <p>Sentiment</p>
        <p>Forecast</p>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", background: "#f1f5f9" }}>
        <h1>Market Trend Analysis</h1>

        {/* Sentiment Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div style={{ ...cardStyle, borderLeft: "6px solid green" }}>
            <h3>Positive</h3>
            <p>{sentiment.positive}%</p>
          </div>

          <div style={{ ...cardStyle, borderLeft: "6px solid orange" }}>
            <h3>Neutral</h3>
            <p>{sentiment.neutral}%</p>
          </div>
          

          <div style={{ ...cardStyle, borderLeft: "6px solid red" }}>
            <h3>Negative</h3>
            <p>{sentiment.negative}%</p>
          </div>
        </div>

        {/* Trend Chart */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h2>Market Trend Forecast</h2>
          <Line data={trendData} />
        </div>

        {/* Forecast */}
        <div
          style={{
            marginTop: "20px",
            background: "#f1f5f9",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <h2>AI Forecast Result</h2>
        {sentiment.neutral > 10 && (
        <div
          style={{
            marginTop: "20px",
            padding: "18px",
            borderRadius: "12px",
            background: "linear-gradient(90deg, #ff4d4d, #ff1a1a)",
            color: "white",
            fontSize: "18px",
            fontWeight: "bold",
            boxShadow: "0 4px 15px rgba(255,0,0,0.4)",
            animation: "pulse 1s infinite"
          }}
        >
          🚨 High Neutral Sentiment Alert ({sentiment.neutral}%)
        </div>
      )}

          <p
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#2563eb",
            }}
          >
            EV market sentiment is trending{" "}
            {sentiment.positive > sentiment.negative
              ? "positively 📈"
              : "negatively 📉"}
          </p>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  fontSize: "18px",
};

export default App;