import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React from 'react';
import { Text } from 'react-native'; // Example import for a loading indicator
import { AuthProvider, useAuth } from '../components/contexts/AuthContext'; // Adjust the import path if needed

// This is the root layout component that wraps your entire app.
// It sets up theme context and authentication context.
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

// This component handles the conditional rendering based on authentication status.
function AppNavigator() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth(); // Assuming your useAuth hook provides an isLoading state

  
  if (isLoading) {
    return <Text>Loading...</Text>; // loading spinner component
  }
  return (
    <Stack>
      {user ? (
        // User is authenticated, render the (tabs) group
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        // User is not authenticated, render the sign-in screen
 <Stack.Screen name="signin" options={{ headerShown: false }} />
 )}
 <Stack.Screen name="trip/[id]" options={{ headerShown: false }} /> </Stack>
  );

}