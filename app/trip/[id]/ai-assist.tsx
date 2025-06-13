import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AIAssistScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>AI Assist Tab Content</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111218', 
  },
  text: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default AIAssistScreen;