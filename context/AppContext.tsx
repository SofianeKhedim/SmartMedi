import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export interface BloodPressureMeasurement {
  id: string;
  date: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  notes?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  age?: number;
  avatar?: string;
  medicalConditions?: string[];
  medications?: string[];
}

export interface AppContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  measurements: BloodPressureMeasurement[];
  addMeasurement: (measurement: Omit<BloodPressureMeasurement, 'id'>) => Promise<void>;
  userProfile: UserProfile | null;
  updateUserProfile: (profile: UserProfile | null) => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [measurements, setMeasurements] = useState<BloodPressureMeasurement[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load theme preference
      const savedTheme = await AsyncStorage.getItem('isDarkMode');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }

      // Load measurements
      const savedMeasurements = await AsyncStorage.getItem('measurements');
      if (savedMeasurements) {
        setMeasurements(JSON.parse(savedMeasurements));
      }

      // Load user profile
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await AsyncStorage.setItem('isDarkMode', JSON.stringify(newTheme));
  };

  const addMeasurement = async (measurementData: Omit<BloodPressureMeasurement, 'id'>) => {
    const newMeasurement: BloodPressureMeasurement = {
      ...measurementData,
      id: Date.now().toString(),
    };
    
    const updatedMeasurements = [newMeasurement, ...measurements];
    setMeasurements(updatedMeasurements);
    await AsyncStorage.setItem('measurements', JSON.stringify(updatedMeasurements));
  };

  const updateUserProfile = async (profile: UserProfile | null) => {
    setUserProfile(profile);
    if (profile) {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
    } else {
      // Logout: clear the stored profile instead of persisting "null".
      await AsyncStorage.removeItem('userProfile');
    }
  };

  const value: AppContextType = {
    isDarkMode,
    toggleTheme,
    measurements,
    addMeasurement,
    userProfile,
    updateUserProfile,
    isLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};