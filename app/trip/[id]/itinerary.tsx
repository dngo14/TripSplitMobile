import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useTrip } from '../../../hooks/useTripData';
import { useAuth } from '../../../components/contexts/AuthContext';
import { ItineraryForm } from '../../../components/trip/ItineraryForm';
import { ItineraryList } from '../../../components/trip/ItineraryList';
import { ItineraryItem } from '../../../lib/types';

export default function ItineraryTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trip, addItineraryItem } = useTrip(id);
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | undefined>();

  if (!trip || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleAddItem = async (itemData: Omit<ItineraryItem, 'id'>) => {
    const newItem: ItineraryItem = {
      ...itemData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    try {
      await addItineraryItem(newItem);
    } catch (error) {
      console.error('Failed to add itinerary item:', error);
    }
  };

  const handleEditItem = (item: ItineraryItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleUpdateItem = async (itemData: Omit<ItineraryItem, 'id'>) => {
    if (!editingItem) return;

    // This would need to be implemented in the trip service
    // For now, we'll just log it
    console.log('Update itinerary item:', editingItem.id, itemData);
    setEditingItem(undefined);
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      // This would need to be implemented in the trip service
      // For now, we'll just log it
      console.log('Delete itinerary item:', itemId);
    } catch (error) {
      console.error('Failed to delete itinerary item:', error);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(undefined);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Trip Itinerary</Text>
            <ItineraryList
              items={trip.itinerary || []}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
            />
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowForm(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <ItineraryForm
        visible={showForm}
        onClose={handleCloseForm}
        onSubmit={editingItem ? handleUpdateItem : handleAddItem}
        item={editingItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});