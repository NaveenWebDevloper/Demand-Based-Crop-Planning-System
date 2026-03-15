import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../Components/Navbar";
import farmerImage from "../assets/farmer-black-img.png";
import ScrollReveal from "../Components/ScrollReveal";
import { useLanguage } from "../Context/LanguageContext";
import { apiUrl } from "../config/api";
import { CloudRain, Wind, MapPin, ThermometerSun, Loader2 } from "lucide-react";

const HomePageContent = () => {
  const { t } = useLanguage();
  const fallbackMarketData = [
    {
      label: "Wheat (Govt MSP) - Punjab: Rs 2,425 / quintal",
      change: 0,
      state: "Punjab",
    },
    {
      label: "Paddy (Common) - Uttar Pradesh: Rs 2,300 / quintal",
      change: 0,
      state: "Uttar Pradesh",
    },
    {
      label: "Maize - Bihar: Rs 2,225 / quintal",
      change: 0,
      state: "Bihar",
    },
    {
      label: "Cotton (Medium Staple) - Gujarat: Rs 7,121 / quintal",
      change: 0,
      state: "Gujarat",
    },
    {
      label: "Tur (Arhar) - Madhya Pradesh: Rs 7,550 / quintal",
      change: 0,
      state: "Madhya Pradesh",
    },
    {
      label: "Mustard - Rajasthan: Rs 5,950 / quintal",
      change: 0,
      state: "Rajasthan",
    },
  ];

  const [liveMarketData, setLiveMarketData] = useState(fallbackMarketData);
  const [marketFeedInfo, setMarketFeedInfo] = useState({
    source: "Government Controlled Feed",
    refreshedAt: null,
    isFallback: true,
    hasStateData: false,
    hasAndhraOrTelangana: false,
  });

  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchLiveGovtData = async () => {
      try {
        const response = await fetch(apiUrl("/api/market/govt-live"), {
          method: "GET",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Live market API failed: ${response.status}`);
        }

        const payload = await response.json();
        const feed = Array.isArray(payload?.data) ? payload.data : [];
        const withStateCount = feed.filter(
          (entry) => entry?.state && String(entry.state).trim().length > 0,
        ).length;
        const hasAndhraOrTelangana = feed.some((entry) => {
          const state = String(entry?.state || "")
            .toLowerCase()
            .trim();
          return state === "andhra pradesh" || state === "telangana";
        });

        setMarketFeedInfo({
          source: payload?.source || "Government Controlled Feed",
          refreshedAt: payload?.refreshedAt || null,
          isFallback: Boolean(payload?.isFallback),
          hasStateData: withStateCount > 0,
          hasAndhraOrTelangana,
        });

        if (!feed.length) {
          setLiveMarketData(fallbackMarketData);
          return;
        }

        const formatted = feed
          .map((entry) => {
            const commodity = entry?.commodity || "Crop";
            const grade = entry?.grade ? ` (${entry.grade})` : "";
            const state = entry?.state ? ` - ${entry.state}` : "";
            const unit = entry?.unit || "quintal";
            const price = Number(entry?.livePrice);
            const change = Number(entry?.change) || 0;

            if (!Number.isFinite(price)) {
              return null;
            }

            return {
              label: `${commodity}${grade}${state}: Rs ${Math.round(price).toLocaleString("en-IN")} / ${unit}`,
              change,
              state: String(entry?.state || "").trim(),
            };
          })
          .filter(Boolean);

        setLiveMarketData(formatted.length ? formatted : fallbackMarketData);
      } catch (error) {
        if (error.name !== "AbortError") {
          setLiveMarketData(fallbackMarketData);
          setMarketFeedInfo((prev) => ({
            ...prev,
            isFallback: true,
          }));
        }
      }
    };

    fetchLiveGovtData();
    const intervalId = setInterval(fetchLiveGovtData, 60000);

    // Weather & Location Logic
    const fetchWeather = async (lat, lon) => {
      setWeatherLoading(true);
      try {
        const response = await fetch(apiUrl(`/api/weather?lat=${lat}&lon=${lon}`));
        const data = await response.json();
        if (data.success) {
          setWeatherData(data.data);
          setLocationError(null);
        } else {
          throw new Error(data.message || "Failed to fetch");
        }
      } catch (error) {
        console.error("Weather fetch failed:", error);
        setLocationError("Could not retrieve weather data.");
      } finally {
        setWeatherLoading(false);
      }
    };

    const detectLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeather(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            console.error("Geolocation error:", error);
            setLocationError("Please enable location access to see local weather.");
            setWeatherLoading(false);
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
        );
      } else {
        setLocationError("Geolocation not supported by your browser.");
        setWeatherLoading(false);
      }
    };

    detectLocation();

    return () => {
      controller.abort();
      clearInterval(intervalId);
    };
  }, []);

  const scrollingMarketData = useMemo(
    () => [...liveMarketData, ...liveMarketData],
    [liveMarketData],
  );

  const marketStatusLabel = marketFeedInfo.isFallback
    ? "Fallback feed"
    : "Official govt feed";

  const marketRefreshLabel = marketFeedInfo.refreshedAt
    ? new Date(marketFeedInfo.refreshedAt).toLocaleString("en-IN")
    : "Syncing...";

  const stateDataLabel = marketFeedInfo.hasStateData
    ? "State data: Available"
    : "State data: Not available";

  const apTelanganaLabel = marketFeedInfo.hasAndhraOrTelangana
    ? "Andhra Pradesh/Telangana data: Present"
    : "Andhra Pradesh/Telangana data: Not present in current feed";

  const getMarketPillStyle = (change) => {
    if (change > 0) {
      return {
        color: "#047857",
        background: "rgba(209, 250, 229, 0.92)",
        borderColor: "rgba(16, 185, 129, 0.7)",
      };
    }

    if (change < 0) {
      return {
        color: "#be123c",
        background: "rgba(255, 228, 230, 0.92)",
        borderColor: "rgba(244, 63, 94, 0.7)",
      };
    }

    return {
      color: "rgba(21, 128, 61, 0.96)",
      background: "rgba(220, 252, 231, 0.85)",
      borderColor: "rgba(34, 197, 94, 0.35)",
    };
  };

  const isAndhraOrTelangana = (state) => {
    const normalized = String(state || "")
      .toLowerCase()
      .trim();
    return normalized === "andhra pradesh" || normalized === "telangana";
  };

  const getHighlightStyle = (state) => {
    if (!isAndhraOrTelangana(state)) {
      return null;
    }

    return {
      boxShadow:
        "0 0 0 2px rgba(234, 179, 8, 0.55), 0 0 16px rgba(234, 179, 8, 0.22)",
      fontWeight: 700,
    };
  };

  return (
    <>
      <Navbar />
      <div className="w-full min-h-screen flex flex-col relative overflow-hidden pt-24 bg-gradient-to-br from-green-50/30 via-white to-emerald-50/30">

      {/* Decorative Floating Elements with Real Images */}
      <div className="hidden md:block absolute top-20 left-10 w-20 h-20 animate-orbit1 opacity-90">
        <img
          src="https://freepngimg.com/thumb/carrot/9-carrot-png-image.png"
          alt="Carrot"
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </div>
      <div className="hidden md:block absolute top-32 right-16 w-16 h-16 animate-orbit2 opacity-90">
        <img
          src="https://pngimg.com/d/tomato_PNG12589.png"
          alt="Tomato"
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </div>
      <div className="hidden md:block absolute top-[30%] left-[35%] w-14 h-14 animate-orbit3 opacity-80">
        <img
          src="https://pngimg.com/d/corn_PNG5287.png"
          alt="Corn"
          className="w-full h-full object-contain drop-shadow-md"
        />
      </div>
      <div className="hidden md:block absolute top-[45%] left-[15%] w-16 h-16 animate-orbit4 opacity-90">
        <img
          src="https://pngimg.com/d/grape_PNG2981.png"
          alt="Grapes"
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </div>
      <div className="hidden md:block absolute top-[50%] right-[18%] w-16 h-16 animate-orbit5 opacity-90">
        <img
          src="https://pngimg.com/d/orange_PNG802.png"
          alt="Orange"
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </div>
      <div className="hidden md:block absolute top-[25%] right-[30%] w-14 h-14 animate-orbit1 opacity-80">
        <img
          src="https://pngimg.com/d/cabbage_PNG8805.png"
          alt="Cabbage"
          className="w-full h-full object-contain drop-shadow-md"
        />
      </div>
      <div className="hidden md:block absolute top-[60%] left-[40%] w-12 h-12 animate-orbit2 opacity-80">
        <img
          src="https://pngimg.com/d/apple_PNG12405.png"
          alt="Apple"
          className="w-full h-full object-contain drop-shadow-md"
        />
      </div>
      <div className="hidden md:block absolute top-[35%] right-[40%] w-14 h-14 animate-orbit3 opacity-80">
        <img
          src="https://pngimg.com/d/lemon_PNG25198.png"
          alt="Lemon"
          className="w-full h-full object-contain drop-shadow-md"
        />
      </div>
      <div className="hidden md:block absolute bottom-48 right-48 w-16 h-16 animate-orbit4 opacity-90">
        <img
          src="https://freepngimg.com/thumb/broccoli/12-broccoli-png-image-with-transparent-background.png"
          alt="Broccoli"
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </div>
      <div className="hidden md:block absolute bottom-24 left-16 w-12 h-12 animate-orbit5 opacity-80">
        <img
          src="https://freepngimg.com/thumb/peach/4-peach-png-image.png"
          alt="Peach"
          className="w-full h-full object-contain drop-shadow-md"
        />
      </div>
      {/* Additional middle positioned images */}
      <div className="hidden md:block absolute top-[55%] left-[25%] w-14 h-14 animate-orbit1 opacity-75">
        <img
          src="https://pngimg.com/d/strawberry_PNG2598.png"
          alt="Strawberry"
          className="w-full h-full object-contain drop-shadow-md"
        />
      </div>
      <div className="hidden md:block absolute top-[40%] right-[35%] w-12 h-12 animate-orbit2 opacity-75">
        <img
          src="https://pngimg.com/d/potato_PNG7088.png"
          alt="Potato"
          className="w-full h-full object-contain drop-shadow-md"
        />
      </div>

      {/* Main Content */}
        <div className="w-full flex-1 flex items-center justify-center relative z-10 px-4 sm:px-6 pt-10 md:pt-0">
          <ScrollReveal duration={1.5} blurStrength={0} baseOpacity={0}>
            <div className="relative flex justify-center items-center group">
              {/* Subtle back-glow for the image */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-100/20 blur-[100px] rounded-full -z-10" />
              
              <img
                className="w-full max-w-[800px] h-auto md:max-h-[500px] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)]"
                src={farmerImage}
                alt="Farmer"
              />
            </div>
          </ScrollReveal>
        </div>

        {/* Unified Hero Dashboard (Both Mobile & Desktop Optimized) */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 relative z-30 -mt-10 md:-mt-20">
          <ScrollReveal yOffset={30} threshold={0.1}>
            <div className="flex flex-col items-center">
               {/* Desktop Only Titles (now in flow) */}
               <div className="hidden md:block text-center mb-10">
                  <h1 className="text-5xl lg:text-6xl font-black text-slate-800 tracking-tight mb-4">
                    {t("home.title")}
                  </h1>
                  <h2 className="text-2xl font-bold text-emerald-600">
                    {t("home.subtitle")}
                  </h2>
               </div>

               {/* Weather Widget Dashboard */}
               <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {/* Local Weather Highlights */}
                  <div className="md:col-span-1 bg-[#0f172a]/85 backdrop-blur-xl p-6 md:p-8 rounded-[35px] flex flex-col justify-center items-center text-center shadow-2xl border border-white/10">
                    {weatherLoading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-emerald-500" size={32} />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Checking...</span>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-amber-500/10 rounded-2xl mb-3 border border-amber-500/20">
                          <ThermometerSun size={32} className="text-amber-400" />
                        </div>
                        <div className="text-4xl font-black text-white tracking-tighter">
                          {weatherData?.temp || "--"}°C
                        </div>
                        <div className="text-[10px] font-black text-emerald-400 mt-2 px-2.5 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 uppercase tracking-tighter">
                          {weatherData?.condition || "Syncing..."}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Detailed Insights & Location */}
                  <div className="md:col-span-3 bg-[#0f172a]/85 backdrop-blur-xl p-6 md:p-8 rounded-[35px] flex flex-col md:flex-row items-center justify-between shadow-2xl gap-6 border border-white/10">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                      <div className="flex items-center gap-2 text-slate-300 font-extrabold text-[11px] uppercase tracking-widest mb-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                        <MapPin size={16} className="text-emerald-400" />
                        <span>Live Area: <span className="text-white border-b-2 border-emerald-400/30">{weatherData?.location || "Nearby Farm"}</span></span>
                      </div>
                      <p className="text-sm md:text-base text-slate-300 font-bold max-w-sm leading-relaxed">
                        Localized weather insights for smarter <span className="text-emerald-400">Crop Planning</span> and harvest precision.
                      </p>
                    </div>
                    
                    <div className="flex gap-10 md:pr-4">
                        <div className="flex flex-col items-center">
                          <div className="p-3.5 bg-blue-500/10 rounded-2xl mb-2 border border-blue-500/20">
                            <CloudRain size={26} className="text-blue-400" />
                          </div>
                          <div className="text-xl font-black text-white">{weatherData?.humidity || "--"}%</div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Humidity</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="p-3.5 bg-teal-500/10 rounded-2xl mb-2 border border-teal-500/20">
                            <Wind size={26} className="text-teal-400" />
                          </div>
                          <div className="text-xl font-black text-white">{weatherData?.windSpeed || "--"} <span className="text-[10px] font-bold text-slate-400">m/s</span></div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Wind</div>
                        </div>
                    </div>
                  </div>
               </div>

               {/* Government Market Ticker Section (Enhanced) */}
               <div className="w-full liquid-glass rounded-[35px] p-6 md:p-8 shadow-2xl border border-emerald-500/10">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Live Market Watch</span>
                      </div>
                    </div>
                    
                    <div className="text-[10px] md:text-xs font-bold text-emerald-800/70 text-center uppercase tracking-wider flex items-center gap-3 bg-white/40 px-4 py-2 rounded-full border border-emerald-100">
                      <span>{marketStatusLabel}</span>
                      <span className="opacity-30">|</span>
                      <span>{marketFeedInfo.source}</span>
                      <span className="opacity-30">|</span>
                      <span>Updated: {marketRefreshLabel}</span>
                    </div>
                  </div>

                  {/* The Ticker Track */}
                  <div className="w-full overflow-hidden bg-gradient-to-r from-emerald-50/50 via-white/40 to-emerald-50/50 rounded-2xl border border-white/60 py-5 shadow-inner">
                    <div className="market-ticker-track">
                      {scrollingMarketData.map((item, index) => (
                        <span
                          key={`${item.label}-${index}`}
                          className="market-pill !bg-white/80 !border-white/90 shadow-sm"
                          style={{
                            ...getMarketPillStyle(item.change),
                            ...getHighlightStyle(item.state),
                          }}
                        >
                          {item.label}
                          {isAndhraOrTelangana(item.state) && (
                            <span className="ml-1 text-amber-700 font-extrabold text-[10px]">
                              [AP/TG]
                            </span>
                          )}
                          <span className="ml-2 font-black text-sm">
                            {item.change > 0
                              ? `(+₹${Math.abs(item.change).toLocaleString("en-IN")})`
                              : item.change < 0
                                ? `(-₹${Math.abs(item.change).toLocaleString("en-IN")})`
                                : ""}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-1.5 border-r border-slate-200 pr-4">{stateDataLabel}</span>
                    <span className={`flex items-center gap-1.5 ${marketFeedInfo.hasAndhraOrTelangana ? "text-amber-600" : "text-slate-400"}`}>
                       Regional Insights: {marketFeedInfo.hasAndhraOrTelangana ? "Enabled" : "Syncing..."}
                    </span>
                  </div>

                  <p className="mt-4 text-center text-[10px] font-bold text-slate-400 bg-slate-50 py-2 rounded-xl border border-slate-100 italic">
                    Note: This is experimental data. Please verify current mandi rates before making cultivation decisions.
                  </p>
               </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
};

export default HomePageContent;
