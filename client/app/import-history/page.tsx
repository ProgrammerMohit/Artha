"use client";
// @ts-nocheck

import { useState, useEffect } from "react";

export default function ImportHistoryPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  // Fetch import logs from backend
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/import-logs`);
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger import job
  const runImport = async () => {
    try {
      setImporting(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/import`, {
        method: "POST",
      });
      const data = await res.json();
      alert(data.message || "Import triggered");
      await fetchLogs(); // Refresh table after import
    } catch (err) {
      alert("Error running import: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Import History
          </h1>
          <button
            onClick={runImport}
            disabled={importing}
            className={`px-4 py-2 rounded-lg text-white font-semibold ${
              importing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {importing ? "Importing..." : "Run Import"}
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading logs...</p>
        ) : logs.length === 0 ? (
          <p className="text-gray-500">No import history found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">File Name</th>
                  <th className="p-3 text-sm text-gray-700">Total</th>
                  <th className="p-3 text-sm text-gray-700">New</th>
                  <th className="p-3 text-sm text-gray-700">Updated</th>
                  <th className="p-3 text-sm text-gray-700">Failed</th>
                  <th className="p-3 text-sm text-gray-700">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-800">{log.fileName}</td>
                    <td className="p-3 text-center text-gray-800">{log.totalFetched}</td>
                    <td className="p-3 text-center text-green-600 font-semibold">{log.newJobs}</td>
                    <td className="p-3 text-center text-blue-600 font-semibold">{log.updatedJobs}</td>
                    <td className="p-3 text-center text-red-600 font-semibold">{log.failedJobs}</td>
                    <td className="p-3 text-sm text-gray-600">
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
