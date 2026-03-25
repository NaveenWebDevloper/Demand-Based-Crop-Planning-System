import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ScrollView,
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MapPin, TrendingUp, Info, RefreshCw, ChevronRight, User, Pencil, Sprout, MessageSquare } from 'lucide-react-native';
import api from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../styles/theme';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const HomeScreen = ({ navigation }) => {
  const [demands, setDemands] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { t } = useLanguage();

  const fetchData = async () => {
    try {
      const userRes = await AsyncStorage.getItem('user');
      const parsedUser = userRes ? JSON.parse(userRes) : null;
      if (parsedUser) setUser(parsedUser);

      const [demandsRes] = await Promise.all([
        api.get('/api/market/demand'),
      ]);
      setDemands(demandsRes.data.demands || []);

      // Fetch AI recommendations in background
      if (parsedUser?.id || parsedUser?._id) {
        const userId = parsedUser.id || parsedUser._id;
        try {
          const recRes = await api.get(`/api/recommendation/${userId}`);
          setRecommendations((recRes.data.recommendations || []).slice(0, 2));
        } catch (_) {}
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const getSeasonStyle = (season) => {
    const s = (season || '').toLowerCase();
    if (s.includes('summer')) return { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' };
    if (s.includes('winter')) return { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' };
    if (s.includes('rainy') || s.includes('monsoon')) return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
    return { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0' };
  };

  const renderCarouselItem = ({ item, index }) => {
    const season = getSeasonStyle(item.season);

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.cropCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('RevenueEstimator', { demandId: item._id })}
        >
          <View style={styles.cardImageStage}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.fullImg} />
            ) : (
              <View style={styles.imgPlaceholder}><Info size={40} color="#CBD5E1" /></View>
            )}
            <View style={[styles.seasonBadge, { backgroundColor: season.bg, borderColor: season.border }]}>
              <Text style={[styles.seasonText, { color: season.text }]}>{item.season?.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.cropName}>{item.crop}</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Target Region</Text>
                <View style={styles.row}>
                  <MapPin size={12} color={THEME.colors.subtitle} />
                  <Text style={styles.statValue} numberOfLines={1}>{item.region}</Text>
                </View>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Market Price</Text>
                <Text style={[styles.statValue, { color: '#065F46' }]}>₹{item.price}/{item.quantityUnit || 'kg'}</Text>
              </View>
            </View>

            <View style={styles.demandBox}>
              <Text style={styles.demandLabel}>Total Market Demand</Text>
              <Text style={styles.demandValue}>{item.quantity} {item.quantityUnit}</Text>
            </View>

            <TouchableOpacity
              style={styles.estimateBtn}
              onPress={() => navigation.navigate('RevenueEstimator', { demandId: item._id })}
            >
              <Text style={styles.estimateBtnText}>{t('estimateRevenue')}</Text>
              <ChevronRight size={18} color="white" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={THEME.colors.bgGradient} style={styles.flex}>

        {/* Dashboard Header (from website) */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.userRow}>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')} activeOpacity={0.7}>
                <View style={styles.avatarBorder}>
                  <View style={styles.avatarInner}>
                    {user?.profileImage?.url || user?.profileImageUrl || (typeof user?.profileImage === 'string' && user?.profileImage) ? (
                      <Image
                        source={{ uri: user.profileImage?.url || user.profileImageUrl || (typeof user.profileImage === 'string' ? user.profileImage : '') }}
                        style={styles.fullImg}
                      />
                    ) : (
                      <User color={THEME.colors.primary} size={20} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
              <View>
                <Text style={styles.welcomeText}>{t('welcomeBack')}</Text>
                <Text style={styles.userNameText}>{user?.name?.split(' ')[0] || 'Farmer'}</Text>
                <View style={styles.statusRow}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Market Live</Text>
                  <View style={styles.sep} />
                  <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={styles.editSmallBtn}>
                    <Pencil size={10} color={THEME.colors.primary} />
                    <Text style={styles.editSmallText}>Edit Profile</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.headerBtn} onPress={onRefresh}>
              <RefreshCw size={20} color={THEME.colors.subtitle} />
            </TouchableOpacity>
          </View>

          {/* Summary Card */}
          <LinearGradient colors={[THEME.colors.primary, THEME.colors.primaryDark]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.summaryCard}>
            <View>
              <Text style={styles.summaryLabel}>{t('marketDemands')}</Text>
              <Text style={styles.summaryValue}>{demands.length}</Text>
            </View>
            <TrendingUp size={48} color="rgba(255,255,255,0.2)" />
          </LinearGradient>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >

          {/* AI Recommendations Section */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <TrendingUp size={18} color={THEME.colors.primary} />
              <Text style={styles.sectionTitle}>AI Recommendations</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('CropRecommendation')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {recommendations.length > 0 ? (
            <View style={styles.recPreviewContainer}>
              {recommendations.map((rec, i) => (
                <TouchableOpacity
                  key={rec.crop_name}
                  style={styles.recPreviewCard}
                  onPress={() => navigation.navigate('CropRecommendation')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.recPreviewIcon, i === 0 && styles.recPreviewIconPrimary]}>
                    <Sprout size={18} color={i === 0 ? THEME.colors.primary : '#64748B'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recPreviewCrop}>{rec.crop_name}</Text>
                    <View style={styles.recPreviewBarRow}>
                      <View style={styles.recPreviewTrack}>
                        <View style={[styles.recPreviewFill, { width: `${rec.score}%` }]} />
                      </View>
                      <Text style={styles.recPreviewScore}>{rec.score}%</Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#CBD5E1" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.recEmptyCard}
              onPress={() => navigation.navigate('CropRecommendation')}
            >
              <Sprout size={22} color="#CBD5E1" />
              <Text style={styles.recEmptyText}>Tap to get AI crop recommendations</Text>
              <ChevronRight size={16} color="#CBD5E1" />
            </TouchableOpacity>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('marketDemands')}</Text>
            <Text style={styles.sectionSubtitle}>{t('noDemandsFound').replace('No market demands found.', 'Swipe to explore available crop demands')}</Text>
          </View>

          {/* Carousel (Matching website behavior) */}
          <FlatList
            data={demands}
            renderItem={renderCarouselItem}
            keyExtractor={item => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + 20}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselList}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Info size={40} color="#CBD5E1" />
                <Text style={styles.emptyText}>No demands available currently.</Text>
              </View>
            }
          />

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Floating Chatbot FAB */}
        <TouchableOpacity 
          style={styles.fab} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('HelpDesk')}
        >
          <LinearGradient
            colors={[THEME.colors.primary, THEME.colors.primaryDark]}
            style={styles.fabGradient}
          >
            <MessageSquare color="white" size={26} />
            <View style={styles.fabBadge} />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fullImg: { width: '100%', height: '100%', resizeMode: 'cover' },

  header: {
    paddingHorizontal: 25,
    paddingTop: Platform.OS === 'android' ? 60 : 25,
    paddingBottom: 15
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarBorder: { width: 44, height: 44, borderRadius: 22, padding: 2, backgroundColor: THEME.colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarInner: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  welcomeText: { fontSize: 13, color: THEME.colors.subtitle, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  userNameText: { fontSize: 26, fontWeight: '900', color: THEME.colors.title, marginTop: 2, marginBottom: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: THEME.colors.primary },
  statusText: { fontSize: 13, color: THEME.colors.subtitle, fontWeight: '600' },
  sep: { width: 1, height: 12, backgroundColor: '#CBD5E1', marginHorizontal: 4 },
  editSmallBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16, 185, 129, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  editSmallText: { fontSize: 10, fontWeight: '800', color: THEME.colors.primary, textTransform: 'uppercase' },
  headerBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    backgroundColor: 'white', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  
  summaryCard: { borderRadius: 24, padding: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: THEME.colors.primary, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  summaryLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { fontSize: 36, fontWeight: '900', color: 'white', marginTop: 2 },

  sectionHeader: { paddingHorizontal: 25, marginTop: 10, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: THEME.colors.title },
  sectionSubtitle: { fontSize: 13, color: THEME.colors.body, marginTop: 2 },
  viewAllText: { fontSize: 13, fontWeight: '700', color: THEME.colors.primary, paddingHorizontal: 25 },

  // AI Recommendations preview
  recPreviewContainer: { marginHorizontal: 25, marginBottom: 20, gap: 10 },
  recPreviewCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'white', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2 },
  recPreviewIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  recPreviewIconPrimary: { backgroundColor: 'rgba(16,185,129,0.1)' },
  recPreviewCrop: { fontSize: 15, fontWeight: '700', color: THEME.colors.title, marginBottom: 4 },
  recPreviewBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recPreviewTrack: { flex: 1, height: 5, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  recPreviewFill: { height: '100%', backgroundColor: THEME.colors.primary, borderRadius: 3 },
  recPreviewScore: { fontSize: 11, fontWeight: '800', color: THEME.colors.primary },
  recEmptyCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'white', borderRadius: 18, padding: 18, marginHorizontal: 25, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9', borderStyle: 'dashed' },
  recEmptyText: { flex: 1, fontSize: 14, color: '#94A3B8', fontWeight: '500' },

  carouselList: { paddingLeft: 25, paddingRight: 5 },
  cardContainer: { width: CARD_WIDTH, marginRight: 20 },
  cropCard: { backgroundColor: 'white', borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9', elevation: 5, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15 },
  cardImageStage: { width: '100%', height: 180 },
  imgPlaceholder: { width: '100%', height: '100%', backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  seasonBadge: { position: 'absolute', top: 15, right: 15, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  seasonText: { fontSize: 10, fontWeight: '800' },
  
  cardBody: { padding: 20 },
  cropName: { fontSize: 22, fontWeight: '800', color: THEME.colors.title, marginBottom: 15 },
  statsGrid: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  statBox: { flex: 1, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  statLabel: { fontSize: 10, fontWeight: '700', color: THEME.colors.body, textTransform: 'uppercase', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontSize: 14, fontWeight: '700', color: THEME.colors.subtitle },
  
  demandBox: { backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: 16, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.1)' },
  demandLabel: { fontSize: 12, fontWeight: '600', color: '#065F46' },
  demandValue: { fontSize: 18, fontWeight: '800', color: '#065F46', marginTop: 2 },
  
  estimateBtn: { backgroundColor: THEME.colors.primary, paddingVertical: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  estimateBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },

  emptyBox: { width: width - 50, alignItems: 'center', padding: 40 },
  emptyText: { color: THEME.colors.body, marginTop: 15, textAlign: 'center' },
  
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    width: 65,
    height: 65,
    borderRadius: 33,
    elevation: 10,
    zIndex: 9999,
    shadowColor: THEME.colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: 'white',
  }
});

export default HomeScreen;
