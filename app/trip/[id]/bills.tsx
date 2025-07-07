import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useTrip } from '../../../hooks/useTripData';
import { useAuth } from '../../../components/contexts/AuthContext';
import { ExpenseForm } from '../../../components/trip/ExpenseForm';
import { ExpenseList } from '../../../components/trip/ExpenseList';
import { SettlementSummary } from '../../../components/trip/SettlementSummary';
import { Expense } from '../../../lib/types';

export default function BillsTabScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trip, addExpense, updateExpense, deleteExpense } = useTrip(id);
  const { user } = useAuth();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [activeTab, setActiveTab] = useState<'expenses' | 'settlements'>('expenses');

  if (!trip || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleAddExpense = async (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    
    try {
      await addExpense(newExpense);
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleUpdateExpense = async (expenseData: Omit<Expense, 'id'>) => {
    if (!editingExpense) return;
    
    try {
      await updateExpense(editingExpense.id, expenseData);
      setEditingExpense(undefined);
    } catch (error) {
      console.error('Failed to update expense:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const handleCloseForm = () => {
    setShowExpenseForm(false);
    setEditingExpense(undefined);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Trip Activity</Text>
            
            <View style={styles.segmentedControl}>
              <Pressable
                style={[
                  styles.segmentButton,
                  activeTab === 'expenses' && styles.activeSegmentButton,
                ]}
                onPress={() => setActiveTab('expenses')}
              >
                <Text style={[
                  styles.segmentText,
                  activeTab === 'expenses' && styles.activeSegmentText,
                ]}>
                  Expenses
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.segmentButton,
                  activeTab === 'settlements' && styles.activeSegmentButton,
                ]}
                onPress={() => setActiveTab('settlements')}
              >
                <Text style={[
                  styles.segmentText,
                  activeTab === 'settlements' && styles.activeSegmentText,
                ]}>
                  Settlements
                </Text>
              </Pressable>
            </View>
          </View>

          {activeTab === 'expenses' ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Recent Expenses</Text>
              <ExpenseList
                expenses={trip.expenses || []}
                members={trip.members || []}
                currency={trip.currency}
                onEditExpense={handleEditExpense}
                onDeleteExpense={handleDeleteExpense}
                currentUserId={user.uid}
              />
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Settlement Summary</Text>
              <SettlementSummary
                expenses={trip.expenses || []}
                members={trip.members || []}
                currency={trip.currency}
                currentUserId={user.uid}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {activeTab === 'expenses' && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setShowExpenseForm(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      <ExpenseForm
        visible={showExpenseForm}
        onClose={handleCloseForm}
        onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
        members={trip.members || []}
        currency={trip.currency}
        expense={editingExpense}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeSegmentButton: {
    backgroundColor: '#007AFF',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeSegmentText: {
    color: '#fff',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});