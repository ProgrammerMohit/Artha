const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const dotenv = require("dotenv");
const xmlToJson = require("./utils/xmlToJson");
const { ImportLog } = require("./models/importJobs");
const jobQueue = require("./queue/jobQueue");
const cors = require("cors");


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error(err));

// Route to trigger job import
app.post("/import", async (req, res) => {
  try {
    const feedUrls = [
      "https://jobicy.com/?feed=job_feed&job_categories=design-multimedia",
      "https://jobicy.com/?feed=job_feed&job_categories=data-science",
      "https://www.higheredjobs.com/rss/articleFeed.cfm",
    ];

    let allJobs = [];

    for (const url of feedUrls) {
      const response = await axios.get(url);
      const jobs = await xmlToJson(response.data);
      allJobs.push(...jobs);
    }

    await jobQueue.add("importJobs", {
      fileName: "job_feed",
      jobs: allJobs,
    });

    res.status(200).json({ message: "Jobs queued successfully", totalFetched: allJobs.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Route to view import logs
app.get("/import-logs", async (req, res) => {
  const logs = await ImportLog.find().sort({ timestamp: -1 });
  res.json(logs);
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
