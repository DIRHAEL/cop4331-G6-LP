// TestPage.js
import React from "react";
import { Button, useDisclosure } from "@chakra-ui/react";
import CustomModal from "../components/Modal";
import { ChakraProvider } from "@chakra-ui/react";
import { useState } from "react";
import { useEffect } from "react";

import ModalTitle from "../components/ModalMarkerMenu/Title";
import ModalBody from "../components/ModalMarkerMenu/Body";
import ModalFooter from "../components/ModalMarkerMenu/Footer";

const TestPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isAddImagesClicked, setIsAddImagesClicked] = useState(false); // New state variable

  const handleAddImagesClick = () => {
    setIsAddImagesClicked(true);
  };

  const handleBackClick = () => {
    setIsAddImagesClicked(false);
  };

  return (
    <div>
      <ChakraProvider>
        <Button colorScheme="green" onClick={onOpen}>
          Open Modal
        </Button>
      </ChakraProvider>
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        modalHeader={
          <ModalTitle
            isAddImagesClicked={isAddImagesClicked}
            handleAddImagesClick={handleAddImagesClick}
            handleBackClick={handleBackClick}
          />
        }
        modalBody={<ModalBody isAddImagesClicked={isAddImagesClicked} />}
        modalFooter={<ModalFooter />}
        modalSize={"lg"}
      />
    </div>
  );
};

export default TestPage;
