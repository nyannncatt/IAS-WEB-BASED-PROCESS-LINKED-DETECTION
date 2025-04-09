import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { supabase } from "./supabaseClient"; // Import Supabase client

// Function to generate random CAPTCHA string
const generateCaptcha = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return captcha;
};

export default function App() {
  const [processes, setProcesses] = useState([]);
  const [filter, setFilter] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [otp, setOtp] = useState(""); 
  const [loggedIn, setLoggedIn] = useState(false); 
  const [loading, setLoading] = useState(false); 
  const [loginMethod, setLoginMethod] = useState("email"); 
  const [captchaText, setCaptchaText] = useState(generateCaptcha()); 
  const [captchaInput, setCaptchaInput] = useState(""); 
  const [captchaValid, setCaptchaValid] = useState(false); 

  const canvasRef = useRef(null); 

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setLoggedIn(true); 
          console.log("Logged in:", session.user);
        } else {
          setLoggedIn(false); 
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
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

  // Send OTP to the user's email after validating CAPTCHA
  const sendOtp = async () => {
    // Check if the CAPTCHA is valid before proceeding
    if (captchaInput !== captchaText) {
      alert("Invalid CAPTCHA. Please try again.");
      return;
    }

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
    if (captchaInput !== captchaText) {
      alert("Invalid CAPTCHA. Please try again.");
      setLoading(false);
      return;
    }
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
      setEmail(""); 
      setPassword(""); 
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Draw CAPTCHA on canvas
  const drawCaptcha = (captcha) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height); 
    context.font = "30px Arial";
    context.fillStyle = "black";
    context.fillText(captcha, 50, 50); 
  };

  // Trigger CAPTCHA regeneration when user clicks "Refresh"
  const refreshCaptcha = () => {
    const newCaptcha = generateCaptcha();
    setCaptchaText(newCaptcha);
    setCaptchaInput("");
    drawCaptcha(newCaptcha); 
  };

  useEffect(() => {
    drawCaptcha(captchaText); 
  }, [captchaText]);

  if (!loggedIn) {
    return (
      <div className={`app-container App ${darkMode ? "dark-mode" : "light-mode"}`}>
        <div className="content container mt-5">
          <h1 className="text-center text-primary mb-4">Login</h1>

          <div className="d-flex justify-content-center mb-3">
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

          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

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

          <div className="mb-3">
            <canvas ref={canvasRef} width="200" height="50" className="border"></canvas>
            <div className="text-center mt-2">
              <button className="btn btn-outline-primary" onClick={refreshCaptcha}>
                Refresh CAPTCHA
              </button>
            </div>
            <input
              type="text"
              className="form-control mt-3"
              placeholder="Enter CAPTCHA"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
            />
          </div>

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

  return (
    <div className={`app-container App ${darkMode ? "dark-mode" : "light-mode"}`}>
      <div className="overlay"></div>
      <div className="content container mt-5">
        <h1 className="text-center text-primary mb-4">Process Manager</h1>

        <div className="text-end mb-4">
          <button className="btn btn-danger" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search Process..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="card shadow-lg">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0">Running Processes</h4>
          </div>
          <ul className="list-group list-group-flush">
            {processes
              .filter((p) => p.toLowerCase().includes(filter.toLowerCase()))
              .map((process) => (
                <li key={process} className="list-group-item d-flex justify-content-between align-items-center">
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
