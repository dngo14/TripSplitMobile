import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { ItineraryItem } from '../../lib/types';
import { ITINERARY_CATEGORIES } from '../../lib/constants';

interface ItineraryFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<ItineraryItem, 'id'>) => void;
  item?: ItineraryItem; // For editing existing item
}

export const ItineraryForm: React.FC<ItineraryFormProps> = ({
  visible,
  onClose,
  onSubmit,
  item,
}) => {
  const [placeName, setPlaceName] = useState(item?.placeName || '');
  const [address, setAddress] = useState(item?.address || '');
  const [notes, setNotes] = useState(item?.notes || '');
  const [category, setCategory] = useState(item?.category || ITINERARY_CATEGORIES[0]);
  const [visitDate, setVisitDate] = useState(
    item?.visitDate ? new Date(item.visitDate as any) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [coordinates, setCoordinates] = useState<{latitude: number; longitude: number} | null>(
    item?.latitude && item?.longitude 
      ? { latitude: item.latitude, longitude: item.longitude }
      : null
  );

  const handleSubmit = () => {
    if (!placeName.trim()) {
      Alert.alert('Error', 'Please enter a place name');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return;
    }

    const newItem: Omit<ItineraryItem, 'id'> = {
      placeName: placeName.trim(),
      address: address.trim(),
      notes: notes.trim(),
      category,
      visitDate,
      createdAt: new Date(),
      comments: item?.comments || [],
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
    };

    onSubmit(newItem);
    onClose();
    
    // Reset form
    setPlaceName('');
    setAddress('');
    setNotes('');
    setCategory(ITINERARY_CATEGORIES[0]);
    setVisitDate(new Date());
    setCoordinates(null);
  };

  const handleGetCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to get current location');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCoordinates({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Try to reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const result = reverseGeocode[0];
        const formattedAddress = [
          result.name,
          result.street,
          result.city,
          result.region,
          result.country,
        ].filter(Boolean).join(', ');
        
        setAddress(formattedAddress);
        if (!placeName.trim()) {
          setPlaceName(result.name || 'Current Location');
        }
      }

      Alert.alert('Success', 'Current location added!');
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setVisitDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(visitDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setVisitDate(newDate);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </Pressable>
          <Text style={styles.title}>{item ? 'Edit Activity' : 'Add Activity'}</Text>
          <Pressable onPress={handleSubmit} style={styles.saveButton}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content}>
          {/* Place Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Activity / Place Name *</Text>
            <TextInput
              style={styles.input}
              value={placeName}
              onChangeText={setPlaceName}
              placeholder="What will you be doing?"
              autoFocus
            />
          </View>

          {/* Address */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Address *</Text>
              <Pressable style={styles.locationButton} onPress={handleGetCurrentLocation}>
                <Ionicons name="location" size={16} color="#007AFF" />
                <Text style={styles.locationButtonText}>Use Current</Text>
              </Pressable>
            </View>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Where is this place?"
              multiline
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {ITINERARY_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.categoryChip, category === cat && styles.categoryChipSelected]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.categoryText, category === cat && styles.categoryTextSelected]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Date and Time */}
          <View style={styles.section}>
            <Text style={styles.label}>Visit Date & Time</Text>
            <View style={styles.dateTimeRow}>
              <Pressable style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                <Text style={styles.dateTimeText}>
                  {visitDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </Pressable>
              
              <Pressable style={styles.dateTimeButton} onPress={() => setShowTimePicker(true)}>
                <Ionicons name="time-outline" size={20} color="#007AFF" />
                <Text style={styles.dateTimeText}>
                  {visitDate.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional details or notes..."
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Location Info */}
          {coordinates && (
            <View style={styles.section}>
              <Text style={styles.label}>Location</Text>
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={16} color="#34C759" />
                <Text style={styles.locationText}>
                  {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={visitDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={visitDate}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#E8F4FD',
    borderRadius: 6,
  },
  locationButtonText: {
    color: '#007AFF',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
  },
  categoryTextSelected: {
    color: '#fff',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#34C759',
    marginLeft: 8,
    fontFamily: 'monospace',
  },
});