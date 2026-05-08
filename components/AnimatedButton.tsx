import { Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  className?: string;
  disabled?: boolean;
}

export function AnimatedButton({ title, onPress, className = '', disabled }: AnimatedButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        className={`rounded-lg p-4 items-center ${className}`}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.95); }}
        onPressOut={() => { scale.value = withSpring(1); }}
      >
        <Text className="text-white font-bold text-base">{title}</Text>
      </Pressable>
    </Animated.View>
  );
}
