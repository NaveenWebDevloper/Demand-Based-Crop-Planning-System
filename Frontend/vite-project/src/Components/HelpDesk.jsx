import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Calendar, TrendingUp, Info, ArrowRight, Loader2, Volume2, VolumeX, Square } from "lucide-react";
import axios from "axios";
import { useLanguage } from "../Context/LanguageContext";
import { apiUrl } from "../config/api";

const HelpDesk = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [isSpeechSupported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const [voices, setVoices] = useState([]);
  const [voiceLang, setVoiceLang] = useState("en-IN"); // "en-IN" | "te-IN"
  const [teluguVoiceAvailable, setTeluguVoiceAvailable] = useState(false);
  const [showLangWarning, setShowLangWarning] = useState(false);
  const messagesEndRef = useRef(null);
  const voicesRef = useRef([]);         // Ref to avoid stale closures
  const voiceLangRef = useRef("en-IN"); // Ref mirror of voiceLang
  const keepAliveRef = useRef(null);    // Chrome speech keepAlive timer
  const utteranceRef = useRef(null);    // Hold ref to prevent garbage collection
  const [activeVoiceName, setActiveVoiceName] = useState(""); // For debugging silent voices
  const { t } = useLanguage();

  // Load available voices and detect Telugu support
  useEffect(() => {
    if (!isSpeechSupported) return;
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        setVoices(v);
        voicesRef.current = v;
        const has = v.some((voice) => voice.lang === "te-IN" || voice.lang.startsWith("te"));
        setTeluguVoiceAvailable(has);
      }
    };
    // Chrome needs a small delay on first call
    loadVoices();
    setTimeout(loadVoices, 200);
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [isSpeechSupported]);

  // Stop any speech when chat is closed
  useEffect(() => {
    if (!isOpen && isSpeechSupported) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
    }
  }, [isOpen, isSpeechSupported]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Strip HTML tags for clean speech text
  const stripHtml = (html) => html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

  // Force-load voices if not already loaded (on-demand fallback)
  const ensureVoices = () => new Promise((resolve) => {
    const v = window.speechSynthesis.getVoices();
    if (v.length > 0) {
      voicesRef.current = v;
      resolve(v);
    } else {
      const handler = () => {
        const loaded = window.speechSynthesis.getVoices();
        voicesRef.current = loaded;
        resolve(loaded);
        window.speechSynthesis.removeEventListener("voiceschanged", handler);
      };
      window.speechSynthesis.addEventListener("voiceschanged", handler);
      // Timeout fallback: speak with no voice if voices never load
      setTimeout(() => resolve([]), 1500);
    }
  });

  const speakMessage = (text, idx) => {
    if (!isSpeechSupported) {
      console.error("Speech synthesis is not supported in this browser.");
      return;
    }

    // Stop any ongoing speech and clear timer
    if (keepAliveRef.current) clearInterval(keepAliveRef.current);
    window.speechSynthesis.cancel();

    // Toggle off if same button clicked again
    if (speakingIdx === idx) {
      setSpeakingIdx(null);
      utteranceRef.current = null;
      return;
    }

    const currentLang = voiceLangRef.current;
    const cleanText = stripHtml(text);
    if (!cleanText) return;

    // Use pre-loaded voices synchronously to preserve user gesture
    const allVoices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
    
    // Gap for Chrome's cancel() - extended to 150ms for stability
    setTimeout(() => {
      try {
        // Stop again just in case another one was triggered
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utteranceRef.current = utterance; // Keep alive for GC
        
        utterance.volume = 1.0;
        utterance.pitch = 1.0;

        // Smart voice selection: Prioritize local voices (localService: true)
        const findBestVoice = (langCode) => {
          const matching = allVoices.filter(v => v.lang === langCode || v.lang.startsWith(langCode.split('-')[0]));
          if (matching.length === 0) return null;
          // Prefer local voices, then the first one matched
          return matching.find(v => v.localService) || matching[0];
        };

        if (currentLang === "te-IN") {
          const teVoice = findBestVoice("te-IN");
          utterance.lang = "te-IN";
          utterance.rate = 0.85;
          if (teVoice) {
            utterance.voice = teVoice;
            setActiveVoiceName(teVoice.name);
            console.log("🗣 Speaking Telugu with:", teVoice.name);
          } else {
            setActiveVoiceName("System Default (Telugu)");
            console.warn("🗣 No Telugu voice found. Using system default for te-IN.");
          }
        } else {
          const enVoice = findBestVoice("en-IN") || findBestVoice("en-US") || findBestVoice("en");
          utterance.lang = "en-IN";
          utterance.rate = 1.0; // Standard rate for English
          if (enVoice) {
            utterance.voice = enVoice;
            setActiveVoiceName(enVoice.name);
            console.log("🗣 Speaking English with:", enVoice.name);
          } else {
            setActiveVoiceName("System Default (English)");
            console.warn("🗣 No English voice found. Using system default for en-IN.");
          }
        }

        setSpeakingIdx(idx);

        utterance.onstart = () => {
          console.log("🗣 Started speaking:", utterance.lang);
        };

        utterance.onend = () => {
          if (speakingIdx === idx) setSpeakingIdx(null);
          if (keepAliveRef.current) clearInterval(keepAliveRef.current);
          utteranceRef.current = null;
          setActiveVoiceName("");
        };

        utterance.onerror = (e) => {
          console.warn("❌ Speech error:", e.error, "| lang:", utterance.lang);
          if (keepAliveRef.current) clearInterval(keepAliveRef.current);
          if (speakingIdx === idx) setSpeakingIdx(null);
          setActiveVoiceName("");
          
          if (currentLang === "te-IN" && e.error !== "canceled" && e.error !== "interrupted") {
            const enVoice = findBestVoice("en-IN") || findBestVoice("en-US") || findBestVoice("en");
            const fallback = new SpeechSynthesisUtterance(cleanText);
            utteranceRef.current = fallback;
            fallback.lang = "en-IN";
            fallback.rate = 0.9;
            if (enVoice) fallback.voice = enVoice;
            fallback.onend = () => { setSpeakingIdx(null); utteranceRef.current = null; setActiveVoiceName(""); };
            fallback.onerror = () => { setSpeakingIdx(null); utteranceRef.current = null; setActiveVoiceName(""); };
            setShowLangWarning(true);
            setTimeout(() => setShowLangWarning(false), 5000);
            window.speechSynthesis.speak(fallback);
            window.speechSynthesis.resume(); // CRITICAL Chrome fix for fallback
          }
        };

        window.speechSynthesis.speak(utterance);
        // CRITICAL Chrome fix: Force resume in case it starts paused
        window.speechSynthesis.resume();

        // Chrome keepAlive workaround (speech pauses after ~15s)
        keepAliveRef.current = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            clearInterval(keepAliveRef.current);
            // No setSpeakingIdx here to avoid conflict with onend
          } else {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 10000);
      } catch (err) {
        console.error("Speech synthesis execution error:", err);
        setSpeakingIdx(null);
        utteranceRef.current = null;
      }
    }, 150);
  };
  const stopSpeech = () => {
    if (keepAliveRef.current) clearInterval(keepAliveRef.current);
    if (isSpeechSupported) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIdx(null);
  };

  const toggleVoiceLang = () => {
    const next = voiceLangRef.current === "en-IN" ? "te-IN" : "en-IN";
    voiceLangRef.current = next;
    stopSpeech();
    setVoiceLang(next);
    setShowLangWarning(false);
    // Clear chat so new replies come in the selected language
    setMessages([]);
    setActiveTab("home");
  };

  // UI strings in both languages
  const isTelugu = voiceLang === "te-IN";
  const ui = {
    title:        isTelugu ? "సహాయ కేంద్రం" : "Help Desk",
    powered:      isTelugu ? "మేళ్ళిన AI సహాయకుడు ద్వారా" : "Powered by Advanced AI Assistant",
    selectTopic:  isTelugu ? "విషయం ఎంచుకోండి" : "Select a Topic",
    placeholder:  isTelugu ? "మీ ప్రశ్న అడుగండి..." : "Ask something...",
    thinking:     isTelugu ? "సహాయకుడు ఆలోచిస్తున్నాడు..." : "Assistant is thinking...",
    readAloud:    isTelugu ? "వినండి" : "Read aloud",
    speaking:     isTelugu ? "చదువుతున్నాడు..." : "Speaking...",
    noVoice:      isTelugu ? "ఈ పరికరంలో తెలుగు వాయిస్ లేదు. ఆంగ్లో మాట్లాడుతున్నాం." : "Telugu voice not supported on this device. Using English fallback.",
    noBrowser:    isTelugu ? "ఈ బ్రైజర్లో వాయిస్ పనిచేయదు. Chrome లేదా Edge వాడండి." : "Voice output is not supported in this browser. Try Chrome or Edge.",
    categories: [
      {
        title:       isTelugu ? "పంట ప్రణాళిక" : t("helpDesk.planning.title"),
        description: isTelugu ? "వచ్చే సీజన్కు సబ్బుగా పంటలు వేయండి" : t("helpDesk.planning.desc"),
        query:       isTelugu
          ? "దయచేసి తెలుగులో సమాధానించండి: భారతదేశంలో రాబోయే సీజన్కు పంట ప్రణాళికపై సలహాఇవ్వండి."
          : "Give me advice on crop planning for the upcoming season in India."
      },
      {
        title:       isTelugu ? "మార్కెట్ ధరల అంచనా" : t("helpDesk.future.title"),
        description: isTelugu ? "భవిష్యత్తు ధరల విశ్లేషణ" : t("helpDesk.future.desc"),
        query:       isTelugu
          ? "దయచేసి తెలుగులో సమాధానించండి: భారతదేశంలో ప్రముఖ పంటల భవిష్యత్ ధరలను అంచనా వేయండి."
          : "What are the predicted future price trends for major crops in India?"
      },
      {
        title:       isTelugu ? "ప్రస్తుత ధరలు" : t("helpDesk.current.title"),
        description: isTelugu ? "నేటి మార్కెట్ ధరలు తెలుసుకోండి" : t("helpDesk.current.desc"),
        query:       isTelugu
          ? "దయచేసి తెలుగులో సమాధానించండి: ప్రస్తుత మార్కెట్ ధరలు మరియు నా ఉత్పత్తులకు మంచి ధర చెప్పండి."
          : "Tell me about current market prices and how I can get the best rates for my produce."
      }
    ]
  };


  const handleSendMessage = async (text) => {
    const queryText = text || inputValue;
    if (!queryText.trim()) return;

    // Stop any ongoing speech when a new message is sent
    stopSpeech();

    // Inject language instruction so AI responds in the selected language
    const langInstruction = isTelugu
      ? "దయచేసి తెలుగులో సమాధానించండి. "
      : "";
    const finalQuery = langInstruction + queryText;

    // Show user's original text (without the instruction prefix)
    const userMessage = { role: "user", content: queryText };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setActiveTab("chat");

    try {
      const response = await axios.post(apiUrl("/api/ai/ask"), 
        { query: finalQuery },
        { withCredentials: true }
      );
      
      const aiMessage = { role: "ai", content: response.data.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage = { 
        role: "error", 
        content: error.response?.data?.message || "Something went wrong. Please try again later." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isOpen ? "bg-red-500 rotate-90" : "bg-green-600 hover:bg-green-700"
        } text-white`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[580px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 text-white shrink-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6" />
                <h3 className="text-xl font-bold">{ui.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                {/* Global stop speech button — only visible when speaking */}
                {speakingIdx !== null && (
                  <button
                    onClick={stopSpeech}
                    title="Stop speaking"
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <Square className="w-3.5 h-3.5 fill-white text-white" />
                  </button>
                )}
                {activeTab === "chat" && (
                  <button 
                    onClick={() => { stopSpeech(); setActiveTab("home"); setMessages([]); }}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-green-50/80 text-xs">{ui.powered}</p>
              {isSpeechSupported && (
                <button
                  onClick={toggleVoiceLang}
                  title={voiceLang === "en-IN" ? "Switch to Telugu voice" : "Switch to English voice"}
                  className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all border ${
                    voiceLang === "te-IN"
                      ? "bg-white text-green-700 border-white"
                      : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                  }`}
                >
                  <Volume2 className="w-2.5 h-2.5" />
                  {voiceLang === "te-IN" ? "తె ON" : "EN"}
                  <span className="opacity-60">|</span>
                  {voiceLang === "te-IN" ? "EN" : "తె"}
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 relative">
            {activeTab === "home" ? (
              <div className="space-y-4">
                <p className="text-slate-500 text-sm font-medium px-2 py-1 uppercase tracking-wider">{ui.selectTopic}</p>
                {ui.categories.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(cat.query)}
                    className="w-full text-left bg-white p-4 rounded-2xl border border-slate-200 hover:border-green-300 hover:shadow-md transition-all group flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                      {[<Calendar className="w-5 h-5" />, <TrendingUp className="w-5 h-5" />, <Info className="w-5 h-5" />][i]}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 leading-tight">{cat.title}</h4>
                      <p className="text-slate-500 text-[11px] mt-0.5">{cat.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-green-500 transition-colors self-center" />
                  </button>
                ))}
                
                <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 italic text-emerald-800 text-xs text-center leading-relaxed">
                  "{t("helpDesk.quote")}"
                </div>

                {isSpeechSupported && (
                  <button
                    onClick={() => speakMessage(isTelugu ? "ఇది ఒక పరీక్షా సందేశం. ఆడియో వినబడుతుందా?" : "This is a test message. Is the audio working?", 999)}
                    className="w-full mt-4 py-2 px-4 rounded-xl border border-dashed border-green-300 text-green-600 text-[11px] font-medium hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {isTelugu ? "వాయిస్ పరీక్షించండి" : "Test Voice Output"}
                  </button>
                )}

                {!isSpeechSupported && (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs flex items-center gap-2">
                    <VolumeX className="w-4 h-4 shrink-0" />
                    Voice output is not supported in this browser. Try Chrome or Edge.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Telugu unavailable warning toast */}
                {showLangWarning && (
                  <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-[11px] animate-fade-in">
                    <VolumeX className="w-3.5 h-3.5 shrink-0" />
                    <span>{ui.noVoice}</span>
                    <button onClick={() => setShowLangWarning(false)} className="ml-auto"><X className="w-3 h-3" /></button>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} flex-col ${msg.role !== "user" ? "items-start" : "items-end"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                        msg.role === "user"
                          ? "bg-green-600 text-white rounded-tr-none"
                          : msg.role === "error"
                          ? "bg-red-50 text-red-600 border border-red-100 italic"
                          : "bg-white text-slate-700 border border-slate-100 shadow-sm rounded-tl-none"
                      }`}
                    >
                      {msg.role === "ai" ? (
                        <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }} />
                      ) : (
                        msg.content
                      )}
                    </div>

                    {/* Voice button — only for AI messages */}
                    {msg.role === "ai" && isSpeechSupported && (
                      <button
                        onClick={() => speakMessage(msg.content, idx)}
                        title={speakingIdx === idx ? "Stop speaking" : "Read aloud"}
                        className={`mt-1.5 flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full transition-all ${
                          speakingIdx === idx
                            ? "bg-green-100 text-green-700 ring-1 ring-green-400 animate-pulse"
                            : "bg-slate-100 text-slate-500 hover:bg-green-50 hover:text-green-600"
                        }`}
                      >
                        {speakingIdx === idx ? (
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-1.5">
                              <Square className="w-3 h-3 fill-current" />
                              {ui.speaking}
                            </div>
                            {activeVoiceName && (
                              <span className="text-[9px] opacity-70 italic font-normal tracking-tight">Voice: {activeVoiceName}</span>
                            )}
                          </div>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            {ui.readAloud}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2 text-slate-400 text-sm italic">
                      <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                      {ui.thinking}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Footer (Input) */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="relative"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={ui.placeholder}
                className="w-full bg-slate-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500/20 pr-12 focus:bg-white transition-all outline-none"
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className={`absolute right-2 top-1.5 w-9 h-9 flex items-center justify-center rounded-xl transition-all shadow-md ${
                  isLoading || !inputValue.trim() 
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                  : "bg-green-600 text-white hover:bg-green-700 active:scale-95"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpDesk;

