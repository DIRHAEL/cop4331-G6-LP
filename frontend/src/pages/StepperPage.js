import React from "react";
import { useState } from "react";
import Stepper from "../components/Stepper";

import { ChakraProvider, Button, useDisclosure } from "@chakra-ui/react";

import FilePicker from "../components/FilePicker";
import CustomModal from "../components/Modal";

import Title from "../components/ModalInsertMarker/Title";
import Body from "../components/ModalInsertMarker/Body";
import Footer from "../components/ModalInsertMarker/Footer";

import MapMarker from "../components/MapMarker";

const StepperPage = () => {
  const [current, setCurrent] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [markerPosition, setMarkerPosition] = useState(null);

  const updateCurrent = (newValue) => {
    setCurrent(newValue);
  };

  const placeNewMarker = (event) => {
    const info = event.detail;

    const newPosition = info.latLng;
    // Set the new marker position
    setMarkerPosition(newPosition);

    console.log(newPosition);
  };

  const footers = [
    <Footer
      prevButton={true}
      nextButton={false}
      prevFunction={() => updateCurrent(0)}
      nextFunction={() => updateCurrent(1)}
    />,
    <Footer
      prevButton={false}
      nextButton={true}
      prevFunction={() => updateCurrent(0)}
      nextFunction={() => updateCurrent(1)}
    />,
    <Footer></Footer>,
  ];

  const body = [
    <div className="h-[32rem]">
      <MapMarker markerCoord={markerPosition} insertFunction={placeNewMarker} />
    </div>,
    <FilePicker />,
  ];

  return (
    <div className="h-screen bg-black">
      <ChakraProvider>
        <Button colorScheme="gray" onClick={onOpen}>
          Open Modal
        </Button>
      </ChakraProvider>

      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        modalHeader={<Title value={current} />} // Has to change dynamically
        modalBody={<Body insertJsx={body[current]} />}
        modalFooter={footers[current]} // This had to change dynamically
        modalSize={"full"}
      />
    </div>
  );
};

export default StepperPage;
