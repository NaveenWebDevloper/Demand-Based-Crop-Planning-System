import React from "react";
import { useLanguage } from "../Context/LanguageContext";

const AboutPage = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full min-h-screen py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-green-50/30 via-white to-emerald-50/30">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 ios-title tracking-tight">
            {t("aboutProject.title")}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-green-400/80 to-emerald-500/80 mx-auto rounded-full"></div>
        </div>

        {/* Mission Section */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 mb-10">
          <h3 className="text-2xl font-semibold mb-4 relative z-10 ios-accent tracking-tight">
            {t("aboutProject.missionTitle")}
          </h3>
          <p className="text-base sm:text-lg leading-relaxed relative z-10 ios-body">
            {t("aboutProject.missionText")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          <div className="glass-card rounded-3xl p-6">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400/90 to-emerald-500/90 rounded-2xl flex items-center justify-center mb-4 relative z-10 shadow-lg">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-2 relative z-10 ios-subtitle">
              {t("aboutProject.marketAnalysisTitle")}
            </h4>
            <p className="relative z-10 ios-body">
              {t("aboutProject.marketAnalysisText")}
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400/90 to-emerald-500/90 rounded-2xl flex items-center justify-center mb-4 relative z-10 shadow-lg">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-2 relative z-10 ios-subtitle">
              {t("aboutProject.betterPricingTitle")}
            </h4>
            <p className="relative z-10 ios-body">
              {t("aboutProject.betterPricingText")}
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400/90 to-emerald-500/90 rounded-2xl flex items-center justify-center mb-4 relative z-10 shadow-lg">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-2 relative z-10 ios-subtitle">
              {t("aboutProject.communitySupportTitle")}
            </h4>
            <p className="relative z-10 ios-body">
              {t("aboutProject.communitySupportText")}
            </p>
          </div>
        </div>

        {/* Vision Section */}
        <div className="glass-card-green rounded-3xl p-6 sm:p-8">
          <h3 className="text-2xl font-semibold mb-4 relative z-10 text-white/95 tracking-tight">
            {t("aboutProject.visionTitle")}
          </h3>
          <p className="text-lg leading-relaxed relative z-10 text-gray-100/90">
            {t("aboutProject.visionText")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
