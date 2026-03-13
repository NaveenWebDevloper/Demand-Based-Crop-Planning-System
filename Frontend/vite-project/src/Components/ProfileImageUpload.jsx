import React, { useRef, useState } from "react";
import { useLanguage } from "../Context/LanguageContext";

const ProfileImageUpload = ({
  onImageSelect,
  previewImage = null,
  userName = "Preview",
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [preview, setPreview] = useState(previewImage);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
        setError("");
        onImageSelect(file, event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setError(
        t("register.invalidImageFile") || "Please select a valid image file",
      );
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setError("");
      }
    } catch (err) {
      setError(
        t("register.cameraAccessDenied") ||
          "Failed to access camera: " + err.message,
      );
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      const imageData = canvasRef.current.toDataURL("image/jpeg");
      setPreview(imageData);

      // Convert canvas to blob for file upload
      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], "camera-capture.jpg", {
          type: "image/jpeg",
        });
        onImageSelect(file, imageData);
      });

      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium ios-subtitle mb-2 text-center">
        {t("register.profileImage") || "Profile Photo"}
      </label>

      <div className="flex flex-col gap-4">
        {/* Preview Section */}
        {preview ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 p-1 shadow-2xl mx-auto">
              <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center ios-body">
              {t("register.photoPreview") || "Photo preview"}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 mx-auto shadow-lg border-2 border-dashed border-gray-400">
            <div className="text-center">
              <svg
                className="w-12 h-12 text-gray-500 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <p className="text-xs text-gray-500">
                {t("register.addPhoto") || "Add photo"}
              </p>
            </div>
          </div>
        )}

        {/* Camera View */}
        {isCameraActive && (
          <div className="relative rounded-2xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-4 left-0 right-0 flex gap-2 justify-center">
              <button
                type="button"
                onClick={capturePhoto}
                className="px-6 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold shadow-lg transition-all"
              >
                {t("register.capture") || "Capture"}
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-6 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg transition-all"
              >
                {t("register.cancel") || "Cancel"}
              </button>
            </div>
          </div>
        )}

        {/* Upload Options */}
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCameraActive}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ios-body"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t("register.uploadImage") || "Upload Image"}
          </button>

          <button
            type="button"
            onClick={startCamera}
            disabled={isCameraActive}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-600 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ios-body"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {t("register.takePhoto") || "Take Photo"}
          </button>

          {preview && (
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                onImageSelect(null, null);
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-medium transition-all ios-body"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              {t("register.remove") || "Remove"}
            </button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-2xl bg-red-50/80 border border-red-200/60 text-red-600 text-sm ios-body">
            {error}
          </div>
        )}

        {/* Info Message */}
        {!preview && !isCameraActive && (
          <p className="text-xs text-gray-500 text-center ios-body">
            {t("register.imageOptional") ||
              "Upload or capture a profile photo to complete your profile"}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileImageUpload;
