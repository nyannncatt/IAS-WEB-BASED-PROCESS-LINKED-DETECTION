import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { motion } from "framer-motion";
import { FaSun, FaMoon, FaSyncAlt, FaSearch } from "react-icons/fa";

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
    <div className={`app-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      <div className="overlay"></div>
      <div className="content container py-5 text-center">
        <motion.h1 
          className="text-primary mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Process Manager
        </motion.h1>

        {/* Theme Toggle */}
        <button 
          className="btn btn-secondary mb-3 d-flex align-items-center mx-auto shadow-sm" 
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <FaSun /> : <FaMoon />} &nbsp; Toggle Mode
        </button>

        {/* Refresh Button */}
        <button className="btn btn-info mb-3 shadow-sm" onClick={fetchProcesses}>
          <FaSyncAlt /> Refresh List
        </button>

        {/* Search Input */}
        <div className="input-group mb-3 search-bar">
          <span className="input-group-text bg-primary text-white"><FaSearch /></span>
          <input
            type="text"
            className="form-control"
            placeholder="Search Process..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {/* Process List */}
        <motion.div className="card process-card shadow-lg glass-effect" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}>
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Running Processes ({processes.length})</h4>
            <FaSyncAlt className="refresh-icon" onClick={fetchProcesses} />
          </div>
          <ul className="list-group list-group-flush">
            {processes
              .filter((p) => p.toLowerCase().includes(filter.toLowerCase()))
              .map((process) => (
                <motion.li
                  key={process}
                  className="list-group-item d-flex justify-content-between align-items-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <span>{process}</span>
                  <button
                    className="btn btn-danger btn-sm shadow-sm"
                    onClick={() => killProcess(process)}
                  >
                    Terminate
                  </button>
                </motion.li>
              ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
