WeatherWise 🚀
An interactive web application for the NASA Space Apps Challenge that visualizes 20 years of historical weather data for any location on Earth.

Table of Contents
About the Project

Features

Technology Stack

Data Sources

Getting Started

How to Use

Future Work

Acknowledgments

About The Project
WeatherWise is our solution to the NASA Space Apps Challenge: "Will it Rain on Your Parade?".

The challenge was to make vast, complex historical climate data accessible to everyone. We built an interactive web application where users can select any location on a global map, choose a specific day of the year, and instantly visualize 20 years of weather data—including temperature, precipitation, and wind speed trends.

Our goal is to empower users—from event planners to curious citizen scientists—to explore long-term weather patterns in their own communities, bridging the gap between massive scientific datasets and practical, everyday questions.

Features
Interactive Global Map: Select any location using our pan-to-select pin, a powerful search bar, or the "Use My Location" feature.

20-Year Trend Charts: Instantly view historical trends for Temperature, Wind Speed, and Precipitation for your chosen day over the last two decades.

Dynamic 3D Icons: A beautifully animated 3D weather icon represents the overall historical "vibe" of the day, changing dynamically based on the data.

Data-Driven Insights: Get at-a-glance historical averages and thematic suggestions based on the data.

Modern & Immersive UI: A fully responsive, cosmic-themed design with an animated particle background makes data exploration engaging and fun.

User Conveniences: Includes features to save a favorite location and lock the map for easier analysis.

Technology Stack
The project is a full-stack application built with modern, open-source technologies.

Frontend
Framework: React.js

Mapping: React-Leaflet

Charts: Chart.js

3D Graphics: React Three Fiber

UI: React Calendar & tsparticles

Backend
Framework: Python (Flask)

Function: Serves as a lightweight API to fetch and process data from external sources.

Data Sources
NASA Data: Our project uses data derived from NASA satellite observations. We access this through the Open-Meteo API, which relies on the ERA5 global reanalysis dataset. This dataset is fundamentally built by assimilating satellite observations from missions conducted and supported by NASA, such as those from the Earth Observing System (EOS).

Geocoding: We use the OpenStreetMap Nominatim API to convert geographic coordinates into readable place names.

Getting Started
To get a local copy up and running, follow these simple steps.

Prerequisites
Node.js & npm: https://nodejs.org/

Python & pip: https://www.python.org/

Installation
Clone the repo

Bash

git clone https://github.com/your_username/your_repository_name.git
Backend Setup

Bash

cd backend_python
python -m venv venv
.\venv\Scripts\activate
pip install Flask Flask-Cors requests
py app.py
(The backend will be running on http://127.0.0.1:5000)

Frontend Setup (in a new terminal)

Bash

cd frontend_react
npm install
npm start
(The app will open at http://localhost:3000)

How to Use
On the dashboard, select a location by panning the map, using the search bar, or clicking "Use My Location."

Click the date button to open the calendar and choose a day of the year.

Click the "Get Historical Analysis" button.

View the results, including summary cards, 20-year trend charts, and the 3D weather icon.

Future Work
Add more data parameters (e.g., humidity, pressure).

Implement a data comparison feature for two different locations.

Create user accounts to save and share multiple analyses.

Acknowledgments
This project is a submission for the NASA International Space Apps Challenge.

All data is made available through incredible open-source APIs.

Special thanks to the organizers and the open-source community.


Sources






