import React, { useState } from "react";

import { buildPath } from "./buildPath";

const app_name = "cop4331-g6-lp-c6d624829cab";

const FileUploadForm = () => {
  function buildPath(route) {
    return "http://localhost:5001/" + route;
  }
  const [caption, setCaption] = useState("");
  const [locationId, setLocationId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false); // Track upload status

  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files)); // Store all selected files
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsUploading(true); // Set uploading status to true

    const formData = new FormData();
    selectedFiles.forEach((file, index) => {
      formData.append(`image`, file); // Append each selected file
    });
    formData.append("caption", caption); // Append other form fields
    formData.append("username", "RickL");
    formData.append("locationId", "66197f796b5389daa4f06dec");

    try {
      const response = await fetch(buildPath("posts"), {
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
      setIsUploading(false); // Reset uploading status
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Caption:</label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>
        <div>
          <label>Location ID:</label>
          <input
            type="text"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          />
        </div>
        <div>
          <label>Choose Images:</label>
          <input multiple type="file" onChange={handleFileChange} />
        </div>
        <button type="submit" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {isUploading && <div className="spinner"></div>}{" "}
      {/* Render spinner if uploading */}
    </div>
  );
};

export default FileUploadForm;
