import { useState } from "react";
import { Surface } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import HistoryTab from "../../components/Tabs/HistoryTab";
import { workoutService } from "../../services/workoutService";
import { exerciseService } from "../../services/exerciseService";
import { HistoryView } from "../../types";
import { ErrorView } from "@/components/common/ErrorView";
import { LoadingView } from "@/components/common/LoadingView";

export default function History() {
  const [historyView, setHistoryView] = useState<HistoryView>("calendar");

  const {
    data: workouts,
    isLoading: workoutsLoading,
    error: workoutsError,
    refetch: refetchWorkouts,
  } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => workoutService.getAllWorkouts(),
  });

  const {
    data: exercises,
    isLoading: exercisesLoading,
    error: exercisesError,
    refetch: refetchExercises,
  } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => exerciseService.getAllExercises(),
  });

  const isLoading = workoutsLoading || exercisesLoading;
  const error = workoutsError || exercisesError;

  if (isLoading) {
    return <LoadingView />;
  }

  if (error) {
    return (
      <ErrorView
        error={error}
        onRetry={() => {
          refetchWorkouts();
          refetchExercises();
        }}
      />
    );
  }

  return (
    <Surface style={{ flex: 1 }}>
      <HistoryTab
        workouts={workouts ?? []}
        exercises={exercises ?? []}
        historyView={historyView}
        setHistoryView={setHistoryView}
      />
    </Surface>
  );
}
