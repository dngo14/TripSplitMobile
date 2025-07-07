import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Expense, Member } from '../../lib/types';
import { CURRENCY_SYMBOLS } from '../../lib/constants';
import { timestampToDate } from '../../lib/firestore-utils';

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
  currency: string;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  currentUserId: string;
}

interface ExpenseItemProps {
  expense: Expense;
  members: Member[];
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
  currentUserId: string;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  members,
  currency,
  onEdit,
  onDelete,
  currentUserId,
}) => {
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;
  const paidByMember = members.find(m => m.id === expense.paidById);
  const expenseDate = timestampToDate(expense.date);

  const getSplitDescription = () => {
    if (expense.splitType === 'equally') {
      const splitCount = expense.splitDetails?.length || members.length;
      return `Split equally among ${splitCount} ${splitCount === 1 ? 'person' : 'people'}`;
    } else if (expense.splitType === 'byAmount') {
      return 'Split by custom amounts';
    } else if (expense.splitType === 'byPercentage') {
      return 'Split by percentages';
    }
    return 'Split details';
  };

  const getMyShare = () => {
    if (expense.splitType === 'equally') {
      const splitCount = expense.splitDetails?.length || members.length;
      return expense.amount / splitCount;
    } else if (expense.splitType === 'byAmount') {
      const myDetail = expense.splitDetails?.find(sd => sd.memberId === currentUserId);
      return myDetail?.amount || 0;
    } else if (expense.splitType === 'byPercentage') {
      const myDetail = expense.splitDetails?.find(sd => sd.memberId === currentUserId);
      return expense.amount * ((myDetail?.percentage || 0) / 100);
    }
    return 0;
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const myShare = getMyShare();
  const isPaidByMe = expense.paidById === currentUserId;

  return (
    <Pressable style={styles.expenseItem} onPress={onEdit}>
      <View style={styles.expenseHeader}>
        <View style={styles.expenseMain}>
          <Text style={styles.expenseDescription}>{expense.description}</Text>
          <Text style={styles.expenseAmount}>
            {currencySymbol}{expense.amount.toFixed(2)}
          </Text>
        </View>
        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </Pressable>
      </View>

      <View style={styles.expenseDetails}>
        <View style={styles.expenseInfo}>
          <Text style={styles.paidBy}>
            Paid by {paidByMember?.name || 'Unknown'}
          </Text>
          {expense.category && (
            <Text style={styles.category}>• {expense.category}</Text>
          )}
          {expenseDate && (
            <Text style={styles.date}>
              • {expenseDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: expenseDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
              })}
            </Text>
          )}
        </View>
        
        <Text style={styles.splitInfo}>{getSplitDescription()}</Text>
        
        <View style={styles.shareInfo}>
          {isPaidByMe ? (
            <Text style={styles.youPaid}>
              You paid {currencySymbol}{expense.amount.toFixed(2)}
            </Text>
          ) : (
            <Text style={styles.yourShare}>
              Your share: {currencySymbol}{myShare.toFixed(2)}
            </Text>
          )}
        </View>
      </View>

      {expense.comments && expense.comments.length > 0 && (
        <View style={styles.commentsIndicator}>
          <Ionicons name="chatbubble-outline" size={16} color="#666" />
          <Text style={styles.commentsCount}>
            {expense.comments.length} comment{expense.comments.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  members,
  currency,
  onEditExpense,
  onDeleteExpense,
  currentUserId,
}) => {
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedExpenses = [...expenses].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      const dateA = timestampToDate(a.date) || new Date(0);
      const dateB = timestampToDate(b.date) || new Date(0);
      comparison = dateA.getTime() - dateB.getTime();
    } else if (sortBy === 'amount') {
      comparison = a.amount - b.amount;
    } else if (sortBy === 'description') {
      comparison = a.description.localeCompare(b.description);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const renderSortButton = (label: string, sortType: typeof sortBy) => (
    <Pressable
      style={[styles.sortButton, sortBy === sortType && styles.sortButtonActive]}
      onPress={() => toggleSort(sortType)}
    >
      <Text style={[styles.sortButtonText, sortBy === sortType && styles.sortButtonTextActive]}>
        {label}
      </Text>
      {sortBy === sortType && (
        <Ionicons
          name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#007AFF"
        />
      )}
    </Pressable>
  );

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;

  if (expenses.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="receipt-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>No expenses yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the + button to add your first expense
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.totalAmount}>
          Total: {currencySymbol}{totalAmount.toFixed(2)}
        </Text>
        <View style={styles.sortControls}>
          {renderSortButton('Date', 'date')}
          {renderSortButton('Amount', 'amount')}
          {renderSortButton('Name', 'description')}
        </View>
      </View>

      <FlatList
        data={sortedExpenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExpenseItem
            expense={item}
            members={members}
            currency={currency}
            onEdit={() => onEditExpense(item)}
            onDelete={() => onDeleteExpense(item.id)}
            currentUserId={currentUserId}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sortControls: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sortButtonActive: {
    backgroundColor: '#E8F4FD',
    borderColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  sortButtonTextActive: {
    color: '#007AFF',
  },
  listContainer: {
    padding: 16,
  },
  expenseItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  expenseMain: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  deleteButton: {
    padding: 4,
  },
  expenseDetails: {
    gap: 4,
  },
  expenseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  paidBy: {
    fontSize: 14,
    color: '#666',
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  splitInfo: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  shareInfo: {
    marginTop: 4,
  },
  youPaid: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
  },
  yourShare: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  commentsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  commentsCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});