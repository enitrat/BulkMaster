import React, { useState } from "react";
import { View, FlatList, Alert, StyleSheet } from "react-native";
import { Surface, FAB, Text, useTheme } from "react-native-paper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BOTTOM_NAV_HEIGHT, FAB_BOTTOM, MealEntry } from "../../types/index";
import { nutritionService } from "../../services/nutritionService";
import MealCard from "../Nutrition/MealCard";
import FoodImageCapture from "../Nutrition/FoodImageCapture";
import ManualMealInput from "../Nutrition/ManualMealInput";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LoadingView } from "@/components/common/LoadingView";
import { ErrorView } from "@/components/common/ErrorView";

export default function NutritionTab() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const today = new Date();

  const [showManualInput, setShowManualInput] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    data: meals,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["meals", today.toDateString()],
    queryFn: () => nutritionService.getMealsByDate(today),
  });

  const addMealMutation = useMutation({
    mutationFn: (mealData: Omit<MealEntry, "id" | "date">) =>
      nutritionService.addMealEntry({
        ...mealData,
        date: new Date(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["meals", today.toDateString()],
      });
    },
    onError: (error) => {
      console.error("Error saving meal:", error);
      Alert.alert("Error", "Failed to save meal");
    },
  });

  const handleAddMeal = async (mealData: Omit<MealEntry, "id" | "date">) => {
    addMealMutation.mutate(mealData);
  };

  if (isLoading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={refetch} />;
  }

  const renderMeal = ({ item }: { item: MealEntry }) => (
    <MealCard meal={item} onDeleted={refetch} onEdited={refetch} />
  );

  return (
    <Surface style={styles.container}>
      <FlatList
        data={meals}
        renderItem={renderMeal}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + 80 },
        ]}
        ListEmptyComponent={
          <Text variant="bodyLarge" style={styles.emptyText}>
            No meals recorded today
          </Text>
        }
      />

      <View style={[styles.fabContainer, { bottom: FAB_BOTTOM }]}>
        {isExpanded && (
          <>
            <FAB
              icon="camera"
              label="Take Photo"
              onPress={() => {
                setIsExpanded(false);
                setShowCamera(true);
              }}
              style={[
                styles.fab,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
            />
            <FAB
              icon="pencil"
              label="Manual Input"
              onPress={() => {
                setIsExpanded(false);
                setShowManualInput(true);
              }}
              style={[
                styles.fab,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
            />
          </>
        )}
        <FAB
          icon={isExpanded ? "close" : "plus"}
          label={isExpanded ? "Close" : "Add Meal"}
          style={[styles.fab]}
          onPress={() => setIsExpanded(!isExpanded)}
          customSize={56}
        />
      </View>

      {showManualInput && (
        <ManualMealInput
          visible={showManualInput}
          onClose={() => {
            setShowManualInput(false);
            setIsExpanded(false);
          }}
          onAnalysisComplete={handleAddMeal}
        />
      )}

      {showCamera && (
        <FoodImageCapture
          onAnalysisComplete={handleAddMeal}
          onClose={() => {
            setShowCamera(false);
            setIsExpanded(false);
          }}
          visible={showCamera}
        />
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
    opacity: 0.7,
  },
  fabContainer: {
    position: "absolute",
    right: 16,
    alignItems: "flex-end",
    gap: 16,
  },
  fab: {
    elevation: 2,
  },
});
