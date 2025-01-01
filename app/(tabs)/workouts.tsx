import { Surface } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import WorkoutsTab from "../../components/Tabs/WorkoutsTab";
import { templateService } from "../../services/templateService";
import { workoutService } from "../../services/workoutService";
import { ErrorView } from "@/components/common/ErrorView";
import { LoadingView } from "@/components/common/LoadingView";

export default function Workouts() {
  const {
    data: templates,
    isLoading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates,
  } = useQuery({
    queryKey: ["templates"],
    queryFn: () => templateService.getAllTemplates(),
  });

  const {
    data: activeWorkout,
    isLoading: workoutLoading,
    error: workoutError,
    refetch: refetchWorkout,
  } = useQuery({
    queryKey: ["activeWorkout"],
    queryFn: () => workoutService.getActiveWorkout(),
  });

  const isLoading = templatesLoading || workoutLoading;
  const error = templatesError || workoutError;

  if (isLoading) {
    return <LoadingView />;
  }

  if (error) {
    return (
      <ErrorView
        error={error}
        onRetry={() => {
          refetchTemplates();
          refetchWorkout();
        }}
      />
    );
  }

  return (
    <Surface style={{ flex: 1 }}>
      <WorkoutsTab
        templates={templates ?? []}
        activeWorkout={activeWorkout ?? null}
        onDataChange={() => {
          refetchTemplates();
          refetchWorkout();
        }}
      />
    </Surface>
  );
}
