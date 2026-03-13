import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../Components/Navbar";
import farmerImage from "../assets/farmer-black-img.png";
import { useLanguage } from "../Context/LanguageContext";
import { apiUrl } from "../config/api";
import ScrollReveal from "../Components/ScrollReveal";

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
    <div className="w-full min-h-screen flex flex-col relative overflow-hidden pt-24 bg-gradient-to-br from-green-50/30 via-white to-emerald-50/30">
      <Navbar />

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
      <ScrollReveal
        baseOpacity={0.1}
        enableBlur
        baseRotation={2}
        blurStrength={3}
      >
        <div className="w-full flex-1 flex items-center justify-center relative z-10 px-4 sm:px-6">
          <div className="imageDiv w-full max-w-5xl flex flex-col items-center justify-center rounded-lg pb-8 md:pb-20">
            <h1 className="md:hidden text-3xl sm:text-4xl font-bold text-center tracking-wide text-gray-700 px-2">
              {t("home.title")}
            </h1>
            <h2 className="md:hidden text-lg sm:text-xl text-center mt-3 mb-6 font-bold text-green-500">
              {t("home.subtitle")}
            </h2>
            <div className="md:hidden w-full max-w-2xl px-1 mb-5">
              <div className="market-ticker-box">
                <p className="market-ticker-title">
                  Government Controlled Live Market Data
                </p>
                <div className="text-[11px] sm:text-xs text-center text-green-900/85 font-medium mb-2">
                  <span>{marketStatusLabel}</span>
                  <span className="mx-2">|</span>
                  <span>Source: {marketFeedInfo.source}</span>
                  <span className="mx-2">|</span>
                  <span>Updated: {marketRefreshLabel}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-center text-emerald-800 font-semibold mb-2 px-2">
                  {stateDataLabel}
                </p>
                <p
                  className={`text-[11px] sm:text-xs text-center font-semibold mb-2 px-2 ${
                    marketFeedInfo.hasAndhraOrTelangana
                      ? "text-emerald-700"
                      : "text-rose-700"
                  }`}
                >
                  {apTelanganaLabel}
                </p>
                <p className="text-[11px] sm:text-xs text-center text-amber-700 font-semibold mb-2 px-2">
                  Note: This is experimental data. Please verify rates before
                  cultivation decisions.
                </p>
                <div
                  className="market-ticker"
                  role="region"
                  aria-label="Government controlled live market data"
                >
                  <div className="market-ticker-track">
                    {scrollingMarketData.map((item, index) => (
                      <span
                        key={`${item.label}-${index}`}
                        className="market-pill"
                        style={{
                          ...getMarketPillStyle(item.change),
                          ...getHighlightStyle(item.state),
                        }}
                      >
                        {item.label}
                        {isAndhraOrTelangana(item.state) && (
                          <span className="ml-1 text-amber-700 font-extrabold">
                            [AP/TG]
                          </span>
                        )}
                        <span className="ml-1 font-bold">
                          {item.change > 0
                            ? `(+Rs ${Math.abs(item.change).toLocaleString("en-IN")})`
                            : item.change < 0
                              ? `(-Rs ${Math.abs(item.change).toLocaleString("en-IN")})`
                              : "(Rs 0)"}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <img
              className="w-full max-w-[900px] h-auto md:h-[500px] object-cover rounded-lg mb-4 md:mb-10 drop-shadow-2xl"
              src={farmerImage}
              alt="Farmer"
            />
          </div>
          <div className="heading-div hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/12 pt-10">
            <h1 className="text-4xl font-bold text-center mt-28 tracking-wide mix-blend-color-dodge text-gray-600">
              {t("home.title")}
            </h1>
            <h2 className="text-xl text-center mt-4 font-bold text-green-500">
              {t("home.subtitle")}
            </h2>
            <div className="w-[min(78vw,1000px)] mt-5">
              <div className="market-ticker-box">
                <p className="market-ticker-title">
                  Government Controlled Live Market Data
                </p>
                <div className="text-xs text-center text-green-900/85 font-medium mb-2">
                  <span>{marketStatusLabel}</span>
                  <span className="mx-2">|</span>
                  <span>Source: {marketFeedInfo.source}</span>
                  <span className="mx-2">|</span>
                  <span>Updated: {marketRefreshLabel}</span>
                </div>
                <p className="text-xs text-center text-emerald-800 font-semibold mb-2 px-2">
                  {stateDataLabel}
                </p>
                <p
                  className={`text-xs text-center font-semibold mb-2 px-2 ${
                    marketFeedInfo.hasAndhraOrTelangana
                      ? "text-emerald-700"
                      : "text-rose-700"
                  }`}
                >
                  {apTelanganaLabel}
                </p>
                <p className="text-xs text-center text-amber-700 font-semibold mb-2 px-2">
                  Note: This is experimental data. Please verify rates before
                  cultivation decisions.
                </p>
                <div
                  className="market-ticker"
                  role="region"
                  aria-label="Government controlled live market data"
                >
                  <div className="market-ticker-track">
                    {scrollingMarketData.map((item, index) => (
                      <span
                        key={`${item.label}-${index}`}
                        className="market-pill"
                        style={{
                          ...getMarketPillStyle(item.change),
                          ...getHighlightStyle(item.state),
                        }}
                      >
                        {item.label}
                        {isAndhraOrTelangana(item.state) && (
                          <span className="ml-1 text-amber-700 font-extrabold">
                            [AP/TG]
                          </span>
                        )}
                        <span className="ml-1 font-bold">
                          {item.change > 0
                            ? `(+Rs ${Math.abs(item.change).toLocaleString("en-IN")})`
                            : item.change < 0
                              ? `(-Rs ${Math.abs(item.change).toLocaleString("en-IN")})`
                              : "(Rs 0)"}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Bottom Decorative Strip */}
    </div>
  );
};

export default HomePageContent;
