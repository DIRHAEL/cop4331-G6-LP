import React from "react";
import FilePicker from "../FilePicker";

import { ModalBody } from "@chakra-ui/react";

import MapMarker from "../MapMarker";

const Body = ({ insertJsx }) => {
  return <ModalBody>{insertJsx}</ModalBody>;
};

export default Body;
