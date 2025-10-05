import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FaTemperatureHigh, FaWind, FaCloudShowersHeavy, FaSadTear, FaGrinBeam, FaMeh, FaShareAlt, FaCheck, FaLocationArrow, FaSave, FaLock, FaLockOpen } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import WeatherIcon3D from './WeatherIcon3D'; 
import MapComponent from './MapComponent';
import './App.css';

const userLocationIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
    className: 'user-location-marker'
});
const nasaLogoUrl = 'https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg';
const loadingMessages = ["Reticulating splines...", "Querying climate archives...", "Aligning satellite data streams...", "Bending spacetime to fetch data..."];

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function WeatherChart({ title, labels, dataset, bgColor, yLabel }) {
    const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: title, color: 'white' } }, scales: { x: { ticks: { color: 'white' } }, y: { ticks: { color: 'white' }, title: { display: true, text: yLabel, color: 'white' } } } };
    const data = { labels, datasets: [{ data: dataset || [], backgroundColor: bgColor }] }; // Defensive check
    return <Bar options={options} data={data} />;
}
function WeatherSuggestion({ summary, weatherType }) {
  if (!summary) return null;
  let suggestion = { icon: <FaMeh />, title: "Historical Vibe Check", text: "Weather looks to be pretty typical. No major surprises expected!" };
  if (weatherType === 'rainy') {
    suggestion = { icon: <FaSadTear />, title: "Will it Rain on Your Parade?", text: "Looks likely! Historical data shows a high chance of rain. Better pack an umbrella." };
  } else if (weatherType === 'sunny') {
    suggestion = { icon: <FaGrinBeam />, title: "A Sun-Soaked Day Ahead!", text: "Expect warm and sunny conditions. Don't forget sunscreen!" };
  }
  return ( <div className="weather-suggestion weather-card"> <div className="suggestion-icon">{suggestion.icon}</div> <div className="suggestion-text"> <h4>{suggestion.title}</h4> <p>{suggestion.text}</p> </div> </div> );
}

