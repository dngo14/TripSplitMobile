import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface TripCardProps {
  trip: {
    id: string;
    tripName: string;
    members?: any[];
    tripStartDate?: any;
    tripEndDate?: any;
  };
  onPress: () => void;
  imageUrl?: string;
}

export function TripCard({ trip, onPress, imageUrl }: TripCardProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const formatTripDates = (trip: any) => {
    if (!trip.tripStartDate || !trip.tripEndDate) {
      return 'Dates TBD';
    }
    
    const startDate = trip.tripStartDate?.toDate?.() || new Date(trip.tripStartDate);
    const endDate = trip.tripEndDate?.toDate?.() || new Date(trip.tripEndDate);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const memberCount = trip.members?.length || 0;

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]} 
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="location" size={32} color={theme.colors.primary} />
          </View>
        )}
        <View style={styles.imageOverlay}>
          <View style={styles.memberBadge}>
            <Ionicons name="people" size={12} color="#fff" />
            <Text style={styles.memberCount}>{memberCount}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {trip.tripName}
        </Text>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.date}>{formatTripDates(trip)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    ...theme.shadows.sm,
    marginBottom: 12,
    marginHorizontal: 4,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  imageContainer: {
    position: 'relative',
    height: 140,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  memberCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    lineHeight: 22,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});