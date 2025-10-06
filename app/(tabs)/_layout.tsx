import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const TABBAR_BASE_HEIGHT = 60;
  const TABBAR_FLOAT_OFFSET = 10;
  const RESERVED_SPACE =
    TABBAR_BASE_HEIGHT + insets.bottom + TABBAR_FLOAT_OFFSET;

  return (
    <Tabs
      sceneContainerStyle={{
        backgroundColor: theme.colors.background,
        paddingBottom: RESERVED_SPACE,
      }}
      screenOptions={{
        sceneStyle: { backgroundColor: theme.colors.background },
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          paddingTop: 3,
          paddingBottom: 6,
          marginLeft: 16,
          marginRight: 16,
          position: 'absolute',
          bottom: insets.bottom + TABBAR_FLOAT_OFFSET,
          borderRadius: 18,
          backgroundColor: theme.colors.surface,
          elevation: 8,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          borderWidth: 1,
          borderColor: theme.colors.background,
          height: TABBAR_BASE_HEIGHT,
        },
        animation: 'shift',
        transitionSpec: { animation: 'timing', config: { duration: 250 } },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transações',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="list.bullet.rectangle.portrait"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transaction-form"
        options={{
          title: 'Adicionar',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chevron.right" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Análises',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
