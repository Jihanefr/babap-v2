// API Keys
const mapboxToken = 'pk.eyJ1IjoiaXNtNGw5MiIsImEiOiJjbTRwaG4zNnkwdTI3MmpxczlkanBjZ2RqIn0.h20uUmHwEJSNQ7MX9D6bPQ';
const openWeatherAPIKey = '486d5e6a0a4361ca45f0513941d70dd6';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing map...');

    // Initialize the Map with Globe Projection
    mapboxgl.accessToken = mapboxToken;
    const map = new mapboxgl.Map({
        container: 'globe-container',
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        projection: 'globe',
        center: [0, 20],
        zoom: 1.8,
        pitch: 0,
        bearing: 0
    });

    // Add navigation controls to the left side
    map.addControl(new mapboxgl.NavigationControl(), 'top-left');
    map.addControl(new mapboxgl.FullscreenControl(), 'top-left');

    // Function to fetch weather data
    async function getWeatherData(lat, lng) {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${openWeatherAPIKey}&units=metric`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Weather data not available');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching weather:', error);
            throw error;
        }
    }

    // Load and configure the map layers
    map.on('load', () => {
        console.log('Map loaded, initializing weather layers...');

        // Set atmospheric fog for a realistic effect
        map.setFog({
            'color': 'rgb(186, 210, 235)',
            'high-color': 'rgb(36, 92, 223)',
            'horizon-blend': 0.02,
            'space-color': 'rgb(11, 11, 25)',
            'star-intensity': 0.6
        });

        // Add click handler for weather information
        map.on('click', async (e) => {
            const { lng, lat } = e.lngLat;
            console.log('Clicked coordinates:', lng, lat);

            try {
                const data = await getWeatherData(lat, lng);
                console.log('Weather data:', data);

                if (data.cod === 200) {
                    // Update weather panel
                    const weatherIcon = document.querySelector('.weather-icon-large');
                    const temperatureDisplay = document.querySelector('.temperature-large');
                    const weatherDetails = document.querySelector('.weather-details-large');

                    weatherIcon.style.backgroundImage = `url(https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png)`;
                    temperatureDisplay.textContent = `${Math.round(data.main.temp)}°C`;
                    
                    weatherDetails.innerHTML = `
                        <div class="weather-description">${data.weather[0].description}</div>
                        <div><span>Feels like:</span> <span>${Math.round(data.main.feels_like)}°C</span></div>
                        <div><span>Humidity:</span> <span>${data.main.humidity}%</span></div>
                        <div><span>Wind:</span> <span>${Math.round(data.wind.speed * 3.6)} km/h</span></div>
                        <div><span>Pressure:</span> <span>${data.main.pressure} hPa</span></div>
                    `;
                }
            } catch (error) {
                console.error('Error:', error);
                const weatherPanel = document.querySelector('.weather-panel-content');
                weatherPanel.innerHTML = '<div class="weather-error">Error loading weather data</div>';
            }
        });

        // Add temperature layer
        map.addSource('temperature', {
            type: 'raster',
            tiles: [
                `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${openWeatherAPIKey}`
            ],
            tileSize: 256
        });

        map.addLayer({
            id: 'temperature',
            type: 'raster',
            source: 'temperature',
            layout: {
                visibility: 'none'
            },
            paint: {
                'raster-opacity': 0.8
            }
        });

        // Add precipitation layer
        map.addSource('precipitation', {
            type: 'raster',
            tiles: [
                `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${openWeatherAPIKey}`
            ],
            tileSize: 256
        });

        map.addLayer({
            id: 'precipitation',
            type: 'raster',
            source: 'precipitation',
            layout: {
                visibility: 'none'
            },
            paint: {
                'raster-opacity': 0.8
            }
        });

        // Add event listeners for weather layer buttons
        const temperatureButton = document.getElementById('temperature-layer');
        const precipitationButton = document.getElementById('precipitation-layer');

        if (!temperatureButton || !precipitationButton) {
            console.error('Weather layer buttons not found!');
            return;
        }

        temperatureButton.addEventListener('click', () => {
            console.log('Temperature button clicked');
            const currentVisibility = map.getLayoutProperty('temperature', 'visibility');
            if (currentVisibility === 'visible') {
                map.setLayoutProperty('temperature', 'visibility', 'none');
                temperatureButton.classList.remove('active');
            } else {
                map.setLayoutProperty('temperature', 'visibility', 'visible');
                temperatureButton.classList.add('active');
                // Hide precipitation layer
                map.setLayoutProperty('precipitation', 'visibility', 'none');
                precipitationButton.classList.remove('active');
            }
        });

        precipitationButton.addEventListener('click', () => {
            console.log('Precipitation button clicked');
            const currentVisibility = map.getLayoutProperty('precipitation', 'visibility');
            if (currentVisibility === 'visible') {
                map.setLayoutProperty('precipitation', 'visibility', 'none');
                precipitationButton.classList.remove('active');
            } else {
                map.setLayoutProperty('precipitation', 'visibility', 'visible');
                precipitationButton.classList.add('active');
                // Hide temperature layer
                map.setLayoutProperty('temperature', 'visibility', 'none');
                temperatureButton.classList.remove('active');
            }
        });
    });

    // Handle map errors
    map.on('error', (e) => {
        console.error('Map error:', e.error);
    });
});
