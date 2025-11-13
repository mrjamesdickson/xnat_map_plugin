/*
 * XNAT Map Plugin
 * Copyright (c) 2025 XNATWorks.
 * All rights reserved.
 *
 * This software is distributed under the terms described in the LICENSE file.
 */

import React, { useEffect, useState } from 'react';
import MapComponent from './components/MapComponent';
import './App.css';

const App = () => {
  const [locations, setLocations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/xapi/map/locations')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load location data');
        }
        return response.json();
      })
      .then(data => {
        setLocations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading locations:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading map data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Map</h2>
        <p>{error}</p>
        <a href="/">← Back to XNAT</a>
      </div>
    );
  }

  return <MapComponent locationsData={locations} />;
};

export default App;
