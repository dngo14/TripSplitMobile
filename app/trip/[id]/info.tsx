import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Pressable, 
  Alert, 
  ScrollView,
  FlatList,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams } from 'expo-router';
import { useTrip } from '../../../hooks/useTripData';
import { useAuth } from '../../../components/contexts/AuthContext';
import { useTheme } from '../../../components/contexts/ThemeContext';
import { Member } from '../../../lib/types';
import { CURRENCY_SYMBOLS } from '../../../lib/constants';
import { timestampToDate } from '../../../lib/firestore-utils';

const InfoTab = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trip, updateTrip, addMember, removeMember } = useTrip(id);
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTrip, setEditedTrip] = useState(trip);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  // Update editedTrip when trip data changes
  useEffect(() => {
    if (trip) {
      setEditedTrip(trip);
    }
  }, [trip]);

  if (!trip || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (!editedTrip) return;
    
    try {
      // Prepare updates object with only changed fields
      const updates: any = {};
      
      if (editedTrip.tripName !== trip.tripName) updates.tripName = editedTrip.tripName;
      if (editedTrip.destinationCity !== trip.destinationCity) updates.destinationCity = editedTrip.destinationCity;
      if (editedTrip.currency !== trip.currency) updates.currency = editedTrip.currency;
      if (editedTrip.budget !== trip.budget) updates.budget = editedTrip.budget;
      if (editedTrip.notes !== trip.notes) updates.notes = editedTrip.notes;
      
      // Handle dates properly
      if (editedTrip.tripStartDate !== trip.tripStartDate) {
        updates.tripStartDate = editedTrip.tripStartDate;
      }
      if (editedTrip.tripEndDate !== trip.tripEndDate) {
        updates.tripEndDate = editedTrip.tripEndDate;
      }
      
      if (Object.keys(updates).length > 0) {
        await updateTrip(updates);
        Alert.alert('Success', 'Trip updated successfully');
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating trip:', error);
      Alert.alert('Error', 'Failed to update trip. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditedTrip(trip);
    setIsEditing(false);
  };

  const handleInviteFriends = () => {
    // Check if current user is the trip creator
    if (trip.creatorUID !== user.uid) {
      Alert.alert('Permission Denied', 'Only the trip creator can add new members.');
      return;
    }
    
    setShowAddMemberModal(true);
  };

  const handleAddMemberSubmit = async () => {
    if (!newMemberName.trim()) {
      Alert.alert('Error', 'Please enter a member name');
      return;
    }
    
    const newMember: Member = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: newMemberName.trim(),
      email: newMemberEmail.trim() || undefined,
    };
    
    try {
      await addMember(newMember);
      setNewMemberName('');
      setNewMemberEmail('');
      setShowAddMemberModal(false);
      Alert.alert('Success', 'Member added successfully');
    } catch (error) {
      console.error('Error adding member:', error);
      Alert.alert('Error', 'Failed to add member. Please try again.');
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    // Check if current user is the trip creator
    if (trip.creatorUID !== user.uid) {
      Alert.alert('Permission Denied', 'Only the trip creator can remove members.');
      return;
    }
    
    if (memberId === trip.creatorUID) {
      Alert.alert('Error', 'Cannot remove trip creator');
      return;
    }

    Alert.alert(
      'Remove Member',
      `Remove ${memberName} from this trip?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMember(memberId);
              Alert.alert('Success', 'Member removed successfully');
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert('Error', 'Failed to remove member. Please try again.');
            }
          },
        },
      ]
    );
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate && editedTrip) {
      setEditedTrip({ ...editedTrip, tripStartDate: selectedDate });
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate && editedTrip) {
      setEditedTrip({ ...editedTrip, tripEndDate: selectedDate });
    }
  };

  // Helper function to safely format dates
  const formatDate = (date: any) => {
    if (!date) return null;
    
    // Handle Firebase Timestamp
    if (date && typeof date.toDate === 'function') {
      return date.toDate();
    }
    
    // Handle regular Date
    if (date instanceof Date) {
      return date;
    }
    
    // Handle string dates
    if (typeof date === 'string') {
      return new Date(date);
    }
    
    return null;
  };

  const displayDate = (date: any, fallback: string = 'Not set') => {
    const formattedDate = formatDate(date);
    return formattedDate ? formattedDate.toLocaleDateString() : fallback;
  };

  const currencies = Object.keys(CURRENCY_SYMBOLS);

  const renderMember = ({ item: member }: { item: Member }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <View style={styles.memberAvatar}>
          <Ionicons name="person" size={20} color={theme.colors.primary} />
        </View>
        <View>
          <Text style={styles.memberName}>{member.name}</Text>
          {member.id === trip.creatorUID && (
            <Text style={styles.memberRole}>Trip Creator</Text>
          )}
          {member.email && (
            <Text style={styles.memberEmail}>{member.email}</Text>
          )}
        </View>
      </View>
      
      {trip.creatorUID === user.uid && member.id !== trip.creatorUID && (
        <Pressable
          style={styles.removeButton}
          onPress={() => handleRemoveMember(member.id, member.name)}
        >
          <Ionicons name="close" size={20} color={theme.colors.error} />
        </Pressable>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trip Information</Text>
        {isEditing ? (
          <View style={styles.editButtons}>
            <Pressable style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Ionicons name="create" size={20} color={theme.colors.primary} />
          </Pressable>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Trip Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedTrip?.tripName || ''}
              onChangeText={(text) => editedTrip && setEditedTrip({ ...editedTrip, tripName: text })}
              placeholder="Enter trip name"
            />
          ) : (
            <Text style={styles.value}>{trip.tripName || 'No name set'}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Destination</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedTrip?.destinationCity || ''}
              onChangeText={(text) => editedTrip && setEditedTrip({ ...editedTrip, destinationCity: text })}
              placeholder="Where are you going?"
            />
          ) : (
            <Text style={styles.value}>{trip.destinationCity || 'No destination set'}</Text>
          )}
        </View>

        <View style={styles.dateRow}>
          <View style={[styles.inputGroup, styles.dateInput]}>
            <Text style={styles.label}>Start Date</Text>
            {isEditing ? (
              <Pressable style={styles.dateButton} onPress={() => setShowStartDatePicker(true)}>
                <Text style={styles.dateText}>
                  {displayDate(editedTrip?.tripStartDate, 'Select date')}
                </Text>
                <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
              </Pressable>
            ) : (
              <Text style={styles.value}>
                {displayDate(trip.tripStartDate, 'No start date')}
              </Text>
            )}
          </View>
          
          <View style={[styles.inputGroup, styles.dateInput]}>
            <Text style={styles.label}>End Date</Text>
            {isEditing ? (
              <Pressable style={styles.dateButton} onPress={() => setShowEndDatePicker(true)}>
                <Text style={styles.dateText}>
                  {displayDate(editedTrip?.tripEndDate, 'Select date')}
                </Text>
                <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
              </Pressable>
            ) : (
              <Text style={styles.value}>
                {displayDate(trip.tripEndDate, 'No end date')}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Currency</Text>
          {isEditing ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.currencyContainer}>
                {currencies.slice(0, 10).map((currency) => (
                  <Pressable
                    key={currency}
                    style={[
                      styles.currencyChip,
                      (editedTrip?.currency || 'USD') === currency && styles.currencyChipSelected
                    ]}
                    onPress={() => editedTrip && setEditedTrip({ ...editedTrip, currency })}
                  >
                    <Text style={[
                      styles.currencyText,
                      (editedTrip?.currency || 'USD') === currency && styles.currencyTextSelected
                    ]}>
                      {currency}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          ) : (
            <Text style={styles.value}>
              {trip.currency} ({CURRENCY_SYMBOLS[trip.currency] || trip.currency})
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Budget</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedTrip?.budget?.toString() || ''}
              onChangeText={(text) => {
                const budget = parseFloat(text) || null;
                editedTrip && setEditedTrip({ ...editedTrip, budget });
              }}
              placeholder="Enter total budget"
              keyboardType="decimal-pad"
            />
          ) : (
            <Text style={styles.value}>
              {trip.budget 
                ? `${CURRENCY_SYMBOLS[trip.currency] || trip.currency}${trip.budget.toFixed(2)}`
                : 'No budget set'
              }
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editedTrip?.notes || ''}
              onChangeText={(text) => editedTrip && setEditedTrip({ ...editedTrip, notes: text })}
              placeholder="Trip notes or description..."
              multiline
              numberOfLines={4}
            />
          ) : (
            <Text style={styles.value}>{trip.notes || 'No notes added'}</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Members ({trip.members?.length || 0})</Text>
          {trip.creatorUID === user.uid && (
            <Pressable style={styles.inviteButton} onPress={handleInviteFriends}>
              <Ionicons name="person-add" size={20} color={theme.colors.primary} />
            </Pressable>
          )}
        </View>
        
        <FlatList
          data={trip.members || []}
          keyExtractor={(item) => item.id}
          renderItem={renderMember}
          scrollEnabled={false}
        />
      </View>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={formatDate(editedTrip?.tripStartDate) || new Date()}
          mode="date"
          display="default"
          onChange={onStartDateChange}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={formatDate(editedTrip?.tripEndDate) || new Date()}
          mode="date"
          display="default"
          onChange={onEndDateChange}
        />
      )}

      {/* Add Member Modal */}
      <Modal
        visible={showAddMemberModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Member</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowAddMemberModal(false);
                  setNewMemberName('');
                  setNewMemberEmail('');
                }}
              >
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.textInput}
                value={newMemberName}
                onChangeText={setNewMemberName}
                placeholder="Enter member's name"
                placeholderTextColor={theme.colors.inactive}
                autoFocus={true}
              />
              
              <Text style={styles.inputLabel}>Email (optional)</Text>
              <TextInput
                style={styles.textInput}
                value={newMemberEmail}
                onChangeText={setNewMemberEmail}
                placeholder="Enter member's email"
                placeholderTextColor={theme.colors.inactive}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddMemberModal(false);
                  setNewMemberName('');
                  setNewMemberEmail('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleAddMemberSubmit}
              >
                <Text style={styles.createButtonText}>Add Member</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  editButton: {
    padding: 8,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
  },
  cancelText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    backgroundColor: theme.colors.surface,
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
  },
  value: {
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: theme.colors.background,
  },
  dateText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  currencyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  currencyChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  currencyChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  currencyText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  currencyTextSelected: {
    color: '#fff',
  },
  inviteButton: {
    padding: 8,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: 8,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  memberRole: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  memberEmail: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  removeButton: {
    padding: 8,
    backgroundColor: theme.colors.error + '20',
    borderRadius: 6,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  createButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
});

export default InfoTab;