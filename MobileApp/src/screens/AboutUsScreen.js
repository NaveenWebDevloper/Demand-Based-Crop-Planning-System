import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, SafeAreaView, Platform, StatusBar, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  Leaf, Target, Mail, Phone, Globe, Award, Users, 
  TrendingUp, Calculator, ShieldCheck, Languages, Smartphone, UserCheck 
} from 'lucide-react-native';
import { THEME } from '../styles/theme';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

const AboutUsScreen = () => {
  const { t } = useLanguage();

  const features = [
    {
      title: "Market Demand Forecasting",
      desc: "Real-time insights into crop demands across different regions and seasons.",
      icon: <TrendingUp color="#10B981" size={24} />,
      color: "#D1FAE5"
    },
    {
      title: "Revenue Estimator",
      desc: "Calculate potential profits and cultivation costs before you even plant.",
      icon: <Calculator color="#3B82F6" size={24} />,
      color: "#DBEAFE"
    },
    {
      title: "Crop Management",
      desc: "Comprehensive database of crop types, optimal growing seasons, and yield units.",
      icon: <Leaf color="#059669" size={24} />,
      color: "#DCFCE7"
    },
    {
      title: "Multi-language Support",
      desc: "Access the system in English, Hindi, and Telugu for ease of communication.",
      icon: <Languages color="#F59E0B" size={24} />,
      color: "#FEF3C7"
    },
    {
      title: "Admin Governance",
      desc: "Verified registration ensures a secure ecosystem for farmers and admins alike.",
      icon: <ShieldCheck color="#6366F1" size={24} />,
      color: "#E0E7FF"
    },
    {
      title: "Profile Customization",
      desc: "Manage your farm details and profile information directly from your mobile device.",
      icon: <UserCheck color="#EC4899" size={24} />,
      color: "#FCE7F3"
    }
  ];

  const stats = [
    { icon: <Users color={THEME.colors.primary} size={22} />, value: '500+', label: 'Farmers' },
    { icon: <Award color="#F59E0B" size={22} />, value: '3+', label: 'Languages' },
    { icon: <Globe color="#3B82F6" size={22} />, value: '10+', label: 'Regions' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={THEME.colors.bgGradient} style={styles.flex}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* Hero Section */}
            <View style={styles.hero}>
              <View style={styles.iconCircle}>
                <Leaf color="white" size={40} />
              </View>
              <Text style={styles.heroTitle}>Demand-Based Crop Planning</Text>
              <Text style={styles.heroSubtitle}>Empowering farmers through data-driven decisions</Text>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
              {stats.map((s, i) => (
                <BlurView key={i} intensity={60} tint="light" style={styles.statCard}>
                  {s.icon}
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </BlurView>
              ))}
            </View>

            {/* Feature Section Header */}
            <View style={styles.sectionHeader}>
               <View style={styles.indicator} />
               <Text style={styles.sectionTitle}>System Features</Text>
            </View>

            {/* Features Grid */}
            <View style={styles.featuresGrid}>
               {features.map((f, i) => (
                 <BlurView key={i} intensity={60} tint="light" style={styles.featureCard}>
                    <View style={[styles.featIconBox, { backgroundColor: f.color }]}>
                      {f.icon}
                    </View>
                    <Text style={styles.featTitle}>{f.title}</Text>
                    <Text style={styles.featDesc}>{f.desc}</Text>
                 </BlurView>
               ))}
            </View>

            {/* Mission Section */}
            <View style={styles.sectionHeader}>
               <View style={styles.indicator} />
               <Text style={styles.sectionTitle}>Our Mission</Text>
            </View>
            <BlurView intensity={60} tint="light" style={styles.card}>
              <Text style={styles.cardText}>
                Our mission is to bridge the gap between market demand and agricultural production. By providing farmers with real-time data, we help minimize crop wastage and maximize profitability, ensuring a sustainable future for agriculture.
              </Text>
            </BlurView>

            {/* Contact Support */}
            <View style={styles.sectionHeader}>
               <View style={styles.indicator} />
               <Text style={styles.sectionTitle}>Get in Touch</Text>
            </View>
            <BlurView intensity={60} tint="light" style={styles.card}>
              <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('mailto:support@cropplan.com')}>
                <View style={styles.contactIconCircle}><Mail color={THEME.colors.primary} size={18} /></View>
                <Text style={styles.contactText}>support@cropplan.com</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('tel:+919999999999')}>
                <View style={styles.contactIconCircle}><Phone color={THEME.colors.primary} size={18} /></View>
                <Text style={styles.contactText}>+91 99999 99999</Text>
              </TouchableOpacity>
            </BlurView>

            <Text style={styles.version}>{t('version') || 'Version 1.0.0'}</Text>
            <View style={{ height: 120 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { 
    padding: 24, 
    paddingTop: Platform.OS === 'android' ? 60 : 24 
  },

  hero: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 28,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    shadowColor: THEME.colors.primary,
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  heroTitle: { fontSize: 26, fontWeight: '900', color: THEME.colors.title, textAlign: 'center' },
  heroSubtitle: { fontSize: 13, color: THEME.colors.subtitle, marginTop: 6, textAlign: 'center', fontWeight: '600', paddingHorizontal: 20 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 35 },
  statCard: {
    flex: 1, borderRadius: 20, padding: 16, alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
  },
  statValue: { fontSize: 18, fontWeight: '900', color: THEME.colors.title },
  statLabel: { fontSize: 9, fontWeight: '700', color: THEME.colors.subtitle, textTransform: 'uppercase' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  indicator: { width: 4, height: 20, borderRadius: 2, backgroundColor: THEME.colors.primary },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: THEME.colors.title },

  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 25 },
  featureCard: {
    width: (width - 60) / 2,
    borderRadius: 24, padding: 16,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
  },
  featIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  featTitle: { fontSize: 14, fontWeight: '800', color: THEME.colors.title, marginBottom: 6 },
  featDesc: { fontSize: 11, color: THEME.colors.body, lineHeight: 16, fontWeight: '500' },

  card: {
    borderRadius: 24, padding: 20, marginBottom: 25,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
  },
  cardText: { fontSize: 14, color: THEME.colors.body, lineHeight: 22, fontWeight: '500' },

  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 },
  contactIconCircle: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.08)', justifyContent: 'center', alignItems: 'center' },
  contactText: { fontSize: 14, color: THEME.colors.title, fontWeight: '700' },

  version: { textAlign: 'center', fontSize: 12, color: THEME.colors.body, fontWeight: '600', marginTop: 10 },
});

export default AboutUsScreen;
