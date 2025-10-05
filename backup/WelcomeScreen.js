import React from 'react';
import './App.css';

function WelcomeScreen({ onEnter }) {
  return (
    <div className="welcome-container">
      <div className="welcome-box">
        <h1>WeatherWise</h1>
        <p>Historical Weather Insights</p>
        <button className="enter-button" onClick={onEnter}>
          Start Exploring
        </button>
        <div className="credits">
          <p>A NASA Space Apps Challenge Project by</p>
          <p><strong>Saksham Talwar & Harshita</strong></p>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;