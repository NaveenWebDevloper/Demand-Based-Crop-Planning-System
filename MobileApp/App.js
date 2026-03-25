import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import RevenueEstimatorScreen from './src/screens/RevenueEstimatorScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import AboutUsScreen from './src/screens/AboutUsScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import CropRecommendationScreen from './src/screens/CropRecommendationScreen';
import HelpDeskScreen from './src/screens/HelpDeskScreen';

// Components & Context
import CustomTabBar from './src/components/CustomTabBar';
import { LanguageProvider } from './src/context/LanguageContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Farmer Navigation (Bottom Tabs) - includes About Us ---
const FarmerTabs = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Dashboard" component={HomeScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
    <Tab.Screen name="About" component={AboutUsScreen} />
  </Tab.Navigator>
);

// --- Admin Navigation (Bottom Tabs) - no About Us ---
const AdminTabs = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Approvals" component={AdminDashboardScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Landing');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setInitialRoute(user.role === 'admin' ? 'AdminMain' : 'FarmerMain');
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return null;

  return (
    <LanguageProvider>
      <NavigationContainer>
        <StatusBar style="dark" translucent backgroundColor="transparent" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Public Pre-Auth Stack */}
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />

          {/* Private Main Flows */}
          <Stack.Screen name="FarmerMain" component={FarmerTabs} />
          <Stack.Screen name="AdminMain" component={AdminTabs} />

          {/* Modals & Sub-pages */}
          <Stack.Screen name="RevenueEstimator" component={RevenueEstimatorScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="CropRecommendation" component={CropRecommendationScreen} />
          <Stack.Screen name="HelpDesk" component={HelpDeskScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
}
