import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { apiUrl } from '../config/api';
import Navbar from './Navbar';
import { Loader2, Map as MapIcon, Info } from 'lucide-react';

const DemandHeatmap = () => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);

    // Default center for India — shows entire subcontinent at zoom 5
    const center = [22.5937, 82.9629];

    const fetchData = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        try {
            const res = await axios.get(apiUrl('/api/heatmap/regional-demand'));
            
            const regionsWithCoords = res.data.data.map(item => {
                const coords = {
                    // Telangana/AP
                    'Hyderabad': [17.3850, 78.4867],
                    'Medchal': [17.6297, 78.4814],
                    'Rangareddy': [17.3616, 78.4747],
                    'Sangareddy': [17.6132, 78.0816],
                    'Nizamabad': [18.6725, 78.0941],
                    'Warangal': [17.9689, 79.5941],
                    'Khammam': [17.2473, 80.1514],
                    'Karimnagar': [18.4386, 79.1288],
                    'Mahbubnagar': [16.7333, 77.9833],
                    // Maharashtra
                    'Pune': [18.5204, 73.8567],
                    'Mumbai': [19.0760, 72.8777],
                    'Nagpur': [21.1458, 79.0882],
                    'Nashik': [19.9975, 73.7898],
                    // Karnataka
                    'Bangalore': [12.9716, 77.5946],
                    'Mysore': [12.2958, 76.6394],
                    // Tamil Nadu
                    'Chennai': [13.0827, 80.2707],
                    'Coimbatore': [11.0168, 76.9558],
                    // Gujarat
                    'Ahmedabad': [23.0225, 72.5714],
                    'Surat': [21.1702, 72.8311],
                    // North India
                    'Delhi': [28.6139, 77.2090],
                    'Lucknow': [26.8467, 80.9462],
                    'Jaipur': [26.9124, 75.7873],
                    'Amritsar': [31.6340, 74.8723]
                };
                
                // Fallback to static distribution across India if region not found
                return {
                    ...item,
                    position: coords[item.region] || [
                        20.5937 + (Math.random() * 10 - 5), 
                        78.9629 + (Math.random() * 10 - 5)
                    ]
                };
            });
            setHeatmapData(regionsWithCoords);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            console.error("Heatmap fetch error:", err);
            setError("Failed to load heatmap data. Please check your backend connection.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Real-time polling every 60 seconds
        const interval = setInterval(() => fetchData(), 60000);
        return () => clearInterval(interval);
    }, []);


    const getColor = (demandLevel) => {
        switch (demandLevel) {
            case 'high': return '#22c55e'; // Green
            case 'medium': return '#eab308'; // Yellow
            case 'low': return '#ef4444'; // Red (Oversupply/Low Demand)
            default: return '#64748b';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium tracking-tight">Loading demand heatmap...</p>
            </div>
        );
    }

    if (error && heatmapData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
                <MapIcon className="w-14 h-14 text-slate-300 mb-4" />
                <p className="text-slate-700 font-semibold text-lg mb-1">Heatmap Unavailable</p>
                <p className="text-slate-400 text-sm max-w-sm">{error}</p>
                <button onClick={() => fetchData(true)} className="mt-4 px-5 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-6 border-b border-slate-50 flex flex-wrap justify-between items-center bg-gradient-to-r from-slate-50 to-white gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 text-green-600 rounded-xl">
                        <MapIcon size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 tracking-tight">Regional Demand Heatmap</h3>
                        <p className="text-[10px] text-slate-400 font-medium">Last updated: {lastUpdated.toLocaleTimeString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> High
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Med
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Risk
                        </div>
                    </div>
                    <button 
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-600 active:scale-95 disabled:opacity-50"
                    >
                        <Loader2 size={18} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>


            <div className="h-[500px] w-full relative z-0">
                <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {heatmapData.map((region, idx) => (
                        <CircleMarker
                            key={idx}
                            center={region.position}
                            radius={20 + (region.totalVolume / 1000)} // Dynamic size
                            fillColor={getColor(region.demandLevel)}
                            color="#fff"
                            weight={2}
                            opacity={0.8}
                            fillOpacity={0.6}
                        >
                            <Popup className="custom-popup">
                                <div className="p-1">
                                    <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-2">{region.region}</h4>
                                    <div className="space-y-1 text-xs">
                                        <p className="flex justify-between">
                                            <span className="text-slate-500 font-bold uppercase text-[9px]">Arrival Volume:</span>
                                            <span className="font-bold">{region.totalVolume.toLocaleString()} units</span>
                                        </p>
                                        <p className="flex justify-between">
                                            <span className="text-slate-500 font-bold uppercase text-[9px]">Avg Price:</span>
                                            <span className="font-bold">₹{Math.round(region.avgPrice)}</span>
                                        </p>
                                        <p className="flex justify-between">
                                            <span className="text-slate-500 font-bold uppercase text-[9px]">Status:</span>
                                            <span className={`font-bold capitalize ${region.demandLevel === 'high' ? 'text-green-600' : (region.demandLevel === 'medium' ? 'text-yellow-600' : 'text-red-500')}`}>
                                                {region.demandLevel === 'high' ? 'High Demand' : (region.demandLevel === 'medium' ? 'Healthy' : 'Oversupply')}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-slate-50">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Top Crops</p>
                                        <div className="flex flex-wrap gap-1">
                                            {region.crops.slice(0, 3).map(crop => (
                                                <span key={crop} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md text-[9px] font-bold">
                                                    {crop}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
                
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/50 z-[1000] max-w-[200px]">
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-800">
                        <Info size={14} className="text-blue-500" />
                        Heatmap Guide
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                        Circle size represents arrival volume. Colors indicate demand vs supply ratio. Grow crops in high demand regions for better profits.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DemandHeatmap;
