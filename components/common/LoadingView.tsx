import { ActivityIndicator } from "react-native-paper";
import { Surface } from "react-native-paper";

export const LoadingView = () => (
  <Surface style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" />
  </Surface>
);
