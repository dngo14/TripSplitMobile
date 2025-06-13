import { View, Text, StyleSheet } from 'react-native';

export default function ItineraryTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Itinerary Tab Content</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    color: '#9ba1bb', 
  },
});