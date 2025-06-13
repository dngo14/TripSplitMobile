import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../components/contexts/AuthContext';

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // need to replace this with your actual authentication state
  // using a hook from your AuthContext
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signIn(); // Call the signIn function from AuthContext
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Sign-in error:', error);
      setLoading(false);
      // Show an error message to the user
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Sign In', headerShown: false }} />
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to TripSplit!</Text>
        <Text style={styles.description}>
          Sign in with your Google account to start planning your trips and splitting expenses with ease.
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Pressable style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Sign In with Google</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', 
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 8,
    backgroundColor: '#fff', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4285F4', 
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
