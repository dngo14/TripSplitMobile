import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useTrip } from '../../../hooks/useTripData';
import { generateTripSuggestions, generateItinerary, optimizeExpenses } from '../../../lib/gemini';

const AIAssistScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trip } = useTrip(id);
  const [loading, setLoading] = useState(false);

  if (!trip) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleTripSuggestions = async () => {
    setLoading(true);
    try {
      const suggestions = await generateTripSuggestions({
        budget: 'moderate',
        interests: ['sightseeing', 'culture'],
        duration: '7 days'
      });
      
      const suggestionText = suggestions.map(s => 
        `🌍 ${s.destination}\n💰 ${s.estimatedCost}\n📅 Best time: ${s.bestTimeToVisit}\n${s.reasoning}`
      ).join('\n\n');
      
      Alert.alert('AI Trip Suggestions', suggestionText);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleItineraryOptimization = async () => {
    setLoading(true);
    try {
      const itinerary = await generateItinerary(trip.tripName, 5, {
        budget: 'moderate',
        interests: ['sightseeing']
      });
      
      const itineraryText = `${itinerary.destination}\n${itinerary.totalEstimatedCost}\n\nDay 1: ${itinerary.days[0]?.activities[0]?.activity || 'Explore the city'}`;
      Alert.alert('AI Itinerary', itineraryText);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetAnalysis = async () => {
    setLoading(true);
    try {
      const mockExpenses = [
        { description: 'Hotel', amount: 150, category: 'Accommodation', paidBy: 'User1' },
        { description: 'Dinner', amount: 50, category: 'Food', paidBy: 'User2' }
      ];
      
      const analysis = await optimizeExpenses(mockExpenses);
      const analysisText = `💡 Suggestions:\n${analysis.suggestions.join('\n')}\n\n💰 Potential savings: ${analysis.totalSavings}`;
      Alert.alert('Budget Analysis', analysisText);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const aiFeatures = [
    {
      icon: 'location-outline',
      title: 'Trip Suggestions',
      description: 'Get AI-powered recommendations for places to visit',
      color: '#007AFF',
      onPress: handleTripSuggestions,
    },
    {
      icon: 'restaurant-outline',
      title: 'Restaurant Recommendations',
      description: 'Find the best local dining spots',
      color: '#FF6B35',
      onPress: () => Alert.alert('Coming Soon', 'Restaurant recommendations will be available soon!'),
    },
    {
      icon: 'calendar-outline',
      title: 'Itinerary Optimization',
      description: 'Optimize your travel schedule for efficiency',
      color: '#34C759',
      onPress: handleItineraryOptimization,
    },
    {
      icon: 'cash-outline',
      title: 'Budget Analysis',
      description: 'Get insights on your spending patterns',
      color: '#FF9500',
      onPress: handleBudgetAnalysis,
    },
    {
      icon: 'partly-sunny-outline',
      title: 'Weather Insights',
      description: 'Plan activities based on weather forecasts',
      color: '#5AC8FA',
      onPress: () => console.log('Weather insights'),
    },
    {
      icon: 'car-outline',
      title: 'Transportation Tips',
      description: 'Best ways to get around your destination',
      color: '#5856D6',
      onPress: () => console.log('Transportation tips'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="sparkles" size={32} color="#007AFF" />
          <Text style={styles.title}>AI Assistant</Text>
          <Text style={styles.subtitle}>
            Get personalized recommendations and insights for {trip.tripName}
          </Text>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingMessage}>AI is thinking...</Text>
        </View>
      )}

      <View style={styles.featuresGrid}>
        {aiFeatures.map((feature, index) => (
          <Pressable
            key={index}
            style={[styles.featureCard, loading && styles.disabledCard]}
            onPress={loading ? undefined : feature.onPress}
            disabled={loading}
          >
            <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
              <Ionicons name={feature.icon as any} size={24} color={feature.color} />
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.comingSoonSection}>
        <View style={styles.comingSoonCard}>
          <Ionicons name="construct-outline" size={48} color="#666" />
          <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
          <Text style={styles.comingSoonText}>
            AI-powered features are currently in development. Stay tuned for intelligent trip planning, 
            personalized recommendations, and smart expense categorization.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingMessage: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresGrid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledCard: {
    opacity: 0.6,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  comingSoonSection: {
    padding: 16,
  },
  comingSoonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default AIAssistScreen;