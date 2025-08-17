
import splashLottie from '@/assets/lottie/splash.json';
import * as ExpoSplashScreen from 'expo-splash-screen';
import LottieView from 'lottie-react-native';
import { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const animation = useRef<LottieView>(null);
  const theme = useTheme();
  const duration = 1.5 * 1000

  useEffect(() => {
    ExpoSplashScreen.preventAutoHideAsync();
    // Play animation and hide splash after finish
    const timer = setTimeout(() => {
      ExpoSplashScreen.hideAsync();
      onFinish();
    }, duration);
    return () => clearTimeout(timer);
  }, [onFinish, duration]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LottieView
        ref={animation}
        source={splashLottie}
        autoPlay
        loop={false}
        style={styles.lottie}
        duration={duration}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: '#E0E8F8', // match your theme
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  lottie: {
    width: 220,
    height: 220,
  },
});
