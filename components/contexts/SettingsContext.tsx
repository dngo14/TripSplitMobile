import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import { useAuth } from './AuthContext';

export interface AppSettings {
  notifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  darkMode: boolean;
  autoSync: boolean;
  currency: string;
  language: string;
  lastSyncTime?: Date;
}

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  updateSetting: (key: keyof AppSettings, value: any) => Promise<void>;
  resetSettings: () => Promise<void>;
  requestNotificationPermissions: () => Promise<boolean>;
  syncData: () => Promise<void>;
  isDarkMode: boolean;
}

const defaultSettings: AppSettings = {
  notifications: true,
  emailNotifications: true,
  pushNotifications: true,
  soundEnabled: true,
  darkMode: false,
  autoSync: true,
  currency: 'USD',
  language: 'English',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load settings from AsyncStorage on app start
  useEffect(() => {
    loadSettings();
  }, []);

  // Load settings from Firebase when user changes
  useEffect(() => {
    if (user) {
      loadSettingsFromFirebase();
    }
  }, [user]);

  // Setup notifications
  useEffect(() => {
    if (settings.pushNotifications) {
      configureNotifications();
    }
  }, [settings.pushNotifications]);

  // Auto-sync when enabled
  useEffect(() => {
    if (settings.autoSync && user) {
      const interval = setInterval(() => {
        syncData();
      }, 300000); // Sync every 5 minutes

      return () => clearInterval(interval);
    }
  }, [settings.autoSync, user]);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('userSettings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettingsFromFirebase = async () => {
    if (!user) return;
    
    try {
      const { doc, getDoc } = require('firebase/firestore');
      const { firestore } = require('../../lib/auth');
      
      if (firestore) {
        const userSettingsRef = doc(firestore, 'userSettings', user.uid);
        const snapshot = await getDoc(userSettingsRef);
        
        if (snapshot.exists()) {
          const firebaseSettings = snapshot.data();
          const mergedSettings = { ...defaultSettings, ...firebaseSettings };
          // Convert Firebase timestamp to Date
          if (firebaseSettings.lastSyncTime?.toDate) {
            mergedSettings.lastSyncTime = firebaseSettings.lastSyncTime.toDate();
          }
          setSettings(mergedSettings);
          await saveSettings(mergedSettings);
          console.log('Settings loaded from Firebase');
        }
      }
    } catch (error) {
      console.error('Error loading settings from Firebase:', error);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  const updateSetting = async (key: keyof AppSettings, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value };
      
      // Handle special cases
      if (key === 'pushNotifications') {
        if (value && !(await requestNotificationPermissions())) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive push notifications.'
          );
          return;
        }
      }

      if (key === 'darkMode') {
        // In a full implementation, you would apply the theme here
        console.log('Dark mode toggled:', value);
      }

      setSettings(newSettings);
      await saveSettings(newSettings);
      
      console.log(`Setting ${key} updated to:`, value);
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
  };

  const resetSettings = async () => {
    try {
      setSettings(defaultSettings);
      await saveSettings(defaultSettings);
      Alert.alert('Success', 'Settings have been reset to default values.');
    } catch (error) {
      console.error('Error resetting settings:', error);
      Alert.alert('Error', 'Failed to reset settings. Please try again.');
    }
  };

  const requestNotificationPermissions = async (): Promise<boolean> => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        console.log('Notification permissions granted');
        return true;
      } else {
        console.log('Notification permissions denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };

  const configureNotifications = async () => {
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: settings.notifications,
          shouldPlaySound: settings.soundEnabled,
          shouldSetBadge: true,
          shouldShowBanner: settings.notifications,
          shouldShowList: settings.notifications,
        }),
      });

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#007AFF',
          sound: settings.soundEnabled ? 'default' : null,
        });
      }
    } catch (error) {
      console.error('Error configuring notifications:', error);
    }
  };

  const syncData = useCallback(async () => {
    if (!user || !settings.autoSync) return;

    try {
      console.log('Auto-syncing data...');
      
      // Sync user settings to Firebase
      const { doc, setDoc, serverTimestamp } = require('firebase/firestore');
      const { firestore } = require('../../lib/auth');
      
      if (firestore) {
        const userSettingsRef = doc(firestore, 'userSettings', user.uid);
        await setDoc(userSettingsRef, {
          ...settings,
          userId: user.uid,
          lastSyncTime: serverTimestamp(),
          syncedAt: serverTimestamp()
        }, { merge: true });
        
        console.log('Settings synced to Firebase successfully');
      }
      
      // Update last sync time locally
      const newSettings = { ...settings, lastSyncTime: new Date() };
      setSettings(newSettings);
      await saveSettings(newSettings);
      
      console.log('Data sync completed at:', new Date().toISOString());
      
    } catch (error) {
      console.error('Error during auto-sync:', error);
      throw error;
    }
  }, [user, settings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        updateSetting,
        resetSettings,
        requestNotificationPermissions,
        syncData,
        isDarkMode: settings.darkMode,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};