import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTrip } from '../../hooks/useTripData';
import AiAssistTab from './[id]/ai-assist';
import BillsTab from './[id]/bills';
import ChatTab from './[id]/chat';
import InfoTab from './[id]/info';
import ItineraryTab from './[id]/itinerary';
import ManageTab from './[id]/manage';
import PhotosTab from './[id]/photos';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('info');
  const { trip, loading, error } = useTrip(typeof id === 'string' ? id : null);
  
  const tripName = trip?.tripName || trip?.name || 'Loading...';

  const tabs = [
    { id: 'info', label: 'Info', icon: 'information-circle' },
    { id: 'activity', label: 'Bills', icon: 'receipt' },
    { id: 'itinerary', label: 'Plan', icon: 'map' },
    { id: 'chat', label: 'Chat', icon: 'chatbubbles' },
    { id: 'photos', label: 'Photos', icon: 'camera' },
    { id: 'ai-plan', label: 'AI', icon: 'sparkles' },
  ];

  const renderTabContent = () => {
    if (!trip) return null;
    
    switch (activeTab) {
      case 'info': 
        return <InfoTab />;
      case 'activity':
        return <BillsTab />;
      case 'itinerary':
        return <ItineraryTab />; 
      case 'photos':
        return <PhotosTab />;
      case 'ai-plan':
        return <AiAssistTab />;
      case 'chat':
        return <ChatTab />; 
      default:
        return <InfoTab />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.replace('/')}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </Pressable>
        <Text style={styles.headerTitle}>{tripName}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Modern Tab Bar */}
      <View style={styles.tabScrollContainer}>
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={activeTab === tab.id ? '#fff' : '#666'} 
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === tab.id ? styles.activeTabButtonText : styles.inactiveTabButtonText,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.contentArea}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading trip...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          renderTabContent()
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#1a1a1a',
    fontSize: 19,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 40,
  },
  tabScrollContainer: {
    backgroundColor: '#fafafa',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    maxHeight: 76,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    minWidth: 64,
    height: 52,
    borderWidth: 1,
    borderColor: 'transparent',
    flex: 1,
    marginHorizontal: 2,
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  tabButtonText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
    lineHeight: 12,
  },
  activeTabButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  inactiveTabButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  contentArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
});