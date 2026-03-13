import React from "react";
import Navbar from "../Components/Navbar";
import ProfileCard from "../Components/ProfileCard";
import shavigneshImage from "../assets/ShaVigneshImage.jpeg";
import shivaImage from "../assets/ShivaImage.jpeg";
import naveenImage from "../assets/myImage.jpeg";
import yashwanthImage from "../assets/yashwanthImage.jpeg";
import { useLanguage } from "../Context/LanguageContext";

const AboutUsPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <Navbar />

      <div className="w-full min-h-screen pt-28 pb-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-green-50/30 via-white to-emerald-50/30 relative overflow-hidden">
        {/* Vertical Path Line */}
        <div className="hidden md:block absolute left-1/2 top-48 bottom-32 w-1 bg-gradient-to-b from-green-300 via-emerald-400 to-green-500 -translate-x-1/2 rounded-full opacity-40"></div>

        <div className="max-w-6xl mx-auto relative">
          {/* Page Title */}
          <div className="text-center mb-20">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 ios-title tracking-tight">
              {t("aboutUs.title")}
            </h1>
            <p className="ios-body text-lg max-w-2xl mx-auto">
              {t("aboutUs.subtitle")}
            </p>
          </div>

          {/* Path Design - Team Members */}
          <div className="space-y-12 md:space-y-16 relative">
            {/* Team Member 1 - Shavignesh (Left) with Quote */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              <div className="w-full md:flex-1 md:flex md:justify-end">
                <ProfileCard
                  name="Shavignesh"
                  role={t("aboutUs.fullStackDeveloper")}
                  description={t("aboutUs.scalableSolutions")}
                  image={shavigneshImage}
                  gradient="from-blue-400 to-indigo-500"
                />
              </div>

              {/* Center Node */}
              <div className="hidden md:block w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg flex-shrink-0 z-10"></div>

              {/* Project Quote */}
              <div className="w-full md:flex-1">
                <div className="glass-card-green rounded-3xl p-6 sm:p-8 max-w-md md:max-w-md mx-auto">
                  <div className="text-4xl mb-4">🌾</div>
                  <p className="text-xl text-white/95 font-medium leading-relaxed relative z-10 italic">
                    {t("aboutUs.quote")}
                  </p>
                  <p className="mt-4 text-white/70 text-sm relative z-10">
                    {t("aboutUs.quoteAuthor")}
                  </p>
                </div>
              </div>
            </div>

            {/* Team Member 2 - Shiva (Right) */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              {/* Info Card */}
              <div className="w-full md:flex-1 md:flex md:justify-end">
                <div className="glass-card rounded-3xl p-6 max-w-sm mx-auto">
                  <h4 className="text-lg font-semibold ios-subtitle relative z-10 mb-2">
                    {t("aboutUs.whyProjectTitle")}
                  </h4>
                  <p className="ios-body relative z-10 text-sm leading-relaxed">
                    {t("aboutUs.whyProjectText")}
                  </p>
                </div>
              </div>

              {/* Center Node */}
              <div className="hidden md:block w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg flex-shrink-0 z-10"></div>

              {/* Member Card */}
              <div className="w-full md:flex-1">
                <ProfileCard
                  name="Shiva"
                  role={t("aboutUs.backendDeveloper")}
                  description={t("aboutUs.apiExpert")}
                  image={shivaImage}
                  gradient="from-purple-400 to-pink-500"
                />
              </div>
            </div>

            {/* Team Member 3 - Yashwanth (Left) */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              {/* Member Card */}
              <div className="w-full md:flex-1 md:flex md:justify-end">
                <ProfileCard
                  name="Yashwanth"
                  role={t("aboutUs.frontendDeveloper")}
                  description={t("aboutUs.beautifulUx")}
                  image={yashwanthImage}
                  gradient="from-orange-400 to-red-500"
                />
              </div>

              {/* Center Node */}
              <div className="hidden md:block w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg flex-shrink-0 z-10"></div>

              {/* Vision Card */}
              <div className="w-full md:flex-1">
                <div className="glass-card rounded-3xl p-6 max-w-sm mx-auto">
                  <h4 className="text-lg font-semibold ios-subtitle relative z-10 mb-2">
                    {t("aboutUs.visionCardTitle")}
                  </h4>
                  <p className="ios-body relative z-10 text-sm leading-relaxed">
                    {t("aboutUs.visionCardText")}
                  </p>
                </div>
              </div>
            </div>

            {/* Team Member 4 - Naveen (Right) */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              {/* Tech Stack Card */}
              <div className="w-full md:flex-1 md:flex md:justify-end">
                <div className="glass-card rounded-3xl p-6 max-w-sm mx-auto">
                  <h4 className="text-lg font-semibold ios-subtitle relative z-10 mb-2">
                    {t("aboutUs.techStackTitle")}
                  </h4>
                  <p className="ios-body relative z-10 text-sm leading-relaxed">
                    {t("aboutUs.techStackText")}
                  </p>
                </div>
              </div>

              {/* Center Node */}
              <div className="hidden md:block w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg flex-shrink-0 z-10"></div>

              {/* Member Card */}
              <div className="w-full md:flex-1">
                <ProfileCard
                  name="Naveen"
                  role={t("aboutUs.mernDesigner")}
                  description={t("aboutUs.seamlessExperience")}
                  image={naveenImage}
                  gradient="from-teal-400 to-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Bottom Section - Project Summary */}
          <div className="mt-16 md:mt-20">
            <div className="glass-card rounded-3xl p-10 text-center max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold ios-title mb-6 relative z-10">
                {t("aboutUs.togetherTitle")}
              </h2>
              <p className="text-base sm:text-lg ios-body leading-relaxed relative z-10 mb-8">
                {t("aboutUs.togetherText")}
              </p>
              <div className="flex justify-center gap-4 flex-wrap relative z-10">
                <span className="px-5 py-2.5 rounded-full bg-green-100/80 text-green-700 font-medium">
                  🌱 {t("aboutUs.tagSustainable")}
                </span>
                <span className="px-5 py-2.5 rounded-full bg-blue-100/80 text-blue-700 font-medium">
                  📊 {t("aboutUs.tagInsights")}
                </span>
                <span className="px-5 py-2.5 rounded-full bg-purple-100/80 text-purple-700 font-medium">
                  🤝 {t("aboutUs.tagFarmerFirst")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUsPage;
