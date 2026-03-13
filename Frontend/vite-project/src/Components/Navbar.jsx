import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useLanguage } from "../Context/LanguageContext";

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
    "navbarButtons text-gray-700/85 hover:text-gray-900 font-medium px-4 py-2 rounded-full";

  return (
    <div className="w-full flex items-center justify-center px-3 sm:px-4 pt-4 sm:pt-6 fixed top-0 left-0 z-50">
      <div className="liquid-glass navbar-transparent w-full max-w-6xl min-h-[52px] flex items-center justify-between px-4 sm:px-5 gap-4 rounded-[24px] sm:rounded-[100px]">
        <Link to="/" className="flex items-center gap-2 relative z-10">
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
          <h1 className="text-base sm:text-lg font-semibold text-gray-700/90">
            CropPlan
          </h1>
        </Link>

        <button
          type="button"
          className="md:hidden relative z-10 p-2 rounded-xl border border-white/45 bg-white/20"
          aria-label="Toggle menu"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
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
              <Link to="/" className={navLinkClass}>
                {t("nav.home")}
              </Link>
            </li>

            {user && (
              <li>
                <Link to={dashboardRoute} className={navLinkClass}>
                  {user.role === "admin"
                    ? t("nav.adminDashboard")
                    : t("nav.farmerDashboard")}
                </Link>
              </li>
            )}

            <li>
              <Link to="/about-us" className={navLinkClass}>
                {t("nav.aboutUs")}
              </Link>
            </li>

            {!user && (
              <>
                <li>
                  <Link to="/login" className={navLinkClass}>
                    {t("nav.login")}
                  </Link>
                </li>

                <li>
                  <Link to="/register" className={navLinkClass}>
                    {t("nav.register")}
                  </Link>
                </li>
              </>
            )}

            <li>
              <button
                type="button"
                aria-label={t("nav.switchLanguage")}
                onClick={cycleLanguage}
                className="navbarButtons text-gray-700/90 hover:text-gray-900 font-semibold px-4 py-2 rounded-full border border-white/45 bg-white/20"
                title={t("nav.switchLanguage")}
              >
                {t("nav.language")}: {languageShortCode[language]}
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-[76px] left-3 right-3 sm:left-4 sm:right-4 md:hidden liquid-glass navbar-transparent rounded-2xl p-3">
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
              <button
                type="button"
                aria-label={t("nav.switchLanguage")}
                onClick={cycleLanguage}
                className="w-full text-left navbarButtons text-gray-700/90 hover:text-gray-900 font-semibold px-4 py-2 rounded-full border border-white/45 bg-white/20"
              >
                {t("nav.language")}: {languageShortCode[language]}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
