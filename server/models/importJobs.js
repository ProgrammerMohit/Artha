const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  jobId: { type: String, unique: true },
  title: String,
  company: String,
  location: String,
  description: String,
  link: String,
  published: Date,
  updatedAt: Date,
});

const importLogSchema = new mongoose.Schema({
  fileName: String,
  timestamp: { type: Date, default: Date.now },
  totalFetched: Number,
  newJobs: Number,
  updatedJobs: Number,
  failedJobs: Number,
  failedReasons: [String],
});

const Job = mongoose.model("Job", jobSchema);
const ImportLog = mongoose.model("ImportLog", importLogSchema);

module.exports = { Job, ImportLog };
