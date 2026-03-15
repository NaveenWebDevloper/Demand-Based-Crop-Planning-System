import { StyleSheet, Platform } from 'react-native';

export const THEME = {
  colors: {
    primary: '#10B981', // Emerald Green from website
    primaryDark: '#059669', // Forest Green from website
    accent: '#34D399',
    title: '#1E293B', // Slate 800
    subtitle: '#475569', // Slate 600
    body: '#64748B', // Slate 500
    white: '#FFFFFF',
    glassBorder: 'rgba(255, 255, 255, 0.4)',
    bgGradient: ['#FFFFFF', '#F8FAFC', '#F1F5F9'], // Clean white → soft grey
  },
  fonts: {
    regular: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    bold: Platform.OS === 'ios' ? 'SF Pro Display' : 'sans-serif-medium',
  }
};

export const GLOBAL_STYLES = StyleSheet.create({
  liquidGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: THEME.colors.glassBorder,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 40,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 100,
  }
});
