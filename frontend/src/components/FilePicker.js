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

const ImageThumbnail = styled("img", {
  width: "1em",
  height: "1em",
  objectFit: "cover",
});

export default function FilePicker({ files, setFiles }) {
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
          accept=".jpg, .png, .jpeg"
          errorMessage={errorMessage}
        />
        <div className="mt-24 flex flex-col items-center">
          {files.map((file, index) => (
            <div key={index}>
              <ImageThumbnail
                src={URL.createObjectURL(file)}
                alt={`upload-${index}`}
              />
              <div>{file.name}</div>
            </div>
          ))}
        </div>
      </BaseProvider>
    </StyletronProvider>
  );
}
