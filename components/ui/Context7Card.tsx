import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Context7CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  title?: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Context7Card({
  children,
  style,
  onPress,
  title,
  subtitle,
  rightElement,
  leftIcon,
  variant = 'default'
}: Context7CardProps) {
  const Component = onPress ? Pressable : View;
  
  const getCardStyle = () => {
    switch (variant) {
      case 'elevated':
        return [styles.card, styles.elevatedCard];
      case 'outlined':
        return [styles.card, styles.outlinedCard];
      default:
        return [styles.card, styles.defaultCard];
    }
  };

  return (
    <Component 
      style={[...getCardStyle(), style]}
      onPress={onPress}
    >
      {(title || subtitle || leftIcon || rightElement) && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {leftIcon && (
              <View style={styles.iconContainer}>
                <Ionicons name={leftIcon} size={20} color="#007AFF" />
              </View>
            )}
            <View style={styles.titleContainer}>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>
          {rightElement && (
            <View style={styles.headerRight}>
              {rightElement}
            </View>
          )}
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </Component>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  defaultCard: {
    backgroundColor: '#fff',
  },
  elevatedCard: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  outlinedCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    marginLeft: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
});