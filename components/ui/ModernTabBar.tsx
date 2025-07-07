import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export function ModernTabBar({ state, descriptors, navigation }: TabBarProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' && (
        <BlurView intensity={100} style={StyleSheet.absoluteFillObject} />
      )}
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined 
            ? options.tabBarLabel 
            : options.title !== undefined 
            ? options.title 
            : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const getIconName = (routeName: string, focused: boolean) => {
            switch (routeName) {
              case 'index':
                return focused ? 'home' : 'home-outline';
              case 'profile':
                return focused ? 'person' : 'person-outline';
              default:
                return 'circle-outline';
            }
          };

          return (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
            >
              <View style={[styles.tabContent, isFocused && styles.focusedTab]}>
                <View style={[styles.iconContainer, isFocused && styles.focusedIconContainer]}>
                  <Ionicons
                    name={getIconName(route.name, isFocused) as any}
                    size={22}
                    color={isFocused ? theme.colors.primary : theme.colors.inactive}
                  />
                </View>
                <Text style={[styles.tabLabel, isFocused && styles.focusedTabLabel]}>
                  {label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : theme.colors.tabBar,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : theme.colors.tabBar,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    minHeight: 48,
  },
  focusedTab: {
    // Add focused styles if needed
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  focusedIconContainer: {
    // Add focused icon container styles if needed
  },
  tabLabel: {
    fontSize: 10,
    color: theme.colors.inactive,
    fontWeight: '500',
    textAlign: 'center',
  },
  focusedTabLabel: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});