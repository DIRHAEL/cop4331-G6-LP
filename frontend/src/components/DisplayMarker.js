import React, { FunctionComponent } from "react";
import { useState, useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useAdvancedMarkerRef,
  InfoWindow,
  MapMouseEvent,
} from "@vis.gl/react-google-maps";

import { buildPath } from "./buildPath";

import CustomModal from "./Modal";

import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";

import Title from "./ModalMarkerMenu/Title";
import Footer from "./ModalMarkerMenu/Footer";

const App = () => {
  const [locations, setLocations] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedLocationName, setSelectedLocationName] = useState("");

  useEffect(() => {
    const username = "<Your Username Here>"; // Replace with the actual username
    // Use useDisclosure hook to manage the modal state

    fetch(`https://memorymap.xyz/api/locations/Admintest1`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setLocations(data);
        console.log(locations);
      })
      .catch((error) => {
        console.error(
          "There has been a problem with your fetch operation: ",
          error
        );
      });
  }, []);

  function handleMarkerClick(uniqueId) {
    console.log(uniqueId);
    setSelectedLocationName(uniqueId);
    onOpen();
  }

  return (
    <APIProvider apiKey={"AIzaSyABVpzV6o5YTJ6FbCKHgMd_SUspf0AYJO0"}>
      <Map
        defaultZoom={3}
        defaultCenter={{ lat: 53.54992, lng: 10.00678 }}
        mapId={"<Your custom MapId here>"}
      >
        {locations.length !== 0 &&
          locations.map((item) => (
            <AdvancedMarker
              key={item.locationName}
              position={{
                lat: parseFloat(item.latitude),
                lng: parseFloat(item.longitude),
              }}
              onClick={() => handleMarkerClick(`${item.locationName}`)}
            />
          ))}
      </Map>

      {selectedLocationName && (
        <CustomModal
          isOpen={isOpen}
          modalHeader={<Title />}
          modalFooter={
            <Footer closeModal={onClose} locationId={selectedLocationName} />
          }
        />
      )}
    </APIProvider>
  );
};

export default App;
