// Sidebar.js

import React from 'react';
import { ListGroup, Button, Container } from 'react-bootstrap';

const Sidebar = ({ markers, onSelectPin, deleteMarker, addMarker }) => {
  return (
    <div className="sidebar">
      <Container className="sidebar-container">
        <Button variant="success" onClick={addMarker} className="w-100 text-center mb-2">Add Pin</Button>
        <ListGroup>
          {markers.map(marker => (
            <ListGroup.Item key={marker.id} className="text-center">
              <div className="mb-1">{marker.name}</div>
              <Button variant="primary" onClick={() => onSelectPin(marker)} className="me-2">Edit</Button>
              <Button variant="danger" onClick={() => deleteMarker(marker.id)}>Delete</Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Container>
    </div>
  );
};

export default Sidebar;