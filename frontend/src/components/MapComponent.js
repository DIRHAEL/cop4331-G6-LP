// MapComponent.js

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from 'react-bootstrap';
import 'leaflet/dist/leaflet.css';

function MapComponent({ markers, addMarker, updateMarker, deleteMarker, onSelectPin, selectedPin }) {
  // The logic for handling map clicks, marker selection, and updates

  const handleMapClick = (e) => {
      e.preventDefault();

    // You could replace this with the logic to add a marker on map click
  };
 
  return (
    <MapContainer center={[50, 10]} zoom={4} style={{ height: '100%', width: '100%' }} onClick={handleMapClick}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {markers.map((marker) => (
        <Marker key={marker.id} position={marker.position}>
          <Popup>
            <div>
              {marker.name}
              <br />
              {marker.description}
              <br />
              <Button variant="primary" onClick={() => onSelectPin(marker)}>Edit</Button>
              <Button variant="danger" onClick={() => deleteMarker(marker.id)}>Delete</Button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapComponent;