import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
  TextInput,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../components/contexts/AuthContext';
import { useSettings } from '../components/contexts/SettingsContext';
import { useTheme } from '../components/contexts/ThemeContext';
import * as Notifications from 'expo-notifications';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuth();
  const { settings, loading, updateSetting, resetSettings, requestNotificationPermissions, syncData } = useSettings();
  const { theme, isDark } = useTheme();
  
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName || '');
  }, [user?.displayName]);

  const styles = getStyles(theme);

  const handleSettingChange = async (key: keyof typeof settings, value: any) => {
    try {
      await updateSetting(key, value);
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const handleEditProfile = async () => {
    try {
      await updateUserProfile({ displayName });
      setShowEditProfile(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncData();
      Alert.alert('Success', 'Data synced successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync data. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetSettings,
        },
      ]
    );
  };

  const handleNotificationTest = async () => {
    try {
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'TripSplit Test',
            body: 'Notifications are working correctly!',
            sound: settings.soundEnabled ? 'default' : undefined,
          },
          trigger: null,
        });
        Alert.alert('Success', 'Test notification sent! Check your notification panel.');
      } else {
        Alert.alert('Permission Denied', 'Please enable notifications in your device settings.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification.');
    }
  };

  const formatLastSync = () => {
    if (!settings.lastSyncTime) return 'Never';
    const now = new Date();
    const syncTime = new Date(settings.lastSyncTime);
    const diffMinutes = Math.floor((now.getTime() - syncTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return syncTime.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Pressable style={styles.settingItem} onPress={() => setShowEditProfile(true)}>
          <View style={styles.settingLeft}>
            <Ionicons name="person-outline" size={24} color={theme.colors.textSecondary} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Edit Profile</Text>
              <Text style={styles.settingSubtitle}>Name, email, and photo</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.inactive} />
        </Pressable>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.textSecondary} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>All Notifications</Text>
              <Text style={styles.settingSubtitle}>Enable all notifications</Text>
            </View>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => handleSettingChange('notifications', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={settings.notifications ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="mail-outline" size={24} color={theme.colors.textSecondary} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Email Notifications</Text>
              <Text style={styles.settingSubtitle}>Trip updates and reminders</Text>
            </View>
          </View>
          <Switch
            value={settings.emailNotifications}
            onValueChange={(value) => handleSettingChange('emailNotifications', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={settings.emailNotifications ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="phone-portrait-outline" size={24} color={theme.colors.textSecondary} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingSubtitle}>Real-time updates</Text>
            </View>
          </View>
          <Switch
            value={settings.pushNotifications}
            onValueChange={(value) => handleSettingChange('pushNotifications', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={settings.pushNotifications ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <Pressable style={styles.settingItem} onPress={handleNotificationTest}>
          <View style={styles.settingLeft}>
            <Ionicons name="send-outline" size={24} color={theme.colors.textSecondary} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Test Notifications</Text>
              <Text style={styles.settingSubtitle}>Send a test notification</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.inactive} />
        </Pressable>
      </View>

      {/* App Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="volume-high-outline" size={24} color={theme.colors.textSecondary} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Sound</Text>
              <Text style={styles.settingSubtitle}>App sounds and alerts</Text>
            </View>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(value) => handleSettingChange('soundEnabled', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={settings.soundEnabled ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={24} color={theme.colors.textSecondary} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingSubtitle}>{isDark ? 'Light theme' : 'Dark theme'}</Text>
            </View>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={(value) => handleSettingChange('darkMode', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={settings.darkMode ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="sync-outline" size={24} color={theme.colors.textSecondary} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Auto Sync</Text>
              <Text style={styles.settingSubtitle}>Automatically sync data</Text>
            </View>
          </View>
          <Switch
            value={settings.autoSync}
            onValueChange={(value) => handleSettingChange('autoSync', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={settings.autoSync ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <Pressable style={styles.settingItem} onPress={handleManualSync} disabled={isSyncing}>
          <View style={styles.settingLeft}>
            <Ionicons name="cloud-upload-outline" size={24} color={theme.colors.textSecondary} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Manual Sync</Text>
              <Text style={styles.settingSubtitle}>Last sync: {formatLastSync()}</Text>
            </View>
          </View>
          {isSyncing ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Ionicons name="chevron-forward" size={20} color={theme.colors.inactive} />
          )}
        </Pressable>
      </View>

      {/* Data & Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Privacy</Text>
        
        <Pressable style={styles.settingItem} onPress={() => Alert.alert('Export Data', 'This feature is coming soon!')}>
          <View style={styles.settingLeft}>
            <Ionicons name="download-outline" size={24} color={theme.colors.textSecondary} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Export Data</Text>
              <Text style={styles.settingSubtitle}>Download your trip data</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.inactive} />
        </Pressable>

        <Pressable style={styles.settingItem} onPress={() => Alert.alert('Privacy Policy', 'This feature is coming soon!')}>
          <View style={styles.settingLeft}>
            <Ionicons name="shield-outline" size={24} color={theme.colors.textSecondary} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Privacy Policy</Text>
              <Text style={styles.settingSubtitle}>View our privacy policy</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.inactive} />
        </Pressable>
      </View>

      {/* Debug Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug Information</Text>
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>Theme: {isDark ? 'Dark' : 'Light'}</Text>
          <Text style={styles.debugText}>Auto Sync: {settings.autoSync ? 'Enabled' : 'Disabled'}</Text>
          <Text style={styles.debugText}>Notifications: {settings.notifications ? 'Enabled' : 'Disabled'}</Text>
          <Text style={styles.debugText}>Push: {settings.pushNotifications ? 'Enabled' : 'Disabled'}</Text>
        </View>
      </View>

      {/* Reset Section */}
      <View style={styles.section}>
        <Pressable style={styles.resetButton} onPress={handleResetSettings}>
          <Ionicons name="refresh-outline" size={24} color={theme.colors.error} />
          <Text style={styles.resetButtonText}>Reset All Settings</Text>
        </Pressable>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowEditProfile(false)}
              >
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                style={styles.textInput}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your display name"
                placeholderTextColor={theme.colors.inactive}
              />
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput]}
                value={user?.email || ''}
                editable={false}
                placeholder="Email address"
                placeholderTextColor={theme.colors.inactive}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditProfile(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleEditProfile}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 16,
    backgroundColor: theme.colors.header,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  section: {
    backgroundColor: theme.colors.surface,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    padding: 16,
    paddingBottom: 8,
    backgroundColor: theme.colors.background,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  debugInfo: {
    padding: 16,
  },
  debugText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.error,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    marginBottom: 16,
  },
  disabledInput: {
    backgroundColor: theme.colors.background,
    color: theme.colors.textSecondary,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});