import SplashScreen from '@/components/SplashScreen';
import { useColorScheme } from '@/hooks/useColorScheme';
import { darkTheme, lightTheme } from '@/theme/paperTheme';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged, User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { auth } from '../firebase/firebaseConfig';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!showSplash) {
      if (user === null) {
        router.replace('/login');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [user, showSplash]);

  if (!loaded) return null;

  const paperTheme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PaperProvider theme={paperTheme}>
        <SafeAreaProvider>
          {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

          {!showSplash && (
            <>
              <Stack>
                <Stack.Screen
                  name="login/index"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="login/register"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" hidden />
            </>
          )}
        </SafeAreaProvider>
      </PaperProvider>
    </ThemeProvider>
  );
}
