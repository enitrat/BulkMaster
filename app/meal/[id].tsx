import { useLocalSearchParams, router } from "expo-router";
import { Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nutritionService } from "@/services/nutritionService";
import FullMealView from "@/components/Nutrition/FullMealView";
import { LoadingView } from "@/components/common/LoadingView";
import { ErrorView } from "@/components/common/ErrorView";

export default function MealScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const {
    data: meal,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["meal", id],
    queryFn: () => nutritionService.getMealById(id),
  });

  const deleteMealMutation = useMutation({
    mutationFn: () => nutritionService.deleteMealEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      router.back();
    },
    onError: (error) => {
      console.error("Error deleting meal:", error);
      Alert.alert("Error", "Failed to delete meal");
    },
  });

  const handleDelete = () => {
    Alert.alert(
      "Delete Meal",
      "Are you sure you want to delete this meal? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteMealMutation.mutate();
          },
        },
      ],
    );
  };

  if (isLoading) {
    return <LoadingView />;
  }

  if (error || !meal) {
    return <ErrorView error={error} onRetry={refetch} />;
  }

  return (
    <FullMealView meal={meal} onEdited={refetch} onDeleted={handleDelete} />
  );
}
