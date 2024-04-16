import React, { useState } from "react";

import { buildPath } from "./buildPath";

const app_name = "cop4331-g6-lp-c6d624829cab";

const FileUploadForm = () => {
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
      console.log(file);
      formData.append(`image`, file); // Append each selected file
    });
    formData.append("caption", caption); // Append other form fields
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
