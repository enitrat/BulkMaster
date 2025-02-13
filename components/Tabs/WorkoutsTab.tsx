import React from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import {
  Surface,
  Card,
  Text,
  Button,
  IconButton,
  List,
  useTheme,
  FAB,
} from "react-native-paper";
import { WorkoutTemplate, Workout, FAB_BOTTOM } from "@/types/index";
import { templateService } from "@/services/templateService";
import { workoutService } from "@/services/workoutService";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { haptics } from "@/utils/haptics";

interface Props {
  templates: WorkoutTemplate[] | null;
  activeWorkout: Workout | null;
  onDataChange: () => void;
}

export default function WorkoutsTab({
  templates,
  activeWorkout,
  onDataChange,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const handleCancelWorkout = async () => {
    haptics.warning();
    Alert.alert(
      "Cancel Workout",
      "Are you sure you want to cancel this workout? This action cannot be undone.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await workoutService.deleteActiveWorkout();
              haptics.success();
              onDataChange();
            } catch (error) {
              haptics.error();
              console.error(error);
              Alert.alert("Error", "Failed to cancel workout");
            }
          },
        },
      ],
    );
  };

  const handleDeleteTemplate = async (template: WorkoutTemplate) => {
    haptics.warning();
    Alert.alert(
      "Delete Template",
      "Are you sure you want to delete this template? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await templateService.deleteTemplate(template.id);
              haptics.success();
              onDataChange();
            } catch (error) {
              haptics.error();
              console.error(error);
              Alert.alert("Error", "Failed to delete template");
            }
          },
        },
      ],
    );
  };

  const handleTemplatePress = async (template: WorkoutTemplate) => {
    haptics.light();
    router.push({
      pathname: "/new-template",
      params: { templateId: template.id },
    });
  };

  const handleNewWorkout = async () => {
    haptics.medium();
    router.push("/new-workout");
  };

  const handleContinueWorkout = async () => {
    haptics.light();
    router.push("/workout-in-progress");
  };

  const handleNewTemplate = async () => {
    haptics.light();
    router.push("/new-template");
  };

  const renderTemplate = (template: WorkoutTemplate) => (
    <Card
      mode="outlined"
      style={{ marginBottom: 12 }}
      onPress={() => handleTemplatePress(template)}
    >
      <Card.Title
        title={template.name}
        subtitle={`${template.exercises.length} exercises`}
        right={(props) => (
          <IconButton
            {...props}
            icon="trash-can-outline"
            iconColor={theme.colors.error}
            onPress={() => handleDeleteTemplate(template)}
          />
        )}
      />
    </Card>
  );

  return (
    <Surface style={{ flex: 1 }}>
      <List.Section style={{ padding: 16, flex: 1 }}>
        {activeWorkout && (
          <Card mode="outlined" style={{ marginBottom: 16 }}>
            <Card.Title
              title="Active Workout"
              subtitle={`${activeWorkout.exercises.length} exercises in progress`}
              titleVariant="titleLarge"
            />
            <Card.Actions style={{ justifyContent: "flex-end", gap: 8 }}>
              <Button
                mode="contained"
                onPress={handleContinueWorkout}
                style={{ flex: 2 }}
              >
                Continue Workout
              </Button>
              <Button
                mode="outlined"
                textColor={theme.colors.error}
                onPress={handleCancelWorkout}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
            </Card.Actions>
          </Card>
        )}

        <List.Subheader
          style={{ fontSize: 20, fontWeight: "bold", paddingHorizontal: 0 }}
        >
          Your Templates
        </List.Subheader>

        {templates &&
          templates.map((template) => (
            <React.Fragment key={template.id}>
              {renderTemplate(template)}
            </React.Fragment>
          ))}

        {templates && templates.length === 0 && (
          <Text
            variant="bodyLarge"
            style={{
              textAlign: "center",
              marginTop: 24,
              opacity: 0.7,
            }}
          >
            No templates yet. Create one to get started!
          </Text>
        )}

        <Button
          mode="outlined"
          icon="plus"
          onPress={handleNewTemplate}
          style={{ marginTop: 16 }}
        >
          Create New Template
        </Button>
      </List.Section>

      <FAB
        icon="plus"
        label="New Workout"
        style={{
          position: "absolute",
          marginRight: 16,
          right: 0,
          bottom: FAB_BOTTOM,
        }}
        onPress={handleNewWorkout}
      />
    </Surface>
  );
}
