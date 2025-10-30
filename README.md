🧾 README.md — Artha Job Board (Full Stack Developer Task)
📘 Overview

This project implements the Artha Job Board Import System, a full-stack MERN application that imports job listings from an external feed, processes them sequentially, and stores the results in MongoDB.

The solution fulfills all the requirements of the Full Stack Developer (MERN) Task – Artha Job Board assignment, including job import, background processing, and detailed logging.

⚙️ Tech Stack

Frontend: Next.js (React) + TailwindCSS

Backend: Node.js + Express

Database: MongoDB Atlas

Queue Processing: Redis + Bull

Environment Management: dotenv

🚀 Key Features

Run Import Button – triggers the backend /import endpoint.

Sequential Job Processing – the worker imports each job one by one using await inside a for...of loop.

Job Classification – identifies and counts new, updated, and failed jobs.

Background Queue (Bull + Redis) – decouples frontend requests from heavy background imports.

Import Logs – each import run is logged with:

File Name

Total Jobs

New Jobs

Updated Jobs

Failed Jobs

Timestamp

Frontend Dashboard – displays import history and allows triggering imports directly from the UI.

🧠 How It Works

User clicks “Run Import” in the frontend UI.

Backend fetches the job feed and pushes data to a Redis queue.

The Worker (worker.js) consumes the queue and processes each job sequentially.

Each job is inserted or updated in MongoDB based on its jobId.

Import summary is saved in the ImportLog collection and displayed in the frontend table.

🗄️ Environment Variables

Create a .env file in both server and client folders:

Server .env
MONGO_URI=mongodb+srv://<your-atlas-uri>
REDIS_URL=redis://<your-redis-cloud-uri>

Client .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000

🧩 Run Locally
# 1. Start Redis server (or connect to Redis Cloud)
# 2. Start backend
cd server
npm install
node index.js

# 3. Start worker
node worker.js

# 4. Start frontend
cd client
npm install
npm run dev


Visit 👉 http://localhost:3000
 to access the import dashboard.

📊 Example Output
File Name	Total	New	Updated	Failed	Timestamp
job_feed	93	93	0	0	2025-10-29 22:40:12
🧩 Architecture Diagram (Conceptually)
[Frontend] → [Express API] → [Bull Queue (Redis)] → [Worker] → [MongoDB]

🧑‍💻 Developer Notes

This project was built and tested using:

Node.js v23+

MongoDB Atlas Cloud

Redis Cloud

Next.js 14 (App Router)

Bull Queue

🤖 Use of AI Assistance

As part of my learning and implementation process,
I used ChatGPT (OpenAI) for:

Debugging issues (MongoDB casting, Redis queue setup)

Improving code quality and error handling

Writing this README professionally

All the code was tested, configured, and executed by me locally.
ChatGPT was used as a development assistant, not a code generator.

✅ Status
Component	Status	Description
MongoDB Connection	✅	Connected to Atlas
Redis Queue	✅	Using Redis Cloud
Worker	✅	Sequential job import
Import Log	✅	Stored in MongoDB & displayed in UI
Frontend Integration	✅	Fully functional
