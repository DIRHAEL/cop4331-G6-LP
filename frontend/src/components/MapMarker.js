import React, { FunctionComponent } from "react";
import { useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useAdvancedMarkerRef,
  InfoWindow,
  MapMouseEvent,
} from "@vis.gl/react-google-maps";

const App = ({ insertFunction, markerCoord }) => {
  return (
    <APIProvider apiKey={"AIzaSyABVpzV6o5YTJ6FbCKHgMd_SUspf0AYJO0"}>
      <Map
        defaultZoom={12}
        defaultCenter={{ lat: 53.54992, lng: 10.00678 }}
        mapId={"<Your custom MapId here>"}
        onClick={insertFunction}
        draggableCursor={"crosshair"}
      >
        {markerCoord && <AdvancedMarker position={markerCoord} />}
      </Map>
    </APIProvider>
  );
};

export default App;
