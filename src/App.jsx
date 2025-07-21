import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, Tooltip, Cell, ResponsiveContainer
} from "recharts";
import { saveAs } from "file-saver";
import {
  FaPlus, FaDownload, FaTrash,
  FaTrophy, FaMedal, FaExternalLinkAlt
} from "react-icons/fa";

const COLORS = ["#4ade80", "#60a5fa", "#facc15", "#f472b6", "#c084fc"];

const App = () => {
  const [hits, setHits] = useState(() => {
    const stored = localStorage.getItem("hits");
    return stored ? JSON.parse(stored) : [];
  });

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterUrl, setFilterUrl] = useState("");

  useEffect(() => {
    localStorage.setItem("hits", JSON.stringify(hits));
  }, [hits]);

  const handleHit = () => {
    if (name && url) {
      setHits([...hits, { name, url, time: new Date().toLocaleString() }]);
      setUrl("");
    }
  };

  const exportCSV = () => {
    const header = "Name,URL,Time\n";
    const rows = hits.map(h => `${h.name},${h.url},${h.time}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "hits.csv");
  };

  const filtered = hits.filter(hit =>
    (filterUser ? hit.name === filterUser : true) &&
    (filterUrl ? hit.url === filterUrl : true)
  );

  const hitsPerUser = Object.entries(
    filtered.reduce((acc, { name }) => {
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  const hitsPerUrl = Object.entries(
    filtered.reduce((acc, { url }) => {
      acc[url] = (acc[url] || 0) + 1;
      return acc;
    }, {})
  ).map(([url, count]) => ({ url, count }));

  const hitsOverTime = filtered.reduce((acc, { time }) => {
    const key = time.split(",")[0];
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const timeChartData = Object.entries(hitsOverTime).map(([time, count]) => ({ time, count }));

  const sortedHits = [...hitsPerUrl].sort((a, b) => b.count - a.count);
  const mostVisited = sortedHits[0];
  const leastVisited = sortedHits[sortedHits.length - 1];
  const leaderboard = sortedHits.slice(0, 3);

  return (
    <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-200 text-black min-h-screen p-8">

      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold tracking-tight">Hit Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your Name"
            className="p-3 rounded border bg-white text-black placeholder-gray-500 focus:outline-none focus:ring focus:border-blue-500"
          />
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleHit()}
            placeholder="Page URL"
            className="p-3 rounded border bg-white text-black placeholder-gray-500 focus:outline-none focus:ring focus:border-blue-500"
          />
          <button
            onClick={handleHit}
            className="bg-green-600 hover:bg-green-700 px-4 py-3 text-white font-medium rounded shadow flex items-center gap-2"
          >
            <FaPlus /> Record Hit
          </button>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <select
            onChange={e => setFilterUser(e.target.value)}
            className="p-2 rounded border bg-white text-black"
          >
            <option value="">All Users</option>
            {[...new Set(hits.map(h => h.name))].map((u, i) => (
              <option key={i}>{u}</option>
            ))}
          </select>
          <select
            onChange={e => setFilterUrl(e.target.value)}
            className="p-2 rounded border bg-white text-black"
          >
            <option value="">All URLs</option>
            {[...new Set(hits.map(h => h.url))].map((u, i) => (
              <option key={i}>{u}</option>
            ))}
          </select>
          <button
            onClick={exportCSV}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded font-medium flex items-center gap-2"
          >
            <FaDownload /> Export CSV
          </button>
          <button
            onClick={() => setHits([])}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium flex items-center gap-2"
          >
            <FaTrash /> Clear All
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold text-lg mb-2 text-green-600">Most Visited Website</h2>
            {mostVisited ? (
              <div>
                <p className="font-medium">URL: <span className="text-blue-600">{mostVisited.url}</span></p>
                <p className="text-sm text-gray-700">Hits: {mostVisited.count}</p>
              </div>
            ) : <p>No data</p>}
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold text-lg mb-2 text-red-500">Least Visited Website</h2>
            {leastVisited ? (
              <div>
                <p className="font-medium">URL: <span className="text-blue-600">{leastVisited.url}</span></p>
                <p className="text-sm text-gray-700">Hits: {leastVisited.count}</p>
              </div>
            ) : <p>No data</p>}
          </div>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h2 className="font-bold text-2xl mb-4 flex items-center gap-2">
            <FaTrophy className="text-yellow-500" /> Top 3 URLs Leaderboard
          </h2>
          <ol className="space-y-3">
            {leaderboard.length === 0 ? (
              <p className="text-gray-500">No data available.</p>
            ) : (
              leaderboard.map((entry, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <FaMedal
                      className={`text-xl ${
                        i === 0
                          ? "text-yellow-400"
                          : i === 1
                          ? "text-gray-400"
                          : "text-orange-500"
                      }`}
                    />
                    <span className="font-medium text-blue-700">{entry.url}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    {entry.count} Hits
                  </span>
                </li>
              ))
            )}
          </ol>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white text-black p-5 rounded shadow">
            <h2 className="font-semibold text-lg mb-3">Hits Per User</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hitsPerUser}>
                <XAxis dataKey="name" tick={{ fill: "#000" }} />
                <YAxis tick={{ fill: "#000" }} />
                <Tooltip />
                <Bar dataKey="count" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white text-black p-5 rounded shadow">
            <h2 className="font-semibold text-lg mb-3">Hits Per URL</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={hitsPerUrl} dataKey="count" nameKey="url" cx="50%" cy="50%" outerRadius={70}>
                  {hitsPerUrl.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white text-black p-5 rounded shadow">
            <h2 className="font-semibold text-lg mb-3">Hits Over Time</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timeChartData}>
                <XAxis dataKey="time" tick={{ fill: "#000" }} />
                <YAxis tick={{ fill: "#000" }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#34d399" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="overflow-x-auto">
          <h2 className="font-semibold text-xl mt-4 mb-2">Hit Log</h2>
          <table className="min-w-full table-auto border border-gray-200 text-sm">
            <thead className="bg-gray-100 text-black">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">URL</th>
                <th className="p-2 border">Timestamp</th>
                <th className="p-2 border">Visit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((hit, i) => (
                <tr key={i} className="text-center border-t hover:bg-gray-50">
                  <td className="p-2 border">{i + 1}</td>
                  <td className="p-2 border">{hit.name}</td>
                  <td className="p-2 border">{hit.url}</td>
                  <td className="p-2 border">{hit.time}</td>
                  <td className="p-2 border">
                    <a
                      href={hit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center justify-center gap-1"
                    >
                      <FaExternalLinkAlt /> Visit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default App;
