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

export default function FilePicker({ setFiles }) {
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileUpload = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setErrorMessage("Please upload only JPG or PNG images.");
      return;
    }

    // Add the new files to the existing files
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
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
