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

import MapStyles from "../assets/mapstyles.json";

const App = ({ markerCoord, insertFunction }) => {
  return (
    <APIProvider apiKey={"AIzaSyABVpzV6o5YTJ6FbCKHgMd_SUspf0AYJO0"}>
      <Map
        mapId={"<Your custom MapId here>"}
        defaultZoom={2}
        defaultCenter={{ lat: 34.544932485966136, lng: -41.27020965979835 }}
        onClick={insertFunction}
        draggableCursor={"crosshair"}
        MapStyles={MapStyles}
      >
        {markerCoord && <AdvancedMarker position={markerCoord} />}
      </Map>
    </APIProvider>
  );
};

export default App;
