import React, { useMemo } from 'react';
import { View } from 'react-native';
import { CartesianChart, Line, Scatter } from 'victory-native';
import { useFont } from '@shopify/react-native-skia';
import { Card, Text, useTheme, List } from 'react-native-paper';
import { Workout, Exercise } from '../../types/index';

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
  const theme = useTheme();

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
    <Card
      mode="outlined"
      style={{ marginBottom: 12 }}
      onPress={onToggle}
    >
      <List.Accordion
        title={exercise.name}
        description={`Best: ${bestWeight}kg • ${chartData.length} workouts`}
        expanded={isExpanded}
        onPress={onToggle}
      >
        <Card.Content>
          <View style={{ height: 300, marginVertical: 16 }}>
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
                  <Line points={points.weight} color={theme.colors.primary} strokeWidth={2} />
                  <Scatter points={points.weight} color={theme.colors.primary} radius={4} />
                </>
              )}
            </CartesianChart>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16 }}>
            <View style={{ alignItems: 'center' }}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Best Weight
              </Text>
              <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
                {bestWeight}kg
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Times Performed
              </Text>
              <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
                {chartData.length}
              </Text>
            </View>
          </View>
        </Card.Content>
      </List.Accordion>
    </Card>
  );
}
