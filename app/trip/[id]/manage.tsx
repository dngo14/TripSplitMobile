import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ManageTab() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trip Settings</Text>
          
          <TouchableOpacity style={styles.listItem}>
            <Text style={styles.listItemTitle}>Trip Name</Text>
            <View style={styles.listItemRight}>
              <Text style={styles.listItemValue}>My Amazing Trip</Text>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.listItem}>
            <Text style={styles.listItemTitle}>Currency</Text>
            <View style={styles.listItemRight}>
              <Text style={styles.listItemValue}>USD</Text>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.listItem}>
            <Text style={styles.listItemTitle}>Budget</Text>
            <View style={styles.listItemRight}>
              <Text style={styles.listItemValue}>$2,000</Text>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.listItem, styles.dangerItem]}>
            <Text style={[styles.listItemTitle, styles.dangerText]}>Delete Trip</Text>
            <Ionicons name="trash" size={16} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Member Management</Text>
          
          <TouchableOpacity style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <Ionicons name="person-add" size={20} color="#007AFF" />
              <Text style={styles.listItemTitle}>Add Member</Text>
            </View>
            <Ionicons name="add" size={20} color="#007AFF" />
          </TouchableOpacity>
          
          <View style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <View style={styles.memberAvatar}>
                <Ionicons name="person" size={16} color="#007AFF" />
              </View>
              <Text style={styles.listItemTitle}>John Doe</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <View style={styles.memberAvatar}>
                <Ionicons name="person" size={16} color="#007AFF" />
              </View>
              <Text style={styles.listItemTitle}>Jane Smith</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  listItemValue: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#FF3B30',
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});