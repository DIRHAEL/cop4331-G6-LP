import React from "react";
import { Button } from "@chakra-ui/react";

import { ModalHeader } from "@chakra-ui/react";

import Stepper from "../Stepper";

const Title = ({ value }) => {
  return (
    <ModalHeader>
      <Stepper currentStep={value} />
    </ModalHeader>
  );
};

export default Title;
