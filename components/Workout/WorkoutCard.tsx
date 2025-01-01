import React, { useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Card, Text, IconButton, useTheme, List } from "react-native-paper";
import { Workout, WorkoutExercise } from "../../types/index";
import { workoutService } from "@/services/workoutService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { haptics } from "@/utils/haptics";

interface Props {
  workout: Workout;
  onPress?: () => void;
  showActions?: boolean;
  compact?: boolean;
  onDeleted?: () => void;
  onEdited?: () => void;
}

export default function WorkoutCard({
  workout,
  onPress,
  showActions = true,
  compact = false,
  onDeleted,
  onEdited,
}: Props) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const deleteWorkoutMutation = useMutation({
    mutationFn: (workoutId: string) => workoutService.deleteWorkout(workoutId),
    onSuccess: async () => {
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      onDeleted?.();
    },
    onError: async (error) => {
      haptics.error();
      console.error("Error deleting workout:", error);
      Alert.alert("Error", "Failed to delete workout");
    },
  });

  const handleDelete = useCallback(async () => {
    haptics.warning();
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteWorkoutMutation.mutate(workout.id),
        },
      ],
    );
  }, [workout.id, deleteWorkoutMutation]);

  const handleExpand = useCallback(async () => {
    haptics.selection();
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const handlePress = useCallback(async () => {
    haptics.light();
    onPress?.();
  }, [onPress]);

  const CardContent = () => (
    <>
      <Card.Title
        title={
          workout.name ||
          `Workout on ${new Date(workout.date).toLocaleDateString()}`
        }
        subtitle={`${workout.exercises.length} exercises`}
        right={(props) => (
          <View style={styles.actionContainer}>
            {isExpanded && showActions && (
              <IconButton
                {...props}
                icon="trash-can-outline"
                iconColor={theme.colors.error}
                onPress={handleDelete}
                disabled={deleteWorkoutMutation.isPending}
              />
            )}
            <IconButton
              {...props}
              icon={isExpanded ? "chevron-up" : "chevron-down"}
              onPress={handleExpand}
            />
          </View>
        )}
      />

      {!compact && isExpanded && (
        <Card.Content>
          <List.Section>
            {workout.exercises.map((exercise: WorkoutExercise) => (
              <List.Item
                key={exercise.exercise.id}
                title={exercise.exercise.name}
                description={`${exercise.sets[0]?.weight || 0}kg x ${exercise.sets[0]?.reps || 0}`}
                left={(props) => <List.Icon {...props} icon="dumbbell" />}
              />
            ))}
          </List.Section>
        </Card.Content>
      )}
    </>
  );

  const cardProps = {
    style: styles.card,
    onPress: onPress ? handlePress : undefined,
    mode: "elevated" as const,
  };

  return onPress ? (
    <Card {...cardProps}>
      <CardContent />
    </Card>
  ) : (
    <Card {...cardProps}>
      <CardContent />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
