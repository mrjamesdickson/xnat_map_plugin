/*
 * XNAT Map Plugin
 * Copyright (c) 2025 XNATWorks.
 * All rights reserved.
 *
 * This software is distributed under the terms described in the LICENSE file.
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

const MapComponent = ({ locationsData }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [stats, setStats] = useState({ locations: 0, countries: 0, domains: 0 });
  const [clusteringEnabled, setClusteringEnabled] = useState(true);
  const [filters, setFilters] = useState({
    Academic: true,
    Healthcare: true,
    Research: true,
    Government: true,
    Commercial: true
  });
  const markersByCategory = useRef({});
  const currentZoom = useRef(2);

  const categoryColors = {
    Academic: '#1976d2',
    Healthcare: '#7b1fa2',
    Research: '#388e3c',
    Government: '#f57c00',
    Commercial: '#c2185b'
  };

  const getMarkerSize = (zoom) => {
    const minSize = 6;
    const maxSize = 14;
    const minZoom = 2;
    const maxZoom = 18;
    const size = minSize + ((zoom - minZoom) / (maxZoom - minZoom)) * (maxSize - minSize);
    return Math.max(minSize, Math.min(maxSize, Math.round(size)));
  };

  const createMarkerIcon = (color, size = 25, borderWidth = 3) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: ${borderWidth}px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
      iconSize: [size, size]
    });
  };

  const updateUnclusteredMarkers = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const zoom = map.getZoom();
    const size = getMarkerSize(zoom);
    const borderWidth = size <= 8 ? 1 : 2;

    Object.entries(markersByCategory.current).forEach(([category, groups]) => {
      if (!groups.unclustered) return;

      groups.unclustered.clearLayers();

      groups.markers.forEach(markerData => {
        const icon = createMarkerIcon(markerData.color, size, borderWidth);
        const marker = L.marker([markerData.location.lat, markerData.location.lon], { icon })
          .bindPopup(markerData.popupContent);
        groups.unclustered.addLayer(marker);
      });
    });
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([20, 0], 2);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Initialize marker groups
    Object.keys(categoryColors).forEach(category => {
      markersByCategory.current[category] = {
        clustered: L.markerClusterGroup(),
        unclustered: L.layerGroup(),
        markers: []
      };
    });

    // Zoom listener
    map.on('zoomend', () => {
      currentZoom.current = map.getZoom();
      if (!clusteringEnabled) {
        updateUnclusteredMarkers();
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!locationsData || !mapInstanceRef.current) return;

    // Calculate stats
    const totalDomains = locationsData.reduce((sum, loc) => sum + loc.count, 0);
    const countries = new Set(locationsData.map(loc => loc.country));
    setStats({
      locations: locationsData.length,
      countries: countries.size,
      domains: totalDomains
    });

    // Create markers
    locationsData.forEach(location => {
      const category = location.category;
      const color = categoryColors[category];

      const iconClustered = createMarkerIcon(color, 25, 3);

      const institutionName = location.institution || location.display_name || location.domain;
      const popupContent = `
        <div class="custom-popup">
          <h3>${institutionName}</h3>
          <div class="location">${location.city}, ${location.country}</div>
          <div><strong>${location.count}</strong> ${location.count === 1 ? 'domain' : 'domains'}</div>
          <div class="category category-${category.toLowerCase()}">${category}</div>
        </div>
      `;

      const markerClustered = L.marker([location.lat, location.lon], { icon: iconClustered })
        .bindPopup(popupContent);

      markersByCategory.current[category].clustered.addLayer(markerClustered);
      markersByCategory.current[category].markers.push({
        location,
        color,
        popupContent
      });
    });

    // Add all cluster groups to map
    Object.values(markersByCategory.current).forEach(groups => {
      mapInstanceRef.current.addLayer(groups.clustered);
    });
  }, [locationsData]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove all layers
    Object.entries(markersByCategory.current).forEach(([category, groups]) => {
      mapInstanceRef.current.removeLayer(groups.clustered);
      mapInstanceRef.current.removeLayer(groups.unclustered);
    });

    // Update unclustered markers if needed
    if (!clusteringEnabled) {
      updateUnclusteredMarkers();
    }

    // Add back layers based on filters
    Object.entries(markersByCategory.current).forEach(([category, groups]) => {
      if (filters[category]) {
        const layerType = clusteringEnabled ? 'clustered' : 'unclustered';
        mapInstanceRef.current.addLayer(groups[layerType]);
      }
    });
  }, [filters, clusteringEnabled]);

  const handleFilterChange = (category) => {
    setFilters(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="map-container">
      <div className="header">
        <div className="header-left">
          <h1>XNAT Global User Map</h1>
        </div>
        <div className="header-right">
          <a href="/" className="back-link">← Back to XNAT</a>
        </div>
      </div>

      <div className="subheader">
        <p>Interactive map of XNAT installations worldwide</p>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="number">{stats.locations}</div>
          <div className="label">Locations</div>
        </div>
        <div className="stat-card">
          <div className="number">{stats.countries}</div>
          <div className="label">Countries</div>
        </div>
        <div className="stat-card">
          <div className="number">{stats.domains}</div>
          <div className="label">Domains</div>
        </div>
      </div>

      <div className="filters">
        <span style={{ fontWeight: 700, marginRight: '1rem' }}>Filter by Category:</span>
        {Object.keys(categoryColors).map(category => (
          <div key={category} className="filter-group">
            <input
              type="checkbox"
              id={`filter-${category.toLowerCase()}`}
              checked={filters[category]}
              onChange={() => handleFilterChange(category)}
            />
            <label htmlFor={`filter-${category.toLowerCase()}`}>{category}</label>
          </div>
        ))}
        <div style={{ marginLeft: '2rem', borderLeft: '2px solid #e0e0e0', paddingLeft: '2rem' }}>
          <div className="filter-group">
            <input
              type="checkbox"
              id="disable-clustering"
              checked={!clusteringEnabled}
              onChange={(e) => setClusteringEnabled(!e.target.checked)}
            />
            <label htmlFor="disable-clustering">Show All Markers (Disable Clustering)</label>
          </div>
        </div>
      </div>

      <div ref={mapRef} className="map" style={{ height: 'calc(100vh - 400px)', width: '100%' }}></div>

      <div className="legend">
        <h3>Categories</h3>
        {Object.entries(categoryColors).map(([category, color]) => (
          <div key={category} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: color }}></div>
            <span>{category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapComponent;
