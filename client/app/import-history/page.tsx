"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
interface ImportLog {
  fileName: string;
  totalFetched: number;
  newJobs: number;
  updatedJobs: number;
  failedJobs: number;
  timestamp: string;
}

export default function ImportHistoryPage() {
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch import logs from backend
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/import-logs`);
      const data = await res.json();
      setLogs(data);
    } catch (err: unknown) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger import job
  // Trigger import job
const runImport = async () => {
  try {
    setImporting(true);
    toast.loading("Importing jobs...", { id: "import" }); // show loading toast

    const res = await fetch(`${BASE_URL}/import`, { method: "POST" });
    const data = await res.json();

    // ✅ Dynamic toast based on backend response
    if (data.success) {
      toast.success(
        `🎉 ${data.message}\n📦 Total Jobs: ${data.details?.totalFetched || 0}\n🕒 Queued At: ${new Date(
          data.details?.queuedAt || Date.now()
        ).toLocaleTimeString()}`,
        {
          id: "import",
          duration: 4000,
          style: {
            border: `1px solid ${darkMode ? "#34D399" : "#10B981"}`,
            padding: "12px 16px",
            color: darkMode ? "#D1FAE5" : "#064E3B",
            background: darkMode ? "#064E3B" : "#ECFDF5",
            fontWeight: 500,
            whiteSpace: "pre-line", // allow \n line breaks
          },
        }
      );
    } else {
      toast.error("⚠️ Failed to queue jobs", { id: "import" });
    }

    await fetchLogs(); // Refresh table after import
  } catch (err) {
    toast.error("❌ Error running import", { id: "import" });
  } finally {
    setImporting(false);
  }
};


  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-500 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div
        className={`max-w-5xl mx-auto shadow-lg rounded-2xl p-6 transition-all duration-500 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Import History
          </h1>

          <div className="flex gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="cursor-pointer px-3 py-2 rounded-lg font-semibold text-sm border border-gray-400 hover:border-gray-600 transition-colors duration-300"
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>

            {/* Run Import Button */}
            <button
              onClick={runImport}
              disabled={importing}
              className={`cursor-pointer px-4 py-2 rounded-lg text-white font-semibold transition-all duration-300 transform ${
                importing
                  ? "bg-gray-500 cursor-not-allowed scale-95"
                  : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
              }`}
            >
              {importing ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Importing...
                </div>
              ) : (
                "Run Import"
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="flex items-center gap-3">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-gray-500 text-lg animate-pulse">Loading logs...</p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No import history found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table
              className={`w-full border border-gray-200 rounded-lg overflow-hidden transition-all duration-500 ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <thead
                className={`border-b ${
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                }`}
              >
                <tr>
                  <th className="p-3 text-left text-sm font-semibold">File Name</th>
                  <th className="p-3 text-sm font-semibold">Total</th>
                  <th className="p-3 text-sm font-semibold">New</th>
                  <th className="p-3 text-sm font-semibold">Updated</th>
                  <th className="p-3 text-sm font-semibold">Failed</th>
                  <th className="p-3 text-sm font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr
                    key={i}
                    className={`transition-colors duration-300 ${
                      darkMode
                        ? "hover:bg-gray-700 border-gray-700"
                        : "hover:bg-gray-50 border-gray-100"
                    } border-b`}
                  >
                    <td className="p-3 text-sm">{log.fileName}</td>
                    <td className="p-3 text-center text-sm">{log.totalFetched}</td>
                    <td className="p-3 text-center text-green-500 font-semibold text-sm">
                      {log.newJobs}
                    </td>
                    <td className="p-3 text-center text-blue-500 font-semibold text-sm">
                      {log.updatedJobs}
                    </td>
                    <td className="p-3 text-center text-red-500 font-semibold text-sm">
                      {log.failedJobs}
                    </td>
                    <td className="p-3 text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
