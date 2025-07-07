import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ItineraryItem } from '../../lib/types';
import { timestampToDate } from '../../lib/firestore-utils';

interface ItineraryListProps {
  items: ItineraryItem[];
  onEditItem: (item: ItineraryItem) => void;
  onDeleteItem: (itemId: string) => void;
}

interface ItineraryItemCardProps {
  item: ItineraryItem;
  onEdit: () => void;
  onDelete: () => void;
}

const ItineraryItemCard: React.FC<ItineraryItemCardProps> = ({
  item,
  onEdit,
  onDelete,
}) => {
  const visitDate = timestampToDate(item.visitDate);
  const createdDate = timestampToDate(item.createdAt);

  const handleDelete = () => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const handleOpenMaps = () => {
    if (item.latitude && item.longitude) {
      const url = `https://maps.google.com/?q=${item.latitude},${item.longitude}`;
      Linking.openURL(url);
    } else if (item.address) {
      const encodedAddress = encodeURIComponent(item.address);
      const url = `https://maps.google.com/?q=${encodedAddress}`;
      Linking.openURL(url);
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'Restaurant': return 'restaurant';
      case 'Attraction': return 'camera';
      case 'Activity': return 'fitness';
      case 'Transportation': return 'car';
      case 'Accommodation': return 'bed';
      case 'Shopping': return 'bag';
      case 'Entertainment': return 'musical-notes';
      default: return 'location';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Restaurant': return '#FF6B35';
      case 'Attraction': return '#FF9500';
      case 'Activity': return '#34C759';
      case 'Transportation': return '#5856D6';
      case 'Accommodation': return '#007AFF';
      case 'Shopping': return '#FF3B30';
      case 'Entertainment': return '#AF52DE';
      default: return '#8E8E93';
    }
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return 'Date not set';
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dateString = '';
    if (date.toDateString() === today.toDateString()) {
      dateString = 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateString = 'Tomorrow';
    } else {
      dateString = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
    
    const timeString = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    return `${dateString} at ${timeString}`;
  };

  return (
    <Pressable style={styles.itemCard} onPress={onEdit}>
      <View style={styles.itemHeader}>
        <View style={styles.itemMain}>
          <View style={styles.categoryIndicator}>
            <Ionicons 
              name={getCategoryIcon(item.category) as any} 
              size={20} 
              color={getCategoryColor(item.category)} 
            />
            <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
              {item.category || 'Activity'}
            </Text>
          </View>
          
          <Text style={styles.placeName}>{item.placeName}</Text>
          
          <View style={styles.dateTimeContainer}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.dateTime}>
              {formatDateTime(visitDate)}
            </Text>
          </View>
          
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.address} numberOfLines={2}>
              {item.address}
            </Text>
            {(item.latitude && item.longitude) || item.address ? (
              <Pressable style={styles.mapsButton} onPress={handleOpenMaps}>
                <Ionicons name="map" size={16} color="#007AFF" />
              </Pressable>
            ) : null}
          </View>
          
          {item.notes && (
            <View style={styles.notesContainer}>
              <Ionicons name="document-text-outline" size={16} color="#666" />
              <Text style={styles.notes} numberOfLines={3}>
                {item.notes}
              </Text>
            </View>
          )}
        </View>
        
        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </Pressable>
      </View>

      {item.comments && item.comments.length > 0 && (
        <View style={styles.commentsIndicator}>
          <Ionicons name="chatbubble-outline" size={16} color="#666" />
          <Text style={styles.commentsCount}>
            {item.comments.length} comment{item.comments.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

export const ItineraryList: React.FC<ItineraryListProps> = ({
  items,
  onEditItem,
  onDeleteItem,
}) => {
  const [sortBy, setSortBy] = useState<'date' | 'category' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  // Get unique categories from items
  const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean)));

  const filteredItems = items.filter(item => 
    !filterCategory || item.category === filterCategory
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      const dateA = timestampToDate(a.visitDate) || new Date(0);
      const dateB = timestampToDate(b.visitDate) || new Date(0);
      comparison = dateA.getTime() - dateB.getTime();
    } else if (sortBy === 'category') {
      comparison = (a.category || '').localeCompare(b.category || '');
    } else if (sortBy === 'name') {
      comparison = a.placeName.localeCompare(b.placeName);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const renderSortButton = (label: string, sortType: typeof sortBy) => (
    <Pressable
      style={[styles.sortButton, sortBy === sortType && styles.sortButtonActive]}
      onPress={() => toggleSort(sortType)}
    >
      <Text style={[styles.sortButtonText, sortBy === sortType && styles.sortButtonTextActive]}>
        {label}
      </Text>
      {sortBy === sortType && (
        <Ionicons
          name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#007AFF"
        />
      )}
    </Pressable>
  );

  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="map-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>No activities planned</Text>
        <Text style={styles.emptySubtitle}>
          Tap the + button to add your first activity
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.itemCount}>
          {filteredItems.length} activit{filteredItems.length !== 1 ? 'ies' : 'y'}
        </Text>
        
        <View style={styles.sortControls}>
          {renderSortButton('Date', 'date')}
          {renderSortButton('Category', 'category')}
          {renderSortButton('Name', 'name')}
        </View>

        {categories.length > 0 && (
          <View style={styles.filterContainer}>
            <Pressable
              style={[styles.filterChip, !filterCategory && styles.filterChipSelected]}
              onPress={() => setFilterCategory(null)}
            >
              <Text style={[styles.filterText, !filterCategory && styles.filterTextSelected]}>
                All
              </Text>
            </Pressable>
            {categories.map((category) => (
              <Pressable
                key={category}
                style={[styles.filterChip, filterCategory === category && styles.filterChipSelected]}
                onPress={() => setFilterCategory(category || null)}
              >
                <Text style={[styles.filterText, filterCategory === category && styles.filterTextSelected]}>
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <FlatList
        data={sortedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItineraryItemCard
            item={item}
            onEdit={() => onEditItem(item)}
            onDelete={() => onDeleteItem(item.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sortControls: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sortButtonActive: {
    backgroundColor: '#E8F4FD',
    borderColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  sortButtonTextActive: {
    color: '#007AFF',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextSelected: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemMain: {
    flex: 1,
  },
  categoryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateTime: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  address: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    marginRight: 8,
  },
  mapsButton: {
    padding: 4,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notes: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 4,
  },
  commentsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  commentsCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});