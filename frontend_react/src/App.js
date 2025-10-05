import React, { useState, useEffect, useCallback } from 'react';
import WelcomeScreen from './WelcomeScreen';
import Dashboard from './Dashboard';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles"; 
import './App.css';

const particleOptions = { background: { color: { value: "#000000" } }, fpsLimit: 60, interactivity: { events: { onHover: { enable: true, mode: "repulse" }, resize: true }, modes: { repulse: { distance: 100, duration: 0.4 } } }, particles: { color: { value: "#ffffff" }, links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.1, width: 1 }, move: { direction: "none", enable: true, outModes: { default: "bounce" }, random: true, speed: 1, straight: false }, number: { density: { enable: true, area: 800 }, value: 80 }, opacity: { value: 0.2 }, shape: { type: "circle" }, size: { value: { min: 1, max: 3 } } }, detectRetina: true };

function Notification({ message, type, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);
  const icon = type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />;
  return ( <div className={`notification-toast ${type}`}>{icon}<span>{message}</span></div> );
}

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [notification, setNotification] = useState(null);
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => { await loadFull(engine); }).then(() => setInit(true));
  }, []);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ id: Date.now(), message, type });
  }, []);

  const handleEnter = () => {
    setShowWelcome(false);
    showNotification("Welcome to the Cosmos of Weather!");
  };

  return (
    <div className="app-wrapper">
      {init && <Particles id="tsparticles" options={particleOptions} />}
      {notification && <Notification key={notification.id} message={notification.message} type={notification.type} onDismiss={() => setNotification(null)} />}
      {showWelcome ? <WelcomeScreen onEnter={handleEnter} /> : <Dashboard showNotification={showNotification} />}
    </div>
  );
}
export default App;