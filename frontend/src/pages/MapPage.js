import React from "react";
import { ChakraProvider, Flex, Button, Box } from "@chakra-ui/react";
import MapComponent from "../components/DisplayMarker";
import ModalCustom from "../components/Modal";
import { useDisclosure } from "@chakra-ui/react";

import DisplayMenu from "../components/DisplayMenu";

import { useState } from "react";

const MapPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [locations, setLocations] = useState([]);

  const handleSignOut = () => {
    localStorage.removeItem("user_data");
    window.location.href = "/login";
  };

  return (
    <ChakraProvider>
      <Flex direction="column" h="100vh">
        {/* Navigation Bar */}
        <Flex bg="#331E3E" p="4" align="center" justify="space-between">
          <span style={{ color: "white", fontWeight: "bold" }}>Memory Map</span>
          <Box>
            <Button onClick={handleSignOut} colorScheme="purple">
              Sign Out
            </Button>
          </Box>
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
            bg="black"
          >
            <Button onClick={onOpen} colorScheme="purple">
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