function Dashboard({ showNotification }) {
  const [position, setPosition] = useState({ lat: 38.8832, lng: -77.0162 });
  const [layoutState, setLayoutState] = useState('initial');
  const [map, setMap] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [markerKey, setMarkerKey] = useState(Date.now());
  const [date, setDate] = useState(new Date());
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [isMapLocked, setMapLocked] = useState(false);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [weatherType, setWeatherType] = useState('average');
  const [loadingText, setLoadingText] = useState(loadingMessages[0]);
  const [error, setError] = useState(null);
  const [shareText, setShareText] = useState('Share Results');
  const [shareClass, setShareClass] = useState('');
  const [localTime, setLocalTime] = useState({ time: '', date: '' });
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const savedLocation = localStorage.getItem('savedWeatherWiseLocation');
    if (savedLocation && map) {
      const { lat, lng } = JSON.parse(savedLocation);
      map.flyTo([lat, lng], 13);
      setPosition({ lat, lng });
      showNotification("Loaded your saved location!");
    }
  }, [map, showNotification]);

  useEffect(() => { /* ... local time effect, same as before ... */ }, []);
  useEffect(() => { /* ... current weather effect, same as before ... */ }, [position]);
  useEffect(() => { /* ... loading text effect, same as before ... */ }, [layoutState]);
  
  const handleGetLocation = () => { /* ... location handler, same as before ... */ };
  const onDateChange = (newDate) => { setDate(newDate); setCalendarOpen(false); };
  
  const handleFetchHistorical = async () => {
    setLayoutState('loading');
    setHistoricalData(null);
    setSummaryData(null);
    setError(null);
    const selectedDate = new Date(date);
    const month = selectedDate.getMonth() + 1;
    const day = selectedDate.getDate();
    try {
      const response = await fetch(`http://localhost:5000/api/historical-stats?lat=${position.lat}&lon=${position.lng}&month=${month}&day=${day}`);
      if (!response.ok) throw new Error('Backend server is not responding.');
      const data = await response.json();
      if (data.error || !data.historicalDetails) throw new Error(data.error || "No historical data found for this date.");
      const summary = {
        avgTemp: data.historicalDetails.temperatures?.stats?.mean,
        chanceOfRain: (data.historicalDetails.precipitation?.values?.filter(p => p > 0.2).length / data.historicalDetails.precipitation?.values?.length * 100),
        avgWind: data.historicalDetails.windSpeeds?.stats?.mean,
      };
      setHistoricalData(data.historicalDetails);
      setSummaryData(summary);
      if (summary.chanceOfRain > 50) setWeatherType('rainy');
      else if (summary.avgTemp > 30) setWeatherType('sunny');
      else setWeatherType('average');
      setLayoutState('results');
    } catch (err) {
      setError(err.message);
      setLayoutState('results'); // <<< THIS IS THE FIX. Stays on the results panel to show the error.
      showNotification(err.message, "error");
    }
  };
  const handleSaveLocation = () => { /* ... */ };
  const handleShare = () => { /* ... */ };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left"><span className="greeting">{greeting}</span><div className="time-block"><span className="time-display">{localTime.time}</span><span className="time-label">{localTime.date}</span></div></div>
        <div className="header-right"><div className="time-block"><span className="time-display">{currentWeather?.localTime?.split(',')[0] || '--:--'}</span><span className="time-label">{currentWeather ? 'Selected Location Time' : 'Local Time'}</span></div></div>
      </header>
      <main className={`dashboard-container ${layoutState}`}>
        <div className="map-wrapper">
          <h1 className="map-title">WeatherWise</h1>
          <MapComponent center={[position.lat, position.lng]} onMapMove={(center) => setPosition({ lat: center.lat, lng: center.lng })} markerPosition={markerPosition} markerKey={markerKey} userLocationIcon={userLocationIcon} isMapLocked={isMapLocked} onSearchFound={(pos) => { if (map) map.flyTo([pos.lat, pos.lng], 13); }} setMapInstance={setMap}/>
          <div className="map-controls">
            <button onClick={handleGetLocation} className="action-button"><FaLocationArrow /> Use My Location</button>
            <button onClick={handleSaveLocation} className="action-button"><FaSave /> Save Location</button>
            <button onClick={() => setMapLocked(!isMapLocked)} className="action-button">{isMapLocked ? <FaLock /> : <FaLockOpen />} {isMapLocked ? 'Unlock' : 'Lock'} Map</button>
          </div>
          <div className="controls-container">
            <div className="date-control"><label>Selected Date</label><button className="action-button" onClick={() => setCalendarOpen(!isCalendarOpen)}>{date.toLocaleDateString()}</button></div>
            <button className="action-button fetch-button" onClick={handleFetchHistorical} disabled={layoutState === 'loading'}>{layoutState === 'loading' ? 'Analyzing...' : 'Get Historical Analysis'}</button>
          </div>
          <div className="dashboard-credits"><img src={nasaLogoUrl} alt="NASA Logo" className="nasa-logo" /><p>A project by Saksham Talwar & Harshita</p></div>
        </div>
        <div className="results-wrapper">
            {isCalendarOpen && <div className="calendar-modal"><Calendar onChange={onDateChange} value={date} /></div>}
            {error && <p className="error-message">Error: {error}</p>}
            {layoutState === 'loading' && (
                <div className="loading-overlay"><div className="spinner"></div><p>{loadingText}</p></div>
            )}
            {layoutState === 'results' && historicalData && summaryData && (
              <div className="results-grid">
                <WeatherIcon3D type={weatherType} />
                <WeatherSuggestion summary={summaryData} weatherType={weatherType} />
                <div className="summary-card weather-card">
                   <h3>Historical Averages</h3>
                   <div className="summary-metrics">
                      <div className="metric-item"><FaTemperatureHigh /><span>{summaryData.avgTemp?.toFixed(1) ?? 'N/A'}°C</span><small>Avg Temp</small></div>
                      <div className="metric-item"><FaCloudShowersHeavy /><span>{summaryData.chanceOfRain?.toFixed(0) ?? 'N/A'}%</span><small>Chance of Rain</small></div>
                      <div className="metric-item"><FaWind /><span>{summaryData.avgWind?.toFixed(1) ?? 'N/A'} km/h</span><small>Avg Wind</small></div>
                   </div>
                </div>
                <div className="weather-card"><WeatherChart title="Temperature History (°C)" labels={historicalData.temperatures?.years} dataset={historicalData.temperatures?.values} bgColor="rgba(255, 99, 132, 0.6)" yLabel="Temp (°C)" /></div>
                <div className="weather-card"><WeatherChart title="Wind Speed History (km/h)" labels={historicalData.windSpeeds?.years} dataset={historicalData.windSpeeds?.values} bgColor="rgba(75, 192, 192, 0.6)" yLabel="Wind (km/h)" /></div>
                <div className="weather-card"><WeatherChart title="Precipitation History (mm)" labels={historicalData.precipitation?.years} dataset={historicalData.precipitation?.values} bgColor="rgba(54, 162, 235, 0.6)" yLabel="Precip (mm)" /></div>
                <div className={`share-button ${shareClass}`}>
                  <button onClick={handleShare} className="action-button">
                      <div className="share-content"><FaShareAlt /> {shareText}</div>
                      <div className="share-copied"><FaCheck /> Copied!</div>
                  </button>
                </div>
              </div>
            )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;