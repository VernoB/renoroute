import { Text, View } from 'react-native';

const marks = {
  lock: '🔒',
  shield: '🛡️',
  handshake: '🤝',
} as const;

/** Trust-card marks. Not third-party logos. */
export function TrustMark({ name }: { name: keyof typeof marks }) {
  return (
    <View
      accessibilityElementsHidden
      className="h-6 w-6 items-center justify-center"
      importantForAccessibility="no-hide-descendants"
      testID={`auth-trust-icon-${name}`}
    >
      <Text className="text-body">{marks[name]}</Text>
    </View>
  );
}
