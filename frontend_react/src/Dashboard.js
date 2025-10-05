import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, LayersControl } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FaTemperatureHigh, FaWind, FaCloudShowersHeavy, FaCrosshairs, FaRegGrinBeam, FaRegSadTear, FaRegMeh, FaShareAlt, FaCheck, FaLocationArrow } from 'react-icons/fa';
import { WiRaindrop, WiStrongWind } from 'react-icons/wi';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const loadingMessages = ["Reticulating splines...", "Querying climate archives...", "Aligning satellite data streams...", "Bending spacetime to fetch data...", "Herding cats for cloud data...", "Polishing the space rocks...", "Translating data from Martian...", "Engaging warp drive..."];

const SearchField = ({ onLocationFound }) => {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({ provider, style: 'bar', showMarker: false, autoClose: true });
    map.addControl(searchControl);
    map.on('geosearch/showlocation', (e) => onLocationFound({ lat: e.location.y, lng: e.location.x }));
    return () => map.removeControl(searchControl);
  }, [map, onLocationFound]);
  return null;
};

function WeatherChart({ title, labels, dataset, bgColor, yLabel }) {
  const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: title, color: 'white' } }, scales: { x: { ticks: { color: 'white' } }, y: { ticks: { color: 'white' }, title: { display: true, text: yLabel, color: 'white' } } } };
  const data = { labels, datasets: [{ data: dataset, backgroundColor: bgColor }] };
  return <Bar options={options} data={data} />;
}

function WeatherSuggestion({ summary }) {
  if (!summary) return null;
  let suggestion = { icon: <FaRegMeh />, title: "Average Day", text: "Weather looks to be pretty typical for this time of year." };
  if (summary.chanceOfRain > 50) {
    suggestion = { icon: <FaRegSadTear />, title: "Will it rain on your parade? Probably!", text: "Historical data shows a high chance of rain. Better pack an umbrella!" };
  } else if (summary.avgTemp > 30) {
    suggestion = { icon: <FaRegGrinBeam />, title: "Looks like a scorcher!", text: "Expect warm and sunny conditions, perfect for outdoor activities. Don't forget sunscreen!" };
  } else if (summary.chanceOfRain < 10 && summary.avgTemp > 15) {
    suggestion = { icon: <FaRegGrinBeam />, title: "Looks like a beautiful day!", text: "Clear skies and pleasant temperatures are historically likely." };
  }
  return (
    <div className="weather-suggestion weather-card">
      <div className="suggestion-icon">{suggestion.icon}</div>
      <div className="suggestion-text">
        <h4>{suggestion.title}</h4>
        <p>{suggestion.text}</p>
      </div>
    </div>
  );
}

