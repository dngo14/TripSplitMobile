import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Settlement, Member, Expense } from '../../lib/types';
import { calculateSettlements } from '../../lib/settlement';
import { CURRENCY_SYMBOLS } from '../../lib/constants';

interface SettlementSummaryProps {
  expenses: Expense[];
  members: Member[];
  currency: string;
  currentUserId: string;
  onMarkSettled?: (settlement: Settlement) => void;
}

export const SettlementSummary: React.FC<SettlementSummaryProps> = ({
  expenses,
  members,
  currency,
  currentUserId,
  onMarkSettled,
}) => {
  const settlements = calculateSettlements(expenses, members);
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;

  const handleMarkSettled = (settlement: Settlement) => {
    Alert.alert(
      'Mark as Settled',
      `Mark the payment from ${settlement.from} to ${settlement.to} for ${currencySymbol}${settlement.amount.toFixed(2)} as settled?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Settled',
          onPress: () => onMarkSettled?.(settlement),
        },
      ]
    );
  };

  const getSettlementIcon = (settlement: Settlement) => {
    const isInvolvedInSettlement = 
      settlement.fromId === currentUserId || settlement.toId === currentUserId;
    
    if (settlement.fromId === currentUserId) {
      return { name: 'arrow-up-circle', color: '#FF3B30' }; // You owe
    } else if (settlement.toId === currentUserId) {
      return { name: 'arrow-down-circle', color: '#34C759' }; // You are owed
    } else {
      return { name: 'swap-horizontal', color: '#666' }; // Others
    }
  };

  const getSettlementDescription = (settlement: Settlement) => {
    if (settlement.fromId === currentUserId) {
      return `You owe ${settlement.to}`;
    } else if (settlement.toId === currentUserId) {
      return `${settlement.from} owes you`;
    } else {
      return `${settlement.from} owes ${settlement.to}`;
    }
  };

  const mySettlements = settlements.filter(s => 
    s.fromId === currentUserId || s.toId === currentUserId
  );

  const otherSettlements = settlements.filter(s => 
    s.fromId !== currentUserId && s.toId !== currentUserId
  );

  if (settlements.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="checkmark-circle-outline" size={64} color="#34C759" />
        <Text style={styles.emptyTitle}>All settled up!</Text>
        <Text style={styles.emptySubtitle}>
          No outstanding balances between group members
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {mySettlements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Settlements</Text>
          {mySettlements.map((settlement, index) => {
            const icon = getSettlementIcon(settlement);
            return (
              <View key={index} style={styles.settlementItem}>
                <View style={styles.settlementMain}>
                  <Ionicons name={icon.name as any} size={24} color={icon.color} />
                  <View style={styles.settlementInfo}>
                    <Text style={styles.settlementDescription}>
                      {getSettlementDescription(settlement)}
                    </Text>
                    <Text style={[styles.settlementAmount, { color: icon.color }]}>
                      {currencySymbol}{settlement.amount.toFixed(2)}
                    </Text>
                  </View>
                </View>
                
                {onMarkSettled && (
                  <Pressable
                    style={styles.settleButton}
                    onPress={() => handleMarkSettled(settlement)}
                  >
                    <Text style={styles.settleButtonText}>Mark Settled</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      )}

      {otherSettlements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Settlements</Text>
          {otherSettlements.map((settlement, index) => {
            const icon = getSettlementIcon(settlement);
            return (
              <View key={index} style={styles.settlementItem}>
                <View style={styles.settlementMain}>
                  <Ionicons name={icon.name as any} size={24} color={icon.color} />
                  <View style={styles.settlementInfo}>
                    <Text style={styles.settlementDescription}>
                      {getSettlementDescription(settlement)}
                    </Text>
                    <Text style={styles.settlementAmount}>
                      {currencySymbol}{settlement.amount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Total settlements: {settlements.length}
        </Text>
        <Text style={styles.footerNote}>
          Tap &quot;Mark Settled&quot; when payments are made outside the app
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  settlementItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settlementMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settlementInfo: {
    flex: 1,
    marginLeft: 12,
  },
  settlementDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  settlementAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  settleButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  settleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
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
    color: '#34C759',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});