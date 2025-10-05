from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import numpy as np
from datetime import datetime
import pytz
from geopy.geocoders import Nominatim

# 1. Initialize the Flask App and Geocoder
app = Flask(__name__)
CORS(app)  # Allow the React app to connect
geolocator = Nominatim(user_agent="weather_wise_app")

# 2. Define the API endpoints we will use
OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

# --- Helper Functions ---

def get_location_info(lat, lon, tz_string):
    """Gets human-readable location name and current local time."""
    location_name = f"Location ({lat:.2f}, {lon:.2f})"
    try:
        # Use geopy to get a city and country from coordinates
        location = geolocator.reverse((lat, lon), exactly_one=True, timeout=10)
        address = location.raw.get('address', {})
        city = address.get('city', address.get('town', address.get('village', 'Unknown Location')))
        country = address.get('country', '')
        if city and country:
            location_name = f"{city}, {country}"
        elif location.address:
            location_name = location.address.split(', ')[-1]
    except Exception:
        pass # If geocoding fails, just use the coordinates

    local_time = "Not Available"
    try:
        # Use pytz to get the accurate local time for the location's timezone
        tz = pytz.timezone(tz_string)
        local_time = datetime.now(tz).strftime('%I:%M %p, %a %b %d')
    except Exception:
        pass
    
    return location_name, local_time

def calculate_stats(data_list):
    """Calculates mean, median, min, and max for a list, ignoring invalid values."""
    if not data_list: return None
    # Filter out any None or NaN values before calculation
    data = np.array([x for x in data_list if x is not None and not np.isnan(x)])
    if data.size == 0: return None
    return {
        "mean": np.mean(data).item(),
        "median": np.median(data).item(),
        "min": np.min(data).item(),
        "max": np.max(data).item(),
    }

# --- API Routes ---

@app.route('/api/current-weather', methods=['GET'])
def get_current_weather():
    """API endpoint to fetch real-time weather."""
    try:
        lat = float(request.args.get('lat'))
        lon = float(request.args.get('lon'))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid coordinates."}), 400

    params = {
        "latitude": lat, "longitude": lon,
        "current": "temperature_2m,precipitation,wind_speed_10m",
        "timezone": "auto"
    }
    try:
        response = requests.get(OPEN_METEO_FORECAST_URL, params=params)
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
        data = response.json()
        
        current_data = data.get('current', {})
        tz_string = data.get('timezone', 'UTC')
        location_name, local_time = get_location_info(lat, lon, tz_string)
        
        return jsonify({
            "locationName": location_name, "localTime": local_time,
            "currentTemperature": current_data.get('temperature_2m'),
            "currentPrecipitation": current_data.get('precipitation'),
            "currentWindSpeed": current_data.get('wind_speed_10m', 0) * 3.6, # Convert m/s to km/h
            "units": data.get('current_units')
        })
    except Exception as e:
        return jsonify({"error": f"API Error: {e}"}), 500

@app.route('/api/historical-stats', methods=['GET'])
def get_historical_stats():
    """API endpoint to fetch historical weather analysis."""
    try:
        lat = float(request.args.get('lat'))
        lon = float(request.args.get('lon'))
        month = int(request.args.get('month'))
        day = int(request.args.get('day'))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid parameters."}), 400

    print(f"\n--- [PYTHON] Fetching historical data for {month}/{day} ---")

    end_year = datetime.now().year - 1
    start_year = end_year - 19 # 20 years of data
    
    # Open-Meteo can fetch specific dates from a range efficiently in one call
    dates = [f"{year}-{month:02d}-{day:02d}" for year in range(start_year, end_year + 1)]
    
    params = {
        "latitude": lat, "longitude": lon,
        "daily": "temperature_2m_max,precipitation_sum,wind_speed_10m_max",
        "time": ",".join(dates) # Provide a comma-separated list of dates
    }
    try:
        response = requests.get(OPEN_METEO_ARCHIVE_URL, params=params)
        response.raise_for_status()
        data = response.json()
        daily_data = data.get('daily', {})
        years = [int(t.split('-')[0]) for t in daily_data.get('time', [])]
        
        if not years:
            return jsonify({"error": "No historical data found for this date range."}), 404

        temps = daily_data.get('temperature_2m_max', [])
        precip = daily_data.get('precipitation_sum', [])
        wind_m_s = daily_data.get('wind_speed_10m_max', [])
        wind_kmh = [w * 3.6 if w is not None else 0 for w in wind_m_s]

        # Structure the final JSON response exactly as the frontend expects it
        response_data = {
            "historicalDetails": {
                "temperatures": {"unit": "°C", "years": years, "values": temps, "stats": calculate_stats(temps)},
                "precipitation": {"unit": "mm", "years": years, "values": precip, "stats": calculate_stats(precip)},
                "windSpeeds": {"unit": "km/h", "years": years, "values": wind_kmh, "stats": calculate_stats(wind_kmh)}
            }
        }
        print(f"--- [PYTHON] Success. Sending data for {len(years)} years. ---")
        return jsonify(response_data)
    except Exception as e:
        print(f"--> [PYTHON WARNING] API error: {e}")
        return jsonify({"error": "Failed to fetch historical data from the API."}), 500

# Run the Flask App on http://localhost:5000
if __name__ == '__main__':
    app.run(debug=True, port=5000)