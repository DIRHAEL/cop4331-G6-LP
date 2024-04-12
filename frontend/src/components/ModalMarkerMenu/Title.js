import React from "react";
import { Button } from "@chakra-ui/react";

import { ModalHeader } from "@chakra-ui/react";

const Title = () => {
  return (
    <ModalHeader className="justify-between flex">
      <h1>Images</h1>
      <Button colorScheme="gray"> Add Images</Button>
    </ModalHeader>
  );
};

export default Title;
