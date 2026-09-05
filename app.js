// GPS Tracking Application for Tobacco Farmers
// Real-time location tracking with map display and data storage

class GPSTracker {
    constructor() {
        this.map = null;
        this.markers = {};
        this.polylines = {};
        this.watchId = null;
        this.isTracking = false;
        this.farmers = {};
        this.currentFarmerId = null;
        this.startTime = null;
        this.trackingData = {};

        this.init();
        this.setupEventListeners();
        this.loadFromStorage();
    }

    init() {
        // Initialize Leaflet Map
        this.map = L.map('map').setView([6.9271, 7.3928], 10); // Default: Nigeria coordinates

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            tileSize: 512,
            zoomOffset: -1
        }).addTo(this.map);

        // Add different tile layers
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri'
        });

        // Layer control
        L.control.layers({
            'Map': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
                tileSize: 512,
                zoomOffset: -1
            }),
            'Satellite': satelliteLayer
        }).addTo(this.map);

        this.updateStatus('Offline');
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startTracking());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopTracking());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearData());

        document.getElementById('farmerName').addEventListener('change', () => {
            this.updateCurrentFarmer();
        });

        document.getElementById('farmerId').addEventListener('change', () => {
            this.updateCurrentFarmer();
        });
    }

    updateCurrentFarmer() {
        const name = document.getElementById('farmerName').value.trim();
        const id = document.getElementById('farmerId').value.trim();

        if (!name || !id) {
            alert('Please enter both farmer name and ID');
            return;
        }

        this.currentFarmerId = id;
        this.farmers[id] = {
            name: name,
            id: id,
            locations: [],
            startTime: null,
            totalDistance: 0
        };

        if (!this.trackingData[id]) {
            this.trackingData[id] = [];
        }
    }

    startTracking() {
        if (!this.currentFarmerId) {
            this.updateCurrentFarmer();
        }

        if (!this.currentFarmerId) {
            alert('Please set farmer details first');
            return;
        }

        if (this.isTracking) {
            alert('Tracking already active');
            return;
        }

        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        this.isTracking = true;
        this.startTime = Date.now();
        this.farmers[this.currentFarmerId].startTime = this.startTime;

        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        this.updateStatus('Online - Tracking Active');

        // Get initial position
        navigator.geolocation.getCurrentPosition(
            (position) => this.handlePosition(position),
            (error) => this.handleError(error),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        // Watch position for continuous tracking
        this.watchId = navigator.geolocation.watchPosition(
            (position) => this.handlePosition(position),
            (error) => this.handleError(error),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }

    stopTracking() {
        if (!this.isTracking) return;

        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }

        this.isTracking = false;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        this.updateStatus('Offline');

        this.saveToStorage();
        console.log('Tracking stopped. Data saved.');
    }

    handlePosition(position) {
        const { latitude, longitude, altitude, accuracy } = position.coords;
        const speed = position.coords.speed ? (position.coords.speed * 3.6).toFixed(2) : 0; // Convert m/s to km/h

        // Update UI
        document.getElementById('latitude').textContent = latitude.toFixed(6);
        document.getElementById('longitude').textContent = longitude.toFixed(6);
        document.getElementById('altitude').textContent = altitude ? altitude.toFixed(2) + ' m' : '--';
        document.getElementById('speed').textContent = speed;
        document.getElementById('gpsAccuracy').textContent = `Accuracy: ±${Math.round(accuracy)}m`;
        document.getElementById('lastUpdate').textContent = `Last Update: ${new Date().toLocaleTimeString()}`;

        // Store location data
        const locationData = {
            lat: latitude,
            lng: longitude,
            altitude: altitude,
            accuracy: accuracy,
            speed: speed,
            timestamp: Date.now(),
            date: new Date().toLocaleString()
        };

        if (!this.trackingData[this.currentFarmerId]) {
            this.trackingData[this.currentFarmerId] = [];
        }

        this.trackingData[this.currentFarmerId].push(locationData);
        this.farmers[this.currentFarmerId].locations = this.trackingData[this.currentFarmerId];

        // Update map
        this.updateMap(latitude, longitude);

        // Update stats
        this.updateStats();

        // Update farmers list
        this.updateFarmersList();
    }

    handleError(error) {
        let message = 'Unknown error';
        switch(error.code) {
            case error.PERMISSION_DENIED:
                message = 'Permission denied. Please enable location access.';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'Location information is unavailable.';
                break;
            case error.TIMEOUT:
                message = 'Location request timed out.';
                break;
        }
        console.error('Geolocation error:', message);
        alert(message);
        this.stopTracking();
    }

    updateMap(lat, lng) {
        const farmerId = this.currentFarmerId;

        // Create or update marker
        if (!this.markers[farmerId]) {
            const farmerName = this.farmers[farmerId].name;
            const marker = L.marker([lat, lng], {
                icon: this.createCustomIcon('#2ecc71')
            }).addTo(this.map);

            marker.bindPopup(`<strong>${farmerName}</strong><br>ID: ${farmerId}<br>Last Update: ${new Date().toLocaleTimeString()}`);
            this.markers[farmerId] = marker;
        } else {
            this.markers[farmerId].setLatLng([lat, lng]);
            const farmerName = this.farmers[farmerId].name;
            this.markers[farmerId].setPopupContent(`<strong>${farmerName}</strong><br>ID: ${farmerId}<br>Last Update: ${new Date().toLocaleTimeString()}`);
        }

        // Create or update polyline (path)
        if (!this.polylines[farmerId]) {
            this.polylines[farmerId] = L.polyline([[lat, lng]], {
                color: '#3498db',
                weight: 3,
                opacity: 0.8,
                smoothFactor: 1.0
            }).addTo(this.map);
        } else {
            const latlngs = this.polylines[farmerId].getLatLngs();
            latlngs.push(L.latLng(lat, lng));
            this.polylines[farmerId].setLatLngs(latlngs);
        }

        // Center map on current location
        this.map.setView([lat, lng], this.map.getZoom());
    }

    createCustomIcon(color) {
        return L.icon({
            iconUrl: `data:image/svg+xml;base64,${btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="15" fill="${color}" opacity="0.3" stroke="${color}" stroke-width="2"/>
                    <circle cx="16" cy="16" r="8" fill="${color}" stroke="white" stroke-width="2"/>
                </svg>
            `)}`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
        });
    }

    calculateDistance() {
        const farmerId = this.currentFarmerId;
        if (!this.trackingData[farmerId] || this.trackingData[farmerId].length < 2) return 0;

        let totalDistance = 0;
        const locations = this.trackingData[farmerId];

        for (let i = 1; i < locations.length; i++) {
            const lat1 = locations[i - 1].lat;
            const lon1 = locations[i - 1].lng;
            const lat2 = locations[i].lat;
            const lon2 = locations[i].lng;

            totalDistance += this.getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);
        }

        return totalDistance;
    }

    getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return d;
    }

    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    updateStats() {
        const farmerId = this.currentFarmerId;
        const pointCount = this.trackingData[farmerId]?.length || 0;
        const distance = this.calculateDistance().toFixed(2);

        document.getElementById('pointCount').textContent = pointCount;
        document.getElementById('distance').textContent = distance;

        // Calculate duration
        if (this.startTime) {
            const elapsed = Date.now() - this.startTime;
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            document.getElementById('duration').textContent = 
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }

    updateFarmersList() {
        const list = document.getElementById('farmersList');
        list.innerHTML = '';

        Object.values(this.farmers).forEach(farmer => {
            const div = document.createElement('div');
            div.className = 'farmer-item' + (farmer.id === this.currentFarmerId ? ' active' : '');
            div.innerHTML = `
                <div class="farmer-item-name">${farmer.name}</div>
                <div class="farmer-item-details">
                    ID: ${farmer.id}<br>
                    Points: ${farmer.locations.length}<br>
                    Distance: ${this.calculateFarmerDistance(farmer).toFixed(2)} km
                </div>
            `;
            div.addEventListener('click', () => {
                this.currentFarmerId = farmer.id;
                this.updateFarmersList();
                if (farmer.locations.length > 0) {
                    const lastLoc = farmer.locations[farmer.locations.length - 1];
                    this.map.setView([lastLoc.lat, lastLoc.lng], this.map.getZoom());
                }
            });
            list.appendChild(div);
        });
    }

    calculateFarmerDistance(farmer) {
        if (!farmer.locations || farmer.locations.length < 2) return 0;

        let distance = 0;
        for (let i = 1; i < farmer.locations.length; i++) {
            distance += this.getDistanceFromLatLonInKm(
                farmer.locations[i - 1].lat,
                farmer.locations[i - 1].lng,
                farmer.locations[i].lat,
                farmer.locations[i].lng
            );
        }
        return distance;
    }

    updateStatus(status) {
        const statusEl = document.getElementById('userStatus');
        statusEl.textContent = `Status: ${status}`;
        statusEl.className = status === 'Offline' ? 'status-offline' : 'status-online';
    }

    clearData() {
        if (confirm('Are you sure you want to clear all tracking data?')) {
            this.trackingData = {};
            this.farmers = {};
            this.markers = {};
            this.polylines = {};
            this.currentFarmerId = null;

            // Clear map layers
            this.map.eachLayer((layer) => {
                if (layer instanceof L.Polyline || layer instanceof L.Marker) {
                    this.map.removeLayer(layer);
                }
            });

            // Reset UI
            document.getElementById('pointCount').textContent = '0';
            document.getElementById('distance').textContent = '0';
            document.getElementById('duration').textContent = '00:00:00';
            document.getElementById('latitude').textContent = '--';
            document.getElementById('longitude').textContent = '--';
            document.getElementById('altitude').textContent = '--';
            document.getElementById('speed').textContent = '--';
            document.getElementById('farmersList').innerHTML = '';

            localStorage.removeItem('gpsTrackerData');
            console.log('All data cleared');
        }
    }

    saveToStorage() {
        const data = {
            farmers: this.farmers,
            trackingData: this.trackingData,
            timestamp: Date.now()
        };
        localStorage.setItem('gpsTrackerData', JSON.stringify(data));
        console.log('Data saved to localStorage');
    }

    loadFromStorage() {
        const stored = localStorage.getItem('gpsTrackerData');
        if (stored) {
            const data = JSON.parse(stored);
            this.farmers = data.farmers || {};
            this.trackingData = data.trackingData || {};

            // Recreate markers and polylines for stored data
            Object.entries(this.farmers).forEach(([id, farmer]) => {
                if (farmer.locations && farmer.locations.length > 0) {
                    const locations = farmer.locations;
                    
                    // Create polyline
                    const latlngs = locations.map(loc => [loc.lat, loc.lng]);
                    this.polylines[id] = L.polyline(latlngs, {
                        color: '#3498db',
                        weight: 2,
                        opacity: 0.6,
                        smoothFactor: 1.0
                    }).addTo(this.map);

                    // Create marker at last location
                    const lastLoc = locations[locations.length - 1];
                    const marker = L.marker([lastLoc.lat, lastLoc.lng], {
                        icon: this.createCustomIcon('#95a5a6')
                    }).addTo(this.map);
                    marker.bindPopup(`<strong>${farmer.name}</strong><br>ID: ${id}<br>Last: ${lastLoc.date}`);
                    this.markers[id] = marker;
                }
            });

            this.updateFarmersList();
            console.log('Data loaded from localStorage');
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tracker = new GPSTracker();
    console.log('GPS Tracker initialized');
});