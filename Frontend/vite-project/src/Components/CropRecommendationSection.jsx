import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiUrl } from "../config/api";
import { useAuth } from "../Context/AuthContext";
import { useLanguage } from "../Context/LanguageContext";
import { Card, CardContent } from "./ui/card";
import { Loader2, TrendingUp, Droplets, AlertTriangle, IndianRupee, Sprout, X, MapPin, Calendar } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CropRecommendationSection = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [loadingForecast, setLoadingForecast] = useState(false);
    const { user } = useAuth();
    const { t } = useLanguage();

    useEffect(() => {
        if (user?.id) {
            fetchRecommendations();
        }
    }, [user]);

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            // --- RAW GOVT API PROOF ---
            let liveApiWorking = false;
            try {
                // Fetching 1000 records so we can see the full scope of the live data
                const govtApiUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd0000019ed47d67d4794706635bb39297c5bfea&format=json&limit=1000';
                const govtRes = await axios.get(govtApiUrl);
                
                console.group("%c🏛️ LIVE GOVT DATA.GOV.IN FETCH", "color: #10b981; font-weight: bold; background: #ecfdf5; padding: 4px; border-radius: 4px;");
                console.log(`Govt API records found: ${govtRes.data.records?.length || 0}`);
                if (govtRes.data.records && govtRes.data.records.length > 0) {
                    liveApiWorking = true;
                    console.table(govtRes.data.records);
                } else {
                    console.warn("API connected but 'records' array was empty. Check filters!");
                }
                console.groupEnd();

            } catch (rawApiErr) {
                console.group("%c⚠️ GOVT API METADATA / CORS ERROR", "color: #f59e0b; font-weight: bold; padding: 4px;");
                console.warn("Live market data fetch failed:", rawApiErr.message);
                console.log("Fallback: Using locally stored historical MongoDB data.");
                console.groupEnd();
            }
            // --------------------------

            const res = await axios.get(apiUrl(`/api/recommendation/${user.id}`), {
                withCredentials: true,
            });
            
            const enrichedRecs = (res.data.recommendations || []).map(r => ({
                ...r,
                dataSourceStatus: liveApiWorking ? "Live Mandi Data" : "Historical/Predicted Trends"
            }));

            console.log("🔥 [Enhanced Backend Analytics] Recommendations JSON Payload: ", enrichedRecs);
            setRecommendations(enrichedRecs);
        } catch (error) {
            console.error("Error fetching recommendations:", error);
            setRecommendations([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchForecast = async (crop_name) => {
        setSelectedCrop(crop_name);
        setLoadingForecast(true);
        try {
            const res = await axios.get(apiUrl(`/api/recommendation/forecast?crop_name=${encodeURIComponent(crop_name)}`), {
                withCredentials: true,
            });
            if (res.data.success && res.data.data.forecast) {
                setForecastData(res.data.data.forecast);
            }
        } catch (error) {
            console.error("Error fetching price forecast:", error);
        } finally {
            setLoadingForecast(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 glass-card rounded-3xl">
                <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Analyzing farm data and market trends...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {(!user?.soil_type || !user?.land_size_acres) && (
                <div className="p-4 glass-card rounded-2xl border-l-4 border-l-amber-400 bg-amber-50/30 mb-6 group transition-all hover:bg-amber-50/50">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                            <p className="text-amber-800 text-sm font-medium">
                                <strong className="font-bold">Personalize your results!</strong> Update your farm details (Soil, Land Size) in profile for 100% accurate AI mapping.
                            </p>
                        </div>
                        <button 
                            onClick={() => window.location.href='/profile'}
                            className="px-4 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                        >
                            Update Profile
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">

                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="text-green-600" />
                        AI-Powered Recommendations
                    </h2>
                    <p className="text-slate-500 text-sm">Best crops for your farm based on soil, weather, & demand</p>
                </div>
                <button 
                    onClick={fetchRecommendations}
                    className="text-sm font-bold text-green-600 hover:text-green-700 underline"
                >
                    Refresh Analysis
                </button>
            </div>

            <div className={`grid grid-cols-1 ${recommendations.length > 0 ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-6`}>
                {recommendations.length > 0 ? (
                    recommendations.slice(0, 3).map((rec, index) => (
                        <ScrollReveal key={rec.crop_name} yOffset={20} duration={0.8 + index * 0.2}>
                            <Card className={`relative overflow-hidden border-none shadow-xl rounded-[2rem] group transition-all duration-500 hover:-translate-y-2 ${index === 0 ? 'ring-2 ring-green-500 ring-offset-4' : ''}`}>
                                {index === 0 && (
                                    <div className="absolute top-0 right-0 bg-green-500 text-white px-6 py-1.5 rounded-bl-[1.5rem] font-bold text-xs z-10 shadow-lg">
                                        TOP PICK
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 bg-gradient-to-br from-white via-white/80 to-transparent z-0"></div>
                                
                                <CardContent className="p-8 relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`p-4 rounded-2xl ${index === 0 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                                            <Sprout size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{rec.crop_name}</h3>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${rec.score}%` }}></div>
                                                </div>
                                                <span className="text-xs font-bold text-green-600">{rec.score}% Match</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase mb-1">
                                                <IndianRupee size={10} /> Market Price
                                            </div>
                                            {rec.live_market ? (
                                                <p className="text-lg font-black text-slate-800">
                                                    ₹{rec.live_market.modal_price.toLocaleString()}<span className="text-xs text-slate-500 font-normal"> /qtl</span>
                                                </p>
                                            ) : (
                                                <p className="text-sm font-black text-slate-500">Wait for Market Update</p>
                                            )}
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                            <div className="flex items-center justify-between gap-1 mb-1">
                                                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                                    <TrendingUp size={10} /> Min - Max Range
                                                </div>
                                            </div>
                                            {rec.live_market ? (
                                                 <p className="text-[11px] font-bold text-slate-700">
                                                     ₹{rec.live_market.min_price} <span className="text-slate-400 font-normal">-</span> ₹{rec.live_market.max_price}
                                                </p>
                                            ) : (
                                                <p className="text-sm font-black text-slate-500">N/A</p>
                                            )}
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase mb-1">
                                                <Droplets size={10} /> Water Req.
                                            </div>
                                            <p className="text-sm font-black text-slate-800 uppercase">{rec.water_requirement}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase mb-1">
                                                <AlertTriangle size={10} /> Oversupply Risk
                                            </div>
                                            <p className={`text-sm font-black uppercase ${rec.risk === 'Low' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {rec.risk}
                                            </p>
                                        </div>
                                    </div>

                                    {rec.live_market && (
                                        <div className="mb-6 p-4 bg-slate-50/80 rounded-2xl border border-slate-100/50 backdrop-blur-sm">
                                            <div className="flex items-center justify-between mb-3 border-b border-slate-200/50 pb-2">
                                                <div className="flex items-center gap-2 bg-emerald-100/50 px-2 py-1 rounded-md">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                                    <span className="text-[9px] font-black text-emerald-700 tracking-wider">OFFICIAL GOVT DATA</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400">Arrivals: {rec.live_market.arrival?.toLocaleString()} qtl</span>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <MapPin size={14} className="text-green-600" />
                                                    <span className="text-xs font-bold truncate">{rec.live_market.market_name}, {rec.live_market.state}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <Calendar size={14} />
                                                    <span className="text-[10px] font-medium">{new Date(rec.live_market.date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button 
                                        onClick={() => fetchForecast(rec.crop_name)}
                                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 group/btn"
                                    >
                                        View Future Price Forecast
                                        <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                    </button>
                                </CardContent>
                            </Card>
                        </ScrollReveal>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center glass-card rounded-3xl border border-dashed border-slate-300">
                        <Loader2 className="w-8 h-8 text-slate-300 mx-auto mb-3 animate-pulse" />
                        <h4 className="text-lg font-bold text-slate-500">No Recommendations Available</h4>
                        <p className="text-slate-400 text-sm italic">Failed to fetch data from AI service. Please ensure the AI service is running.</p>
                    </div>
                )}
            </div>


            {/* Forecast Modal */}
            {selectedCrop && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
                        <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-between text-white">
                            <div>
                                <h3 className="text-2xl font-black">{selectedCrop}</h3>
                                <p className="text-green-50 text-sm font-medium">3-Month Price Forecast (AI Powered)</p>
                            </div>
                            <button 
                                onClick={() => { setSelectedCrop(null); setForecastData(null); }}
                                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-8">
                            {loadingForecast ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-4" />
                                    <p className="text-slate-500 font-medium">Running Prophet Time-Series Model...</p>
                                </div>
                            ) : forecastData ? (
                                <div className="space-y-6">
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={value => `₹${value}`} />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                                                    cursor={{stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4'}}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="predicted_price" 
                                                    name="Predicted Price / Qtl"
                                                    stroke="#10b981" 
                                                    strokeWidth={4}
                                                    dot={{ r: 6, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }}
                                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                                        <p className="text-emerald-800 text-sm">
                                            <strong className="font-bold">AI Insight:</strong> Market signals indicate {forecastData[0]?.predicted_price < forecastData[forecastData.length - 1]?.predicted_price ? 'an upward' : 'a stable or softening'} trend for {selectedCrop} prices in the coming months. Consider these projections when planning your harvest timing.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    Failed to generate forecast
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CropRecommendationSection;
