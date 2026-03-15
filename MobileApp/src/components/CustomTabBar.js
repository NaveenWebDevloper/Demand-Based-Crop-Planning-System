import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { Home, User, ShieldCheck, LayoutGrid, Info } from 'lucide-react-native';
import { THEME } from '../styles/theme';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { language, cycleLanguage } = useLanguage();

  return (
    <View style={styles.outerWrap}>
      <View style={styles.pill}>

        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const getIcon = () => {
            const color = isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.55)';
            const size = 21;
            if (route.name === 'Dashboard' || route.name === 'Market') return LayoutGrid ? <LayoutGrid size={size} color={color} /> : <Home size={size} color={color} />;
            if (route.name === 'Profile') return User ? <User size={size} color={color} /> : <Home size={size} color={color} />;
            if (route.name === 'Approvals') return ShieldCheck ? <ShieldCheck size={size} color={color} /> : <Home size={size} color={color} />;
            if (route.name === 'About') return Info ? <Info size={size} color={color} /> : <Home size={size} color={color} />;
            return <Home size={size} color={color} />;
          };

          const getLabel = () => {
            let label = route.name;
            if (route.name === 'Dashboard') label = 'Home';
            if (route.name === 'Approvals') label = 'Admin';
            return label;
          };

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.75}
            >
              <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
                {getIcon()}
              </View>
              <Text style={[styles.label, isFocused && styles.labelActive]}>
                {getLabel()}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Language Toggle */}
        <TouchableOpacity style={styles.tabItem} onPress={cycleLanguage} activeOpacity={0.75}>
          <View style={styles.langWrap}>
            <Text style={styles.langText}>{language.toUpperCase()}</Text>
          </View>
          <Text style={styles.label}>Lang</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrap: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 40,
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: width * 0.88,
    overflow: 'hidden',           // clips children to pill shape on Android
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.28,
        shadowRadius: 20,
      },
      android: { elevation: 16 },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  iconWrapActive: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.primary,
    overflow: 'hidden',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  labelActive: {
    color: '#FFFFFF',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 2,
  },
  langWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  langText: {
    fontSize: 12,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.8,
  },
});

export default CustomTabBar;
