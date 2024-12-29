import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { CartesianChart, Line, Scatter } from 'victory-native';
import { useFont } from '@shopify/react-native-skia';
import { Ionicons } from '@expo/vector-icons';
import { Workout, Exercise } from '../types';

type ExerciseHistoryProps = {
  exercise: Exercise;
  workouts: Workout[];
  isExpanded?: boolean;
  onToggle?: () => void;
};

type ChartData = {
  date: number;
  weight: number;
};

export default function ExerciseHistory({ exercise, workouts, isExpanded = false, onToggle }: ExerciseHistoryProps) {
  const chartData = useMemo(() => {
    const exerciseData = workouts
      .filter(workout => workout.exercises.some(e => e.exercise.id === exercise.id))
      .map(workout => {
        const exerciseInstance = workout.exercises.find(e => e.exercise.id === exercise.id)!;
        const maxWeight = Math.max(...exerciseInstance.sets.map(set => set.weight));
        return {
          date: new Date(workout.date).getTime(),
          weight: maxWeight,
        };
      })
      .sort((a, b) => a.date - b.date);

    return exerciseData;
  }, [exercise.id, workouts]);

  if (chartData.length === 0) {
    return null;
  }

  const xDomain: [number, number] = [
    chartData[0].date,
    chartData[chartData.length - 1].date
  ];

  const yDomain: [number, number] = [
    0,
    Math.max(...chartData.map(d => d.weight)) * 1.1
  ];

  const bestWeight = Math.max(...chartData.map(d => d.weight));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>{exercise.name}</Text>
            <Text style={styles.subtitle}>
              Best: {bestWeight}kg • {chartData.length} workouts
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color="#666"
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <>
          <View style={styles.chartContainer}>
            <CartesianChart
              data={chartData}
              xKey="date"
              yKeys={["weight"]}
              domain={{ x: xDomain, y: yDomain }}
              axisOptions={{
                formatXLabel: (value: number) => new Date(value).toLocaleDateString(),
                formatYLabel: (value: number) => `${value}kg`,
              }}
            >
              {({ points }) => (
                <>
                  <Line points={points.weight} color="#007AFF" strokeWidth={2} />
                  <Scatter points={points.weight} color="#007AFF" radius={4} />
                </>
              )}
            </CartesianChart>
          </View>

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Best Weight</Text>
              <Text style={styles.statValue}>{bestWeight}kg</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Times Performed</Text>
              <Text style={styles.statValue}>{chartData.length}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  header: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  chartContainer: {
    height: 300,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});
