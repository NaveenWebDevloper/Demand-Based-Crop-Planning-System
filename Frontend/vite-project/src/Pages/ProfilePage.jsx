import React from "react";
import { useAuth } from "../Context/AuthContext";
import Navbar from "../Components/Navbar";
import { useLanguage } from "../Context/LanguageContext";
import ProfileCard from "../Components/ProfileCard";

const ProfilePage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

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
                        image={user?.profileImage?.url}
                        className="scale-95"
                    />
                </div>
              </div>
            </div>

            {/* Right Column - Account Details */}
            <div className="md:col-span-12 lg:col-span-8 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="glass-card rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-8 bg-green-500 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-slate-900">{t("profile.personalDetails") || "Personal Information"}</h2>
                    </div>

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
                    </div>
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
