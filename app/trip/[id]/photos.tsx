import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PhotosTab() {
  const [photos, setPhotos] = useState([
    { id: 1, uri: 'https://picsum.photos/200/200?random=1', caption: 'Beautiful sunset' },
    { id: 2, uri: 'https://picsum.photos/200/200?random=2', caption: 'Amazing food' },
    { id: 3, uri: 'https://picsum.photos/200/200?random=3', caption: 'Group photo' },
    { id: 4, uri: 'https://picsum.photos/200/200?random=4', caption: 'City view' },
  ]);

  const renderPhoto = (photo: any) => (
    <TouchableOpacity key={photo.id} style={styles.photoContainer}>
      <Image source={{ uri: photo.uri }} style={styles.photo} />
      <Text style={styles.caption}>{photo.caption}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Trip Photos</Text>
            <View style={styles.photoGrid}>
              {photos.map(renderPhoto)}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Photo Albums</Text>
            
            <TouchableOpacity style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <View style={styles.albumIcon}>
                  <Ionicons name="folder" size={20} color="#007AFF" />
                </View>
                <Text style={styles.listItemTitle}>Day 1 - Arrival</Text>
              </View>
              <Text style={styles.photoCount}>5 photos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <View style={styles.albumIcon}>
                  <Ionicons name="folder" size={20} color="#007AFF" />
                </View>
                <Text style={styles.listItemTitle}>Day 2 - Sightseeing</Text>
              </View>
              <Text style={styles.photoCount}>12 photos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <View style={styles.albumIcon}>
                  <Ionicons name="folder" size={20} color="#007AFF" />
                </View>
                <Text style={styles.listItemTitle}>Day 3 - Food Tour</Text>
              </View>
              <Text style={styles.photoCount}>8 photos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <View style={styles.albumIcon}>
                  <Ionicons name="folder" size={20} color="#007AFF" />
                </View>
                <Text style={styles.listItemTitle}>Day 4 - Beach Day</Text>
              </View>
              <Text style={styles.photoCount}>15 photos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoContainer: {
    width: '48%',
    marginBottom: 16,
  },
  photo: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  caption: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  albumIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoCount: {
    fontSize: 14,
    color: '#666',
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