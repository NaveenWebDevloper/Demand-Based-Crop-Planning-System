import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { apiUrl } from "../config/api";
import { useAuth } from "../Context/AuthContext";
import { useLanguage } from "../Context/LanguageContext";
import ScrollReveal from "./ScrollReveal";

const MarketDemandCarousel = () => {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "farmer")) {
      fetchDemands();
    }
  }, [user]);

  const fetchDemands = async () => {
    setLoading(true);
    try {
      const res = await axios.get(apiUrl("/api/market/demand"), {
        withCredentials: true,
      });
      setDemands(res.data.demands || []);
    } catch (error) {
      console.error("Error fetching market demands:", error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" 
        ? scrollLeft - clientWidth * 0.8 
        : scrollLeft + clientWidth * 0.8;
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "farmer")) {
    return null;
  }

  if (loading && demands.length === 0) {
    return (
      <div className="w-full py-10 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (demands.length === 0) {
    return null;
  }

  return (
    <ScrollReveal yOffset={15} threshold={0.1}>
      <div className="w-full max-w-4xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 opacity-80">
            {t("farmer.marketDemand") || "Market Demands"}
          </h2>
        </div>

        <div className="relative group">
          <div 
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {demands.map((demand) => (
              <div 
                key={demand._id}
                className="min-w-[150px] sm:min-w-[180px] snap-center"
              >
                <div className="liquid-glass rounded-xl p-2 h-full flex flex-col hover:scale-[1.01] transition-transform duration-300 border-[0.5px]">
                  <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden mb-1.5 bg-gray-50">
                    {demand.imageUrl ? (
                      <img 
                        src={demand.imageUrl} 
                        alt={demand.crop} 
                        className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">
                        {demand.crop}
                      </div>
                    )}
                    <div className="absolute top-1 right-1">
                      <span className="px-1.5 py-0.5 rounded-full text-[6px] font-black uppercase bg-white/95 text-emerald-700 shadow-sm border border-emerald-50">
                        {demand.season}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-[11px] font-bold text-gray-800 leading-tight mb-1 truncate">{demand.crop}</h3>
                    <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                      <div className="bg-white/50 rounded-md py-0.5 px-1 border border-white/60">
                        <p className="text-[6px] uppercase text-gray-400 font-black leading-none mb-0.5">Qty</p>
                        <p className="text-[9px] font-bold text-gray-700 leading-none">{demand.quantity}{demand.quantityUnit}</p>
                      </div>
                      <div className="bg-white/50 rounded-md py-0.5 px-1 border border-white/60">
                        <p className="text-[6px] uppercase text-gray-400 font-black leading-none mb-0.5">Price</p>
                        <p className="text-[9px] font-bold text-emerald-700 leading-none">₹{demand.price}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Buttons at the bottom for a cleaner look */}
          <div className="flex justify-center gap-4 mt-1">
            <button
              onClick={() => scroll("left")}
              className="p-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/90 shadow-sm hover:bg-white transition-all active:scale-90"
              aria-label="Previous"
            >
              <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/90 shadow-sm hover:bg-white transition-all active:scale-90"
              aria-label="Next"
            >
              <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
};

export default MarketDemandCarousel;
