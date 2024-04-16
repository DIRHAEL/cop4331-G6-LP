import React from "react";
import { Client as Styletron } from "styletron-engine-monolithic";
import { Provider as StyletronProvider } from "styletron-react";
import { DarkTheme, BaseProvider, styled } from "baseui";
import { FileUploader } from "baseui/file-uploader";

import { useState } from "react";

import { buildPath } from "./buildPath";

const engine = new Styletron();

const Centered = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
});

export default function FilePicker({ markerId }) {
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileUpload = async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setErrorMessage("Please upload only JPG or PNG images.");
      return;
    }

    console.log(markerId);

    //setIsUploading(true); // Set uploading status to true

    const formData = new FormData();
    acceptedFiles.forEach((file, index) => {
      console.log(file);
      formData.append(`image`, file); // Append each selected file
    });
    formData.append("caption", ""); // Append other form fields
    formData.append("username", "Admintest1");
    formData.append("locationId", "661d7c61209ac3e07fe5e064");

    try {
      const response = await fetch("https://memorymap.xyz/posts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload images");
      }

      console.log("Images uploaded successfully");
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      //setIsUploading(false); // Reset uploading status
    }
  };

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={DarkTheme}>
        <FileUploader
          onDrop={handleFileUpload}
          accept="image/jpg, image/png"
          errorMessage={errorMessage}
        />
      </BaseProvider>
    </StyletronProvider>
  );
}
