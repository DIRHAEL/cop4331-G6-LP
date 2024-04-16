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

import SubmitBttn from "../components/SubmitBttn";

const StepperPage = ({ openModal, closeModal, locations, setLocations }) => {
  const [current, setCurrent] = useState(0);

  console.log(closeModal);

  const [markerPosition, setMarkerPosition] = useState(null);

  const [files, setFiles] = useState([]);

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
      nextButton={false}
      prevFunction={() => updateCurrent(0)}
      nextFunction={() => updateCurrent(2)}
    />,
    <Footer
      prevButton={false}
      nextButton={true}
      prevFunction={() => updateCurrent(1)}
      nextFunction={() => updateCurrent(1)}
    />,
  ];

  const body = [
    <div className="h-[32rem]">
      <MapMarker markerCoord={markerPosition} insertFunction={placeNewMarker} />
    </div>,
    <FilePicker files={files} setFiles={setFiles} />,
    <div className="flex h-96 w-full justify-center items-center ">
      <SubmitBttn
        curCord={markerPosition}
        curFiles={files}
        closeModal={closeModal}
        setCurrent={setCurrent}
        setMarkerPosition={setMarkerPosition}
        setFiles={setFiles}
        locations={locations}
        setLocations={setLocations}
      />
    </div>,
  ];

  return (
    <CustomModal
      isOpen={openModal}
      onClose={closeModal}
      modalHeader={<Title value={current} />} // Has to change dynamically
      modalBody={<Body insertJsx={body[current]} />}
      modalFooter={footers[current]} // This had to change dynamically
      modalSize={"full"}
    />
  );
};

export default StepperPage;
