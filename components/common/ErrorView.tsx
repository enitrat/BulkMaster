import { Surface, Text, Button } from "react-native-paper";

interface ErrorViewProps {
  error: Error | null;
  onRetry?: () => void;
}

export const ErrorView = ({ error, onRetry }: ErrorViewProps) => (
  <Surface
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
    }}
  >
    <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
      Oops!
    </Text>
    <Text
      variant="bodyMedium"
      style={{ textAlign: "center", marginBottom: 16, opacity: 0.7 }}
    >
      {error?.message || "Something went wrong"}
    </Text>
    {onRetry && (
      <Button mode="contained" onPress={onRetry}>
        Try Again
      </Button>
    )}
  </Surface>
);
