import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatTabScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is the Chat tab content.</Text>
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
    color: '#9ba1bb', 
    fontSize: 16,
  },
});

export default ChatTabScreen;