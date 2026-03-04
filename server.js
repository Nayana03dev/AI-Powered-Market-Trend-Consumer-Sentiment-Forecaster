const express = require("express");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");

const app = express();
app.use(cors());

/*
  Utility function:
  Detect sentiment from text (simple rule-based NLP)
*/
function getSentiment(text) {
  const positiveWords = ["good", "growth", "profit", "increase", "positive", "success", "benefit"];
  const negativeWords = ["bad", "loss", "decline", "drop", "negative", "risk", "problem"];

  let score = 0;
  const lowerText = text.toLowerCase();

  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score++;
  });

  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score--;
  });

  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
}

/*
  API: Sentiment Analysis
*/
app.get("/api/sentiment", (req, res) => {
  let positive = 0;
  let neutral = 0;
  let negative = 0;
  let dailyTrend = [];

  fs.createReadStream("./data/final_ev_dataset.csv")
    .pipe(csv())
    .on("data", (row) => {
      // Adjust column name if needed
        const text = row.text ? row.text.toLowerCase() : "";

      const sentiment = getSentiment(text);

      if (sentiment === "positive") positive++;
      else if (sentiment === "negative") negative++;
      else neutral++;

      dailyTrend.push(sentiment === "positive" ? 1 : sentiment === "negative" ? -1 : 0);
    })
    .on("end", () => {
      const total = positive + neutral + negative || 1;

      // Build trend values (moving average)
      let trend = [];
      let sum = 0;

      dailyTrend.forEach((val, index) => {
        sum += val;
        trend.push(Number((sum / (index + 1)).toFixed(2)));
      });

      res.json({
        positive: Number(((positive / total) * 100).toFixed(1)),
        neutral: Number(((neutral / total) * 100).toFixed(1)),
        negative: Number(((negative / total) * 100).toFixed(1)),
        trend: trend.slice(0, 10) // limit for chart
      });
    })
    .on("error", (err) => {
      res.status(500).json({ error: err.message });
    });
});

/*
  Start server
*/
app.listen(5000, () => {
  console.log("Backend running at http://localhost:5000");
});