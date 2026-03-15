import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  SafeAreaView,
  Dimensions,
  Alert,
  StatusBar,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Mail, Phone, MapPin, LogOut, ChevronRight, ShieldCheck, Pencil } from 'lucide-react-native';
import { THEME } from '../styles/theme';
import { useLanguage } from '../context/LanguageContext';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const { t } = useLanguage();

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        const u = await AsyncStorage.getItem('user');
        if (u) setUser(JSON.parse(u));
      };
      fetchUser();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.replace('Landing');
          }
        }
      ]
    );
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>
        {icon}
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={THEME.colors.bgGradient} style={styles.flex}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Header (from website ProfilePage) */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.headerTitle}>{t('myProfile')}</Text>
                  <Text style={styles.headerSubtitle}>Manage your information</Text>
                </View>
                <TouchableOpacity 
                  style={styles.editHeaderBtn} 
                  onPress={() => navigation.navigate('EditProfile')}
                >
                  {Pencil ? <Pencil size={22} color={THEME.colors.primary} /> : <View />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Profile Card (Mirroring ProfileCard.jsx from website) */}
            <View style={styles.profileCardWrapper}>
              <View style={styles.profileCardGlow} />
              <BlurView intensity={50} tint="light" style={styles.profileCard}>
                <View style={styles.avatarBorder}>
                  <View style={styles.avatarInner}>
                    {user?.profileImage?.url || user?.profileImageUrl || (typeof user?.profileImage === 'string' && user?.profileImage) ? (
                      <Image 
                        source={{ uri: user.profileImage?.url || user.profileImageUrl || (typeof user.profileImage === 'string' ? user.profileImage : '') }} 
                        style={styles.fullImg} 
                      />
                    ) : (
                      <User size={40} color={THEME.colors.primary} />
                    )}
                  </View>
                </View>
                <Text style={styles.userName}>{user?.name}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
                </View>
                <Text style={styles.userBio}>{user?.address}</Text>
              </BlurView>
            </View>

            {/* Details Section */}
            <View style={styles.detailsCard}>
               <View style={styles.sectionTitleRow}>
                  <View style={styles.indicator} />
                  <Text style={styles.sectionTitle}>Account Information</Text>
               </View>

               <View style={styles.detailsList}>
                 {User ? <InfoRow icon={<User size={18} color={THEME.colors.primary} />} label="Full Name" value={user?.name} /> : null}
                 {Mail ? <InfoRow icon={<Mail size={18} color={THEME.colors.primary} />} label="Email Address" value={user?.email} /> : null}
                 {Phone ? <InfoRow icon={<Phone size={18} color={THEME.colors.primary} />} label="Contact Number" value={user?.phone} /> : null}
                 {MapPin ? <InfoRow icon={<MapPin size={18} color={THEME.colors.primary} />} label="Region / Address" value={user?.address} /> : null}
               </View>
            </View>

            {/* Account Status (from website) */}
            <View style={styles.statusCard}>
              <View>
                <Text style={styles.statusTitle}>Account Status</Text>
                <Text style={styles.statusSubtitle}>Your account is verified and active</Text>
              </View>
              <View style={styles.statusPill}>
                 <View style={styles.pulseDot} />
                 <Text style={styles.statusPillText}>{user?.status?.toUpperCase() || 'ACTIVE'}</Text>
              </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              {LogOut ? <LogOut size={20} color="#EF4444" /> : <View />}
              <Text style={styles.logoutText}>{t('logout')}</Text>
            </TouchableOpacity>

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
  fullImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  scrollContent: { 
    padding: 24, 
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 30) + 10 : 24 
  },
  header: { marginBottom: 30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: '900', color: THEME.colors.title },
  headerSubtitle: { fontSize: 16, color: THEME.colors.body, marginTop: 5 },
  editHeaderBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },

  profileCardWrapper: { marginBottom: 30, alignItems: 'center' },
  profileCardGlow: { position: 'absolute', width: width * 0.7, height: width * 0.7, borderRadius: 100, backgroundColor: 'rgba(34, 197, 94, 0.1)', top: 20 },
  profileCard: { width: '100%', borderRadius: 40, padding: 30, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.4)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)', overflow: 'hidden' },
  avatarBorder: { width: 100, height: 100, borderRadius: 50, padding: 3, backgroundColor: THEME.colors.primary, shadowColor: '#000', shadowOpacity: 0.1, elevation: 10, marginBottom: 15 },
  avatarInner: { width: '100%', height: '100%', borderRadius: 50, backgroundColor: 'white', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 24, fontWeight: '800', color: THEME.colors.title },
  roleBadge: { backgroundColor: 'rgba(34, 197, 94, 0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
  roleText: { color: THEME.colors.primary, fontWeight: '800', fontSize: 11 },
  userBio: { fontSize: 14, color: THEME.colors.body, textAlign: 'center', marginTop: 12, lineHeight: 20 },

  detailsCard: { backgroundColor: 'white', borderRadius: 32, padding: 25, shadowColor: '#000', shadowOpacity: 0.04, elevation: 5, borderWidth: 1, borderColor: '#F1F5F9' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 25 },
  indicator: { width: 4, height: 24, borderRadius: 2, backgroundColor: THEME.colors.primary },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: THEME.colors.title },

  detailsList: { gap: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  infoIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.05)', justifyContent: 'center', alignItems: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '700', color: THEME.colors.subtitle },

  statusCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderRadius: 24, padding: 20, marginTop: 20, borderLeftWidth: 5, borderLeftColor: THEME.colors.primary, shadowColor: '#000', shadowOpacity: 0.04, elevation: 5 },
  statusTitle: { fontSize: 16, fontWeight: '800', color: THEME.colors.title },
  statusSubtitle: { fontSize: 13, color: THEME.colors.body, marginTop: 2 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: THEME.colors.primary },
  statusPillText: { fontSize: 12, fontWeight: '800', color: '#15803D' },

  logoutBtn: { width: '100%', backgroundColor: 'rgba(239, 68, 68, 0.05)', paddingVertical: 18, borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 30, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.1)' },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '800' }
});

export default ProfileScreen;
