import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../components/contexts/AuthContext';

export default function SignInPage() {
  const { signIn, loading } = useAuth();

  const handleSignIn = async () => {
    try {
      console.log('SignInPage: Calling signIn');
      await signIn();
      console.log('SignInPage: signIn completed');
    } catch (error: any) {
      console.error('SignInPage: signIn error:', error);
      Alert.alert('Sign In Error', error?.message || 'Failed to sign in. Please try again.');
    }
  };


  return (
    <LinearGradient
      colors={['#f8f9fa', '#e3f2fd', '#f8f9fa']}
      style={styles.container}
    >
      <Stack.Screen options={{ title: 'Sign In', headerShown: false }} />
      
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="airplane" size={40} color="#007AFF" />
        </View>
        <Text style={styles.appName}>TripSplit</Text>
        <Text style={styles.tagline}>Split expenses, share memories</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.welcomeSection}>
          <Text style={styles.title}>Welcome to TripSplit!</Text>
          <Text style={styles.description}>
            Sign in with your Google account to start planning your trips and splitting expenses with ease.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Signing you in...</Text>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <Pressable style={styles.googleButton} onPress={handleSignIn}>
              <View style={styles.googleButtonContent}>
                <Ionicons name="logo-google" size={20} color="#fff" />
                <Text style={styles.buttonText}>Sign In with Google</Text>
              </View>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 32,
    borderRadius: 24,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
  },
  googleButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  footer: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
