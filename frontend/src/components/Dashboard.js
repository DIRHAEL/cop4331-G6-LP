
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Navbar, Nav, Container } from 'react-bootstrap';
import MapComponent from './MapComponent';
import Sidebar from './Sidebar';

function Dashboard() {
  const [markers, setMarkers] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);

  const addMarker = () => {
    const newMarker = {
      id: uuidv4(),
      position: { lat: 50, lng: 10 }, // Replace with a dynamic location if necessary
      name: 'New Pin',
      description: 'No description'
    };
    setMarkers([...markers, newMarker]);
  };

  const updateMarker = (updatedMarker) => {
    setMarkers(markers.map(marker => marker.id === updatedMarker.id ? updatedMarker : marker));
  };

  const deleteMarker = (id) => {
    setMarkers(markers.filter(marker => marker.id !== id));
  };

  const handleSelectPin = (marker) => {
    setSelectedPin(marker);
    // Here, you might want to handle the logic to show the modal or any UI for editing the selected pin
  };

  return (
    <div className="App">
      <Navbar bg="light" expand="lg" className="mb-3">
        <Container fluid>
          <Navbar.Brand href="#" className="font-weight-bold">Map App</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#home" className="nav-link-home">Home</Nav.Link>
              <Nav.Link href="#about" className="nav-link-about">About Us</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <div className="content">
        <Sidebar 
          markers={markers} 
          onSelectPin={handleSelectPin} 
          deleteMarker={deleteMarker} 
          addMarker={addMarker}
        />
        <MapComponent 
          markers={markers} 
          addMarker={addMarker} 
          updateMarker={updateMarker} 
          deleteMarker={deleteMarker} 
          onSelectPin={handleSelectPin} 
          selectedPin={selectedPin}
        />
      </div>
    </div>
  );
}

export default Dashboard;
