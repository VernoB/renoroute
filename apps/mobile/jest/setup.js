jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  const easing = {
    duration: () => easing,
    delay: () => easing,
    easing: () => easing,
  };
  return {
    __esModule: true,
    default: { View, createAnimatedComponent: (component) => component },
    Easing: { bezier: () => (value) => value, out: (value) => value, cubic: {} },
    FadeIn: easing,
    FadeInDown: easing,
    FadeOut: easing,
    FadeOutUp: easing,
    interpolate: (_value, _input, output) => output[1] ?? 0,
    runOnJS: (fn) => fn,
    useAnimatedStyle: () => ({}),
    useReducedMotion: () => false,
    useSharedValue: (value) => ({ value }),
    withSpring: (value) => value,
    withTiming: (value) => value,
  };
});

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(async () => undefined),
  impactAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'fr', languageTag: 'fr-CA' }],
}));

jest.mock('posthog-react-native', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    capture: jest.fn(),
  })),
  PostHogProvider: ({ children }) => children,
}));

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  wrap: (component) => component,
}));

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();
  return {
    getItem: jest.fn(async (key) => (store.has(key) ? store.get(key) : null)),
    setItem: jest.fn(async (key, value) => {
      store.set(key, value);
    }),
    clear: jest.fn(async () => {
      store.clear();
    }),
  };
});
