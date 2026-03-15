import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Image, 
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/config';
import { User, Mail, Phone, MapPin, Camera, ChevronRight, Save, X } from 'lucide-react-native';
import { THEME } from '../styles/theme';
import { useLanguage } from '../context/LanguageContext';

const EditProfileScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
          });
          if (user.profileImage?.url) {
            setImage({ uri: user.profileImage.url });
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setFetching(false);
      }
    };
    loadUserData();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleUpdate = async () => {
    if (!form.name || !form.email || !form.phone || !form.address) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      let profileImage = null;
      
      // If a NEW image was picked (has uri and it's not the original url)
      if (image && image.uri && !image.uri.startsWith('http')) {
        const formData = new FormData();
        formData.append('image', {
          uri: image.uri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
        const uploadRes = await api.post('/api/image/upload-pre-register', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        profileImage = {
          url: uploadRes.data.imageUrl,
          imageId: uploadRes.data.imageId
        };
      }

      const response = await api.put('/api/auth/update-profile', { 
        ...form, 
        ...(profileImage && { profileImage })
      });

      const updatedUser = response.data.user;
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      Alert.alert(
        'Success', 
        'Profile updated successfully!', 
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const msg = error.response?.data?.message || 'Update failed.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={THEME.colors.bgGradient} style={styles.flex}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            
            {/* Custom Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <X size={24} color={THEME.colors.title} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Edit Profile</Text>
              <View style={{ width: 44 }} /> 
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              
              <View style={styles.cardWrapper}>
                <BlurView intensity={60} tint="light" style={styles.glassCard}>
                  
                  {/* Photo Picker */}
                  <View style={styles.imagePickerSection}>
                    <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
                      {image ? (
                        <Image source={{ uri: image.uri }} style={styles.image} />
                      ) : (
                        <View style={styles.placeholderImg}>
                          <User size={40} color="#94A3B8" />
                        </View>
                      )}
                      <View style={styles.cameraIcon}>
                        <Camera size={12} color="white" />
                      </View>
                    </TouchableOpacity>
                    <Text style={styles.imageLabel}>Change Profile Photo</Text>
                  </View>

                  <View style={styles.form}>
                    {[
                      { label: 'Full Name', key: 'name', icon: <User size={18} color="#94A3B8" />, placeholder: 'Naveen Chary' },
                      { label: 'Email Address', key: 'email', icon: <Mail size={18} color="#94A3B8" />, placeholder: 'farmer@example.com', autoCap: 'none' },
                      { label: 'Phone Number', key: 'phone', icon: <Phone size={18} color="#94A3B8" />, placeholder: '9876543210', keyboard: 'phone-pad' },
                      { label: 'Mandal / Region', key: 'address', icon: <MapPin size={18} color="#94A3B8" />, placeholder: 'Nirmal, Telangana' },
                    ].map((item) => (
                      <View key={item.key} style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>{item.label}</Text>
                        <View style={styles.inputGroup}>
                          <TextInput
                            style={styles.input}
                            placeholder={item.placeholder}
                            value={form[item.key]}
                            onChangeText={(val) => setForm({...form, [item.key]: val})}
                            autoCapitalize={item.autoCap || 'sentences'}
                            keyboardType={item.keyboard || 'default'}
                            placeholderTextColor="#94A3B8"
                          />
                          {item.icon}
                        </View>
                      </View>
                    ))}

                    <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate} disabled={loading}>
                      <LinearGradient colors={['#22C55E', '#10B981']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.updateGradient}>
                        {loading ? <ActivityIndicator color="white" /> : (
                          <>
                            <Text style={styles.updateText}>Save Changes</Text>
                            <Save size={20} color="white" />
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                  
                </BlurView>
              </View>

              <View style={{ height: 60 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  safeArea: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 25, paddingTop: 10 },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 30) + 10 : 10,
    paddingBottom: 15
  },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowAlpha: 0.1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: THEME.colors.title },

  cardWrapper: { marginTop: 10 },
  glassCard: { borderRadius: 32, padding: 25, backgroundColor: 'rgba(255, 255, 255, 0.45)', borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.4)' },
  
  imagePickerSection: { alignItems: 'center', marginBottom: 25 },
  imageBox: { width: 100, height: 100, borderRadius: 50, padding: 2, backgroundColor: THEME.colors.primary, shadowColor: '#000', shadowOpacity: 0.1, elevation: 8 },
  image: { width: '100%', height: '100%', borderRadius: 50 },
  placeholderImg: { width: '100%', height: '100%', borderRadius: 50, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: THEME.colors.primary, borderWidth: 3, borderColor: 'white', justifyContent: 'center', alignItems: 'center' },
  imageLabel: { fontSize: 13, color: THEME.colors.body, marginTop: 12, fontWeight: '700' },

  form: { gap: 15 },
  inputWrapper: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: THEME.colors.subtitle, marginLeft: 5 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', paddingHorizontal: 15 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#1E293B' },
  
  updateBtn: { borderRadius: 18, overflow: 'hidden', marginTop: 15 },
  updateGradient: { paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  updateText: { color: 'white', fontSize: 17, fontWeight: '700' },
});

export default EditProfileScreen;
