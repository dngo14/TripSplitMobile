import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, Modal, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTrips } from '../../hooks/useTripData';
import { useState } from 'react';
import { timestampToDate } from '../../lib/firestore-utils';
import { TripCard } from '../../components/ui/TripCard';
import { ModernButton } from '../../components/ui/ModernButton';
import { useAuth } from '../../components/contexts/AuthContext';
import { useTheme } from '../../components/contexts/ThemeContext';

// Fallback images for trips without custom images
const fallbackImages = [
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1551524164-6cf17ac17db1?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
];

export default function HomeScreen() {
  const router = useRouter();
  const { trips, loading, error, refetch, createTrip } = useTrips();
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  console.log('HomeScreen: Rendering with user:', user?.uid || 'null');
  console.log('HomeScreen: Trips loading:', loading, 'trips count:', trips.length);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTripName, setNewTripName] = useState('');

  const handleCreateTrip = () => {
    setShowCreateDialog(true);
  };

  const handleCreateTripSubmit = async () => {
    if (!newTripName.trim()) {
      Alert.alert('Error', 'Please enter a trip name');
      return;
    }

    try {
      const tripId = await createTrip({
        tripName: newTripName.trim(),
      });
      setNewTripName('');
      setShowCreateDialog(false);
      router.push(`/trip/${tripId}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create trip. Please try again.');
    }
  };

  const formatTripDates = (trip: any) => {
    const startDate = timestampToDate(trip.tripStartDate);
    const endDate = timestampToDate(trip.tripEndDate);
    
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return 'Dates not set';
  };

  const getTripImage = (trip: any, index: number) => {
    // Use trip's cover photo if available, then AI generated image, otherwise use fallback
    if (trip.photos && trip.photos.length > 0) {
      return trip.photos[0].downloadURL;
    }
    if (trip.aiGeneratedImage) {
      return trip.aiGeneratedImage;
    }
    return fallbackImages[index % fallbackImages.length];
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading trips...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userSection}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.headerTitle}>My Trips</Text>
              <Text style={styles.userName}>{user?.displayName || user?.email || 'User'}</Text>
            </View>
          </View>
          <Pressable 
            style={styles.signOutButton} 
            onPress={() => {
              // Clear demo user and sign out
              if (typeof window !== 'undefined') {
                localStorage.removeItem('demo-user');
              }
              signOut();
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={trips.length === 0 ? styles.emptyContainer : styles.gridContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {trips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="airplane-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptySubtitle}>Tap the + button to create your first trip and start planning!</Text>
            <ModernButton
              title="Create Your First Trip"
              onPress={handleCreateTrip}
              icon="add"
              style={styles.firstTripButton}
            />
          </View>
        ) : (
          <View style={styles.tripsContainer}>
            {trips.map((trip, index) => (
              <TripCard
                key={trip.id}
                trip={trip}
                imageUrl={getTripImage(trip, index)}
                onPress={() => router.push(`/trip/${trip.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable style={styles.fab} onPress={handleCreateTrip}>
        <Ionicons name="add" size={24} color="white" />
      </Pressable>

      {/* Create Trip Modal */}
      <Modal
        visible={showCreateDialog}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Trip</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCreateDialog(false)}
              >
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Trip Name</Text>
              <TextInput
                style={styles.textInput}
                value={newTripName}
                onChangeText={setNewTripName}
                placeholder="e.g., Summer Vacation '24"
                placeholderTextColor={theme.colors.inactive}
                autoFocus={true}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowCreateDialog(false);
                  setNewTripName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateTripSubmit}
              >
                <Text style={styles.createButtonText}>Create Trip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: theme.colors.header,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 8,
    ...theme.shadows.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    alignItems: 'flex-start',
    flex: 1,
  },
  signOutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
  },
  userName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: theme.colors.error,
    margin: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    flex: 1,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  retryText: {
    color: theme.colors.error,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    paddingBottom: 120, // Extra padding for tab bar
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  gridContainer: {
    padding: 16,
    paddingBottom: 100, // Extra padding for tab bar
  },
  tripsContainer: {
    gap: 8,
  },
  firstTripButton: {
    marginTop: 24,
    alignSelf: 'center',
  },
  // Modal styles
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
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
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
  createButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
