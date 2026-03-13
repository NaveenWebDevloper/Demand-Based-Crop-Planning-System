import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import LoginPage from "./Pages/LoginPage";
import AboutUsPage from "./Pages/AboutUsPage";
import RegisterPage from "./Pages/RegisterPage";
import AdminDashboard from "./AdminDashboard";
import FarmerDashboard from "./Pages/FarmerDashboard";
import RevenueGeneratePage from "./Pages/RevenueGeneratePage";
import { AuthProvider } from "./Context/AuthContext";
import { LanguageProvider } from "./Context/LanguageContext";
import ProtectedRoute from "./Components/ProtectedRoute";

const App = () => {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          {/* Bottom fade shadow - Global */}
          <div className="hidden md:block fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-40"></div>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/about-us" element={<AboutUsPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer"
              element={
                <ProtectedRoute allowedRoles={["farmer"]}>
                  <FarmerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/revenue"
              element={
                <ProtectedRoute allowedRoles={["farmer"]}>
                  <RevenueGeneratePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;
