import React from "react";
import { ModalFooter } from "@chakra-ui/react";

import { ButtonGroup, Button } from "@chakra-ui/react";

const Footer = () => {
  return (
    <ModalFooter>
      <ButtonGroup>
        <Button color="red.500" bg="red.200">
          Discard Changes
        </Button>
        <Button color="green.500" bg="green.200">
          Save Changes
        </Button>
      </ButtonGroup>
    </ModalFooter>
  );
};

export default Footer;
