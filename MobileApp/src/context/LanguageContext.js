import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    // Tabs
    dashboard: 'Dashboard',
    profile: 'Profile',
    aboutUs: 'About',
    approvals: 'Approvals',
    // Home Screen
    marketDemands: 'Market Demands',
    welcomeBack: 'Welcome Back',
    noDemandsFound: 'No market demands found.',
    estimateRevenue: 'Estimate Revenue',
    viewDetails: 'View Details',
    season: 'Season',
    quantity: 'Quantity',
    price: 'Price',
    region: 'Region',
    demandLevel: 'Demand Level',
    // Profile Screen
    myProfile: 'My Profile',
    logout: 'Logout',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    status: 'Status',
    // About Screen
    aboutTitle: 'About Us',
    aboutSubtitle: 'Demand Based Crop Planning System',
    aboutDesc: 'We empower farmers with real-time market intelligence and AI-powered crop planning tools to maximize yield and profitability.',
    ourMission: 'Our Mission',
    missionDesc: 'To bridge the gap between farmers and market demand, ensuring every crop grown finds its best market value.',
    contactUs: 'Contact Us',
    version: 'Version 1.0.0',
    // Language
    language: 'Language',
    english: 'EN', telugu: 'TE', hindi: 'HI',
  },
  te: {
    dashboard: 'డాష్‌బోర్డ్',
    profile: 'ప్రొఫైల్',
    aboutUs: 'మా గురించి',
    approvals: 'అనుమతులు',
    marketDemands: 'మార్కెట్ డిమాండ్లు',
    welcomeBack: 'స్వాగతం',
    noDemandsFound: 'మార్కెట్ డిమాండ్లు కనుగొనబడలేదు.',
    estimateRevenue: 'ఆదాయం అంచనా వేయండి',
    viewDetails: 'వివరాలు చూడండి',
    season: 'సీజన్',
    quantity: 'పరిమాణం',
    price: 'ధర',
    region: 'ప్రాంతం',
    demandLevel: 'డిమాండ్ స్థాయి',
    myProfile: 'నా ప్రొఫైల్',
    logout: 'లాగ్ అవుట్',
    name: 'పేరు',
    email: 'ఇమెయిల్',
    phone: 'ఫోన్',
    status: 'స్థితి',
    aboutTitle: 'మా గురించి',
    aboutSubtitle: 'డిమాండ్ ఆధారిత పంట ప్రణాళిక వ్యవస్థ',
    aboutDesc: 'మేము రైతులను నిజ-సమయ మార్కెట్ సమాచారం మరియు AI-ఆధారిత పంట ప్రణాళిక సాధనాలతో సజావుగా సంపాదించేలా చేస్తాము.',
    ourMission: 'మా లక్ష్యం',
    missionDesc: 'రైతులు మరియు మార్కెట్ డిమాండ్ మధ్య వ్యత్యాసాన్ని తగ్గించడం, ప్రతి పంటకు అత్యుత్తమ మార్కెట్ విలువ నిర్ధారించడం.',
    contactUs: 'మమ్మల్ని సంప్రదించండి',
    version: 'వెర్షన్ 1.0.0',
    language: 'భాష',
    english: 'EN', telugu: 'TE', hindi: 'HI',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    profile: 'प्रोफ़ाइल',
    aboutUs: 'हमारे बारे में',
    approvals: 'अनुमोदन',
    marketDemands: 'बाज़ार माँग',
    welcomeBack: 'वापस स्वागत है',
    noDemandsFound: 'कोई बाज़ार माँग नहीं मिली।',
    estimateRevenue: 'आय का अनुमान लगाएं',
    viewDetails: 'विवरण देखें',
    season: 'मौसम',
    quantity: 'मात्रा',
    price: 'मूल्य',
    region: 'क्षेत्र',
    demandLevel: 'माँग स्तर',
    myProfile: 'मेरी प्रोफ़ाइल',
    logout: 'लॉग आउट',
    name: 'नाम',
    email: 'ईमेल',
    phone: 'फ़ोन',
    status: 'स्थिति',
    aboutTitle: 'हमारे बारे में',
    aboutSubtitle: 'माँग आधारित फसल योजना प्रणाली',
    aboutDesc: 'हम किसानों को वास्तविक समय की बाजार जानकारी और AI-आधारित फसल योजना उपकरणों के साथ सशक्त बनाते हैं।',
    ourMission: 'हमारा मिशन',
    missionDesc: 'किसानों और बाज़ार की माँग के बीच की खाई को पाटना, यह सुनिश्चित करना कि उगाई गई हर फसल का सर्वोत्तम बाज़ार मूल्य मिले।',
    contactUs: 'हमसे संपर्क करें',
    version: 'संस्करण 1.0.0',
    language: 'भाषा',
    english: 'EN', telugu: 'TE', hindi: 'HI',
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => translations[language]?.[key] || translations.en[key] || key;

  const cycleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'te' : prev === 'te' ? 'hi' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, cycleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
