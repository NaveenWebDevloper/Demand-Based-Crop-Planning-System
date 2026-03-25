import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import Navbar from "../Components/Navbar";
import { useLanguage } from "../Context/LanguageContext";
import ProfileCard from "../Components/ProfileCard";
import axios from "axios";
import { apiUrl } from "../config/api";
import { UserPen, Save, X, Camera, Loader2, Mail, Phone, MapPin, User } from "lucide-react";

const ProfilePage = () => {
  const { user, checkAuth } = useAuth();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        state: user.state || "",
        district: user.district || "",
        village: user.village || "",
        land_size_acres: user.land_size_acres || "",
        soil_type: user.soil_type || "",
        irrigation_type: user.irrigation_type || "rainfed",
        water_availability: user.water_availability || "medium",
        previous_crop: user.previous_crop || "",
        sowing_season: user.sowing_season || "",
        latitude: user.latitude || "",
        longitude: user.longitude || "",
      });
      setPreviewImage(user.profileImage?.url);
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let profileImage = null;

      // Handle Image Upload if file selected
      if (selectedFile) {
        const imgData = new FormData();
        imgData.append("image", selectedFile);
        const uploadRes = await axios.post(apiUrl("/api/image/upload-pre-register"), imgData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        profileImage = {
          url: uploadRes.data.imageUrl,
          imageId: uploadRes.data.imageId,
        };
      }

      await axios.put(
        apiUrl("/api/auth/update-profile"),
        { ...formData, ...(profileImage && { profileImage }) },
        { withCredentials: true }
      );

      await checkAuth(); // Refresh user data
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-green-50/40 via-white to-emerald-50/40">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center animate-fade-in-down">
            <h1 className="text-4xl font-extrabold ios-title mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {t("profile.title") || "My Profile"}
            </h1>
            <p className="ios-body text-gray-500">
              {t("profile.subtitle") || "Manage your personal information and account settings"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column - Profile Card */}
            <div className="md:col-span-12 lg:col-span-4 flex justify-center animate-fade-in-up">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-4 shadow-xl">
                    <ProfileCard 
                        name={user?.name || "Farmer Name"}
                        role={user?.role === 'farmer' ? (t("register.farmerRole") || "Farmer") : (t("nav.admin") || "Admin")}
                        description={user?.address || "Address info"}
                        image={isEditing ? previewImage : user?.profileImage?.url}
                        className="scale-95"
                    />
                </div>
              </div>
            </div>

            {/* Right Column - Account Details */}
            <div className="md:col-span-12 lg:col-span-8 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="glass-card rounded-3xl p-8 relative">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-green-500 rounded-full"></div>
                            <h2 className="text-2xl font-bold text-slate-900">{isEditing ? "Edit Personal Details" : (t("profile.personalDetails") || "Personal Information")}</h2>
                        </div>
                        {!isEditing && (
                          <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 font-bold rounded-xl hover:bg-green-100 transition-all border border-green-100 shadow-sm"
                          >
                            <UserPen size={18} />
                            {t("Edit Profile") || "Edit Details"}
                          </button>
                        )}
                    </div>

                    {isEditing ? (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Photo Edit */}
                        <div className="flex justify-center mb-8">
                          <div className="relative">
                            <img 
                              src={previewImage || "/placeholder-user.png"} 
                              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                              alt="Profile"
                            />
                            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-green-500 border-2 border-white flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors">
                              <Camera size={14} className="text-white" />
                              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                          </div>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                           <div className="space-y-2">
                             <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                               <User size={14} /> Name
                             </label>
                             <input 
                               type="text" 
                               value={formData.name}
                               onChange={(e) => setFormData({...formData, name: e.target.value})}
                               className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                             />
                           </div>
                           <div className="space-y-2">
                             <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                               <Mail size={14} /> Email
                             </label>
                             <input 
                               type="email" 
                               value={formData.email}
                               onChange={(e) => setFormData({...formData, email: e.target.value})}
                               className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                             />
                           </div>
                           <div className="space-y-2">
                             <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                               <Phone size={14} /> Phone
                             </label>
                             <input 
                               type="tel" 
                               value={formData.phone}
                               onChange={(e) => setFormData({...formData, phone: e.target.value})}
                               className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                             />
                           </div>
                           <div className="space-y-2">
                             <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                               <MapPin size={14} /> Region / Address
                             </label>
                             <input 
                               type="text" 
                               value={formData.address}
                               onChange={(e) => setFormData({...formData, address: e.target.value})}
                               className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                             />
                           </div>
                         </div>

                         {/* Farm Details */}
                         <div className="pt-4">
                           <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                             <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                             Farm Conditions
                           </h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                               <label className="text-xs font-bold text-gray-500 uppercase">State</label>
                               <input 
                                 type="text" 
                                 value={formData.state}
                                 onChange={(e) => setFormData({...formData, state: e.target.value})}
                                 className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                 placeholder="e.g. Telangana"
                               />
                             </div>
                             <div className="space-y-2">
                               <label className="text-xs font-bold text-gray-500 uppercase">District</label>
                               <input 
                                 type="text" 
                                 value={formData.district}
                                 onChange={(e) => setFormData({...formData, district: e.target.value})}
                                 className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                 placeholder="e.g. Medchal"
                               />
                             </div>
                             <div className="space-y-2">
                               <label className="text-xs font-bold text-gray-500 uppercase">Land Size (Acres)</label>
                               <input 
                                 type="number" 
                                 value={formData.land_size_acres}
                                 onChange={(e) => setFormData({...formData, land_size_acres: e.target.value})}
                                 className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                               />
                             </div>
                             <div className="space-y-2">
                               <label className="text-xs font-bold text-gray-500 uppercase">Soil Type</label>
                               <select 
                                 value={formData.soil_type}
                                 onChange={(e) => setFormData({...formData, soil_type: e.target.value})}
                                 className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                               >
                                 <option value="">Select Soil Type</option>
                                 <option value="Red Soil">Red Soil</option>
                                 <option value="Black Soil">Black Soil</option>
                                 <option value="Alluvial Soil">Alluvial Soil</option>
                                 <option value="Laterite Soil">Laterite Soil</option>
                               </select>
                             </div>
                             <div className="space-y-2">
                               <label className="text-xs font-bold text-gray-500 uppercase">Irrigation Type</label>
                               <select 
                                 value={formData.irrigation_type}
                                 onChange={(e) => setFormData({...formData, irrigation_type: e.target.value})}
                                 className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                               >
                                 <option value="rainfed">Rainfed</option>
                                 <option value="borewell">Borewell</option>
                                 <option value="canal">Canal</option>
                               </select>
                             </div>
                             <div className="space-y-2">
                               <label className="text-xs font-bold text-gray-500 uppercase">Water Availability</label>
                               <select 
                                 value={formData.water_availability}
                                 onChange={(e) => setFormData({...formData, water_availability: e.target.value})}
                                 className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                               >
                                 <option value="low">Low</option>
                                 <option value="medium">Medium</option>
                                 <option value="high">High</option>
                               </select>
                             </div>
                             <div className="space-y-2">
                               <label className="text-xs font-bold text-gray-500 uppercase">Sowing Season</label>
                               <select 
                                 value={formData.sowing_season}
                                 onChange={(e) => setFormData({...formData, sowing_season: e.target.value})}
                                 className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                               >
                                 <option value="kharif">Kharif</option>
                                 <option value="rabi">Rabi</option>
                                 <option value="summer">Summer</option>
                               </select>
                             </div>
                             <div className="space-y-2">
                               <label className="text-xs font-bold text-gray-500 uppercase">Previous Crop</label>
                               <input 
                                 type="text" 
                                 value={formData.previous_crop}
                                 onChange={(e) => setFormData({...formData, previous_crop: e.target.value})}
                                 className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                 placeholder="e.g. Tomato"
                               />
                             </div>
                           </div>
                         </div>

                        <div className="flex items-center gap-4 pt-4">
                          <button 
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                          >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Changes</>}
                          </button>
                          <button 
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("farmer.nameLabel")}</p>
                              <p className="text-xl font-semibold text-slate-800">{user?.name}</p>
                          </div>
                          <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("farmer.emailLabel")}</p>
                              <p className="text-xl font-semibold text-slate-800 break-all">{user?.email}</p>
                          </div>
                          <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("farmer.phoneLabel")}</p>
                              <p className="text-xl font-semibold text-slate-800">{user?.phone}</p>
                          </div>
                          <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("farmer.roleLabel") || "Account Role"}</p>
                              <p className="text-xl font-semibold text-green-600 capitalize">{user?.role}</p>
                          </div>
                          <div className="md:col-span-2 space-y-1">
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("farmer.addressLabel")}</p>
                               <p className="text-xl font-semibold text-slate-800 leading-relaxed">{user?.address}</p>
                           </div>
                           
                           {/* Farm Condition Summary */}
                           <div className="md:col-span-2 pt-6 mt-6 border-t border-gray-100">
                             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Farm Condition Summary</h3>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                               <div className="bg-green-50/50 p-3 rounded-2xl border border-green-100">
                                 <p className="text-[10px] text-green-600 font-bold uppercase">Land Size</p>
                                 <p className="text-lg font-bold text-slate-800">{user?.land_size_acres || '--'} Acres</p>
                               </div>
                               <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
                                 <p className="text-[10px] text-emerald-600 font-bold uppercase">Soil Type</p>
                                 <p className="text-lg font-bold text-slate-800">{user?.soil_type || '--'}</p>
                               </div>
                               <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
                                 <p className="text-[10px] text-blue-600 font-bold uppercase">Irrigation</p>
                                 <p className="text-lg font-bold text-slate-800 capitalize">{user?.irrigation_type || '--'}</p>
                               </div>
                               <div className="bg-cyan-50/50 p-3 rounded-2xl border border-cyan-100">
                                 <p className="text-[10px] text-cyan-600 font-bold uppercase">Water</p>
                                 <p className="text-lg font-bold text-slate-800 capitalize">{user?.water_availability || '--'}</p>
                               </div>
                               <div className="bg-orange-50/50 p-3 rounded-2xl border border-orange-100">
                                 <p className="text-[10px] text-orange-600 font-bold uppercase">Season</p>
                                 <p className="text-lg font-bold text-slate-800 capitalize">{user?.sowing_season || '--'}</p>
                               </div>
                               <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100">
                                 <p className="text-[10px] text-amber-600 font-bold uppercase">Prev Crop</p>
                                 <p className="text-lg font-bold text-slate-800 capitalize">{user?.previous_crop || '--'}</p>
                               </div>
                             </div>
                           </div>
                       </div>
                    )}
                </div>

                {/* Account Status */}
                <div className="glass-card rounded-3xl p-8 border-l-4 border-l-green-400">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">{t("profile.accountStatus") || "Account Status"}</h3>
                            <p className="text-sm text-gray-500">{t("profile.verifiedDesc") || "Your account is verified and active"}</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-2xl font-bold text-sm shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            {user?.status?.toUpperCase() || "ACTIVE"}
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
