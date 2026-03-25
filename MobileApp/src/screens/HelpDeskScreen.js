import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, SafeAreaView, Platform, ActivityIndicator,
  KeyboardAvoidingView, Keyboard, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ChevronRight, HelpCircle, Send, Phone, Mail, 
  MessageSquare, Bot, Volume2, VolumeX, X, 
  Calendar, TrendingUp, Info, RotateCcw
} from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { THEME } from '../styles/theme';
import api from '../api/config';

const HelpDeskScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'chat'
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [voiceLang, setVoiceLang] = useState('en-IN'); // 'en-IN' | 'te-IN'
  const flatListRef = useRef(null);

  const isTelugu = voiceLang === 'te-IN';

  const ui = {
    title: isTelugu ? "సహాయ కేంద్రం" : "Help Desk",
    powered: isTelugu ? "AI సహాయకుడు ద్వారా" : "Powered by AI Assistant",
    selectTopic: isTelugu ? "విషయం ఎంచుకోండి" : "Select a Topic",
    placeholder: isTelugu ? "మీ ప్రశ్న అడుగుండండి..." : "Ask something...",
    thinking: isTelugu ? "సహాయకుడు ఆలోచిస్తున్నాడు..." : "AI is thinking...",
    readAloud: isTelugu ? "వినండి" : "Read aloud",
    categories: [
      {
        title: isTelugu ? "పంట ప్రణాళిక" : "Crop Planning",
        icon: <Calendar size={20} color={THEME.colors.primary} />,
        query: isTelugu 
          ? "దయచేసి తెలుగులో సమాధానించండి: రాబోయే సీజన్కు పంట ప్రణాళికపై సలహాఇవ్వండి." 
          : "Give me advice on crop planning for the upcoming season."
      },
      {
        title: isTelugu ? "ధరల అంచనా" : "Price Trends",
        icon: <TrendingUp size={20} color={THEME.colors.primary} />,
        query: isTelugu 
          ? "దయచేసి తెలుగులో సమాధానించండి: ప్రముఖ పంటల భవిష్యత్ ధరలను అంచనా వేయండి." 
          : "What are the predicted future price trends for major crops?"
      },
      {
        title: isTelugu ? "మార్కెట్ సహాయం" : "Market Help",
        icon: <Info size={20} color={THEME.colors.primary} />,
        query: isTelugu 
          ? "దయచేసి తెలుగులో సమాధానించండి: నా ఉత్పత్తులకు మంచి ధర ఎలా పొందాలి?" 
          : "How can I get the best rates for my produce in the market?"
      }
    ]
  };

  const toggleLanguage = () => {
    Speech.stop();
    setSpeakingIdx(null);
    const next = voiceLang === 'en-IN' ? 'te-IN' : 'en-IN';
    setVoiceLang(next);
    setMessages([]);
    setActiveTab('home');
  };

  const handleSpeak = async (text, index) => {
    if (speakingIdx === index) {
      Speech.stop();
      setSpeakingIdx(null);
      return;
    }

    const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (!cleanText) return;

    setSpeakingIdx(index);
    Speech.speak(cleanText, {
      language: voiceLang,
      rate: 0.9,
      onDone: () => setSpeakingIdx(null),
      onError: () => setSpeakingIdx(null),
    });
  };

  const handleSendMessage = async (text) => {
    const query = text || inputValue;
    if (!query.trim()) return;

    Speech.stop();
    setSpeakingIdx(null);

    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setActiveTab('chat');
    
    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const langInstruction = isTelugu ? "దయచేసి తెలుగులో సమాధానించండి. " : "";
      const response = await api.post('/api/ai/ask', { query: langInstruction + query });
      
      const aiMsg = { role: 'ai', content: response.data.response };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI error:', err);
      const errorMsg = { role: 'ai', content: "Sorry, I'm having trouble connecting. Please try again." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item, index }) => {
    const isAi = item.role === 'ai';
    return (
      <View style={[styles.msgWrapper, isAi ? styles.aiWrapper : styles.userWrapper]}>
        <View style={[styles.msgBubble, isAi ? styles.aiBubble : styles.userBubble]}>
          <Text style={[styles.msgText, isAi ? styles.aiText : styles.userText]}>
            {item.content}
          </Text>
        </View>
        
        {isAi && (
          <TouchableOpacity 
            style={[styles.speakBtn, speakingIdx === index && styles.speakingBtnActive]} 
            onPress={() => handleSpeak(item.content, index)}
          >
            {speakingIdx === index ? <VolumeX size={14} color="white" /> : <Volume2 size={14} color={THEME.colors.primary} />}
            <Text style={[styles.speakBtnText, speakingIdx === index && { color: 'white' }]}>
              {speakingIdx === index ? ui.readAloud : ui.readAloud}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={THEME.colors.bgGradient} style={styles.flex}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronRight size={22} color={THEME.colors.subtitle} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Bot size={20} color={THEME.colors.primary} />
            <View>
              <Text style={styles.headerText}>{ui.title}</Text>
              <Text style={styles.headerSubtitle}>{ui.powered}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.langBtn} onPress={toggleLanguage}>
            <Text style={styles.langBtnText}>{voiceLang === 'en-IN' ? 'EN' : 'తె'}</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.flex}
        >
          {activeTab === 'home' ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
              <View style={styles.contactRow}>
                <View style={styles.contactCard}>
                  <Phone size={18} color={THEME.colors.primary} />
                  <Text style={styles.contactLabel}>Helpline</Text>
                  <Text style={styles.contactValue}>1800-XXX-XXXX</Text>
                </View>
                <View style={styles.contactCard}>
                  <Mail size={18} color={THEME.colors.primary} />
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue}>support@cropplan.in</Text>
                </View>
              </View>

              <Text style={styles.topicHeader}>{ui.selectTopic}</Text>
              {ui.categories.map((cat, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={styles.topicCard}
                  onPress={() => handleSendMessage(cat.query)}
                >
                  <View style={styles.topicIcon}>{cat.icon}</View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.topicTitle}>{cat.title}</Text>
                    <Text style={styles.topicDesc}>{cat.query.length > 40 ? cat.query.substring(0, 40) + '...' : cat.query}</Text>
                  </View>
                  <ChevronRight size={18} color="#CBD5E1" />
                </TouchableOpacity>
              ))}

              <View style={styles.quoteBox}>
                <Text style={styles.quoteText}>"Precision farming is the key to sustainable growth."</Text>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.flex}>
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(_, i) => i.toString()}
                contentContainerStyle={styles.chatList}
                ListFooterComponent={isLoading && (
                  <View style={styles.thinkingBox}>
                    <ActivityIndicator size="small" color={THEME.colors.primary} />
                    <Text style={styles.thinkingText}>{ui.thinking}</Text>
                  </View>
                )}
              />
              {messages.length > 0 && (
                <TouchableOpacity 
                  style={styles.resetBtn} 
                  onPress={() => { setMessages([]); setActiveTab('home'); Speech.stop(); }}
                >
                  <RotateCcw size={14} color="#64748B" />
                  <Text style={styles.resetBtnText}>Clear Chat</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Footer Input */}
          <View style={styles.footer}>
            <TextInput
              style={styles.input}
              placeholder={ui.placeholder}
              placeholderTextColor="#94A3B8"
              value={inputValue}
              onChangeText={setInputValue}
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={() => handleSendMessage()}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !inputValue.trim() && { backgroundColor: '#E2E8F0' }]}
              onPress={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
            >
              <Send size={20} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 55 : 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'white', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0', elevation: 2,
  },
  headerTitle: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerText: { fontSize: 18, fontWeight: '800', color: THEME.colors.title },
  headerSubtitle: { fontSize: 10, fontWeight: '600', color: '#10B981', textTransform: 'uppercase' },
  langBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    backgroundColor: THEME.colors.primary, borderWidth: 1, borderColor: THEME.colors.primary,
  },
  langBtnText: { color: 'white', fontWeight: '800', fontSize: 13 },

  scroll: { paddingHorizontal: 20, paddingTop: 4 },
  
  contactRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  contactCard: {
    flex: 1, backgroundColor: 'white', borderRadius: 18, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9',
    elevation: 2, gap: 4,
  },
  contactLabel: { fontSize: 10, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginTop: 4 },
  contactValue: { fontSize: 12, fontWeight: '800', color: THEME.colors.title },

  topicHeader: { fontSize: 14, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  topicCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2,
  },
  topicIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(16,185,129,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  topicTitle: { fontSize: 16, fontWeight: '800', color: THEME.colors.title },
  topicDesc: { fontSize: 12, color: '#94A3B8', marginTop: 2 },

  quoteBox: { marginTop: 20, padding: 20, backgroundColor: 'rgba(16,185,129,0.05)', borderRadius: 24, borderStyle: 'dashed', borderWidth: 1, borderColor: '#10B981' },
  quoteText: { textAlign: 'center', color: '#10B981', fontWeight: '700', fontSize: 13, fontStyle: 'italic' },

  chatList: { paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 100 },
  msgWrapper: { marginBottom: 20, maxWidth: '85%' },
  userWrapper: { alignSelf: 'flex-end' },
  aiWrapper: { alignSelf: 'flex-start' },
  msgBubble: { padding: 16, borderRadius: 24 },
  userBubble: { backgroundColor: THEME.colors.primary, borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: 'white', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2 },
  msgText: { fontSize: 15, lineHeight: 22 },
  userText: { color: 'white', fontWeight: '600' },
  aiText: { color: THEME.colors.title, fontWeight: '500' },

  speakBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, 
    marginTop: 8, paddingHorizontal: 12, paddingVertical: 6, 
    borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.1)', alignSelf: 'flex-start' 
  },
  speakingBtnActive: { backgroundColor: THEME.colors.primary },
  speakBtnText: { fontSize: 11, fontWeight: '800', color: THEME.colors.primary },

  thinkingBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 },
  thinkingText: { color: '#94A3B8', fontStyle: 'italic', fontSize: 14 },

  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginTop: -10, marginBottom: 10, padding: 8 },
  resetBtnText: { color: '#64748B', fontWeight: '800', fontSize: 11, textTransform: 'uppercase' },

  footer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  input: {
    flex: 1, backgroundColor: '#F8FAFC', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
    borderWidth: 1, borderColor: '#E2E8F0', maxHeight: 100,
  },
  sendBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: THEME.colors.primary, justifyContent: 'center', alignItems: 'center',
    elevation: 3,
  },
});

export default HelpDeskScreen;

