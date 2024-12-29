import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Tab {
  id: string;
  icon: string;
  label: string;
}

interface Props {
  activeTab: string;
  onTabPress: (tabId: string) => void;
  tabs: Tab[];
}

export default function TabBar({ activeTab, onTabPress, tabs }: Props) {
  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => onTabPress(tab.id)}
        >
          <Ionicons
            name={tab.icon as any}
            size={24}
            color={activeTab === tab.id ? '#007AFF' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 20, // Add extra padding for iPhone home indicator
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  activeTab: {
    backgroundColor: '#f0f9ff',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
