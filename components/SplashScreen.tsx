import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const titleTranslateY = useRef(new Animated.Value(50)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateSequence = Animated.sequence([
      // Animation du logo
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Animation du titre
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Animation du sous-titre
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    animateSequence.start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* Logo animé */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={[styles.logoCircle, { backgroundColor: theme.primary }]}>
            <Text style={[styles.logoIcon, { color: theme.background }]}>🩺</Text>
          </View>
        </Animated.View>

        {/* Titre animé */}
        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
          }}
        >
          <Text style={[styles.title, { color: theme.text }]}>SmartMedi</Text>
        </Animated.View>

        {/* Sous-titre animé */}
        <Animated.View style={{ opacity: subtitleOpacity }}>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Votre compagnon santé intelligent
          </Text>
        </Animated.View>

        {/* Version */}
        <Animated.View style={{ opacity: subtitleOpacity }}>
          <Text style={[styles.version, { color: theme.placeholder }]}>v2.0</Text>
        </Animated.View>
      </View>

      {/* Indicateur de chargement */}
      <Animated.View style={{ opacity: subtitleOpacity }}>
        <View style={styles.loadingContainer}>
          <View style={[styles.loadingBar, { backgroundColor: theme.border }]}>
            <Animated.View
              style={[
                styles.loadingProgress,
                { backgroundColor: theme.primary },
              ]}
            />
          </View>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Chargement...
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  content: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoContainer: {
    marginBottom: 40,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  version: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    width: width * 0.6,
  },
  loadingBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    width: '70%',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
});