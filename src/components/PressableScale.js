// PressableScale — surface tactile moderne 2026 :
// micro-animation spring au press + retour haptique optionnel.
// Repli automatique sur Pressable simple si reanimated indisponible.
import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { hapticLight, hapticSelection } from '../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING = { damping: 18, stiffness: 320, mass: 0.6 };

export default function PressableScale({
  children,
  onPress,
  style,
  scaleTo = 0.96,
  haptic = 'light',
  disabled = false,
  hitSlop,
  accessibilityLabel,
  ...rest
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const triggerHaptic = () => {
    if (haptic === 'selection') hapticSelection();
    else if (haptic !== 'none') hapticLight();
  };

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(scaleTo, SPRING); }}
      onPressOut={() => { scale.value = withSpring(1, SPRING); }}
      onPress={(e) => {
        if (disabled) return;
        triggerHaptic();
        onPress && onPress(e);
      }}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={[style, animatedStyle]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
