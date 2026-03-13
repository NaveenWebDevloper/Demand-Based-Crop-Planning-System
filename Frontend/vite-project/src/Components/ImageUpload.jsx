import React, { useState } from "react";
import { apiUrl } from "../config/api";

const ImageUpload = ({ onImageUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("Please select a valid image file");
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("No file selected");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch(apiUrl("/api/image/upload"), {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setUploadedImage(data.imageUrl);
        setError(null);
        setSelectedFile(null);
        // Call parent component callback with the image URL
        onImageUpload(data.imageUrl);
      } else {
        setError(data.message || "Upload failed");
      }
    } catch (err) {
      setError("Error uploading image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3>Upload Image</h3>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        style={styles.input}
      />
      {selectedFile && <p>Selected: {selectedFile.name}</p>}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        style={styles.button}
      >
        {uploading ? "Uploading..." : "Upload Image"}
      </button>

      {error && <p style={styles.error}>{error}</p>}

      {uploadedImage && (
        <div>
          <p style={styles.success}>Image uploaded successfully!</p>
          <img src={uploadedImage} alt="Uploaded" style={styles.preview} />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  input: {
    marginBottom: "10px",
    padding: "8px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
  success: {
    color: "green",
    marginTop: "10px",
  },
  preview: {
    maxWidth: "200px",
    marginTop: "10px",
    borderRadius: "4px",
  },
};

export default ImageUpload;
