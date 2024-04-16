import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const customTheme = extendTheme({
  components: {
    Modal: {
      baseStyle: {
        // Modify the base styles of the Modal component
        dialog: {
          backgroundColor: "rgb(20, 20, 20)", // Example background color
          color: "rgb(203, 203, 203)", // Example text color
        },
      },
    },
  },
});

function CustomModal({
  isOpen,
  onClose,
  modalHeader,
  modalBody,
  modalFooter,
  modalSize,
}) {
  return (
    <ChakraProvider theme={customTheme}>
      <Modal
        closeOnOverlayClick={false}
        closeOnEsc={false}
        onClose={onClose}
        size={modalSize}
        isOpen={isOpen}
      >
        <ModalOverlay>
          <ModalContent>
            {modalHeader}
            {modalBody}
            {modalFooter}
          </ModalContent>
        </ModalOverlay>
      </Modal>
    </ChakraProvider>
  );
}

export default CustomModal;
