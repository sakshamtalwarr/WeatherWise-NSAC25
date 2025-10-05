import React from 'react';
import './App.css';

function WelcomeScreen({ onEnter }) {
  const nasaLogoUrl = 'https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg';

  return (
    <div className="welcome-container">
      <div className="welcome-box">
        <img src={nasaLogoUrl} alt="NASA Logo" className="nasa-logo" />
        <h1>WeatherWise</h1>
        <p>A NASA Space Apps Challenge Project</p>
        <button className="action-button fetch-button" onClick={onEnter}>
          Start Exploring
        </button>
        <div className="credits">
          <p>By <strong>Saksham Talwar & Harshita</strong></p>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;