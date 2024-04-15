// ModalBody.js
import React from "react";
import FilePicker from "../FilePicker";
import GalleryGrid from "../Gallery/GalleryGrid";
import { ModalBody } from "@chakra-ui/react";

const Body = ({ isAddImagesClicked }) => {
  return (
    <ModalBody>
      {isAddImagesClicked ? <FilePicker /> : <GalleryGrid />}
    </ModalBody>
  );
};

export default Body;
