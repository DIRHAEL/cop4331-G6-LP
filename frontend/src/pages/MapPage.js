import React from "react";
import { ChakraProvider, Flex, Button } from "@chakra-ui/react";
import MapComponent from "../components/DisplayMarker";
import ModalCustom from "../components/Modal";
import { useDisclosure } from "@chakra-ui/react";

import DisplayMenu from "../components/DisplayMenu";

import { useState } from "react";

const MapPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [locations, setLocations] = useState([]);

  return (
    <ChakraProvider>
      <Flex direction="column" h="100vh">
        {/* Navigation Bar */}
        <Flex bg="blue.500" p="4" align="center" justify="center">
          <span style={{ color: "white", fontWeight: "bold" }}>Navigation</span>
        </Flex>

        {/* Main Content */}
        <Flex flexGrow="1" justify="space-between">
          {/* Left Side - Button */}
          <Flex
            direction="column"
            p="4"
            align="center"
            justify="center"
            flexBasis="20%" // Adjusted to be 20% smaller
          >
            <Button
              onClick={onOpen}
              bg="blue.500"
              color="white"
              _hover={{ bg: "blue.600" }}
            >
              Add Pin
            </Button>
          </Flex>

          {/* Right Side - Map */}
          <Flex flexGrow="1">
            <MapComponent locations={locations} setLocations={setLocations} />
          </Flex>
        </Flex>

        {/* Custom Modal */}
        <DisplayMenu
          openModal={isOpen}
          closeModal={onClose}
          locations={locations}
          setLocations={setLocations}
        />
      </Flex>
    </ChakraProvider>
  );
};

export default MapPage;
