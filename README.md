# XNAT Map Plugin

Interactive global map visualization of XNAT installations worldwide.

## Features

- **Interactive Leaflet map** with zoom and pan controls
- **Marker clustering** for performance with many locations
- **Category filters** - Filter by Academic, Healthcare, Research, Government, Commercial
- **Zoom-responsive markers** - Markers resize based on zoom level when clustering is disabled
- **Statistics dashboard** - Shows total locations, countries, and domains
- **Responsive design** - Works on desktop and mobile devices

## Build Requirements

- **Java 8** (source and target compatibility)
- **Gradle 5.6.x** (wrapper included)
- **Node.js 14+** (for UI build)

## Building

```bash
./gradlew clean build
```

This will:
1. Install npm dependencies (`npm install`)
2. Build the React UI (`npm run build`)
3. Package everything into a plugin JAR

## Installation

1. Build the plugin JAR:
   ```bash
   ./gradlew jar
   ```

2. Copy the JAR to your XNAT plugins directory:
   ```bash
   cp build/libs/xnat-map-plugin-1.0.0-SNAPSHOT.jar /data/xnat/home/plugins/
   ```

3. Restart XNAT

4. Access the map at: `http://your-xnat-host/xnat-map/`

## Development

### UI Development

```bash
cd ui
npm install
npm run dev  # Watch mode for development
```

The UI builds to: `src/main/resources/META-INF/resources/xnat-map/`

### Project Structure

```
xnat_map_plugin/
├── src/main/
│   ├── java/org/xnat/map/
│   │   ├── MapPlugin.java         # Main plugin class
│   │   └── rest/
│   │       └── MapApi.java        # REST API endpoint
│   └── resources/
│       └── META-INF/
│           ├── xnat/
│           │   └── xnat-map-plugin.properties  # Plugin discovery
│           └── resources/
│               ├── xnat-map/      # Built UI + data
│               └── templates/     # Apps menu integration
├── ui/                            # React application
│   ├── src/
│   │   ├── components/
│   │   │   └── MapComponent.jsx   # Main map component
│   │   ├── App.jsx                # App wrapper
│   │   ├── App.css                # Styles
│   │   └── index.js               # Entry point
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── webpack.config.js
└── build.gradle
```

## REST API

### GET /xapi/map/locations

Returns all XNAT installation locations.

**Response:**
```json
[
  {
    "domain": "example.edu",
    "institution": "Example University",
    "city": "Boston",
    "country": "United States",
    "lat": 42.3601,
    "lon": -71.0589,
    "category": "Academic",
    "count": 1
  },
  ...
]
```

## Data Format

Location data is stored in `src/main/resources/META-INF/resources/xnat-map/locations.json`:

```json
{
  "domain": "string",
  "institution": "string",
  "city": "string",
  "country": "string",
  "country_code": "string",
  "region": "string",
  "lat": number,
  "lon": number,
  "org": "string",
  "category": "Academic|Healthcare|Research|Government|Commercial",
  "display_name": "string",
  "count": number
}
```

## License

Copyright © 2025 XNATWorks.
All rights reserved.

This software is distributed under the terms described in the LICENSE file.
