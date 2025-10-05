import React, { useState, useEffect } from 'react';
import WelcomeScreen from './WelcomeScreen';
import Dashboard from './Dashboard';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import './App.css';

// Notification Component
function Notification({ message, type, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000); // Auto-hide after 4 seconds
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const icon = type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />;
  return (
    <div className={`notification-toast ${type}`}>
      {icon}
      <span>{message}</span>
    </div>
  );
}

// Main App Component
function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ id: Date.now(), message, type }); // Use ID to re-trigger animation
  };

  const handleEnter = () => {
    setShowWelcome(false);
    showNotification("Connected to Backend Successfully!");
  };

  if (showWelcome) {
    return <WelcomeScreen onEnter={handleEnter} />;
  }

  return (
    <div className="app-container">
      {notification && (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onDismiss={() => setNotification(null)}
        />
      )}
      <Dashboard showNotification={showNotification} />
    </div>
  );
}

export default App;