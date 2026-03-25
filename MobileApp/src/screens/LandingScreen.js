import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Dimensions, 
  Animated,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { ChevronRight, TrendingUp, Info, Sun, Cloud, CloudRain, Wind, MapPin } from 'lucide-react-native';
import { THEME } from '../styles/theme';
import api from '../api/config';
import Logo from '../components/Logo';

const { width } = Dimensions.get('window');

const PulseDot = () => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[styles.liveDot, { opacity: pulse }]} />;
};

const OrbitingItem = ({ delay, duration, image, size, top, left, radius }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: duration * 2.5, // Slowed down significantly
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, radius, 0, -radius, 0],
  });

  const translateY = anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [-radius, 0, radius, 0, -radius],
  });

  return (
    <Animated.View style={[styles.orbitingItem, { top, left, width: size, height: size, transform: [{ translateX }, { translateY }] }]}>
      <Image source={{ uri: image }} style={styles.fullImg} />
    </Animated.View>
  );
};

const LandingScreen = ({ navigation }) => {
  const [tickerData, setTickerData] = useState([]);
  const [loadingTicker, setLoadingTicker] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  
  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const res = await api.get('/api/market/govt-live');
        if (res.data?.data) {
          setTickerData(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching ticker:', error);
      } finally {
        setLoadingTicker(false);
      }
    };

    const fetchWeather = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Permission to access location was denied');
          setWeatherLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Call our new backend endpoint
        const res = await api.get(`/api/weather?lat=${latitude}&lon=${longitude}`);
        if (res.data?.success) {
          setWeatherData(res.data.data);
        }
      } catch (error) {
        console.error('Weather error:', error);
        setLocationError('Could not fetch weather');
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchTicker();
    fetchWeather();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={THEME.colors.bgGradient} style={styles.flex}>
        
        {/* Decorative Floating Elements (from website) */}
        <OrbitingItem top="12%" left="8%" size={55} radius={15} duration={3500} image="https://freepngimg.com/thumb/carrot/9-carrot-png-image.png" />
        <OrbitingItem top="18%" left="82%" size={50} radius={20} duration={4200} image="https://pngimg.com/d/tomato_PNG12589.png" />
        <OrbitingItem top="42%" left="15%" size={45} radius={12} duration={3800} image="https://pngimg.com/d/corn_PNG5287.png" />
        <OrbitingItem top="62%" left="78%" size={55} radius={18} duration={4800} image="https://pngimg.com/d/orange_PNG802.png" />

        <SafeAreaView style={styles.safeArea}>
          {/* Navbar Replacement (Top Bar) */}
          <View style={styles.navBar}>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <Logo size={24} />
              </View>
              <Text style={styles.logoText}>CropPlan</Text>
            </View>
            <TouchableOpacity 
              style={styles.navBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.navBtnText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            <View style={styles.heroSection}>
              <View style={styles.badge}>
                <TrendingUp size={12} color={THEME.colors.primary} />
                <Text style={styles.badgeText}>Real-time Market Insights</Text>
              </View>

              <Text style={styles.title}>Demand Based</Text>
              <Text style={styles.titleAccent}>Crop Planning</Text>
              
              <Text style={styles.subtitle}>
                Maximize your harvest revenue with official government market data and intelligent profit estimation tools.
              </Text>

              {/* Weather Widget */}
              <View style={styles.weatherWrapper}>
                <BlurView intensity={80} tint="dark" style={styles.weatherCard}>
                  {weatherLoading ? (
                    <ActivityIndicator size="small" color={THEME.colors.primary} />
                  ) : locationError ? (
                    <Text style={styles.weatherError}>{locationError}</Text>
                  ) : weatherData ? (
                    <View style={styles.weatherContent}>
                      <View style={styles.weatherMain}>
                        <View style={styles.locRow}>
                          <MapPin size={12} color={THEME.colors.primary} />
                          <Text style={styles.weatherLoc}>{weatherData.location}</Text>
                        </View>
                        <Text style={styles.weatherTemp}>{weatherData.temp}°C</Text>
                        <Text style={styles.weatherCond}>{weatherData.condition}</Text>
                      </View>
                      
                      <View style={styles.weatherDivider} />
                      
                      <View style={styles.weatherDetails}>
                        <View style={styles.weatherDetCol}>
                          <CloudRain size={14} color="#3B82F6" />
                          <Text style={styles.weatherDetVal}>{weatherData.humidity}%</Text>
                          <Text style={styles.weatherDetLab}>Humidity</Text>
                        </View>
                        <View style={styles.weatherDetCol}>
                          <Wind size={14} color="#10B981" />
                          <Text style={styles.weatherDetVal}>{weatherData.windSpeed}m/s</Text>
                          <Text style={styles.weatherDetLab}>Wind</Text>
                        </View>
                      </View>
                    </View>
                  ) : null}
                </BlurView>
              </View>

              {/* Market Ticker (Exactly like website) */}
              <View style={styles.tickerContainer}>
                <BlurView intensity={80} tint="dark" style={styles.tickerGlass}>
                  <View style={styles.tickerHeaderRow}>
                    <PulseDot />
                    <Text style={styles.liveBadgeText}>LIVE MARKET WATCH</Text>
                  </View>
                  
                  {loadingTicker ? (
                    <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 20 }} />
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tickerScrollContent}>
                      {tickerData.map((item, idx) => (
                        <View key={idx} style={styles.marketCard}>
                          <View style={styles.cardTop}>
                            <Text style={styles.commodityName}>{item.commodity}</Text>
                            <TrendingUp size={14} color="#10B981" />
                          </View>
                          <View style={styles.priceRow}>
                            <Text style={styles.priceSymbol}>₹</Text>
                            <Text style={styles.priceValue}>{item.livePrice}</Text>
                            <Text style={styles.priceUnit}>/{item.unit}</Text>
                          </View>
                          <Text style={styles.marketLoc} numberOfLines={1}>
                            {item.market}, {item.state}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  )}

                  <View style={styles.experimentalBadge}>
                    <Info size={10} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.disclaimerText}>
                      Experimental Data • Verify locally before cultivation
                    </Text>
                  </View>
                </BlurView>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionSection}>
                <TouchableOpacity 
                  style={styles.primaryBtn}
                  onPress={() => navigation.navigate('Register')}
                >
                  <LinearGradient 
                    colors={[THEME.colors.primary, THEME.colors.primaryDark]} 
                    start={{x:0, y:0}} 
                    end={{x:1, y:0}}
                    style={styles.btnGradient}
                  >
                    <Text style={styles.primaryBtnText}>Get Started</Text>
                    <ChevronRight color="white" size={20} />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                   style={styles.secondaryBtn}
                   onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.secondaryBtnText}>Farmer Access</Text>
                </TouchableOpacity>
              </View>

              {/* Farmer Image (from website) */}
              <View style={styles.mainImgContainer}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=1000' }}
                  style={styles.mainImg}
                />
                <LinearGradient 
                  colors={['transparent', 'rgba(0,0,0,0.6)']} 
                  style={styles.imgOverlay}
                />
              </View>

            </View>

            <View style={{ height: 100 }} />
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
  orbitingItem: { position: 'absolute', opacity: 0.9 },
  fullImg: { width: '100%', height: '100%', resizeMode: 'contain' },
  
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: Platform.OS === 'android' ? 60 : 16,
    paddingBottom: 16,
    zIndex: 100,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: THEME.colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: THEME.colors.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  logoText: { fontSize: 22, fontWeight: '900', color: THEME.colors.title, letterSpacing: -0.5 },
  navBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  navBtnText: { fontSize: 14, fontWeight: '800', color: THEME.colors.primary },

  scrollContent: { paddingHorizontal: 25 },
  heroSection: { alignItems: 'center', paddingTop: 20 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  badgeText: { fontSize: 11, fontWeight: '800', color: THEME.colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  
  title: { fontSize: 44, fontWeight: '900', color: '#334155', textAlign: 'center', letterSpacing: -1 },
  titleAccent: { fontSize: 44, fontWeight: '900', color: THEME.colors.primary, textAlign: 'center', marginTop: -10, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', marginTop: 20, lineHeight: 24, paddingHorizontal: 10 },

  tickerContainer: { width: '100%', marginTop: 35 },
  tickerGlass: { borderRadius: 32, overflow: 'hidden', backgroundColor: 'rgba(15, 23, 42, 0.85)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tickerHeaderRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  liveBadgeText: { color: 'red', fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  
  tickerScrollContent: { padding: 16, gap: 12 },
  marketCard: { width: 150, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  commodityName: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '800' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  priceSymbol: { color: '#10B981', fontSize: 12, fontWeight: '800', marginRight: 2 },
  priceValue: { color: 'white', fontSize: 20, fontWeight: '900' },
  priceUnit: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700', marginLeft: 2 },
  marketLoc: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '600' },

  experimentalBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, backgroundColor: 'rgba(0,0,0,0.2)', gap: 6 },
  disclaimerText: { fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: '700' },

  actionSection: { width: '100%', marginTop: 35, gap: 15 },
  primaryBtn: { width: '100%', borderRadius: 24, overflow: 'hidden', elevation: 8, shadowColor: THEME.colors.primary, shadowOpacity: 0.3, shadowRadius: 15 },
  btnGradient: { paddingVertical: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  primaryBtnText: { color: 'white', fontSize: 18, fontWeight: '900' },
  secondaryBtn: { width: '100%', backgroundColor: 'white', paddingVertical: 18, borderRadius: 24, alignItems: 'center', borderWidth: 1.5, borderColor: '#F1F5F9' },
  secondaryBtnText: { color: '#475569', fontSize: 16, fontWeight: '800' },

  mainImgContainer: { width: '100%', height: 260, borderRadius: 32, overflow: 'hidden', marginTop: 40, borderWidth: 1.5, borderColor: 'white', elevation: 12 },
  mainImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  imgOverlay: { ...StyleSheet.absoluteFillObject },

  // Weather Styles
  weatherWrapper: { width: '100%', marginTop: 20, marginBottom: 10 },
  weatherCard: { 
    borderRadius: 24, 
    padding: 16, 
    backgroundColor: 'rgba(15, 23, 42, 0.85)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)', 
    overflow: 'hidden' 
  },
  weatherContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  weatherMain: { flex: 1 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  weatherLoc: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  weatherTemp: { fontSize: 32, fontWeight: '900', color: 'white', marginVertical: -2 },
  weatherCond: { fontSize: 14, fontWeight: '600', color: '#10B981' },
  weatherDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 15 },
  weatherDetails: { flexDirection: 'row', gap: 20 },
  weatherDetCol: { alignItems: 'center', gap: 2 },
  weatherDetVal: { fontSize: 14, fontWeight: '800', color: 'white' },
  weatherDetLab: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' },
  weatherError: { fontSize: 12, color: '#EF4444', textAlign: 'center', fontWeight: '600' },
});

export default LandingScreen;
