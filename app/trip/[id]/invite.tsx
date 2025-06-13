import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const InviteTab = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Invite Tab Content</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9ba1bb',
  },
});

export default InviteTab;