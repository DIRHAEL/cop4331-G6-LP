import React from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Center,
  extendTheme,
  ThemeProvider,
  ColorModeProvider,
  CSSReset,
  ChakraProvider,
} from "@chakra-ui/react";

import { useToast } from "@chakra-ui/react";

import { useState } from "react";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  colors: {
    teal: {
      500: "#319795",
    },
  },
});

async function EmailForm() {
  const [email, setEmail] = useState("");
  const toast = useToast();

  async function handleSubmit() {
    console.log(setEmail);

    let obj = {
      email: email,
    };

    let js = JSON.stringify(obj);

    const response = await fetch("https://memorymap.xyz/api/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: js,
    });

    // 200 goood, 400, username/email already exists, 500 really bad
    const serverCode = response.status;

    if (serverCode === 404) {
      toast({
        title: "Error",
        description: "Not a valid email",
        status: "error",
        position: "top",
        duration: "9000",
        isClosable: true,
      });
      return;
    }
  }

  return (
    <ChakraProvider>
      <ThemeProvider theme={theme}>
        <ColorModeProvider>
          <CSSReset />
          <Center h="100vh" bg={"gray.800"}>
            <Box
              w="300px"
              p={4}
              borderWidth={1}
              borderRadius="lg"
              bg={"gray.700"}
            >
              <form onSubmit={handleSubmit}>
                <FormControl id="email" isRequired>
                  <FormLabel color={"gray.200"}>Enter Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="Email"
                    bg={"gray.800"}
                    color={"gray.200"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>
                <Button mt={4} colorScheme="teal" type="submit">
                  Submit
                </Button>
              </form>
            </Box>
          </Center>
        </ColorModeProvider>
      </ThemeProvider>
    </ChakraProvider>
  );
}

export default EmailForm;
