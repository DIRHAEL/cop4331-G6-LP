"use client";

// *** Very Important ***
// Tie the info marker to the position of the marker by anchoring them together
// Look at packages website

import { useState } from "react";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";

import { MapMouseEvent } from "@vis.gl/react-google-maps";

export default function MapComponent() {
  const KEY = "AIzaSyABVpzV6o5YTJ6FbCKHgMd_SUspf0AYJO0";

  const MAPID = "dd45e6ef73dc6fdf";
  const position = { lat: 31.9686, lng: -99.9018 };

  // need a state to see if the pin is clicked
  // Is triggered when the marker is clicked
  const [open, setOpen] = useState(false);

  const handleDoubleClick = (event) => {
    console.log(event.detail);
  };

  return (
    <APIProvider apiKey={KEY}>
      <Map
        defaultZoom={5}
        defaultCenter={position}
        mapId={MAPID}
        onDblclick={handleDoubleClick}
      >
        <AdvancedMarker position={position} onClick={() => setOpen(true)}>
          <Pin
            background={"purple"}
            borderColor={"white"}
            glyphColor={"white"}
          ></Pin>
        </AdvancedMarker>

        {open && (
          <InfoWindow position={position} onCloseClick={() => setOpen(false)}>
            <p>I am here</p>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
  // eslint-disable-next-line no-unreachable
}
