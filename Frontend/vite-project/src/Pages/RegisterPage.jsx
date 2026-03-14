import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import ProfileImageUpload from "../Components/ProfileImageUpload";
import ProfileCard from "../Components/ProfileCard";
import { useLanguage } from "../Context/LanguageContext";
import { apiUrl } from "../config/api";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [profileImageId, setProfileImageId] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (imageFile, imagePreview) => {
    setProfileImage(imageFile);
    setProfileImagePreview(imagePreview);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    let currentImageUrl = profileImageUrl;
    let currentImageId = profileImageId;

    // If we have an image file but no URL yet, upload it first
    if (!currentImageUrl && profileImage) {
      setUploadingImage(true);
      try {
        const imageFormData = new FormData();
        imageFormData.append("image", profileImage);

        const response = await axios.post(apiUrl("/api/image/upload-pre-register"), imageFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });

        currentImageUrl = response.data.imageUrl;
        currentImageId = response.data.imageId;
        setProfileImageUrl(currentImageUrl);
        setProfileImageId(currentImageId);
      } catch (err) {
        console.error("Image upload failed:", err);
        setError(err.response?.data?.message || t("register.imageUploadFailed") || "Failed to upload image. Please try again.");
        setUploadingImage(false);
        return;
      }
      setUploadingImage(false);
    }

    if (!currentImageUrl) {
      setError(t("register.errorNoImage") || "Please upload or capture a profile photo");
      return;
    }

    setUploadingImage(true); // Re-use loading state for registration
    try {
      const registrationData = {
        ...formData,
        profileImageUrl: currentImageUrl,
        profileImageId: currentImageId
      };

      const response = await axios.post(apiUrl("/api/auth/register"), registrationData);
      console.log("Register:", response.data);
      setIsRegistered(true);
    } catch (err) {
      setError(err.response?.data?.message || t("register.failed"));
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="w-full min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-green-50/40 via-white to-emerald-50/40 relative overflow-hidden flex items-center justify-center">
        {/* Background Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-200/30 to-emerald-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-teal-200/30 to-cyan-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-gradient-to-br from-green-300/20 to-emerald-400/10 rounded-full blur-2xl"></div>

        {/* Floating bubbles */}
        <div className="absolute top-32 right-1/4 w-16 h-16 rounded-full bg-gradient-to-br from-white/60 to-white/20 backdrop-blur-sm border border-white/30 shadow-lg"></div>
        <div className="absolute bottom-40 left-1/3 w-10 h-10 rounded-full bg-gradient-to-br from-white/50 to-white/10 backdrop-blur-sm border border-white/20 shadow-md"></div>
        <div className="absolute top-1/3 right-20 w-8 h-8 rounded-full bg-gradient-to-br from-green-200/40 to-emerald-300/20 backdrop-blur-sm border border-white/20"></div>

        {/* Register Card */}
        <div className="relative z-10 w-full max-w-md">
          {/* Main Glass Card */}
          <div className="glass-card rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 relative">
            {/* Success Message */}
            {isRegistered ? (
              <div className="text-center py-8">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl">
                    <svg
                      className="w-12 h-12 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold ios-title mb-4">
                  {t("register.successTitle")}
                </h2>
                <p className="ios-body text-base leading-relaxed mb-6">
                  {t("register.successText")}
                </p>
                <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-amber-50/80 border border-amber-200/60 mb-6">
                  <svg
                    className="w-5 h-5 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-amber-700 text-sm font-medium">
                    {t("register.pendingApproval")}
                  </span>
                </div>
                <Link
                  to="/login"
                  className="inline-block w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-base shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:from-green-600 hover:to-emerald-600 transform hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] text-center"
                >
                  {t("register.backToLogin")}
                </Link>
              </div>
            ) : (
              <>
                {/* Logo/Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Header */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold ios-title mb-2">
                    {t("register.createAccount")}
                  </h1>
                  <p className="ios-body text-sm">
                    {t("register.joinText")}
                  </p>
                </div>

                <div className="flex flex-col">
                  {/* Profile Image Section */}
                  <div className="p-4 rounded-3xl bg-white/40 border border-white/60 backdrop-blur-sm mb-4">
                    <ProfileImageUpload
                      onImageSelect={handleImageSelect}
                      previewImage={profileImagePreview}
                      userName={formData.name || "Farmer"}
                    />
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Error Message */}
                    {error && (
                      <div className="px-4 py-3 rounded-2xl bg-red-50/80 border border-red-200/60 text-red-600 text-sm">
                        {error}
                      </div>
                    )}

                    {/* Name Input */}
                    <div className="relative">
                      <label className="block text-sm font-medium ios-subtitle mb-2 ml-1">
                        {t("register.fullName")}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder={t("register.fullNamePlaceholder")}
                          className="w-full px-5 py-3.5 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 focus:border-green-400/60 focus:ring-2 focus:ring-green-400/20 outline-none transition-all duration-300 ios-body placeholder:text-gray-400 shadow-sm"
                          required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="relative">
                      <label className="block text-sm font-medium ios-subtitle mb-2 ml-1">
                        {t("register.emailAddress")}
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder={t("register.emailPlaceholder")}
                          className="w-full px-5 py-3.5 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 focus:border-green-400/60 focus:ring-2 focus:ring-green-400/20 outline-none transition-all duration-300 ios-body placeholder:text-gray-400 shadow-sm"
                          required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Phone Number Input */}
                    <div className="relative">
                      <label className="block text-sm font-medium ios-subtitle mb-2 ml-1">
                        {t("register.phoneNumber")}
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder={t("register.phonePlaceholder")}
                          className="w-full px-5 py-3.5 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 focus:border-green-400/60 focus:ring-2 focus:ring-green-400/20 outline-none transition-all duration-300 ios-body placeholder:text-gray-400 shadow-sm"
                          required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Address Input */}
                    <div className="relative">
                      <label className="block text-sm font-medium ios-subtitle mb-2 ml-1">
                        {t("register.address")}
                      </label>
                      <div className="relative">
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder={t("register.addressPlaceholder")}
                          rows={2}
                          className="w-full px-5 py-3.5 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 focus:border-green-400/60 focus:ring-2 focus:ring-green-400/20 outline-none transition-all duration-300 ios-body placeholder:text-gray-400 shadow-sm resize-none"
                          required
                        />
                        <div className="absolute right-4 top-4 text-gray-400">
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
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                      <label className="block text-sm font-medium ios-subtitle mb-2 ml-1">
                        {t("register.createPassword")}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className="w-full px-5 py-3.5 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 focus:border-green-400/60 focus:ring-2 focus:ring-green-400/20 outline-none transition-all duration-300 ios-body placeholder:text-gray-400 shadow-sm pr-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? (
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
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          ) : (
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={uploadingImage}
                      className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-base shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:from-green-600 hover:to-emerald-600 transform hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {uploadingImage ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>{t("register.processing") || "Processing..."}</span>
                        </>
                      ) : (
                        t("register.registerButton")
                      )}
                    </button>
                  </form>
                </div>

                {/* Login Link */}
                <p className="text-center mt-6 ios-body text-sm">
                  {t("register.alreadyAccount")}{" "}
                  <Link
                    to="/login"
                    className="ios-accent font-semibold hover:text-green-600 transition-colors"
                  >
                    {t("register.signIn")}
                  </Link>
                </p>
              </>
            )}
          </div>

          {/* Subtle brand text */}
          <p className="text-center mt-6 text-xs ios-body opacity-50">
            🌱 {t("register.brandText")}
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
