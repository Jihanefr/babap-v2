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

    // Hide Western Sahara label and add Algeria trip route when the map loads
    map.on('load', () => {
        // Hide Western Sahara label
        const layers = map.getStyle().layers;
        for (const layer of layers) {
            if (layer.type === 'symbol') {
                map.setLayoutProperty(layer.id, 'text-field', [
                    'case',
                    ['==', ['get', 'name_en'], 'Western Sahara'],
                    '',  // hide Western Sahara label
                    ['get', 'name_en']  // show other labels normally
                ]);
            }
        }

        // Add the route coordinates
        map.addSource('route', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': [
                        [2.3522, 48.8566], // Paris
                        [3.0588, 36.7538], // Alger
                        [2.1978, 36.6769], // Cherchell
                        [2.4419, 36.5892], // Tipaza
                        [3.0588, 36.7538], // Back to Alger
                        [9.4916, 24.5536], // Djanet
                        [9.5000, 24.5000], // Tilalen (approximate)
                        [9.4500, 24.5000], // Essendilène (approximate)
                        [9.4000, 24.4500]  // Erg Admer (approximate)
                    ]
                }
            }
        });

        // Add a line layer for the route
        map.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#FF0000',
                'line-width': 3,
                'line-opacity': 0.8
            }
        });

        // Add markers for each stop with detailed information
        const stops = [
            { 
                coordinates: [2.3522, 48.8566],
                name: "Paris",
                day: "1",
                description: "Départ pour Alger"
            },
            { 
                coordinates: [3.0588, 36.7538],
                name: "Alger",
                day: "1-4",
                description: "Jour 1: Arrivée et découverte de la ville<br>Jour 2: Visite de la Kasbah, Palais de la Régence, Mosquée Ketchaoua<br>Jour 4: Visite du Mémorial des Martyrs, Jardin d'Essai du Hamma, Musée National des Beaux-Arts"
            },
            { 
                coordinates: [2.1978, 36.6769],
                name: "Cherchell",
                day: "3",
                description: "Exploration du parc archéologique: théâtre antique, forum, thermes et musée"
            },
            { 
                coordinates: [2.4419, 36.5892],
                name: "Tipaza",
                day: "3",
                description: "Site UNESCO avec vestiges romains: temples, théâtre, forum, basilique chrétienne. Visite de la Villa des Fresques"
            },
            { 
                coordinates: [9.4916, 24.5536],
                name: "Djanet",
                day: "5",
                description: "Découverte du marché local: bijoux touaregs, étoffes traditionnelles et épices"
            },
            { 
                coordinates: [9.5000, 24.5000],
                name: "Tilalen",
                day: "5",
                description: "Expédition en 4x4, site archéologique avec gravures rupestres"
            },
            { 
                coordinates: [9.4500, 24.5000],
                name: "Essendilène",
                day: "6",
                description: "Randonnée aux guelta (bassins naturels) entourés de falaises majestueuses"
            },
            { 
                coordinates: [9.4000, 24.4500],
                name: "Erg Admer",
                day: "6",
                description: "Mer de dunes à perte de vue, coucher de soleil et nuit sous les étoiles"
            }
        ];

        stops.forEach(stop => {
            const marker = document.createElement('div');
            marker.className = 'marker';
            
            const popupContent = `
                <div class="popup-content">
                    <h3>${stop.name}</h3>
                    <div class="day-number">Jour ${stop.day}</div>
                    <div class="description">${stop.description}</div>
                </div>
            `;
            
            new mapboxgl.Marker(marker)
                .setLngLat(stop.coordinates)
                .setPopup(new mapboxgl.Popup({ maxWidth: '300px' }).setHTML(popupContent))
                .addTo(map);
        });
    });

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
                        <div class="location-name">${data.name}, ${data.sys.country}</div>
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
