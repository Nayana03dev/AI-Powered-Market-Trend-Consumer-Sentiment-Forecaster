const multer = require("multer");
const upload = multer({ dest: "uploads/" });

let datasets = {}; // store multiple datasets
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
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors({
  origin: "*"
}));

// 🔹 RAG API
app.post("/api/ask", (req, res) => {
  const question = req.body.question.toLowerCase();

  let answer = "";

  if (question.includes("ev")) {
    answer = "EV market is growing with increasing adoption and government support.";
  } 
  else if (question.includes("trend")) {
    answer = "The market shows a moderate positive trend with some fluctuations.";
  } 
  else if (question.includes("risk")) {
    answer = "Risks include battery cost, charging infrastructure, and supply chain issues.";
  } 
  else {
    answer = "Market sentiment is mostly neutral with slight positive growth.";
  }

  res.json({ answer });
});
app.post("/api/upload", upload.single("file"), (req, res) => {
  const datasetId = Date.now();

  let positive = 0;
  let neutral = 0;
  let negative = 0;
  let dailyTrend = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      const text = (row.text || "").toLowerCase();

      const sentiment = getSentiment(text);

      if (sentiment === "positive") positive++;
      else if (sentiment === "negative") negative++;
      else neutral++;

      // same logic as default API
      dailyTrend.push(
        sentiment === "positive" ? 1 :
        sentiment === "negative" ? -1 : 0
      );
    })
    .on("end", () => {
      const total = positive + neutral + negative || 1;

      // 🔥 build proper trend
      let trend = [];
      let sum = 0;

      dailyTrend.forEach((val, index) => {
        sum += val;
        trend.push(Number((sum / (index + 1)).toFixed(2)));
      });

      datasets[datasetId] = {
        positive: Number(((positive / total) * 100).toFixed(1)),
        neutral: Number(((neutral / total) * 100).toFixed(1)),
        negative: Number(((negative / total) * 100).toFixed(1)),
        trend: trend.slice(0, 10),
      };

      res.json({
        datasetId: datasetId,
        message: "Uploaded successfully",
      });
    });
});

app.get("/api/sentiment/:id", (req, res) => {
  const id = req.params.id;
  res.json(datasets[id] || {});
});


/*
  Start server
*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
