// ModalBody.js
import React from "react";
import FilePicker from "../ImageUpdate";
import GalleryGrid from "../Gallery/GalleryGrid";
import { ModalBody } from "@chakra-ui/react";

const Body = ({ isAddImagesClicked, markerId }) => {
  return (
    <ModalBody>
      {isAddImagesClicked ? (
        <FilePicker markerId={markerId} />
      ) : (
        <GalleryGrid />
      )}
    </ModalBody>
  );
};

export default Body;
