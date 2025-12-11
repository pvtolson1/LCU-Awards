// server.js
// Minimal backend for LCU Awards voting

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { randomUUID } = require("crypto");

const app = express();
const PORT = process.env.PORT || 3001;

// Change this in production, or better: pull from process.env.ADMIN_KEY
const ADMIN_KEY = process.env.ADMIN_KEY || "7x5W$&ewFN0CJRaH";

app.use(
  cors({
    origin: true, // allow all origins during development
    credentials: false
  })
);
app.use(bodyParser.json());

// In-memory store of ballots: [{ id, submittedAt, votes }]
const ballots = [];

// POST /api/ballots – submit one ballot
app.post("/api/ballots", (req, res) => {
  const { votes, submittedAt } = req.body || {};

  if (!votes || typeof votes !== "object" || Array.isArray(votes)) {
    return res.status(400).json({ error: "Invalid payload. 'votes' object required." });
  }

  const ballot = {
    id: randomUUID(),
    submittedAt: submittedAt || new Date().toISOString(),
    votes
  };

  ballots.push(ballot);
  console.log("Received new ballot:", ballot);

  res.status(201).json({ ok: true, id: ballot.id });
});

// GET /api/ballots – list all ballots (admin)
app.get("/api/ballots", (req, res) => {
  const adminKey = req.header("x-admin-key");

  if (!adminKey || adminKey !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized (missing or invalid admin key)" });
  }

  res.json(ballots);
});

app.listen(PORT, () => {
  console.log(`LCU Awards backend listening on http://localhost:${PORT}`);
});
