// Title.js
import React from "react";
import { Button } from "@chakra-ui/react";
import { ModalHeader } from "@chakra-ui/react";

const Title = ({
  isAddImagesClicked,
  handleAddImagesClick,
  handleBackClick,
}) => {
  return (
    <ModalHeader className="justify-between flex">
      <h1>Images</h1>
      {isAddImagesClicked ? (
        <Button onClick={handleBackClick} colorScheme="gray">
          Back
        </Button>
      ) : (
        <Button onClick={handleAddImagesClick} colorScheme="gray">
          Add Images
        </Button>
      )}
    </ModalHeader>
  );
};

export default Title;
