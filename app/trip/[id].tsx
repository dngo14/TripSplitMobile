import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AiAssistTab from '/home/user/tripsplitmobile/app/trip/[id]/ai-assist';
import BillsTab from '/home/user/tripsplitmobile/app/trip/[id]/bills';
import ChatTab from '/home/user/tripsplitmobile/app/trip/[id]/chat';
import InfoTab from '/home/user/tripsplitmobile/app/trip/[id]/info';
import ItineraryTab from '/home/user/tripsplitmobile/app/trip/[id]/itinerary';

export default function TripDetailScreen() {
  const { id, tripName, name } = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Info'); // State to manage active tab

  const renderTabContent = () => {
    
    switch (activeTab) {
      case 'Info': 
        return <InfoTab />;
      case 'Bills':
        return <BillsTab />;
      // case 'Invite':
      //   return <InviteTab />;
      case 'Itinerary':
        return <ItineraryTab />; 
      case 'Chat':
        return <ChatTab />; 
      case 'AI Assist':
        return <AiAssistTab />; 
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.replace('/')}>
          {/* Back Arrow SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
            <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
          </svg>
        </Pressable>
        <Text style={styles.headerTitle}>{`Trip: ${name}`}</Text>
      </View>

    
      <View style={styles.tabContainer}>
        {['Info','Bills', 'Itinerary', 'Chat', 'AI Assist'].map((tab) => (
          <Pressable
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab ? styles.activeTabButtonText : styles.inactiveTabButtonText,
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.contentArea}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111218',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111218',
    padding: 16,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white', 
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    paddingRight: 48, 
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#3a3f55',
    paddingHorizontal: 16,
    width: '100%',
    justifyContent: 'space-around',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    paddingBottom: 13,
    paddingTop: 16,
  },
  activeTabButton: {
    borderBottomColor: 'white',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.015,
  },
  activeTabButtonText: {
    color: 'white',
  },
  inactiveTabButtonText: {
    color: '#9ba1bb',
  },
  contentArea: {
    flex: 1, 
    padding: 16, 
  },
  tabContentText: {
    color: 'white',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'flex-end',
    backgroundColor: '#111218', 
  },
  inviteButton: {
    minWidth: 84,
    maxWidth: 480,
    cursor: 'pointer', 
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', 
    borderRadius: 9999, 
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: '#4768fa',
  },
  inviteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.015,
  },
});