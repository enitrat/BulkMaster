import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Macros } from '../../types/index';

interface Props {
  macros: Macros;
  style?: 'grid' | 'inline';
  showLabels?: boolean;
}

export default function MacroSummary({ macros, style = 'inline', showLabels = true }: Props) {
  if (!macros.calories && !macros.protein && !macros.carbs && !macros.fat) {
    return null;
  }

  if (style === 'grid') {
    return (
      <View style={styles.gridContainer}>
        {macros.calories !== undefined && (
          <View style={styles.gridItem}>
            <Text style={styles.gridValue}>{Math.round(macros.calories)}</Text>
            {showLabels && <Text style={styles.gridLabel}>kcal</Text>}
          </View>
        )}
        {macros.protein !== undefined && (
          <View style={styles.gridItem}>
            <Text style={styles.gridValue}>{Math.round(macros.protein)}g</Text>
            {showLabels && <Text style={styles.gridLabel}>Protein</Text>}
          </View>
        )}
        {macros.carbs !== undefined && (
          <View style={styles.gridItem}>
            <Text style={styles.gridValue}>{Math.round(macros.carbs)}g</Text>
            {showLabels && <Text style={styles.gridLabel}>Carbs</Text>}
          </View>
        )}
        {macros.fat !== undefined && (
          <View style={styles.gridItem}>
            <Text style={styles.gridValue}>{Math.round(macros.fat)}g</Text>
            {showLabels && <Text style={styles.gridLabel}>Fat</Text>}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.inlineContainer}>
      {macros.calories !== undefined && (
        <Text style={styles.inlineText}>
          {Math.round(macros.calories)} {showLabels && 'kcal'}
        </Text>
      )}
      {macros.protein !== undefined && (
        <Text style={styles.inlineText}>
          {Math.round(macros.protein)}g {showLabels && 'protein'}
        </Text>
      )}
      {macros.carbs !== undefined && (
        <Text style={styles.inlineText}>
          {Math.round(macros.carbs)}g {showLabels && 'carbs'}
        </Text>
      )}
      {macros.fat !== undefined && (
        <Text style={styles.inlineText}>
          {Math.round(macros.fat)}g {showLabels && 'fat'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inlineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  inlineText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    alignItems: 'center',
  },
  gridValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  gridLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
