import React, { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [processes, setProcesses] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    const response = await axios.get("http://127.0.0.1:5000/api/processes");
    setProcesses(response.data);
  };

  const killProcess = async (name) => {
    await axios.post("http://127.0.0.1:5000/api/kill", { name });
    fetchProcesses();
  };

  return (
    <div className="p-5">
      <input
        type="text"
        placeholder="Search Process..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <button onClick={fetchProcesses} className="my-2">
        Refresh List
      </button>
      <div>
        <h2>Running Processes</h2>
        {processes
          .filter((p) => p.toLowerCase().includes(filter.toLowerCase()))
          .map((process) => (
            <div key={process}>
              <span>{process}</span>
              <button onClick={() => killProcess(process)}>Terminate</button>
            </div>
          ))}
      </div>
    </div>
  );
}
