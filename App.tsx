import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { AppProvider, useApp } from './context/AppContext';
import { lightTheme, darkTheme } from './constants/Colors';
import NotificationService from './services/NotificationService';
import SplashScreen from './components/SplashScreen';

import HomeScreen from './screen/HomeScreen';
import ProfileScreen from './screen/UserProfile';
import MesureScreen from './screen/MesureScreen';
import HistoriqueScreen from './screen/HistoriqueScreen';
import ChatbotScreen from './screen/ChatbotScreen';
import LoginScreen from './screen/LoginScreen';
import SignUpScreen from './screen/SignUpScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);

const MainTabs = () => {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Accueil':
              iconName = 'home';
              break;
            case 'Mesure':
              iconName = 'heart';
              break;
            case 'Historique':
              iconName = 'clock';
              break;
            case 'Chatbot':
              iconName = 'message-circle';
              break;
            case 'Profil':
              iconName = 'user';
              break;
            default:
              iconName = 'circle';
          }

          return <FeatherIcon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
          marginHorizontal: 16,
          marginBottom: 16,
          borderRadius: 20,
          position: 'absolute',
          elevation: 8,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        headerStyle: {
          backgroundColor: theme.card,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          paddingBottom: 4,
        },
        sceneStyle: {
          paddingBottom: 80,
        },
      })}
    >
      <Tab.Screen 
        name="Accueil" 
        component={HomeScreen}
        options={{ title: 'Accueil' }}
      />
      <Tab.Screen 
        name="Mesure" 
        component={MesureScreen}
        options={{ title: 'Mesurer' }}
      />
      <Tab.Screen 
        name="Historique" 
        component={HistoriqueScreen}
        options={{ title: 'Historique' }}
      />
      <Tab.Screen 
        name="Chatbot" 
        component={ChatbotScreen}
        options={{ title: 'Assistant' }}
      />
      <Tab.Screen 
        name="Profil" 
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
};

const AppContent = () => {
  const { isLoading, isDarkMode, userProfile } = useApp();

  useEffect(() => {
    NotificationService.requestPermissions();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer
      theme={{
        dark: isDarkMode,
        colors: {
          primary: isDarkMode ? darkTheme.primary : lightTheme.primary,
          background: isDarkMode ? darkTheme.background : lightTheme.background,
          card: isDarkMode ? darkTheme.card : lightTheme.card,
          text: isDarkMode ? darkTheme.text : lightTheme.text,
          border: isDarkMode ? darkTheme.border : lightTheme.border,
          notification: isDarkMode ? darkTheme.accent : lightTheme.accent,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userProfile ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="auto" />
      <AppContent />
    </AppProvider>
  );
}
