import React from "react";
import { Button, useDisclosure } from "@chakra-ui/react";
import CustomModal from "../components/Modal";
import { ChakraProvider } from "@chakra-ui/react";

import ModalTitle from "../components/ModalMarkerMenu/Title";
import ModalBody from "../components/ModalMarkerMenu/Body";
import ModalFooter from "../components/ModalMarkerMenu/Footer";

const TestPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

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
        modalHeader={<ModalTitle />}
        modalBody={<ModalBody />}
        modalFooter={<ModalFooter />}
        modalSize={"lg"}
      />
    </div>
  );
};

export default TestPage;
