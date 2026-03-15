import React from "react";
import Navbar from "../Components/Navbar";
import ProfileCard from "../Components/ProfileCard";
import shavigneshImage from "../assets/ShaVigneshImage.jpeg";
import shivaImage from "../assets/ShivaImage.jpeg";
import naveenImage from "../assets/myImage.jpeg";
import yashwanthImage from "../assets/yashwanthImage.jpeg";
import { useLanguage } from "../Context/LanguageContext";
import { 
  Leaf, TrendingUp, Calculator, ShieldCheck, 
  Languages, UserCheck, Users, Award, Globe, 
  Target, Mail, Phone, ChevronRight 
} from "lucide-react";

const AboutUsPage = () => {
  const { t } = useLanguage();

  const features = [
    {
      title: "Market Demand Forecasting",
      desc: "Real-time insights into crop demands across different regions and seasons.",
      icon: <TrendingUp className="text-emerald-600" size={24} />,
      color: "bg-emerald-100"
    },
    {
      title: "Revenue Estimator",
      desc: "Calculate potential profits and cultivation costs before you even plant.",
      icon: <Calculator className="text-blue-600" size={24} />,
      color: "bg-blue-100"
    },
    {
      title: "Crop Management",
      desc: "Comprehensive database of crop types, optimal growing seasons, and yield units.",
      icon: <Leaf className="text-green-600" size={24} />,
      color: "bg-green-100"
    },
    {
      title: "Multi-language Support",
      desc: "Access the system in English, Hindi, and Telugu for ease of communication.",
      icon: <Languages className="text-amber-600" size={24} />,
      color: "bg-amber-100"
    },
    {
      title: "Admin Governance",
      desc: "Verified registration ensures a secure ecosystem for farmers and admins alike.",
      icon: <ShieldCheck className="text-indigo-600" size={24} />,
      color: "bg-indigo-100"
    },
    {
      title: "Profile Customization",
      desc: "Manage your farm details and profile information directly from your device.",
      icon: <UserCheck className="text-pink-600" size={24} />,
      color: "bg-pink-100"
    }
  ];

  const stats = [
    { icon: <Users className="text-emerald-500" size={24} />, value: '500+', label: 'Farmers' },
    { icon: <Award className="text-amber-500" size={24} />, value: '3+', label: 'Languages' },
    { icon: <Globe className="text-blue-500" size={24} />, value: '10+', label: 'Regions' },
  ];

  return (
    <>
      <Navbar />

      <div className="w-full min-h-screen pt-28 pb-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-green-50/30 via-white to-emerald-50/30 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-6xl mx-auto relative">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/30 mb-6">
              <Leaf className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-slate-800">
              Demand-Based <span className="text-emerald-500">Crop Planning</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
              Empowering the agricultural backbone of our nation through data-driven insights and intelligent planning.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
            {stats.map((s, i) => (
              <div key={i} className="liquid-glass p-8 text-center transition-transform hover:scale-105">
                <div className="flex justify-center mb-4">{s.icon}</div>
                <div className="text-3xl font-black text-slate-800 mb-1">{s.value}</div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
              <h2 className="text-3xl font-black text-slate-800">System Features</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <div key={i} className="group liquid-glass p-8 rounded-[2.5rem] transition-all hover:bg-white hover:shadow-emerald-200/40">
                  <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="mb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-emerald-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-emerald-500/30 relative overflow-hidden">
                <Target className="absolute top-10 right-10 opacity-10" size={120} />
                <div className="flex items-center gap-3 mb-6">
                  <Target size={24} />
                  <h2 className="text-2xl font-black">Our Mission</h2>
                </div>
                <p className="text-lg leading-relaxed font-medium opacity-90">
                  To bridge the gap between market demand and agricultural production. By providing farmers with real-time data, we help minimize crop wastage and maximize profitability, ensuring a sustainable future for agriculture.
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-md p-10 rounded-[3rem] border border-white/40 shadow-xl shadow-slate-200/30">
                <div className="flex items-center gap-3 mb-6 text-emerald-600">
                  <Globe size={24} />
                  <h2 className="text-2xl font-black">Our Vision</h2>
                </div>
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  We envision a future where every farmer has access to sophisticated market intelligence, transitioning from traditional guesswork to precise, demand-driven cultivation that benefits both the producer and the consumer.
                </p>
              </div>
            </div>
          </div>

          {/* Team Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
              Meet Our <span className="text-emerald-500">Core Team</span>
            </h2>
            <div className="w-20 h-1.5 bg-emerald-500 mx-auto rounded-full"></div>
          </div>

          {/* Team Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
            <ProfileCard
              name="Shavignesh"
              role="Full Stack Developer"
              description="Crafting scalable solutions and robust backend architectures."
              image={shavigneshImage}
              gradient="from-blue-400 to-indigo-500"
            />
            <ProfileCard
              name="Shiva"
              role="Backend Developer"
              description="Expert in API development and database optimization."
              image={shivaImage}
              gradient="from-purple-400 to-pink-500"
            />
            <ProfileCard
              name="Yashwanth"
              role="Frontend Developer"
              description="Building beautiful and interactive user experiences."
              image={yashwanthImage}
              gradient="from-orange-400 to-red-500"
            />
            <ProfileCard
              name="Naveen"
              role="Lead Designer & MERN"
              description="Designing seamless and modern digital experiences."
              image={naveenImage}
              gradient="from-teal-400 to-cyan-500"
            />
          </div>

          {/* Contact & Support Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="md:col-span-2 liquid-glass p-10 rounded-[3rem]">
              <h2 className="text-2xl font-black text-slate-800 mb-8">Get in Touch</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <a href="mailto:support@cropplan.com" className="flex items-center gap-5 group">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <Mail size={24} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email Support</div>
                    <div className="text-slate-700 font-bold group-hover:text-emerald-600 transition-colors">support@cropplan.com</div>
                  </div>
                </a>
                <a href="tel:+919999999999" className="flex items-center gap-5 group">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <Phone size={24} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Call Us</div>
                    <div className="text-slate-700 font-bold group-hover:text-blue-600 transition-colors">+91 99999 99999</div>
                  </div>
                </a>
              </div>
            </div>
            <div className="bg-emerald-500 p-10 rounded-[3rem] text-white flex flex-col justify-center items-center text-center shadow-xl shadow-emerald-500/20">
               <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
                 <ShieldCheck size={32} />
               </div>
               <h3 className="text-xl font-black mb-2">Verified Ecosystem</h3>
               <p className="text-sm font-medium opacity-90 mb-6">Every farmer and admin is verified via OTP to ensure data integrity.</p>
               <button className="px-6 py-2.5 bg-white text-emerald-600 rounded-full font-bold text-sm shadow-lg">Learn More</button>
            </div>
          </div>

          <div className="text-center text-slate-400 font-bold text-sm">
            © 2026 Demand-Based Crop Planning System • Version 1.0.0
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUsPage;
