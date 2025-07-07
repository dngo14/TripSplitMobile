import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../components/contexts/AuthContext';
import { SettingsProvider } from '../components/contexts/SettingsContext';
import { ThemeProvider as CustomThemeProvider } from '../components/contexts/ThemeContext';

// This is the root layout component that wraps your entire app.
// It sets up theme context and authentication context.
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <SettingsProvider>
          <CustomThemeProvider>
            <AppNavigator />
          </CustomThemeProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// This component handles the conditional rendering based on authentication status.
function AppNavigator() {
  const { user, isLoading } = useAuth();

  console.log("AppNavigator: isLoading:", isLoading, "user:", user?.uid || 'null');
  console.log("AppNavigator: user object:", user);
  
  if (isLoading) {
    console.log("AppNavigator: Showing loading screen");
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="loading" 
          options={{ 
            headerShown: false,
            title: 'Loading'
          }} 
        />
      </Stack>
    );
  }

  if (!user) {
    // User is not authenticated - only show signin
    console.log("AppNavigator: No user - showing signin only");
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="signin" 
          options={{ 
            headerShown: false,
            title: 'Sign In'
          }} 
        />
      </Stack>
    );
  }
  
  // User is authenticated - show main app
  console.log("AppNavigator: User authenticated - showing main app for user:", user.uid);
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false,
          title: ''
        }} 
      />
      <Stack.Screen 
        name="trip/[id]" 
        options={{ 
          headerShown: false,
          title: ''
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          headerShown: false,
          title: 'Settings'
        }} 
      />
    </Stack>
  );
}