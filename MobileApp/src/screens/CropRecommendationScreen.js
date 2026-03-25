import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Droplets, AlertTriangle, Sprout, X, ChevronRight, IndianRupee, RefreshCw } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/config';
import { THEME } from '../styles/theme';

const { width } = Dimensions.get('window');

const ScoreBar = ({ score }) => (
  <View style={styles.scoreBarTrack}>
    <View style={[styles.scoreBarFill, { width: `${score}%` }]} />
  </View>
);

// Simple bar chart using View elements (no recharts on RN)
const ForecastBarChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  const maxPrice = Math.max(...data.map(d => d.predicted_price));
  return (
    <View style={styles.chartContainer}>
      {data.map((item, i) => {
        const barHeight = Math.max(8, (item.predicted_price / maxPrice) * 120);
        return (
          <View key={i} style={styles.barGroup}>
            <Text style={styles.barPrice}>₹{Math.round(item.predicted_price)}</Text>
            <View style={[styles.bar, { height: barHeight }]} />
            <Text style={styles.barMonth}>{item.month?.slice(0, 3)}</Text>
          </View>
        );
      })}
    </View>
  );
};

const CropRecommendationScreen = ({ navigation }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [forecastVisible, setForecastVisible] = useState(false);

  useEffect(() => {
    loadUserAndFetch();
  }, []);

  const loadUserAndFetch = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      fetchRecommendations(u.id || u._id);
    } else {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (userId) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/recommendation/${userId}`);
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      console.error('Recommendation fetch error:', err.message);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (cropName) => {
    setSelectedCrop(cropName);
    setForecastData(null);
    setForecastVisible(true);
    setLoadingForecast(true);
    try {
      const res = await api.get(`/api/recommendation/forecast?crop_name=${encodeURIComponent(cropName)}`);
      if (res.data.success && res.data.data.forecast) {
        setForecastData(res.data.data.forecast);
      }
    } catch (err) {
      console.error('Forecast fetch error:', err.message);
    } finally {
      setLoadingForecast(false);
    }
  };

  const getRiskColor = (risk) => {
    if (risk === 'Low') return '#10B981';
    if (risk === 'Medium') return '#F59E0B';
    return '#EF4444';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={THEME.colors.bgGradient} style={styles.flex}>
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={THEME.colors.primary} />
            <Text style={styles.loadingText}>Analyzing farm data & market trends...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={THEME.colors.bgGradient} style={styles.flex}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronRight size={22} color={THEME.colors.subtitle} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <TrendingUp size={20} color={THEME.colors.primary} />
            <Text style={styles.headerText}>AI Recommendations</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => user && fetchRecommendations(user.id || user._id)}
          >
            <RefreshCw size={18} color={THEME.colors.subtitle} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Profile warning if soil / land data missing */}
          {user && (!user.soil_type || !user.land_size_acres) && (
            <View style={styles.warningCard}>
              <AlertTriangle size={16} color="#D97706" />
              <View style={{ flex: 1 }}>
                <Text style={styles.warningTitle}>Personalize your results!</Text>
                <Text style={styles.warningBody}>Update Soil Type & Land Size in profile for 100% AI accuracy.</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={styles.warningBtn}>
                <Text style={styles.warningBtnText}>Update</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionSubtitle}>Best crops for your farm based on soil, weather & demand</Text>

          {recommendations.length === 0 ? (
            <View style={styles.emptyCard}>
              <Sprout size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Recommendations Available</Text>
              <Text style={styles.emptyBody}>Make sure the AI service is running and your profile has farm details.</Text>
            </View>
          ) : (
            recommendations.map((rec, index) => (
              <View key={rec.crop_name} style={[styles.recCard, index === 0 && styles.topPickCard]}>
                {index === 0 && (
                  <View style={styles.topPickBadge}>
                    <Text style={styles.topPickBadgeText}>TOP PICK</Text>
                  </View>
                )}
                <View style={[styles.recHeader, { justifyContent: 'center' }]}>
                  <View style={[styles.recIcon, index === 0 ? styles.recIconPrimary : styles.recIconGray, { marginBottom: 10 }]}>
                    <Sprout size={32} color={index === 0 ? THEME.colors.primary : '#64748B'} />
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.recCropName}>{rec.crop_name}</Text>
                    <View style={[styles.scoreRow, { width: width * 0.5 }]}>
                      <ScoreBar score={rec.score} />
                      <Text style={styles.scoreLabel}>{rec.score}% Match</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <View style={styles.statLabelRow}>
                      <IndianRupee size={10} color="#94A3B8" />
                      <Text style={styles.statLabel}>Market Price</Text>
                    </View>
                    {rec.live_market ? (
                      <Text style={styles.statValue}>₹{rec.live_market.modal_price?.toLocaleString()}<Text style={styles.statUnit}>/qtl</Text></Text>
                    ) : (
                      <Text style={[styles.statValue, { color: '#94A3B8', fontSize: 12 }]}>Awaiting market update</Text>
                    )}
                  </View>

                  <View style={styles.statBox}>
                    <View style={styles.statLabelRow}>
                      <Droplets size={10} color="#94A3B8" />
                      <Text style={styles.statLabel}>Water Req.</Text>
                    </View>
                    <Text style={styles.statValue}>{rec.water_requirement || 'N/A'}</Text>
                  </View>

                  <View style={styles.statBox}>
                    <View style={styles.statLabelRow}>
                      <AlertTriangle size={10} color="#94A3B8" />
                      <Text style={styles.statLabel}>Risk</Text>
                    </View>
                    <Text style={[styles.statValue, { color: getRiskColor(rec.risk) }]}>{rec.risk || 'N/A'}</Text>
                  </View>

                  <View style={styles.statBox}>
                    <View style={styles.statLabelRow}>
                      <TrendingUp size={10} color="#94A3B8" />
                      <Text style={styles.statLabel}>Est. Profit</Text>
                    </View>
                    <Text style={styles.statValue}>₹{(rec.expected_profit || 0).toLocaleString()}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.forecastBtn}
                  onPress={() => fetchForecast(rec.crop_name)}
                >
                  <Text style={styles.forecastBtnText}>View 3-Month Forecast</Text>
                  <ChevronRight size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>

      {/* Forecast Modal */}
      <Modal visible={forecastVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <LinearGradient colors={[THEME.colors.primary, THEME.colors.primaryDark]} style={styles.modalHeader}>
              <View>
                <Text style={styles.modalCropName}>{selectedCrop}</Text>
                <Text style={styles.modalSubtitle}>3-Month Price Forecast (AI Powered)</Text>
              </View>
              <TouchableOpacity
                onPress={() => { setForecastVisible(false); setForecastData(null); setSelectedCrop(null); }}
                style={styles.closeBtn}
              >
                <X size={20} color="white" />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.modalBody}>
              {loadingForecast ? (
                <View style={styles.centered}>
                  <ActivityIndicator size="large" color={THEME.colors.primary} />
                  <Text style={styles.loadingText}>Running Prophet Time-Series Model...</Text>
                </View>
              ) : forecastData ? (
                <>
                  <ForecastBarChart data={forecastData} />
                  <View style={styles.insightBox}>
                    <Text style={styles.insightText}>
                      <Text style={{ fontWeight: '800' }}>AI Insight: </Text>
                      Market signals indicate{' '}
                      {forecastData[0]?.predicted_price < forecastData[forecastData.length - 1]?.predicted_price
                        ? 'an upward' : 'a stable or softening'}{' '}
                      price trend for {selectedCrop} in the coming months.
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={[styles.emptyBody, { textAlign: 'center', marginTop: 40 }]}>
                  Failed to generate forecast. Ensure the AI service is running.
                </Text>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 14, color: '#64748B', fontWeight: '600', textAlign: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 55 : 16,
    paddingBottom: 12,
    gap: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'white', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0', elevation: 2,
  },
  headerTitle: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerText: { fontSize: 18, fontWeight: '800', color: THEME.colors.title },
  refreshBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'white', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0', elevation: 2,
  },

  scroll: { paddingHorizontal: 20, paddingTop: 4 },

  warningCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFBEB', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#FDE68A', marginBottom: 16,
  },
  warningTitle: { fontSize: 13, fontWeight: '800', color: '#92400E' },
  warningBody: { fontSize: 11, color: '#B45309', marginTop: 2 },
  warningBtn: { backgroundColor: '#F59E0B', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  warningBtnText: { color: 'white', fontSize: 11, fontWeight: '800' },

  sectionSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 16, fontWeight: '500' },

  emptyCard: {
    alignItems: 'center', padding: 40, backgroundColor: 'white',
    borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9',
    borderStyle: 'dashed', marginTop: 20,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#64748B', marginTop: 14 },
  emptyBody: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 6 },

  recCard: {
    backgroundColor: 'white', borderRadius: 28, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12,
    overflow: 'hidden',
  },
  topPickCard: { borderColor: THEME.colors.primary, borderWidth: 1.5 },
  topPickBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 16, paddingVertical: 6,
    borderBottomLeftRadius: 20,
  },
  topPickBadgeText: { color: 'white', fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  recHeader: { flexDirection: 'column', alignItems: 'center', marginBottom: 20 },
  recIcon: { width: 52, height: 52, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  recIconPrimary: { backgroundColor: 'rgba(16,185,129,0.1)' },
  recIconGray: { backgroundColor: '#F8FAFC' },
  recCropName: { fontSize: 22, fontWeight: '900', color: THEME.colors.title, marginBottom: 4 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scoreBarTrack: { flex: 1, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  scoreBarFill: { height: '100%', backgroundColor: THEME.colors.primary, borderRadius: 3 },
  scoreLabel: { fontSize: 11, fontWeight: '800', color: THEME.colors.primary },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, justifyContent: 'space-between' },
  statBox: { width: '48.5%', backgroundColor: '#F8FAFC', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 10 },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  statLabel: { fontSize: 9, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' },
  statValue: { fontSize: 14, fontWeight: '800', color: THEME.colors.title },
  statUnit: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },

  forecastBtn: {
    backgroundColor: '#1E293B', paddingVertical: 16, borderRadius: 18,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  forecastBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden', maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24 },
  modalCropName: { fontSize: 24, fontWeight: '900', color: 'white' },
  modalSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  modalBody: { padding: 24, minHeight: 200 },

  // Bar chart
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 30, height: 180, marginBottom: 20 },
  barGroup: { alignItems: 'center', gap: 6 },
  bar: { width: 54, backgroundColor: THEME.colors.primary, borderRadius: 10, minHeight: 8 },
  barPrice: { fontSize: 11, fontWeight: '800', color: '#475569' },
  barMonth: { fontSize: 12, fontWeight: '700', color: '#64748B' },

  insightBox: { backgroundColor: 'rgba(16,185,129,0.06)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(16,185,129,0.1)' },
  insightText: { fontSize: 13, color: '#065F46', lineHeight: 20 },
});

export default CropRecommendationScreen;
