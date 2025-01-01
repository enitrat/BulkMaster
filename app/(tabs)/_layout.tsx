import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useTheme, BottomNavigation } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BOTTOM_NAV_HEIGHT } from '@/types';

export const unstable_settings = {
  initialRouteName: 'today',
};

export default function TabLayout() {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const insets = useSafeAreaInsets();

  const routes = [
    { key: 'today', title: 'Today', focusedIcon: 'calendar-today', unfocusedIcon: 'calendar-today' },
    { key: 'workouts', title: 'Workouts', focusedIcon: 'dumbbell', unfocusedIcon: 'dumbbell' },
    { key: 'nutrition', title: 'Nutrition', focusedIcon: 'food-apple', unfocusedIcon: 'food-apple' },
    { key: 'history', title: 'History', focusedIcon: 'history', unfocusedIcon: 'history' },
    { key: 'settings', title: 'Settings', focusedIcon: 'cog', unfocusedIcon: 'cog' },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={{
          flex: 1,
          paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom
        }}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: { display: 'none' },
            }}
            initialRouteName="today"
          >
            <Tabs.Screen name="today" options={{ href: null }} />
            <Tabs.Screen name="workouts" options={{ href: null }} />
            <Tabs.Screen name="nutrition" options={{ href: null }} />
            <Tabs.Screen name="history" options={{ href: null }} />
            <Tabs.Screen name="settings" options={{ href: null }} />
          </Tabs>
        </View>

        <View style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.background,
        }}>
          <BottomNavigation
            navigationState={{ index, routes }}
            onIndexChange={index => {
              setIndex(index);
              router.push(`/(tabs)/${routes[index].key}` as any);
            }}
            renderScene={() => null}
            labeled={true}
            compact={true}
            activeColor={colors.primary}
            barStyle={{
              height: BOTTOM_NAV_HEIGHT,
              backgroundColor: colors.elevation.level2,
              borderTopWidth: 1,
              borderTopColor: colors.surfaceVariant,
              paddingBottom: insets.bottom,
            }}
            activeIndicatorStyle={{
              backgroundColor: colors.primaryContainer,
              height: 32,
              marginVertical: 4,
            }}
            theme={{
              colors: {
                secondaryContainer: 'transparent',
              },
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
