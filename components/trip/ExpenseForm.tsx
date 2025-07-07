import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Expense, Member, SplitType, SplitDetail } from '../../lib/types';
import { EXPENSE_CATEGORIES, CURRENCY_SYMBOLS } from '../../lib/constants';

interface ExpenseFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
  members: Member[];
  currency: string;
  expense?: Expense; // For editing existing expense
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  visible,
  onClose,
  onSubmit,
  members,
  currency,
  expense,
}) => {
  const [description, setDescription] = useState(expense?.description || '');
  const [amount, setAmount] = useState(expense?.amount?.toString() || '');
  const [category, setCategory] = useState(expense?.category || EXPENSE_CATEGORIES[0]);
  const [paidById, setPaidById] = useState(expense?.paidById || members[0]?.id || '');
  const [splitType, setSplitType] = useState<SplitType>(expense?.splitType || 'equally');
  const [splitDetails, setSplitDetails] = useState<SplitDetail[]>(
    expense?.splitDetails || members.map(m => ({ memberId: m.id, amount: 0, percentage: 0 }))
  );
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set(expense?.splitDetails?.map(sd => sd.memberId) || members.map(m => m.id))
  );

  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;

  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!paidById) {
      Alert.alert('Error', 'Please select who paid for this expense');
      return;
    }

    if (selectedMembers.size === 0) {
      Alert.alert('Error', 'Please select at least one member to split with');
      return;
    }

    // Validate split details based on split type
    let finalSplitDetails: SplitDetail[] = [];

    if (splitType === 'equally') {
      finalSplitDetails = Array.from(selectedMembers).map(memberId => ({
        memberId,
      }));
    } else if (splitType === 'byAmount') {
      finalSplitDetails = splitDetails.filter(sd => selectedMembers.has(sd.memberId));
      const totalSplitAmount = finalSplitDetails.reduce((sum, sd) => sum + (sd.amount || 0), 0);
      
      if (Math.abs(totalSplitAmount - numAmount) > 0.01) {
        Alert.alert('Error', `Split amounts must total ${currencySymbol}${numAmount.toFixed(2)}`);
        return;
      }
    } else if (splitType === 'byPercentage') {
      finalSplitDetails = splitDetails.filter(sd => selectedMembers.has(sd.memberId));
      const totalPercentage = finalSplitDetails.reduce((sum, sd) => sum + (sd.percentage || 0), 0);
      
      if (Math.abs(totalPercentage - 100) > 0.01) {
        Alert.alert('Error', 'Split percentages must total 100%');
        return;
      }
    }

    const newExpense: Omit<Expense, 'id'> = {
      description: description.trim(),
      amount: numAmount,
      paidById,
      category,
      splitType,
      splitDetails: finalSplitDetails,
      date: new Date(),
      createdAt: new Date(),
      comments: expense?.comments || [],
      receiptImageUri: expense?.receiptImageUri,
    };

    onSubmit(newExpense);
    onClose();
    
    // Reset form
    setDescription('');
    setAmount('');
    setCategory(EXPENSE_CATEGORIES[0]);
    setPaidById(members[0]?.id || '');
    setSplitType('equally');
    setSelectedMembers(new Set(members.map(m => m.id)));
    setSplitDetails(members.map(m => ({ memberId: m.id, amount: 0, percentage: 0 })));
  };

  const toggleMemberSelection = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const updateSplitDetail = (memberId: string, field: 'amount' | 'percentage', value: number) => {
    setSplitDetails(prev => 
      prev.map(sd => 
        sd.memberId === memberId 
          ? { ...sd, [field]: value }
          : sd
      )
    );
  };

  const getMemberName = (memberId: string) => {
    return members.find(m => m.id === memberId)?.name || 'Unknown';
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </Pressable>
          <Text style={styles.title}>{expense ? 'Edit Expense' : 'Add Expense'}</Text>
          <Pressable onPress={handleSubmit} style={styles.saveButton}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content}>
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="What was this expense for?"
              autoFocus
            />
          </View>

          {/* Amount */}
          <View style={styles.section}>
            <Text style={styles.label}>Amount ({currencySymbol}) *</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {EXPENSE_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.categoryChip, category === cat && styles.categoryChipSelected]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.categoryText, category === cat && styles.categoryTextSelected]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Paid By */}
          <View style={styles.section}>
            <Text style={styles.label}>Paid by *</Text>
            <View style={styles.memberList}>
              {members.map((member) => (
                <Pressable
                  key={member.id}
                  style={[styles.memberChip, paidById === member.id && styles.memberChipSelected]}
                  onPress={() => setPaidById(member.id)}
                >
                  <Text style={[styles.memberText, paidById === member.id && styles.memberTextSelected]}>
                    {member.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Split Type */}
          <View style={styles.section}>
            <Text style={styles.label}>Split Type</Text>
            <View style={styles.splitTypeContainer}>
              {(['equally', 'byAmount', 'byPercentage'] as SplitType[]).map((type) => (
                <Pressable
                  key={type}
                  style={[styles.splitTypeButton, splitType === type && styles.splitTypeButtonSelected]}
                  onPress={() => setSplitType(type)}
                >
                  <Text style={[styles.splitTypeText, splitType === type && styles.splitTypeTextSelected]}>
                    {type === 'equally' ? 'Equally' : type === 'byAmount' ? 'By Amount' : 'By %'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Split With */}
          <View style={styles.section}>
            <Text style={styles.label}>Split with</Text>
            {members.map((member) => (
              <View key={member.id} style={styles.splitRow}>
                <Pressable
                  style={styles.memberRow}
                  onPress={() => toggleMemberSelection(member.id)}
                >
                  <View style={[styles.checkbox, selectedMembers.has(member.id) && styles.checkboxSelected]}>
                    {selectedMembers.has(member.id) && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.memberName}>{member.name}</Text>
                </Pressable>

                {selectedMembers.has(member.id) && splitType !== 'equally' && (
                  <View style={styles.splitInput}>
                    <TextInput
                      style={styles.smallInput}
                      value={
                        splitType === 'byAmount'
                          ? (splitDetails.find(sd => sd.memberId === member.id)?.amount || 0).toString()
                          : (splitDetails.find(sd => sd.memberId === member.id)?.percentage || 0).toString()
                      }
                      onChangeText={(text) => {
                        const value = parseFloat(text) || 0;
                        updateSplitDetail(member.id, splitType === 'byAmount' ? 'amount' : 'percentage', value);
                      }}
                      placeholder={splitType === 'byAmount' ? '0.00' : '0'}
                      keyboardType="decimal-pad"
                    />
                    <Text style={styles.splitInputSuffix}>
                      {splitType === 'byAmount' ? currencySymbol : '%'}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
  },
  categoryTextSelected: {
    color: '#fff',
  },
  memberList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  memberChipSelected: {
    backgroundColor: '#34C759',
  },
  memberText: {
    color: '#666',
    fontSize: 14,
  },
  memberTextSelected: {
    color: '#fff',
  },
  splitTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  splitTypeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  splitTypeButtonSelected: {
    backgroundColor: '#007AFF',
  },
  splitTypeText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  splitTypeTextSelected: {
    color: '#fff',
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  memberName: {
    fontSize: 16,
    color: '#333',
  },
  splitInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  smallInput: {
    padding: 8,
    fontSize: 14,
    minWidth: 60,
    textAlign: 'right',
  },
  splitInputSuffix: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});