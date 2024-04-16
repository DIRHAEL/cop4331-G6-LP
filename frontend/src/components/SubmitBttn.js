import * as React from "react";

import { Client as Styletron } from "styletron-engine-monolithic";
import { Provider as StyletronProvider } from "styletron-react";
import { DarkTheme, BaseProvider, styled } from "baseui";
import { Button, SHAPE, ButtonProps, KIND, SIZE } from "baseui/button";

const engine = new Styletron();

function SpacedButton(props) {
  return (
    <Button
      {...props}
      shape={SHAPE.pill}
      kind={KIND.secondary}
      size={SIZE.large}
      overrides={{
        BaseButton: {
          style: ({ $theme }) => ({
            height: "50px", // Set the height as per your requirement
            width: "100px",
            paddingLeft: $theme.sizing.scale600,
            paddingRight: $theme.sizing.scale600,
          }),
        },
      }}
    />
  );
}

function ProgressStepsContainer({
  curCord,
  curFiles,
  closeModal,
  setMarkerPosition,
  setCurrent,
  setFiles,
  locations,
  setLocations,
}) {
  const handleSubmit = async (event) => {
    // Retrieve user data from localStorage
    let userData = JSON.parse(localStorage.getItem("user_data"));

    let obj = {
      username: userData.username,
      latitude: curCord.lat,
      longitude: curCord.lng,
    };

    let json = JSON.stringify(obj);

    try {
      const response = await fetch("https://memorymap.xyz/api/locations", {
        method: "POST",
        body: json,
        headers: { "Content-Type": "application/json" },
      });

      const res = JSON.parse(await response.text());

      const markId = res.markerId;

      try {
        const formData = new FormData();
        curFiles.forEach((curFiles) => {
          formData.append("image", curFiles);
        });

        formData.append("username", userData.username);
        formData.append("caption", "whater");
        formData.append("locationId", markId);

        const response = await fetch("https://memorymap.xyz/posts", {
          method: "POST",
          body: formData,
        });

        console.log("Files uploaded successfully");

        const newMarker = {
          _id: markId,
          latitude: curCord.lat,
          longitude: curCord.lng,
          username: userData.username,
        };

        setCurrent(0);
        setMarkerPosition(null);
        setFiles([]);

        setLocations((locations) => [...locations, newMarker]);

        closeModal();
      } catch (error) {
        console.error("Error uploading files:", error);
      }
    } catch (error) {
      console.log("Error creating a location");
    }

    /*

    try {
      const formData = new FormData();
      curFiles.forEach((file) => {
        formData.append("files", file);
      });

      formData.append("username", "RickL");
      formData.append("caption", "whater");
      formData.append("locationId", "66197f796b5389daa4f06dec");

      const response = await fetch(
        "https://memorymap.xyz/posts/dmedi/661986e1aed87edfd1ea0248",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      console.log("Files uploaded successfully");
    } catch (error) {
      console.error("Error uploading files:", error);
    }
    */
  };

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={DarkTheme}>
        <SpacedButton onClick={handleSubmit}>Submit</SpacedButton>
      </BaseProvider>
    </StyletronProvider>
  );
}

export default ProgressStepsContainer;
