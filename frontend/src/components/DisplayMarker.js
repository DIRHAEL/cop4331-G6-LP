import React, { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import CustomModal from "./Modal";
import { useDisclosure } from "@chakra-ui/react";
import Title from "./ModalMarkerMenu/Title";
import Body from "./ModalMarkerMenu/Body";
import Footer from "./ModalMarkerMenu/Footer";

const App = () => {
  const [locations, setLocations] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedLocationName, setSelectedLocationName] = useState("");
  const [defaultZoom, setDefaultZoom] = useState(7);
  const [defaultCenter, setDefaultCenter] = useState({
    lat: 28.60216740171059,
    lng: -81.19755884949998,
  });
  const [isAddImagesClicked, setIsAddImagesClicked] = useState(false); // New state variable

  useEffect(() => {
    fetch(`https://memorymap.xyz/api/locations/Admintest1`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setLocations(data);
      })
      .catch((error) => {
        console.error(
          "There has been a problem with your fetch operation: ",
          error
        );
      });
  }, []); // Removed mapRefresh dependency

  function handleMarkerClick(uniqueId) {
    setSelectedLocationName(uniqueId);
    onOpen();
  }

  // For states
  const handleAddImagesClick = () => {
    setIsAddImagesClicked(true);
  };

  const handleBackClick = () => {
    setIsAddImagesClicked(false);
  };

  function handleDeletePin(locationId) {
    setLocations(locations.filter((location) => location._id !== locationId));
  }

  return (
    <APIProvider apiKey={"AIzaSyABVpzV6o5YTJ6FbCKHgMd_SUspf0AYJO0"}>
      <Map
        defaultZoom={defaultZoom}
        defaultCenter={defaultCenter}
        mapId={"<Your custom MapId here>"}
      >
        {locations.length !== 0 &&
          locations.map((item) => (
            <AdvancedMarker
              key={item._id}
              position={{
                lat: parseFloat(item.latitude),
                lng: parseFloat(item.longitude),
              }}
              onClick={() => handleMarkerClick(`${item._id}`)}
            />
          ))}
      </Map>

      {selectedLocationName && (
        <CustomModal
          isOpen={isOpen}
          modalHeader={
            <Title
              isAddImagesClicked={isAddImagesClicked}
              handleBackClick={handleBackClick}
              handleAddImagesClick={handleAddImagesClick}
            />
          }
          modalBody={
            <Body
              markerId={selectedLocationName}
              isAddImagesClicked={isAddImagesClicked}
            />
          }
          modalFooter={
            <Footer
              closeModal={onClose}
              locationId={selectedLocationName}
              deletePin={() => handleDeletePin(selectedLocationName)}
            />
          }
        />
      )}
    </APIProvider>
  );
};

export default App;
