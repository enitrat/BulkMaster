import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { DefaultTheme, PaperProvider, useTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorView } from "@/components/common/ErrorView";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const { colors } = useTheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorView}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style={colors.background === "light" ? "light" : "dark"} />
          <PaperProvider theme={DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="meal/[id]" options={{ headerShown: false }} />
              <Stack.Screen
                name="workout-in-progress"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="new-template"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="new-workout"
                options={{ headerShown: false }}
              />
            </Stack>
          </PaperProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
