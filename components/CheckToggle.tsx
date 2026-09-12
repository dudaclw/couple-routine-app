import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii } from '../theme';

export function CheckToggle({
  checked,
  onToggle,
  size = 26,
}: {
  checked: boolean;
  onToggle: () => void;
  size?: number;
}) {
  const scale = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: checked ? 1 : 0,
      useNativeDriver: true,
      friction: 5,
      tension: 140,
    }).start();
  }, [checked, scale]);

  return (
    <Pressable
      onPress={onToggle}
      hitSlop={10}
      style={[
        styles.box,
        { width: size, height: size, borderRadius: radii.sm - 4 },
        checked && styles.boxChecked,
      ]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name="checkmark" size={size * 0.6} color="#FFFFFF" />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
});
