import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/theme/tokens';

const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** Soft shapes shared with the welcome screen. Hidden from assistive tech. */
export function AuthBackdrop() {
  const reduceMotion = useReducedMotion();
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = reduceMotion
      ? 0
      : withRepeat(withTiming(1, { duration: 8000, easing: ease }), -1, true);
  }, [drift, reduceMotion]);

  const back = useAnimatedStyle(() => ({
    transform: [{ translateX: reduceMotion ? 0 : drift.value * 12 }],
  }));
  const mid = useAnimatedStyle(() => ({
    transform: [{ translateX: reduceMotion ? 0 : -drift.value * 8 }],
  }));

  return (
    <View
      accessibilityElementsHidden
      className="h-24 overflow-hidden rounded-xl bg-primary-50"
      importantForAccessibility="no-hide-descendants"
      style={styles.banner}
      testID={reduceMotion ? 'auth-motion-reduced' : 'auth-motion-full'}
    >
      <Animated.View style={[styles.mint, back]} />
      <Animated.View style={[styles.sand, mid]} />
      <Animated.View style={styles.forest} />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 96,
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: colors.primary[50],
  },
  mint: {
    position: 'absolute',
    left: -16,
    top: 16,
    height: 64,
    width: 64,
    borderRadius: 9999,
    backgroundColor: colors.mint[200],
  },
  sand: {
    position: 'absolute',
    right: 24,
    top: 12,
    height: 48,
    width: 48,
    borderRadius: 16,
    backgroundColor: colors.accent[100],
  },
  forest: {
    position: 'absolute',
    bottom: 8,
    left: 64,
    height: 40,
    width: 64,
    borderRadius: 16,
    backgroundColor: colors.primary[700],
  },
});
