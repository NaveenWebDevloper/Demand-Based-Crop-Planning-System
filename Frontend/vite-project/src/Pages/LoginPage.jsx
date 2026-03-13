import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { useAuth } from "../Context/AuthContext";
import { useLanguage } from "../Context/LanguageContext";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(identifier, password);
      console.log("Login Response:", user);

      // Redirect based on user role
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/farmer");
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      setError(error.response?.data?.message || t("login.failed"));
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

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md">
          {/* Main Glass Card */}
          <div className="glass-card rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 relative">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-8">
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold ios-title mb-2">
                {t("login.welcomeBack")}
              </h1>
              <p className="ios-body text-sm">{t("login.continueText")}</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email or Phone Input */}
              <div className="relative">
                <label className="block text-sm font-medium ios-subtitle mb-2 ml-1">
                  {t("login.emailOrMobile")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={t("login.emailOrMobilePlaceholder")}
                    className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 focus:border-green-400/60 focus:ring-2 focus:ring-green-400/20 outline-none transition-all duration-300 ios-body placeholder:text-gray-400 shadow-sm"
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

              {/* Password Input */}
              <div className="relative">
                <label className="block text-sm font-medium ios-subtitle mb-2 ml-1">
                  {t("login.password")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 focus:border-green-400/60 focus:ring-2 focus:ring-green-400/20 outline-none transition-all duration-300 ios-body placeholder:text-gray-400 shadow-sm pr-12"
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded-md border-gray-300 text-green-500 focus:ring-green-400/30 transition-all"
                  />
                  <span className="ios-body group-hover:text-gray-700 transition-colors">
                    {t("login.rememberMe")}
                  </span>
                </label>
                {/* <Link
                  to="/forgot-password"
                  className="ios-accent hover:text-green-600 transition-colors font-medium"
                >
                  Forgot Password?
                </Link> */}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 mt-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-base shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:from-green-600 hover:to-emerald-600 transform hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]"
              >
                {t("login.signIn")}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center mt-8 ios-body text-sm">
              {t("login.noAccount")}{" "}
              <Link
                to="/register"
                className="ios-accent font-semibold hover:text-green-600 transition-colors"
              >
                {t("login.createAccount")}
              </Link>
            </p>
          </div>

          {/* Subtle brand text */}
          <p className="text-center mt-6 text-xs ios-body opacity-50">
            🌱 {t("login.brandText")}
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
