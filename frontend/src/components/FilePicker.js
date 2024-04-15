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

export default function FilePicker() {
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileUpload = async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setErrorMessage("Please upload only JPG or PNG images.");
      return;
    }

    try {
      // TODO sending imgaes to the api
      const filesInsert = [];
      acceptedFiles.forEach((file) => {
        filesInsert.push(file);
      });

      let obj = {
        files: acceptedFiles,
        username: "RickL",
        caption: "whater",
        locationId: "66197f796b5389daa4f06dec",
      };
      // login : sdfsdfas
      // password : dsfsdafasd
      let js = JSON.stringify(obj);

      console.log(js);

      const response = await fetch(buildPath("api/posts"), {
        method: "POST",
        body: js,
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      console.log("Files uploaded successfully");
    } catch (error) {
      console.error("Error uploading files:", error);
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
