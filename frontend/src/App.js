import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"; // Ensure you create and import a CSS file for custom styles

export default function App() {
  const [processes, setProcesses] = useState([]);
  const [filter, setFilter] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/processes");
      setProcesses(response.data);
    } catch (error) {
      console.error("Error fetching processes:", error);
    }
  };

  const killProcess = async (name) => {
    try {
      await axios.post("http://127.0.0.1:5000/api/kill", { name });
      fetchProcesses();
    } catch (error) {
      console.error("Error killing process:", error);
    }
  };

  return (
    <div className={`app-container App ${darkMode ? "dark-mode" : "light-mode"}`} style={{
      backgroundImage: "url('/background.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      minHeight: "100vh"
    }}>
      <div className="overlay"></div>
      <div className="content container mt-5">
        <h1 className="text-center text-primary mb-4">Process Manager</h1>

       

        {/* Search Input */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search Process..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {/* Process List */}
        <div className="card shadow-lg">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0">Running Processes</h4>
          </div>
          <ul className="list-group list-group-flush">
            {processes
              .filter((p) => p.toLowerCase().includes(filter.toLowerCase()))
              .map((process) => (
                <li
                  key={process}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span>{process}</span>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => killProcess(process)}
                  >
                    Terminate
                  </button>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
