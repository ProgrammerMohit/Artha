const Queue = require("bull");
const dotenv = require("dotenv");

dotenv.config();

const jobQueue = new Queue("job-import", process.env.REDIS_URL);

module.exports = jobQueue;
