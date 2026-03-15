import React, { useState } from 'react';
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
import api from '../api/config';
import { User, Mail, Phone, MapPin, Lock, Camera, ChevronRight } from 'lucide-react-native';
import { THEME } from '../styles/theme';
import Logo from '../components/Logo';

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.phone || !form.address || !form.password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      let profileImage = null;
      if (image) {
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

      await api.post('/api/auth/register', { 
        ...form, 
        profileImage,
        role: 'farmer'
      });

      Alert.alert(
        'Success', 
        'Registration successful! Please wait for admin approval.', 
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={THEME.colors.bgGradient} style={styles.flex}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              
              <View style={styles.header}>
                <View style={styles.logoCircle}>
                  <Logo size={36} />
                </View>
                <Text style={styles.title}>Join CropPlan</Text>
                <Text style={styles.subtitle}>Enter your details to create an account</Text>
              </View>

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
                          <View style={styles.cameraIcon}>
                            <Camera size={12} color="white" />
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                    <Text style={styles.imageLabel}>Upload Profile Photo</Text>
                  </View>

                  <View style={styles.form}>
                    {[
                      { label: 'Full Name', key: 'name', icon: <User size={18} color="#94A3B8" />, placeholder: 'Naveen Chary' },
                      { label: 'Email Address', key: 'email', icon: <Mail size={18} color="#94A3B8" />, placeholder: 'farmer@example.com', autoCap: 'none' },
                      { label: 'Phone Number', key: 'phone', icon: <Phone size={18} color="#94A3B8" />, placeholder: '9876543210', keyboard: 'phone-pad' },
                      { label: 'Mandal / Region', key: 'address', icon: <MapPin size={18} color="#94A3B8" />, placeholder: 'Nirmal, Telangana' },
                      { label: 'Password', key: 'password', icon: <Lock size={18} color="#94A3B8" />, placeholder: '••••••••', secure: true },
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
                            secureTextEntry={item.secure}
                            placeholderTextColor="#94A3B8"
                          />
                          {item.icon}
                        </View>
                      </View>
                    ))}

                    <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading}>
                      <LinearGradient colors={['#22C55E', '#10B981']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.registerGradient}>
                        {loading ? <ActivityIndicator color="white" /> : (
                          <>
                            <Text style={styles.registerText}>Create Account</Text>
                            <ChevronRight size={20} color="white" />
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.footer}>
                    <Text style={styles.footerText}>Existing farmer? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                      <Text style={styles.iosAccent}>Sign In</Text>
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
  scrollContent: { 
    paddingHorizontal: 25, 
    paddingTop: Platform.OS === 'android' ? 60 : 20 
  },
  header: { alignItems: 'center', marginBottom: 25 },
  logoCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 15, backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.1, elevation: 4 },
  title: { fontSize: 28, fontWeight: '800', color: THEME.colors.title },
  subtitle: { fontSize: 15, color: THEME.colors.body, marginTop: 5, textAlign: 'center' },
  
  cardWrapper: { marginBottom: 20 },
  glassCard: { borderRadius: 32, padding: 25, backgroundColor: 'rgba(255, 255, 255, 0.45)', borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.4)' },
  
  imagePickerSection: { alignItems: 'center', marginBottom: 25 },
  imageBox: { width: 90, height: 90, borderRadius: 45, padding: 2, backgroundColor: THEME.colors.primary, shadowColor: '#000', shadowOpacity: 0.1, elevation: 8 },
  image: { width: '100%', height: '100%', borderRadius: 45 },
  placeholderImg: { width: '100%', height: '100%', borderRadius: 45, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: THEME.colors.primary, borderWidth: 2, borderColor: 'white', justifyContent: 'center', alignItems: 'center' },
  imageLabel: { fontSize: 12, color: THEME.colors.body, marginTop: 10, fontWeight: '700' },

  form: { gap: 15 },
  inputWrapper: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: THEME.colors.subtitle, marginLeft: 5 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', paddingHorizontal: 15 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#1E293B' },
  
  registerBtn: { borderRadius: 18, overflow: 'hidden', marginTop: 10 },
  registerGradient: { paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  registerText: { color: 'white', fontSize: 17, fontWeight: '700' },
  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { fontSize: 14, color: THEME.colors.body },
  iosAccent: { fontSize: 14, fontWeight: '700', color: THEME.colors.primary }
});

export default RegisterScreen;
