import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const InfoTab = () => {
  return (
    <View style={styles.container}>
      <View style={styles.sectionContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Destination</Text>
          <TextInput
            style={styles.input}
            placeholder="" 
            placeholderTextColor="#9ba1bb"
            value="" 
          />
        </View>
      </View>
      <View style={styles.dateInputsRow}>
        <View style={styles.dateInputContainer}>
          <Text style={styles.label}>Start date</Text>
          <TextInput
            style={styles.input}
            placeholder="" 
            placeholderTextColor="#9ba1bb"
            value="" 
          />
        </View>
        <View style={styles.dateInputContainer}>
          <Text style={styles.label}>End date</Text>
          <TextInput
            style={styles.input}
            placeholder="" 
            placeholderTextColor="#9ba1bb"
            value="" 
          />
        </View>
      </View>
      <View style={styles.sectionContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="" 
            placeholderTextColor="#9ba1bb"
            multiline={true}
            textAlignVertical="top"
            value="" 
          />
        </View>
      </View>
      <View style={styles.footer}>
        <Pressable style={styles.inviteButton} onPress={() => console.log('Invite friends pressed')}>
          <Text style={styles.inviteButtonText}>Invite friends</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16, 
  },
  inputGroup: {
    flexDirection: 'column',
    marginBottom: 12, 
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24, 
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    width: '100%',
    minHeight: 56, 
    borderRadius: 12, 
    color: '#ffffff',
    backgroundColor: '#272b3a',
    padding: 16,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24, 
  },
  dateInputsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    gap: 16, 
    paddingVertical: 12, 
  },
  dateInput: {
    flexDirection: 'column',
    flex: 1, 
    minWidth: 160, 
  },
  descriptionInput: {
    minHeight: 144, 
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    marginTop: 16, 
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
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: 0.015, 
  },
});

export default InfoTab;