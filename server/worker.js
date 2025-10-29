const mongoose = require("mongoose");
const { Job, ImportLog } = require("./models/importJobs");
const jobQueue = require("./queue/jobQueue");
const dotenv = require("dotenv");

dotenv.config();

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// --- Upsert (Insert or Update) Job Function ---
async function upsertJob(jobData) {
  if (!jobData.jobId) {
    throw new Error("Missing jobId");
  }

  // Check if job already exists
  const existing = await Job.findOne({ jobId: jobData.jobId });

  if (existing) {
    Object.assign(existing, jobData);
    await existing.save();
    return "updated";
  } else {
    const newJob = new Job(jobData);
    await newJob.save();
    return "new";
  }
}

// --- Job Queue Processing ---
jobQueue.process("importJobs", async (job) => {
  const { fileName, jobs } = job.data;
  let stats = {
    totalFetched: 0,
    newJobs: 0,
    updatedJobs: 0,
    failedJobs: 0,
    failedReasons: [],
  };

  console.log(`🚀 Import started for file: ${fileName}`);
  console.log(`📦 Total jobs received from feed: ${jobs.length}`);

  for (const j of jobs) {
    try {
      // ✅ Extract guid properly (handles object format from XML)
      let rawGuid = j.guid?.[0];
      if (typeof rawGuid === "object" && rawGuid._) {
        rawGuid = rawGuid._; // extract actual string from object
      }

      // ✅ Handle links safely
      const rawLink = Array.isArray(j.link) ? j.link[0] : j.link;

      // ✅ Always generate a valid unique string jobId
      const jobId =
        (rawGuid && String(rawGuid).trim()) ||
        (rawLink && String(rawLink).trim()) ||
        `${(j.title?.[0] || "job")}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

      // ✅ Prevent duplicates — skip if already inserted this run
      if (stats[jobId]) {
        console.log("⚠️ Duplicate skipped:", jobId);
        continue;
      }
      stats[jobId] = true;

      const jobData = {
        jobId: String(jobId),
        title: j.title?.[0] || "Untitled",
        company: j["dc:creator"]?.[0] || "Unknown Company",
        location: j.location?.[0] || "Remote",
        description: j.description?.[0] || "No description provided",
        link: rawLink || "",
        published: j.pubDate ? new Date(j.pubDate[0]) : new Date(),
        updatedAt: new Date(),
      };

      const result = await upsertJob(jobData);

      stats.totalFetched++;
      if (result === "new") stats.newJobs++;
      else stats.updatedJobs++;
    } catch (err) {
      stats.failedJobs++;
      const reason = err.message || JSON.stringify(err);
      stats.failedReasons.push(reason);
      console.error("❌ Job failed reason:", reason);
    }
  }

  // --- Save Import Summary ---
  await ImportLog.create({
    fileName,
    totalFetched: stats.totalFetched,
    newJobs: stats.newJobs,
    updatedJobs: stats.updatedJobs,
    failedJobs: stats.failedJobs,
    failedReasons: stats.failedReasons,
    timestamp: new Date(),
  });

  console.log(`✅ Import completed for ${fileName}`);
  console.log(
    `📊 Summary: Total=${stats.totalFetched}, New=${stats.newJobs}, Updated=${stats.updatedJobs}, Failed=${stats.failedJobs}`
  );
});
