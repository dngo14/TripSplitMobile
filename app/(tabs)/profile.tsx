import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../components/contexts/AuthContext';
import { useTheme } from '../../components/contexts/ThemeContext';

export default function TabThreeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { theme, isDark } = useTheme();

  const styles = getStyles(theme);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About TripSplit',
      'TripSplit helps you manage shared expenses and plan trips with friends. Split costs, track payments, and stay organized throughout your journey.',
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Support',
      'Need help? Contact us at support@tripsplit.app',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Email Support', 
          onPress: () => Linking.openURL('mailto:support@tripsplit.app?subject=TripSplit Support') 
        }
      ]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'View our privacy policy and terms of service.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'View Online', 
          onPress: () => Linking.openURL('https://tripsplit.app/privacy') 
        }
      ]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate TripSplit',
      'Help us improve by rating the app on your app store!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Rate Now', 
          onPress: () => {
            // In a real app, this would open the app store
            Alert.alert('Thank you!', 'This would open your app store to rate TripSplit.');
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'App preferences and notifications',
      onPress: () => router.push('/settings'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get help with the app',
      onPress: handleSupport,
    },
    {
      icon: 'information-circle-outline',
      title: 'About',
      subtitle: 'Learn more about TripSplit',
      onPress: handleAbout,
    },
    {
      icon: 'shield-outline',
      title: 'Privacy Policy',
      subtitle: 'View our privacy policy',
      onPress: handlePrivacy,
    },
    {
      icon: 'star-outline',
      title: 'Rate the App',
      subtitle: 'Share your feedback',
      onPress: handleRateApp,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* User Info Section */}
      <View style={styles.section}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={theme.colors.primary} />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.displayName || 'Anonymous User'}</Text>
            <Text style={styles.userEmail}>{user.email || 'No email'}</Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        {menuItems.map((item, index) => (
          <Pressable
            key={index}
            style={[styles.menuItem, index === menuItems.length - 1 && styles.lastMenuItem]}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon as any} size={24} color={theme.colors.textSecondary} />
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.inactive} />
          </Pressable>
        ))}
      </View>

      {/* Sign Out Section */}
      <View style={styles.section}>
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>

      {/* App Info */}
      <View style={styles.footer}>
        <Text style={styles.appVersion}>TripSplit Mobile v1.0.0</Text>
        <Text style={styles.copyright}>© 2024 TripSplit. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  header: {
    backgroundColor: theme.colors.header,
    padding: 16,
    paddingTop: 44,
    paddingBottom: 12,
    ...theme.shadows.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  section: {
    backgroundColor: theme.colors.surface,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary + '20', // Add transparency
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 16,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.error,
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  appVersion: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: theme.colors.inactive,
  },
});
