import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  StatusBar,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/config';
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { THEME } from '../styles/theme';
import Logo from '../components/Logo';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please enter your email or phone.');
      return;
    }

    setLoading(true);
    try {
      const isEmail = identifier.includes('@');
      const payload = isEmail 
        ? { email: identifier.trim(), password } 
        : { phone: identifier.trim(), password };

      const response = await api.post('/api/auth/login', payload);
      const user = response.data.user;
      
      await AsyncStorage.setItem('user', JSON.stringify(user));
      if (response.data.token) {
        await AsyncStorage.setItem('jwtToken', response.data.token);
      }

      navigation.replace(user.role === 'admin' ? 'AdminMain' : 'FarmerMain');
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      Alert.alert('Login Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Super Clean Background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F8FAFC' }]} />
      
      {/* Subtle Background Glows */}
      <View style={[styles.decorCircle, { top: -80, right: -80, width: 350, height: 350, backgroundColor: 'rgba(34, 197, 94, 0.06)' }]} />
      <View style={[styles.decorCircle, { bottom: -120, left: -100, width: 450, height: 450, backgroundColor: 'rgba(20, 184, 166, 0.04)' }]} />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Minimal Header */}
            <View style={styles.header}>
              <View style={styles.logoBox}>
                <Logo size={44} />
              </View>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to manage your planning</Text>
            </View>

            {/* Login Card with Liquid Glass Effect */}
            <View style={styles.cardWrapper}>
              <BlurView intensity={90} tint="light" style={styles.glassCard}>
                <View style={styles.form}>
                  {/* Email/Phone Input */}
                  <View style={styles.inputBox}>
                    <Text style={styles.label}>Email or Phone</Text>
                    <View style={styles.inputContainer}>
                      <Mail size={18} color="#64748B" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter identifier"
                        value={identifier}
                        onChangeText={setIdentifier}
                        autoCapitalize="none"
                        placeholderTextColor="#94A3B8"
                        keyboardType="email-address"
                      />
                    </View>
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputBox}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputContainer}>
                      <Lock size={18} color="#64748B" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        placeholderTextColor="#94A3B8"
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        {showPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* <TouchableOpacity style={styles.forgotBtn}>
                    <Text style={styles.forgotText}>Forgot password?</Text>
                  </TouchableOpacity> */}

                  {/* Submit Button */}
                  <TouchableOpacity 
                    style={styles.loginBtn} 
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    <LinearGradient 
                      colors={[THEME.colors.primary, THEME.colors.primaryDark]} 
                      start={{x:0, y:0}} end={{x:1, y:0}}
                      style={styles.btnGradient}
                    >
                      {loading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <>
                          <Text style={styles.btnText}>Sign In</Text>
                          <ArrowRight color="white" size={20} strokeWidth={3} />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Subtle Reflection Overlay */}
                <View style={styles.glassReflection} pointerEvents="none" />
              </BlurView>
            </View>

            {/* Footer Links */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>New here? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signupText}>Create account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { paddingHorizontal: 30, paddingTop: height * 0.08, paddingBottom: 50 },
  decorCircle: { position: 'absolute', borderRadius: 999 },
  
  header: { alignItems: 'center', marginBottom: 40 },
  logoBox: { 
    width: 82, height: 82, borderRadius: 28, 
    backgroundColor: '#FFFFFF', 
    justifyContent: 'center', alignItems: 'center', 
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 20, elevation: 4, 
    marginBottom: 25,
    borderWidth: 1, borderColor: '#F1F5F9'
  },
  title: { fontSize: 34, fontWeight: '900', color: '#0F172A', letterSpacing: -1.2 },
  subtitle: { fontSize: 16, color: '#64748B', marginTop: 8, fontWeight: '500' },
  
  cardWrapper: { width: '100%', marginBottom: 35 },
  glassCard: {
    borderRadius: 38,
    padding: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 50,
  },
  glassReflection: { position: 'absolute', top: 0, left: '5%', right: '5%', height: '30%', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: 100 },
  
  form: { gap: 22 },
  inputBox: { gap: 10 },
  label: { fontSize: 13, fontWeight: '800', color: '#444', marginLeft: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 22, 
    borderWidth: 1.5, 
    borderColor: '#F8FAFC', 
    paddingHorizontal: 18,
    shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 18, fontSize: 16, color: '#0F172A', fontWeight: '600' },
  eyeIcon: { padding: 8 },
  
  // forgotBtn: { alignSelf: 'flex-end', marginTop: -5 },
  // forgotText: { fontSize: 14, color: THEME.colors.primary, fontWeight: '800' },
  
  loginBtn: { borderRadius: 24, overflow: 'hidden', marginTop: 10, shadowColor: THEME.colors.primary, shadowOpacity: 0.35, shadowRadius: 25, elevation: 10 },
  btnGradient: { paddingVertical: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  btnText: { color: 'white', fontSize: 19, fontWeight: '900', letterSpacing: 0.2 },
  
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 16, color: '#64748B', fontWeight: '500' },
  signupText: { fontSize: 16, fontWeight: '800', color: THEME.colors.primary }
});

export default LoginScreen;
