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
  // Retrieve user data from localStorage
  let userData = JSON.parse(localStorage.getItem("user_data"));
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setErrorMessage("Please upload only JPG or PNG images.");
      return;
    }

    setIsUploading(true);

    //setIsUploading(true); // Set uploading status to true

    const formData = new FormData();
    acceptedFiles.forEach((file, index) => {
      console.log(file);
      formData.append(`image`, file); // Append each selected file
    });
    formData.append("caption", ""); // Append other form fields
    formData.append("username", userData.username);
    formData.append("locationId", markerId);

    try {
      const response = await fetch("https://memorymap.xyz/posts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload images");
      }

      console.log("Images uploaded successfully");

      setIsUploading(false);
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
          accept=".jpg, .png, .jpeg"
          errorMessage={errorMessage}
          progressMessage={isUploading ? "Uploading... hang tight." : ""}
        />
      </BaseProvider>
    </StyletronProvider>
  );
}
