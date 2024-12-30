import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';

export default function NotFoundScreen() {
  const theme = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Surface style={styles.container}>
        <Text variant="headlineMedium">This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
            Go to home screen!
          </Text>
        </Link>
      </Surface>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
