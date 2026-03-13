import React, { createContext, useContext, useMemo, useState } from "react";

const STORAGE_KEY = "cropplan_language";

const translations = {
  en: {
    nav: {
      home: "Home",
      aboutUs: "About Us",
      login: "Login",
      register: "Register",
      adminDashboard: "Admin Dashboard",
      farmerDashboard: "Farmer Dashboard",
      language: "Language",
      switchLanguage: "Switch language",
    },
    home: {
      title: "DEMAND BASED CROP PLANNING SYSTEM",
      subtitle: "To Reduce Agricultural Surplus Through Market Integration",
    },
    aboutProject: {
      title: "About This Platform",
      missionTitle: "Our Mission",
      missionText:
        "We aim to bridge the gap between farmers and markets by providing a demand-based crop planning system. Our platform helps farmers make informed decisions about what to grow, reducing agricultural surplus and ensuring better market prices for their produce.",
      marketAnalysisTitle: "Market Analysis",
      marketAnalysisText:
        "Real-time market data and demand forecasting to help farmers plan their crops effectively.",
      betterPricingTitle: "Better Pricing",
      betterPricingText:
        "Connect directly with buyers and get fair prices for your produce without middlemen.",
      communitySupportTitle: "Community Support",
      communitySupportText:
        "Join a community of farmers and experts to share knowledge and best practices.",
      visionTitle: "Our Vision",
      visionText:
        "To create a sustainable agricultural ecosystem where farmers prosper by growing what the market needs. We envision a future where agricultural waste is minimized, farmer incomes are maximized, and food security is ensured for all.",
    },
    aboutUs: {
      title: "Meet Our Team",
      subtitle:
        "We are a passionate team of developers dedicated to revolutionizing agriculture through technology.",
      fullStackDeveloper: "Full Stack Developer",
      backendDeveloper: "Backend Developer",
      frontendDeveloper: "Frontend Developer",
      mernDesigner: "MERN Stack Developer & Designer",
      scalableSolutions: "Passionate about building scalable solutions",
      apiExpert: "Expert in APIs and database systems",
      beautifulUx: "Crafting beautiful user experiences",
      seamlessExperience: "Creating seamless full-stack experiences",
      quote: '"Plan smarter. Grow better. Harvest success."',
      quoteAuthor: "- CropPlan Team",
      whyProjectTitle: "Why This Project?",
      whyProjectText:
        "We saw farmers struggling with market unpredictability. Technology can bridge this gap and create sustainable farming practices.",
      visionCardTitle: "Our Vision",
      visionCardText:
        "A future where every farmer has access to market insights, reducing waste and maximizing their earnings for a sustainable tomorrow.",
      techStackTitle: "Our Tech Stack",
      techStackText:
        "Built with MongoDB, Express, React and Node.js, the MERN stack powering modern, scalable web applications.",
      togetherTitle: "Together We Build",
      togetherText:
        "Four minds, one mission, to revolutionize how farmers plan their crops by connecting them with real-time market demand.",
      tagSustainable: "Sustainable Farming",
      tagInsights: "Data-Driven Insights",
      tagFarmerFirst: "Farmer-First Approach",
    },
    login: {
      welcomeBack: "Welcome Back",
      continueText: "Sign in to continue to CropPlan",
      emailOrMobile: "Email or Mobile Number",
      emailOrMobilePlaceholder: "you@example.com or 9876543210",
      password: "Password",
      rememberMe: "Remember me",
      signIn: "Sign In",
      noAccount: "Don't have an account?",
      createAccount: "Create Account",
      brandText: "CropPlan - Smart Farming Solutions",
      failed: "Login failed",
    },
    register: {
      successTitle: "Registration Successful!",
      successText:
        "You have registered successfully. Please wait for the admin approval. We will notify you via email once your account is approved.",
      pendingApproval: "Pending Admin Approval",
      backToLogin: "Back to Login",
      createAccount: "Create Account",
      joinText: "Join CropPlan to start planning smarter",
      fullName: "Full Name",
      fullNamePlaceholder: "John Doe",
      emailAddress: "Email Address",
      emailPlaceholder: "you@example.com",
      phoneNumber: "Phone Number",
      phonePlaceholder: "+91 98765 43210",
      address: "Address",
      addressPlaceholder: "Enter your full address",
      createPassword: "Create Password",
      registerButton: "Register",
      alreadyAccount: "Already have an account?",
      signIn: "Sign In",
      brandText: "CropPlan - Smart Farming Solutions",
      failed: "Registration failed. Please try again.",
    },
  },
  te: {
    nav: {
      home: "హోమ్",
      aboutUs: "మా గురించి",
      login: "లాగిన్",
      register: "నమోదు",
      adminDashboard: "అడ్మిన్ డ్యాష్‌బోర్డ్",
      farmerDashboard: "రైతు డ్యాష్‌బోర్డ్",
      language: "భాష",
      switchLanguage: "భాష మార్చండి",
    },
    home: {
      title: "డిమాండ్ ఆధారిత పంట ప్రణాళిక వ్యవస్థ",
      subtitle: "మార్కెట్ సమన్వయం ద్వారా వ్యవసాయ అదనాన్ని తగ్గించడానికి",
    },
    aboutProject: {
      title: "ఈ ప్లాట్‌ఫారమ్ గురించి",
      missionTitle: "మా లక్ష్యం",
      missionText:
        "డిమాండ్ ఆధారిత పంట ప్రణాళిక వ్యవస్థ ద్వారా రైతులు మరియు మార్కెట్ల మధ్య అంతరాన్ని తగ్గించడం మా లక్ష్యం. ఏ పంట వేయాలి అన్న నిర్ణయంలో రైతులకు సహాయం చేస్తూ, అధిక ఉత్పత్తి తగ్గించి, మంచి ధరలు పొందేలా చేస్తాము.",
      marketAnalysisTitle: "మార్కెట్ విశ్లేషణ",
      marketAnalysisText:
        "రియల్ టైమ్ మార్కెట్ డేటా మరియు డిమాండ్ అంచనాలతో రైతులు పంటలను సమర్థంగా ప్రణాళిక చేసుకోగలరు.",
      betterPricingTitle: "మెరుగైన ధరలు",
      betterPricingText:
        "మధ్యవర్తుల లేకుండా కొనుగోలుదారులతో నేరుగా కలసి, మీ ఉత్పత్తికి న్యాయమైన ధర పొందండి.",
      communitySupportTitle: "సముదాయ మద్దతు",
      communitySupportText:
        "రైతులు మరియు నిపుణుల సమాజంతో కలసి జ్ఞానం మరియు ఉత్తమ విధానాలను పంచుకోండి.",
      visionTitle: "మా దృష్టి",
      visionText:
        "మార్కెట్ అవసరాలకు అనుగుణంగా పంటలు పండించి రైతులు అభివృద్ధి చెందే స్థిరమైన వ్యవసాయ వ్యవస్థను నిర్మించడం మా దృష్టి. వ్యవసాయ వ్యర్థం తగ్గి, రైతుల ఆదాయం పెరిగి, అందరికీ ఆహార భద్రత లభించే భవిష్యత్తు మా లక్ష్యం.",
    },
    aboutUs: {
      title: "మా బృందాన్ని కలుసుకోండి",
      subtitle:
        "సాంకేతికత ద్వారా వ్యవసాయాన్ని మార్పు చేయాలనే లక్ష్యంతో పనిచేసే అభిరుచి గల డెవలపర్ల బృందం మేము.",
      fullStackDeveloper: "ఫుల్ స్టాక్ డెవలపర్",
      backendDeveloper: "బ్యాక్‌ఎండ్ డెవలపర్",
      frontendDeveloper: "ఫ్రంట్‌ఎండ్ డెవలపర్",
      mernDesigner: "MERN స్టాక్ డెవలపర్ & డిజైనర్",
      scalableSolutions: "విస్తరించగల పరిష్కారాల నిర్మాణంపై ఆసక్తి",
      apiExpert: "APIs మరియు డేటాబేస్ వ్యవస్థల్లో నిపుణుడు",
      beautifulUx: "అందమైన యూజర్ అనుభవాల సృష్టి",
      seamlessExperience: "సులభమైన ఫుల్ స్టాక్ అనుభవాల నిర్మాణం",
      quote: '"తెలివిగా ప్రణాళిక చేయండి. మెరుగ్గా పెంచండి. విజయాన్ని కోయండి."',
      quoteAuthor: "- CropPlan బృందం",
      whyProjectTitle: "ఈ ప్రాజెక్ట్ ఎందుకు?",
      whyProjectText:
        "మార్కెట్ అనిశ్చితితో రైతులు ఇబ్బంది పడుతున్నారని చూశాం. ఈ అంతరాన్ని సాంకేతికతతో తగ్గించి, స్థిరమైన వ్యవసాయ పద్ధతులు సృష్టించవచ్చు.",
      visionCardTitle: "మా దృష్టి",
      visionCardText:
        "ప్రతి రైతుకూ మార్కెట్ సమాచారం అందుబాటులో ఉండే, వ్యర్థం తగ్గి, ఆదాయం పెరిగే స్థిరమైన భవిష్యత్తు.",
      techStackTitle: "మా టెక్ స్టాక్",
      techStackText:
        "MongoDB, Express, React, Node.js తో నిర్మించిన MERN స్టాక్ ఆధునిక, విస్తరించగల వెబ్ యాప్‌లకు బలం ఇస్తుంది.",
      togetherTitle: "కలిసి మేము నిర్మిస్తున్నాం",
      togetherText:
        "నాలుగు మేధస్సులు, ఒకే లక్ష్యం - రియల్ టైమ్ మార్కెట్ డిమాండ్‌తో రైతుల పంట ప్రణాళికను మార్చడం.",
      tagSustainable: "స్థిరమైన వ్యవసాయం",
      tagInsights: "డేటా ఆధారిత విశ్లేషణలు",
      tagFarmerFirst: "రైతు ముందుగా",
    },
    login: {
      welcomeBack: "తిరిగి స్వాగతం",
      continueText: "CropPlan కొనసాగించడానికి సైన్ ఇన్ చేయండి",
      emailOrMobile: "ఈమెయిల్ లేదా మొబైల్ నంబర్",
      emailOrMobilePlaceholder: "you@example.com లేదా 9876543210",
      password: "పాస్‌వర్డ్",
      rememberMe: "నన్ను గుర్తుంచుకోండి",
      signIn: "సైన్ ఇన్",
      noAccount: "ఖాతా లేదా?",
      createAccount: "ఖాతా సృష్టించండి",
      brandText: "CropPlan - స్మార్ట్ వ్యవసాయ పరిష్కారాలు",
      failed: "లాగిన్ విఫలమైంది",
    },
    register: {
      successTitle: "నమోదు విజయవంతమైంది!",
      successText:
        "మీ నమోదు విజయవంతంగా పూర్తైంది. అడ్మిన్ ఆమోదం కోసం వేచి ఉండండి. మీ ఖాతా ఆమోదించబడిన తర్వాత ఈమెయిల్ ద్వారా తెలియజేస్తాము.",
      pendingApproval: "అడ్మిన్ ఆమోదం పెండింగ్‌లో ఉంది",
      backToLogin: "లాగిన్‌కు తిరుగు",
      createAccount: "ఖాతా సృష్టించండి",
      joinText: "తెలివిగా ప్రణాళిక మొదలుపెట్టడానికి CropPlan లో చేరండి",
      fullName: "పూర్తి పేరు",
      fullNamePlaceholder: "జాన్ డో",
      emailAddress: "ఈమెయిల్ చిరునామా",
      emailPlaceholder: "you@example.com",
      phoneNumber: "ఫోన్ నంబర్",
      phonePlaceholder: "+91 98765 43210",
      address: "చిరునామా",
      addressPlaceholder: "మీ పూర్తి చిరునామాను నమోదు చేయండి",
      createPassword: "పాస్‌వర్డ్ సృష్టించండి",
      registerButton: "నమోదు",
      alreadyAccount: "ఇప్పటికే ఖాతా ఉందా?",
      signIn: "సైన్ ఇన్",
      brandText: "CropPlan - స్మార్ట్ వ్యవసాయ పరిష్కారాలు",
      failed: "నమోదు విఫలమైంది. మళ్లీ ప్రయత్నించండి.",
    },
  },
  hi: {
    nav: {
      home: "होम",
      aboutUs: "हमारे बारे में",
      login: "लॉगिन",
      register: "रजिस्टर",
      adminDashboard: "एडमिन डैशबोर्ड",
      farmerDashboard: "किसान डैशबोर्ड",
      language: "भाषा",
      switchLanguage: "भाषा बदलें",
    },
    home: {
      title: "मांग आधारित फसल योजना प्रणाली",
      subtitle: "बाजार एकीकरण के माध्यम से कृषि अधिशेष को कम करने के लिए",
    },
    aboutProject: {
      title: "इस प्लेटफॉर्म के बारे में",
      missionTitle: "हमारा मिशन",
      missionText:
        "मांग आधारित फसल योजना प्रणाली के माध्यम से किसानों और बाजार के बीच की दूरी कम करना हमारा लक्ष्य है। यह प्लेटफॉर्म किसानों को क्या उगाना है इस पर सही निर्णय लेने में मदद करता है, जिससे कृषि अधिशेष कम होता है और बेहतर कीमत मिलती है।",
      marketAnalysisTitle: "बाजार विश्लेषण",
      marketAnalysisText:
        "रियल-टाइम बाजार डेटा और मांग पूर्वानुमान किसानों को प्रभावी योजना बनाने में मदद करते हैं।",
      betterPricingTitle: "बेहतर मूल्य",
      betterPricingText:
        "बिचौलियों के बिना खरीदारों से सीधे जुड़ें और अपनी उपज का उचित मूल्य पाएं।",
      communitySupportTitle: "समुदाय सहयोग",
      communitySupportText:
        "किसानों और विशेषज्ञों के समुदाय से जुड़ें और ज्ञान व सर्वोत्तम प्रथाएं साझा करें।",
      visionTitle: "हमारा विजन",
      visionText:
        "ऐसा टिकाऊ कृषि तंत्र बनाना जहां किसान बाजार की जरूरत के अनुसार उगाकर समृद्ध हों। हम ऐसा भविष्य देखते हैं जहां कृषि अपशिष्ट कम हो, किसानों की आय बढ़े और सभी के लिए खाद्य सुरक्षा सुनिश्चित हो।",
    },
    aboutUs: {
      title: "हमारी टीम से मिलें",
      subtitle:
        "हम डेवलपर्स की एक उत्साही टीम हैं जो तकनीक के माध्यम से कृषि में बदलाव लाने के लिए समर्पित है।",
      fullStackDeveloper: "फुल स्टैक डेवलपर",
      backendDeveloper: "बैकएंड डेवलपर",
      frontendDeveloper: "फ्रंटएंड डेवलपर",
      mernDesigner: "MERN स्टैक डेवलपर और डिज़ाइनर",
      scalableSolutions: "स्केलेबल समाधान बनाने के प्रति उत्साही",
      apiExpert: "APIs और डेटाबेस सिस्टम के विशेषज्ञ",
      beautifulUx: "सुंदर उपयोगकर्ता अनुभव तैयार करना",
      seamlessExperience: "स्मूद फुल-स्टैक अनुभव बनाना",
      quote: '"बेहतर योजना बनाओ। बेहतर उगाओ। सफलता पाओ।"',
      quoteAuthor: "- CropPlan टीम",
      whyProjectTitle: "यह प्रोजेक्ट क्यों?",
      whyProjectText:
        "हमने किसानों को बाजार की अनिश्चितता से जूझते देखा। तकनीक इस अंतर को कम कर सकती है और टिकाऊ खेती को बढ़ावा दे सकती है।",
      visionCardTitle: "हमारा विजन",
      visionCardText:
        "ऐसा भविष्य जहां हर किसान को बाजार की जानकारी मिले, अपव्यय घटे और आय बढ़े।",
      techStackTitle: "हमारा टेक स्टैक",
      techStackText:
        "MongoDB, Express, React और Node.js पर बना MERN स्टैक आधुनिक और स्केलेबल वेब ऐप्स को शक्ति देता है।",
      togetherTitle: "मिलकर हम बनाते हैं",
      togetherText:
        "चार दिमाग, एक मिशन - रियल-टाइम बाजार मांग से किसानों की फसल योजना को बदलना।",
      tagSustainable: "टिकाऊ खेती",
      tagInsights: "डेटा-आधारित इनसाइट्स",
      tagFarmerFirst: "किसान-प्रथम दृष्टिकोण",
    },
    login: {
      welcomeBack: "वापसी पर स्वागत है",
      continueText: "CropPlan जारी रखने के लिए साइन इन करें",
      emailOrMobile: "ईमेल या मोबाइल नंबर",
      emailOrMobilePlaceholder: "you@example.com या 9876543210",
      password: "पासवर्ड",
      rememberMe: "मुझे याद रखें",
      signIn: "साइन इन",
      noAccount: "क्या आपका अकाउंट नहीं है?",
      createAccount: "अकाउंट बनाएं",
      brandText: "CropPlan - स्मार्ट खेती समाधान",
      failed: "लॉगिन विफल हुआ",
    },
    register: {
      successTitle: "रजिस्ट्रेशन सफल हुआ!",
      successText:
        "आपका पंजीकरण सफल हुआ। कृपया एडमिन अनुमोदन की प्रतीक्षा करें। अकाउंट स्वीकृत होने पर हम आपको ईमेल से सूचित करेंगे।",
      pendingApproval: "एडमिन अनुमोदन लंबित",
      backToLogin: "लॉगिन पर वापस जाएं",
      createAccount: "अकाउंट बनाएं",
      joinText: "स्मार्ट योजना शुरू करने के लिए CropPlan से जुड़ें",
      fullName: "पूरा नाम",
      fullNamePlaceholder: "जॉन डो",
      emailAddress: "ईमेल पता",
      emailPlaceholder: "you@example.com",
      phoneNumber: "फोन नंबर",
      phonePlaceholder: "+91 98765 43210",
      address: "पता",
      addressPlaceholder: "अपना पूरा पता लिखें",
      createPassword: "पासवर्ड बनाएं",
      registerButton: "रजिस्टर",
      alreadyAccount: "क्या पहले से अकाउंट है?",
      signIn: "साइन इन",
      brandText: "CropPlan - स्मार्ट खेती समाधान",
      failed: "रजिस्ट्रेशन विफल हुआ। कृपया फिर कोशिश करें।",
    },
  },
};

const LanguageContext = createContext(null);

const languages = ["en", "te", "hi"];

const getNestedValue = (obj, path) =>
  path
    .split(".")
    .reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : null),
      obj,
    );

export const LanguageProvider = ({ children }) => {
  const initialLanguage =
    typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)
      ? localStorage.getItem(STORAGE_KEY)
      : "en";

  const [language, setLanguageState] = useState(
    languages.includes(initialLanguage) ? initialLanguage : "en",
  );

  const setLanguage = (nextLanguage) => {
    if (!languages.includes(nextLanguage)) {
      return;
    }
    setLanguageState(nextLanguage);
    localStorage.setItem(STORAGE_KEY, nextLanguage);
  };

  const cycleLanguage = () => {
    const currentIndex = languages.indexOf(language);
    const nextLanguage = languages[(currentIndex + 1) % languages.length];
    setLanguage(nextLanguage);
  };

  const t = (key) => {
    const localizedText = getNestedValue(translations[language], key);
    if (localizedText !== null) {
      return localizedText;
    }
    const fallbackText = getNestedValue(translations.en, key);
    return fallbackText !== null ? fallbackText : key;
  };

  const value = useMemo(
    () => ({ language, setLanguage, cycleLanguage, t, languages }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
