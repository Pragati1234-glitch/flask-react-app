import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Main entry component to handle global features
const Main = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Load dark mode preference from local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") setDarkMode(true);
  }, []);

  // Toggle dark mode
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("darkMode", !darkMode);
  };

  return (
    <div className={darkMode ? "dark-theme" : "light-theme"}>
      <header className="global-header">
        <h1>Stroke Prediction App</h1>
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </header>
      <main>
        <App />
      </main>
      <footer className="global-footer">
        <p>
          &copy; {new Date().getFullYear()} Stroke Prediction App | Developed
          by Mio
        </p>
      </footer>
    </div>
  );
};

// Render to root
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
