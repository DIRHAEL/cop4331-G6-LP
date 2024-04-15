import React, { useState } from "react";
import { Box, Image, Button, Input, Stack } from "@chakra-ui/react";

const ModalBody = () => {
  const [images, setImages] = useState([]);

  const addImage = (event) => {
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    setImages([...images, url]);
  };

  const deleteImage = (indexToDelete) => {
    setImages(images.filter((_, index) => index !== indexToDelete));
  };

  return (
    <Box p={4}>
      <Input type="file" onChange={addImage} accept="image/*" />
      <Stack direction="row" spacing={4} overflowX="scroll" py={4}>
        {images.map((image, index) => (
          <Box key={index} position="relative">
            <Image src={image} boxSize="100px" objectFit="cover" />
            <Button
              position="absolute"
              right="1"
              top="-1"
              size="xs"
              colorScheme="red"
              onClick={() => deleteImage(index)}
            >
              X
            </Button>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default ModalBody;
