import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { apiUrl } from "../config/api";

const FarmerDashboard = () => {
  const [marketDemands, setMarketDemands] = useState([]);
  const [loadingDemands, setLoadingDemands] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
      <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-green-50/40 via-white to-emerald-50/40">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="glass-card rounded-3xl p-8 mb-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold ios-title mb-2">
                  Welcome, {user?.name}!
                </h1>
                <p className="ios-body text-gray-600">
                  Manage your farm activities and crops
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Market Demand View */}
          <div className="glass-card rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Market Demand
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-slate-600 text-sm font-medium">
                    Latest demand shared by admin
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
                Refresh
              </button>
            </div>

            {loadingDemands ? (
              <div className="py-10 text-center text-slate-500">
                Loading market demand...
              </div>
            ) : marketDemands.length === 0 ? (
              <div className="py-10 text-center text-slate-500">
                No market demand available right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {marketDemands.map((demand) => (
                  <article
                    key={demand._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 p-1.5">
                      <div className="h-60 md:h-64 rounded-lg overflow-hidden bg-slate-100">
                        {demand.imageUrl ? (
                          <img
                            src={demand.imageUrl}
                            alt={demand.crop}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
                            No image available
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-5">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <h3 className="text-2xl font-bold text-slate-900">
                          {demand.crop}
                        </h3>
                        {getSeasonBadge(demand.season)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm font-medium p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div>
                          <p className="text-slate-500">Season</p>
                          <div className="mt-1">
                            {getSeasonBadge(demand.season)}
                          </div>
                        </div>
                        <div>
                          <p className="text-slate-500">Quantity</p>
                          <p className="font-semibold text-slate-800">
                            {demand.quantity} {demand.quantityUnit || "kg"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Price Per Unit</p>
                          <p className="font-semibold text-slate-800">
                            {demand.price} / {demand.quantityUnit || "kg"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Region</p>
                          <p className="font-semibold text-slate-800">
                            {demand.region}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          navigate("/farmer/revenue", {
                            state: { demandId: demand._id },
                          })
                        }
                        className="mt-5 w-full px-4 py-2.5 bg-green-400 text-slate-900 font-semibold rounded-lg"
                      >
                        Estimate Revenue for This Crop
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="glass-card rounded-2xl p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-semibold">{user?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-semibold">{user?.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FarmerDashboard;
