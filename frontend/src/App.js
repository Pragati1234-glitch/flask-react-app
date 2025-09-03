import React, { useState, useEffect } from "react";
import "./App.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import contacts from "./data/emergencyContacts.json";

export default function App() {
  const [apiStatus, setApiStatus] = useState("Checking...");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [probability, setProbability] = useState(null);

  // Form state with corrected keys
  const [form, setForm] = useState({
    age: "",
    gender: "Male",
    hypertension: 0,
    heart_disease: 0,
    glucose_level: "",
    bmi: "",
    smoking_status: "never",
    ever_married: "No",
    residence_type: "Urban",
    work_type: "Private",
  });

  const [history, setHistory] = useState([]);

  const COLORS = ["#e74c3c", "#2ecc71"]; // red and green

  // Backend health check
  useEffect(() => {
    fetch("http://127.0.0.1:5000/health")
      .then((res) => res.json())
      .then((data) => setApiStatus(data.status))
      .catch(() => setApiStatus("Offline"));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !form.age ||
      !form.glucose_level ||
      !form.bmi ||
      Number(form.age) <= 0 ||
      Number(form.glucose_level) <= 0 ||
      Number(form.bmi) <= 0
    ) {
      alert("Please enter valid positive numbers for Age, Glucose Level, and BMI.");
      return;
    }

    setLoading(true);
    fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        hypertension: Number(form.hypertension),
        heart_disease: Number(form.heart_disease),
        glucose_level: Number(form.glucose_level),
        bmi: Number(form.bmi),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.prediction !== undefined && data.probability !== undefined) {
          setPrediction(data.prediction);
          setProbability(data.probability);
          setHistory((prev) => [
            { ...form, prediction: data.prediction, probability: data.probability, timestamp: new Date().toLocaleTimeString() },
            ...prev,
          ]);
        } else {
          setPrediction(null);
          setProbability(null);
          alert("Error: Backend returned invalid data.");
        }
      })
      .catch((err) => {
        console.error("Backend fetch error:", err);
        setPrediction(null);
        setProbability(null);
        alert("Error: Could not connect to backend.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2>🧠 Stroke Predictor</h2>
        <nav>
          <a href="#form">Prediction Form</a>
          <a href="#results">Results</a>
          <a href="#history">History</a>
          <a href="#emergency">Emergency</a>
        </nav>
        <div className={`status ${apiStatus === "ok" ? "online" : "offline"}`}>
          API: {apiStatus}
        </div>
      </aside>

      <main className="main">
        {/* Form Section */}
        <section id="form" className="card">
          <h3>Enter Patient Details</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid">
              <label>
                Age
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 45"
                  required
                />
              </label>
              <label>
                Gender
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </label>
              <label>
                Hypertension
                <select name="hypertension" value={form.hypertension} onChange={handleChange}>
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </label>
              <label>
                Heart Disease
                <select name="heart_disease" value={form.heart_disease} onChange={handleChange}>
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </label>
              <label>
                Glucose Level
                <input
                  type="number"
                  name="glucose_level"
                  value={form.glucose_level}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  placeholder="e.g. 85.5"
                  required
                />
              </label>
              <label>
                BMI
                <input
                  type="number"
                  name="bmi"
                  value={form.bmi}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  placeholder="e.g. 22.5"
                  required
                />
              </label>
              <label>
                Smoking Status
                <select name="smoking_status" value={form.smoking_status} onChange={handleChange}>
                  <option value="never">Never</option>
                  <option value="formerly">Formerly</option>
                  <option value="smokes">Smokes</option>
                </select>
              </label>
              <label>
                Ever Married
                <select name="ever_married" value={form.ever_married} onChange={handleChange}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </label>
              <label>
                Residence Type
                <select name="residence_type" value={form.residence_type} onChange={handleChange}>
                  <option value="Urban">Urban</option>
                  <option value="Rural">Rural</option>
                </select>
              </label>
              <label>
                Work Type
                <select name="work_type" value={form.work_type} onChange={handleChange}>
                  <option value="Private">Private</option>
                  <option value="Self-employed">Self-employed</option>
                  <option value="Govt_job">Government Job</option>
                  <option value="children">Children</option>
                  <option value="Never_worked">Never Worked</option>
                </select>
              </label>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Predicting..." : "Predict Stroke Risk"}
            </button>
          </form>
        </section>

        {/* Results Section */}
        <section id="results" className="card">
          <h3>Prediction Results</h3>
          {prediction !== null && probability !== null ? (
            <div className="results">
              <h4>
                Prediction:{" "}
                <span className={prediction === 1 ? "danger" : "safe"}>
                  {prediction === 1 ? "Stroke Risk" : "No Stroke"}
                </span>
              </h4>
              <p>Probability: {probability.toFixed(2)}%</p>

              {/* Pie Chart */}
              <div className="chart">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Stroke Risk", value: probability },
                        { name: "Safe Zone", value: 100 - probability },
                      ]}
                      dataKey="value"
                      outerRadius={90}
                      label
                    >
                      <Cell fill={COLORS[0]} />
                      <Cell fill={COLORS[1]} />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p>No prediction yet. Submit details above.</p>
          )}
        </section>

        {/* History Section with Line Chart */}
        <section id="history" className="card">
          <h3>Prediction History</h3>
          {history.length === 0 ? (
            <p>No history yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={[...history].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                  <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                  <Line
                    type="monotone"
                    dataKey="probability"
                    stroke="#e74c3c"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Glucose</th>
                    <th>BMI</th>
                    <th>Ever Married</th>
                    <th>Residence</th>
                    <th>Work Type</th>
                    <th>Prediction</th>
                    <th>Probability</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i}>
                      <td>{h.timestamp}</td>
                      <td>{h.age}</td>
                      <td>{h.gender}</td>
                      <td>{h.glucose_level}</td>
                      <td>{h.bmi}</td>
                      <td>{h.ever_married}</td>
                      <td>{h.residence_type}</td>
                      <td>{h.work_type}</td>
                      <td className={h.prediction === 1 ? "danger" : "safe"}>
                        {h.prediction === 1 ? "Stroke" : "No Stroke"}
                      </td>
                      <td>{h.probability.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>

        {/* Emergency Contacts Section */}
        <section id="emergency" className="card">
          <h3>🚑 Emergency Contacts</h3>
          <p>If you or someone nearby shows stroke symptoms, call immediately:</p>
          <ul>
            {contacts.helplines.map((h, i) => (
              <li key={i}>
                <strong>{h.name}:</strong>{" "}
                <a href={`tel:${h.phone}`}>{h.phone}</a>
              </li>
            ))}
          </ul>
          <h4>Nearby Doctors</h4>
          <ul>
            {contacts.doctors.map((d, i) => (
              <li key={i}>
                <strong>{d.name}</strong> – <a href={`tel:${d.phone}`}>{d.phone}</a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
