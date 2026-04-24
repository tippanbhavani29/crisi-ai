import { useState } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { AlertTriangle } from 'lucide-react';
import { useCrisisContext } from '../../context/CrisisContext';
import './MapDisplay.css';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function MapDisplay({ onRegionSelect }) {
  const { areas } = useCrisisContext();
  
  const center = { lat: 17.44, lng: 78.38 }; // Hyderabad Default

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="map-error glass-panel">
        <AlertTriangle size={32} color="#f59e0b" />
        <h3>Google Maps API Key Missing</h3>
        <p>Please add <code>VITE_GOOGLE_MAPS_API_KEY</code> to your <code>.env</code> file.</p>
      </div>
    );
  }

  return (
    <div className="map-wrapper" style={{ width: '100%', height: '100%', minHeight: '400px' }}>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          style={{ width: '100%', height: '100%' }}
          defaultCenter={center}
          defaultZoom={12}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        >
          {areas.map((region) => (
            <Marker
              key={region.id}
              position={{ lat: region.lat || 17.44, lng: region.lng || 78.38 }}
              onClick={() => onRegionSelect && onRegionSelect(region)}
            />
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}
