import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { supabase } from "./supabaseClient"; // Import Supabase client

export default function App() {
  const [processes, setProcesses] = useState([]);
  const [filter, setFilter] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState(""); // Email for login
  const [password, setPassword] = useState(""); // Password input
  const [otp, setOtp] = useState(""); // OTP input
  const [loggedIn, setLoggedIn] = useState(false); // Track login state
  const [loading, setLoading] = useState(false); // Track loading state
  const [loginMethod, setLoginMethod] = useState("email"); // Track the login method

  // Listen for auth state change
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setLoggedIn(true); // User is logged in
          console.log("Logged in:", session.user);
        } else {
          setLoggedIn(false); // User logged out
        }
      }
    );

    return () => {
      authListener?.unsubscribe(); // Clean up listener on component unmount
    };
  }, []);

  useEffect(() => {
    if (loggedIn) {
      fetchProcesses();
    }
  }, [loggedIn]);

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

  // Send OTP to the user's email
  const sendOtp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });
      if (error) throw error;
      alert("OTP sent to your email! Please check your inbox and click the link.");
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Login function with email and password
  const loginWithPassword = async () => {
    setLoading(true);
    try {
      const { user, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      console.log("Logged in user:", user);
      setLoggedIn(true);
    } catch (error) {
      console.error("Error logging in:", error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setLoggedIn(false);
      setEmail(""); // Clear the email and password after logging out
      setPassword(""); // Clear the password
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Render login screen if the user is not logged in
  if (!loggedIn) {
    return (
      <div className={`app-container App ${darkMode ? "dark-mode" : "light-mode"}`}>
        <div className="content container mt-5">
          <h1 className="text-center text-primary mb-4">Login</h1>

          {/* Login Method Selection */}
          <div className="mb-3 text-center">
            <button
              className={`btn ${loginMethod === "email" ? "btn-info" : "btn-outline-info"} mx-2`}
              onClick={() => setLoginMethod("email")}
            >
              Email & Password
            </button>
            <button
              className={`btn ${loginMethod === "otp" ? "btn-info" : "btn-outline-info"} mx-2`}
              onClick={() => setLoginMethod("otp")}
            >
              OTP Login
            </button>
          </div>

          {/* Email Input */}
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password or OTP */}
          {loginMethod === "email" && (
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
          {loginMethod === "otp" && (
            <div className="mb-3">
              <button
                className="btn btn-primary mb-3"
                onClick={sendOtp}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
              <p className="text-center">Please check your email for the OTP link.</p>
            </div>
          )}

          {/* Login Button */}
          <div className="text-center">
            {loginMethod === "email" && (
              <button
                className="btn btn-primary mb-3"
                onClick={loginWithPassword}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            )}
           
           
          </div>

   
        </div>
      </div>
    );
  }

  // If the user is logged in, show the process manager
  return (
    <div
      className={`app-container App ${darkMode ? "dark-mode" : "light-mode"}`}
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <div className="overlay"></div>
      <div className="content container mt-5">
        <h1 className="text-center text-primary mb-4">Process Manager</h1>

        {/* Logout Button */}
        <div className="text-end mb-4">
          <button className="btn btn-danger" onClick={logout}>
            Logout
          </button>
        </div>

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
