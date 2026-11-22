import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

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
      testID={reduceMotion ? 'auth-motion-reduced' : 'auth-motion-full'}
    >
      <Animated.View
        className="absolute -left-4 top-4 h-16 w-16 rounded-full bg-mint-200"
        style={back}
      />
      <Animated.View
        className="absolute right-6 top-3 h-12 w-12 rounded-2xl bg-accent-100"
        style={mid}
      />
      <Animated.View className="absolute bottom-2 left-16 h-10 w-16 rounded-2xl bg-primary-700" />
    </View>
  );
}
