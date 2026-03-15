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
  TextInput,
  StatusBar,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MapPin, TrendingUp, Info, RefreshCw, ChevronRight, User, Pencil } from 'lucide-react-native';
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
  const scrollX = useRef(new Animated.Value(0)).current;
  const { t } = useLanguage();

  const fetchData = async () => {
    try {
      const [userRes, demandsRes] = await Promise.all([
        AsyncStorage.getItem('user'),
        api.get('/api/market/demand')
      ]);

      if (userRes) setUser(JSON.parse(userRes));
      setDemands(demandsRes.data.demands || []);
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

  sectionHeader: { paddingHorizontal: 25, marginTop: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: THEME.colors.title },
  sectionSubtitle: { fontSize: 14, color: THEME.colors.body, marginTop: 4 },

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
  emptyText: { color: THEME.colors.body, marginTop: 15, textAlign: 'center' }
});

export default HomeScreen;
