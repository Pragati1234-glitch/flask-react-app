import React from "react";
import contacts from "../data/emergencyContacts.json";
import "./EmergencyContacts.css"; // optional for styling

const EmergencyContacts = () => {
  return (
    <div className="emergency-section">
      <h2>🚑 Emergency Contacts</h2>
      <p>
        If you or someone nearby shows symptoms of a stroke, please call these
        numbers immediately:
      </p>

      <ul>
        {contacts.helplines.map((helpline, index) => (
          <li key={index}>
            <strong>{helpline.name}:</strong>{" "}
            <a href={`tel:${helpline.phone}`}>{helpline.phone}</a>
          </li>
        ))}
      </ul>

      <h3>👨‍⚕️ Nearby Doctors</h3>
      <ul>
        {contacts.doctors.map((doctor, index) => (
          <li key={index}>
            <strong>{doctor.name}</strong> –{" "}
            <a href={`tel:${doctor.phone}`}>{doctor.phone}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmergencyContacts;
