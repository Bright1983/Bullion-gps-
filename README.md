# 🌾 Tobacco Farmer GPS Tracking App

A real-time GPS tracking application designed specifically for monitoring tobacco farmers' locations, movement patterns, and work activities.

## Features

✅ **Real-Time GPS Tracking**
- Continuous location updates using device's GPS
- High accuracy positioning with precision data
- Speed and altitude tracking

✅ **Interactive Map Display**
- Live map with multiple tile layers (Map & Satellite view)
- Dynamic markers showing farmer locations
- Path visualization with colored polylines
- Automatic map centering on tracked location

✅ **Data Analytics**
- Distance calculation and tracking
- Duration monitoring
- Location point counting
- Speed monitoring
- GPS accuracy display

✅ **Multi-Farmer Support**
- Track multiple tobacco farmers simultaneously
- Individual farmer profiles
- Separate tracking data per farmer
- Quick farmer switching

✅ **Data Persistence**
- Automatic local storage of tracking data
- Resume tracking sessions
- Historical location data access
- No server required

✅ **Responsive Design**
- Mobile-friendly interface
- Works on desktop and tablets
- Adaptive layout

## How to Use

### 1. **Setup**
- Open `index.html` in a modern web browser
- Allow location access when prompted

### 2. **Start Tracking**
- Enter farmer name and ID
- Click "Start Tracking"
- The app will capture GPS coordinates in real-time

### 3. **Monitor**
- View current location (latitude, longitude, altitude)
- See real-time speed
- Monitor tracking statistics:
  - Number of tracked points
  - Total distance covered
  - Duration of tracking session

### 4. **Manage Data**
- Click on a farmer in the list to view their tracking data
- Click "Stop Tracking" to pause
- Click "Clear Data" to reset all data

## Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Maps**: Leaflet.js (OpenStreetMap)
- **Storage**: Browser LocalStorage API
- **GPS**: Geolocation API
- **Browser Support**: Chrome, Firefox, Safari, Edge (modern versions)

## File Structure

```
Tobacco-Farmer-GPS-Tracking/
├── index.html          # Main HTML file
├── styles.css          # Styling and layout
├── app.js              # Core application logic
└── README.md           # This file
```

## Installation & Setup

### Option 1: Direct Browser Access
1. Download all files
2. Place them in a folder
3. Open `index.html` in your browser
4. Grant location permissions

### Option 2: Local Server (Recommended for better GPS accuracy)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```
Then visit: `http://localhost:8000/index.html`

## Privacy & Security

⚠️ **Important Notes:**
- GPS data is stored locally in your browser only
- No data is sent to external servers
- Clear your browser cache to completely remove data
- For production use, consider implementing backend encryption

## API Reference

### GPS Tracker Class Methods

```javascript
// Start tracking a farmer
tracker.startTracking()

// Stop current tracking session
tracker.stopTracking()

// Clear all data
tracker.clearData()

// Get distance traveled
tracker.calculateDistance()

// Get farmer's tracking data
tracker.trackingData[farmerId]
```

## Data Structure

### Farmer Object
```javascript
{
  name: "John Doe",
  id: "F001",
  locations: [],
  startTime: 1234567890,
  totalDistance: 5.23
}
```

### Location Data Point
```javascript
{
  lat: 6.9271,
  lng: 7.3928,
  altitude: 145.5,
  accuracy: 5.2,
  speed: 12.4,
  timestamp: 1234567890,
  date: "9/5/2026, 10:30:45 AM"
}
```

## Browser Requirements

- **Minimum**: 
  - Chrome 50+
  - Firefox 44+
  - Safari 10+
  - Edge 12+

- **Required Features**:
  - Geolocation API support
  - LocalStorage support
  - ES6 JavaScript support

## Troubleshooting

### GPS Not Working?
1. Check browser permissions for location access
2. Ensure device has GPS capability
3. Move to an open area (GPS works better outdoors)
4. Try a different browser
5. Check that HTTPS is used (if on production)

### Map Not Showing?
1. Check internet connection (needed for map tiles)
2. Clear browser cache
3. Try a different tile provider
4. Check browser console for errors

### Data Not Saving?
1. Check if browser allows LocalStorage
2. Ensure private/incognito mode is disabled
3. Check browser storage quota
4. Clear old data to free up space

## Future Enhancements

- 📊 Export tracking data (CSV, JSON, PDF)
- 🔒 Backend server integration for data sync
- 👥 Multi-user support with authentication
- 📱 Mobile app version
- 📍 Geofencing & alerts
- 📈 Advanced analytics & reports
- 🎯 Route optimization
- 🗺️ Offline map support
- 🔔 Real-time notifications
- 📹 Photo/evidence capture

## Support & Issues

For bugs, feature requests, or questions:
1. Check existing issues on GitHub
2. Create a detailed bug report
3. Include browser version and OS
4. Provide steps to reproduce

## License

This project is open source. Feel free to modify and use for your needs.

## Credits

- **Maps**: OpenStreetMap & Leaflet.js
- **GPS**: Browser Geolocation API
- **Icons**: Material Design

---

**Happy Farming! 🌾**

*Empowering tobacco farmers with modern tracking technology*