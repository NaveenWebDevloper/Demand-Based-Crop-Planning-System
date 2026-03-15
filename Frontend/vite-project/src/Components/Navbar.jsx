import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useLanguage } from "../Context/LanguageContext";

const MagneticWrapper = ({ children, strength = 0.25 }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const wrapperRef = useRef(null);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = wrapperRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const x = (clientX - centerX) * strength;
    const y = (clientY - centerY) * strength;
    
    setPosition({ x, y });
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetPosition}
      className="magnetic-item"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Navbar = () => {
  const { user } = useAuth();
  const { language, cycleLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const languageShortCode = {
    en: "EN",
    te: "తె",
    hi: "हि",
  };

  const dashboardRoute = user
    ? user.role === "admin"
      ? "/admin"
      : "/farmer"
    : "/";

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [user]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navLinkClass =
    "navbarButtons text-gray-700/85 hover:text-gray-900 font-medium px-4 py-2 text-base rounded-full";

  return (
    <div className="fixed inset-x-0 top-0 flex flex-col items-center z-50 pointer-events-none pt-4 sm:pt-6">
      <div className="liquid-glass w-[92%] max-w-4xl min-h-[56px] flex items-center justify-between px-5 sm:px-8 gap-4 rounded-[32px] sm:rounded-[100px] pointer-events-auto">
        <MagneticWrapper strength={0.15}>
          <Link to="/" className="flex items-center gap-2 relative z-10 transition-transform hover:scale-105 active:scale-95">
            <svg
              className="w-7 h-7"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="32" cy="32" r="30" fill="url(#gradient1)" />
              <path
                d="M32 16C32 16 24 24 24 32C24 40 28 44 32 48C36 44 40 40 40 32C40 24 32 16 32 16Z"
                fill="#ffffff"
                opacity="0.9"
              />
              <path
                d="M20 28C20 28 26 30 30 34C28 38 24 40 20 40C16 40 14 36 14 32C14 28 20 28 20 28Z"
                fill="#ffffff"
                opacity="0.7"
              />
              <path
                d="M44 28C44 28 38 30 34 34C36 38 40 40 44 40C48 40 50 36 50 32C50 28 44 28 44 28Z"
                fill="#ffffff"
                opacity="0.7"
              />
              <defs>
                <linearGradient id="gradient1" x1="0" y1="0" x2="64" y2="64">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
              </defs>
            </svg>
            <h1 className="text-base sm:text-lg font-bold text-gray-700/90 tracking-tight">
              CropPlan
            </h1>
          </Link>
        </MagneticWrapper>

        <button
          type="button"
          className="md:hidden relative z-50 p-2 rounded-xl border border-white/40 bg-white/20 active:scale-95 transition-transform"
          aria-label="Toggle menu"
          onClick={(e) => {
            e.stopPropagation();
            setIsMobileMenuOpen((prev) => !prev);
          }}
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        <nav className="relative z-10 hidden md:block">
          <ul className="flex space-x-1 items-center">
            <li>
              <MagneticWrapper>
                <Link to="/" className={navLinkClass}>
                  {t("nav.home")}
                </Link>
              </MagneticWrapper>
            </li>

            {user && (
              <li>
                <MagneticWrapper>
                  <Link to={dashboardRoute} className={navLinkClass}>
                    {user.role === "admin"
                      ? t("nav.adminDashboard")
                      : t("nav.farmerDashboard")}
                  </Link>
                </MagneticWrapper>
              </li>
            )}

            <li>
              <MagneticWrapper>
                <Link to="/about-us" className={navLinkClass}>
                  {t("nav.aboutUs")}
                </Link>
              </MagneticWrapper>
            </li>

            {!user && (
              <>
                <li>
                  <MagneticWrapper>
                    <Link to="/login" className={navLinkClass}>
                      {t("nav.login")}
                    </Link>
                  </MagneticWrapper>
                </li>

                <li>
                  <MagneticWrapper>
                    <Link to="/register" className={navLinkClass}>
                      {t("nav.register")}
                    </Link>
                  </MagneticWrapper>
                </li>
              </>
            )}

            <li>
              <MagneticWrapper strength={0.2}>
                <button
                  type="button"
                  aria-label={t("nav.switchLanguage")}
                  onClick={cycleLanguage}
                  className="navbarButtons text-gray-700/90 hover:text-gray-900 font-semibold px-4 py-2 rounded-full"
                  title={t("nav.switchLanguage")}
                >
                  {t("nav.language")}: {languageShortCode[language]}
                </button>
              </MagneticWrapper>
            </li>

            {user && (
              <li className="pl-2">
                <MagneticWrapper strength={0.35}>
                  <Link 
                    to="/profile" 
                    className="block w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 p-0.5 shadow-md hover:scale-110 active:scale-95 transition-transform"
                    title={t("nav.viewProfile") || "View Profile"}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                      {user?.profileImage?.url ? (
                        <img 
                          src={user.profileImage.url} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-green-600 bg-green-50">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </Link>
                </MagneticWrapper>
              </li>
            )}
          </ul>
        </nav>
      </div>
 
      {isMobileMenuOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <div 
            className="fixed inset-0 bg-white/10 backdrop-blur-[20px] z-[-1] md:hidden pointer-events-auto"
            onClick={closeMobileMenu}
          />
          <div 
            className="w-full max-w-6xl mt-3 md:hidden pointer-events-auto animate-fade-in-down"
            onClick={(e) => e.stopPropagation()}
          >
          <div className="liquid-glass rounded-[2rem] p-4 w-[92%] mx-auto">
          <ul className="flex flex-col gap-1">
            <li>
              <Link to="/" onClick={closeMobileMenu} className={navLinkClass}>
                {t("nav.home")}
              </Link>
            </li>
            {user && (
              <li>
                <Link
                  to={dashboardRoute}
                  onClick={closeMobileMenu}
                  className={navLinkClass}
                >
                  {user.role === "admin"
                    ? t("nav.adminDashboard")
                    : t("nav.farmerDashboard")}
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/about-us"
                onClick={closeMobileMenu}
                className={navLinkClass}
              >
                {t("nav.aboutUs")}
              </Link>
            </li>
            {!user && (
              <>
                <li>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className={navLinkClass}
                  >
                    {t("nav.login")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className={navLinkClass}
                  >
                    {t("nav.register")}
                  </Link>
                </li>
              </>
            )}
            <li>
              <div className="flex items-center justify-between gap-2 px-1">
                <button
                  type="button"
                  aria-label={t("nav.switchLanguage")}
                  onClick={cycleLanguage}
                  className="flex-grow text-left navbarButtons text-gray-700/90 hover:text-gray-900 font-semibold px-4 py-2 rounded-full"
                >
                  {t("nav.language")}: {languageShortCode[language]}
                </button>
                {user && (
                  <Link 
                    to="/profile" 
                    onClick={closeMobileMenu}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 p-0.5 shadow-md flex-shrink-0 active:scale-95 transition-transform"
                    title={t("nav.viewProfile") || "View Profile"}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                      {user?.profileImage?.url ? (
                        <img 
                          src={user.profileImage.url} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-green-600 bg-green-50">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </Link>
                )}
              </div>
            </li>
          </ul>
          </div>
        </div>
      </>
    )}
  </div>
);
};

export default Navbar;