function Dashboard({ showNotification }) {
  const [layoutState, setLayoutState] = useState('initial');
  const [map, setMap] = useState(null);
  const [position, setPosition] = useState({ lat: 28.7041, lng: 77.1025 });
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState(null);
  const [loadingText, setLoadingText] = useState(loadingMessages[0]);
  const [shareText, setShareText] = useState('Share Results');
  const [localTime, setLocalTime] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLocalTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      const hour = now.getHours();
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 18) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!position || layoutState !== 'initial') return;
    const fetchCurrentWeather = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/current-weather?lat=${position.lat}&lon=${position.lng}`);
        if (!response.ok) return;
        const data = await response.json();
        setCurrentWeather(data);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchCurrentWeather();
  }, [position, layoutState]);

  useEffect(() => {
    let interval;
    if (layoutState === 'loading') {
      interval = setInterval(() => {
        setLoadingText(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [layoutState]);
  
  const handleGetLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (map) map.flyTo([lat, lng], 13);
        showNotification("Current location set!");
      },
      () => showNotification("Could not get your location.", "error")
    );
  };

  const handleFetchHistorical = async () => {
    if (!position) return;
    setLayoutState('loading');
    setHistoricalData(null);
    setError(null);
    const selectedDate = new Date(date);
    const month = selectedDate.getMonth() + 1;
    const day = selectedDate.getDate();
    try {
      showNotification("Fetching historical data...", "success");
      const response = await fetch(`http://localhost:5000/api/historical-stats?lat=${position.lat}&lon=${position.lng}&month=${month}&day=${day}`);
      if (!response.ok) throw new Error('Backend server is not responding.');
      const data = await response.json();
      if (data.error || !data.historicalDetails) throw new Error(data.error || "No historical data found.");
      
      setHistoricalData(data.historicalDetails);
      setSummaryData({
        avgTemp: data.historicalDetails.temperatures.stats.mean,
        chanceOfRain: (data.historicalDetails.precipitation.values.filter(p => p > 0.2).length / data.historicalDetails.precipitation.values.length * 100),
        avgWind: data.historicalDetails.windSpeeds.stats.mean,
      });
      setLayoutState('results');
      showNotification("Analysis complete!", "success");
    } catch (err) {
      setError(err.message);
      setLayoutState('initial');
      showNotification(err.message, "error");
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}?lat=${position.lat.toFixed(4)}&lon=${position.lng.toFixed(4)}&date=${date}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareText('Link Copied!');
      showNotification("Link copied to clipboard!");
      setTimeout(() => setShareText('Share Results'), 2000);
    });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <span className="greeting">{greeting}</span>
          <div className="time-block">
            <span className="time-display">{localTime}</span>
            <span className="time-label">Your Local Time</span>
          </div>
        </div>
        <div className="header-right">
          <div className="time-block">
            <span className="time-display">{currentWeather?.localTime?.split(',')[0] || '--:--'}</span>
            <span className="time-label">{currentWeather ? 'Selected Location Time' : ''}</span>
          </div>
        </div>
      </header>

      <main className={`dashboard-container ${layoutState}`}>
        <div className="map-wrapper">
          <h1 className="map-title">WeatherWise</h1>
          <div className="location-controls"><button onClick={handleGetLocation} className="action-button"><FaLocationArrow /> Use My Location</button></div>
          <MapContainer center={position} zoom={13} scrollWheelZoom={true} whenCreated={setMap} className="map-container" onMoveEnd={(e) => setPosition(e.target.getCenter())}>
              <div className="map-crosshair"><FaCrosshairs /></div>
              <LayersControl position="topright" />
              <SearchField onLocationFound={(pos) => { if (map) map.flyTo([pos.lat, pos.lng], 13); }} />
              <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"/>
          </MapContainer>
          <div className="coordinate-display">
            <span>Lat: {position.lat.toFixed(4)}</span>
            <span>Lon: {position.lng.toFixed(4)}</span>
          </div>
          <div className="controls-container">
            <div className="input-group"><label>Select a Day</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <button className="action-button fetch-button" onClick={handleFetchHistorical} disabled={layoutState === 'loading'}>
                {layoutState === 'loading' ? 'Analyzing...' : 'Get Historical Analysis'}
            </button>
          </div>
          <div className="dashboard-credits">
            <p>A Project by Saksham Talwar & Harshita</p>
          </div>
        </div>
        
        <div className="results-wrapper">
          {layoutState === 'initial' && (
            <div className="initial-view">
              {currentWeather ? (
                <div className="current-weather-display">
                  <h2>{currentWeather.locationName}</h2>
                  <p>{currentWeather.localTime}</p>
                  <div className="current-temp">{currentWeather.currentTemperature}<span className="unit">{currentWeather.units?.temperature_2m}</span></div>
                  <div className="current-stats">
                    <div><WiRaindrop size={30} /> {currentWeather.currentPrecipitation} {currentWeather.units?.precipitation}</div>
                    <div><WiStrongWind size={30} /> {currentWeather.currentWindSpeed.toFixed(1)} km/h</div>
                  </div>
                </div>
              ) : <div className="spinner"></div>}
              <p className="welcome-message">Move the map and select a date to analyze past trends.</p>
            </div>
          )}
          {layoutState === 'loading' && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>{loadingText}</p>
            </div>
          )}
          {error && <p className="error-message">Error: {error}</p>}
          {layoutState === 'results' && historicalData && summaryData && (
            <div className="results-grid">
                <WeatherSuggestion summary={summaryData} />
                <div className="summary-card weather-card">
                   <h3>Historical Averages</h3>
                   <div className="summary-metrics">
                      <div className="metric-item"><FaTemperatureHigh size={25} /><span>{summaryData.avgTemp.toFixed(1)}°C</span><small>Avg Temp</small></div>
                      <div className="metric-item"><FaCloudShowersHeavy size={25} /><span>{summaryData.chanceOfRain.toFixed(0)}%</span><small>Chance of Rain</small></div>
                      <div className="metric-item"><FaWind size={25} /><span>{summaryData.avgWind.toFixed(1)} km/h</span><small>Avg Wind</small></div>
                   </div>
                </div>
                <div className="weather-card"><WeatherChart title="Temperature History (°C)" labels={historicalData.temperatures.years} dataset={historicalData.temperatures.values} bgColor="rgba(255, 99, 132, 0.6)" yLabel="Temp (°C)" /></div>
                <div className="weather-card"><WeatherChart title="Wind Speed History (km/h)" labels={historicalData.windSpeeds.years} dataset={historicalData.windSpeeds.values} bgColor="rgba(75, 192, 192, 0.6)" yLabel="Wind (km/h)" /></div>
                <div className="weather-card"><WeatherChart title="Precipitation History (mm)" labels={historicalData.precipitation.years} dataset={historicalData.precipitation.values} bgColor="rgba(54, 162, 235, 0.6)" yLabel="Precip (mm)" /></div>
                <div className="share-button">
                  <button onClick={handleShare} className="action-button">
                      {shareText === 'Share Results' ? <FaShareAlt /> : <FaCheck />} {shareText}
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