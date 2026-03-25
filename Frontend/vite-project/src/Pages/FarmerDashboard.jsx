import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { apiUrl } from "../config/api";
import { useLanguage } from "../Context/LanguageContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../Components/ui/carousel";
import { Card, CardContent } from "../Components/ui/card";
import ScrollReveal from "../Components/ScrollReveal";
import { UserPen } from "lucide-react";
import CropRecommendationSection from "../Components/CropRecommendationSection";
import DemandHeatmap from "../Components/DemandHeatmap";
import HelpDesk from "../Components/HelpDesk";


const FarmerDashboard = () => {
  const [marketDemands, setMarketDemands] = useState([]);
  const [loadingDemands, setLoadingDemands] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    fetchMarketDemands();
  }, []);

  const fetchMarketDemands = async () => {
    setLoadingDemands(true);
    try {
      const res = await axios.get(apiUrl("/api/market/demand"), {
        withCredentials: true,
      });
      setMarketDemands(res.data.demands || []);
    } catch (error) {
      console.error("Error fetching market demands:", error);
      setMarketDemands([]);
    } finally {
      setLoadingDemands(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getSeasonBadge = (season) => {
    const normalizedSeason = (season || "").toLowerCase().trim();

    if (normalizedSeason === "summer" || normalizedSeason === "hot") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border bg-orange-100 text-orange-700 border-orange-200">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364l-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0L16.95 7.05M7.05 16.95l-1.414 1.414M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          {season}
        </span>
      );
    }

    if (normalizedSeason === "winter") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border bg-sky-100 text-sky-700 border-sky-200">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 2v20m0-20 3 3m-3-3-3 3m3 17-3-3m3 3 3-3M4.93 4.93l14.14 14.14M4.93 19.07 19.07 4.93M2 12h20"
            />
          </svg>
          {season}
        </span>
      );
    }

    if (
      normalizedSeason === "rainy" ||
      normalizedSeason === "rain" ||
      normalizedSeason === "monsoon"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border bg-blue-100 text-blue-700 border-blue-200">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 15a4 4 0 004 4h8a4 4 0 10-.436-7.976A5.5 5.5 0 004 11.5 3.5 3.5 0 003 15zm6 4v2m3-2v2m3-2v2"
            />
          </svg>
          {season}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border bg-slate-100 text-slate-700 border-slate-200">
        {season || "N/A"}
      </span>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 px-2 md:px-4 bg-gradient-to-br from-green-50/40 via-white to-emerald-50/40">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="glass-card rounded-3xl p-8 mb-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex items-center gap-6">
                {/* Profile Image */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 p-0.5 shadow-xl">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                      {user?.profileImage?.url ? (
                        <img 
                          src={user.profileImage.url} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-green-600 bg-green-50">
                          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  </div>
                </div>

                <div>
                  <h1 className="text-3xl font-bold ios-title mb-2">
                    {t("farmer.welcome")}, {user?.name}!
                  </h1>
                  <p className="ios-body text-gray-600 mb-4">
                    {t("farmer.manageFarm")}
                  </p>
                  <button
                    onClick={() => navigate("/profile")}
                    className="px-4 py-2 bg-green-100 text-green-600 font-bold rounded-xl flex items-center gap-2 hover:bg-green-200 transition-all active:scale-95 shadow-sm border border-green-200"
                  >
                    <UserPen className="w-4 h-4" />
                    {t("Edit Profile") || "Edit Details"}
                  </button>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
              >
                {t("farmer.logout")}
              </button>
            </div>
          </div>
          
          <div className="mb-8">
            <CropRecommendationSection />
          </div>

          {/* Market Demand View */}
          <div className="glass-card rounded-2xl px-2 py-6 md:p-8 mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {t("farmer.marketDemand")}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-slate-600 text-sm font-medium">
                    {t("farmer.latestDemand")}
                  </p>
                  <span
                    className="relative inline-flex h-2 w-2"
                    aria-label="Live data"
                  >
                    <span className="absolute -inset-1.5 inline-flex rounded-full bg-green-400 opacity-75 animate-ping [animation-duration:2s]"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                  </span>
                </div>
              </div>
              <button
                onClick={fetchMarketDemands}
                className="px-4 py-2 bg-green-400 text-slate-900 font-semibold rounded-lg"
              >
                {t("farmer.refresh")}
              </button>
            </div>

            {loadingDemands ? (
              <div className="py-10 text-center text-slate-500">
                {t("farmer.loadingDemand")}
              </div>
            ) : marketDemands.length === 0 ? (
              <div className="py-10 text-center text-slate-500">
                {t("farmer.noDemand")}
              </div>
            ) : (
              <ScrollReveal yOffset={20} duration={1.2}>
                <div className="w-full -mx-2 sm:mx-0 sm:px-4 md:px-12">
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2 md:-ml-4">
                    {marketDemands.map((demand) => (
                      <CarouselItem 
                        key={demand._id} 
                        className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                      >
                        <div className="p-1">
                          <Card className="overflow-hidden border-slate-200 hover:shadow-lg transition-all duration-300 rounded-2xl group">
                            <div className="relative h-48 overflow-hidden bg-slate-100">
                              {demand.imageUrl ? (
                                <img
                                  src={demand.imageUrl}
                                  alt={demand.crop}
                                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
                                  {t("farmer.noImage")}
                                </div>
                              )}
                              <div className="absolute top-3 right-3">
                                {getSeasonBadge(demand.season)}
                              </div>
                            </div>
                            <CardContent className="p-5">
                              <h3 className="text-xl font-bold text-slate-900 mb-3 truncate">
                                {demand.crop}
                              </h3>
                              
                              <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-500">{t("farmer.quantityLabel")}:</span>
                                  <span className="font-semibold text-slate-800">
                                    {demand.quantity} {demand.quantityUnit || "kg"}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-500">{t("farmer.pricePerUnit")}:</span>
                                  <span className="font-semibold text-slate-800">
                                    ₹{demand.price}/{demand.quantityUnit || "kg"}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-500">{t("farmer.regionLabel")}:</span>
                                  <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                                    {demand.region}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() =>
                                  navigate("/farmer/revenue", {
                                    state: { demandId: demand._id },
                                  })
                                }
                                className="w-full py-2 bg-green-400 hover:bg-green-300 text-gray-600 font-bold rounded-2xl transition-colors shadow-sm active:scale-95"
                              >
                                {t("farmer.estimateRevenue")}
                              </button>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden md:flex -left-12" />
                  <CarouselNext className="hidden md:flex -right-12" />
                </Carousel>
              </div>
            </ScrollReveal>
          )}
          </div>

          <div className="mb-8">
            <DemandHeatmap />
          </div>
          
          <HelpDesk />
        </div>
      </div>
    </>
  );
};

export default FarmerDashboard;
