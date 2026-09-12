import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fonts, radii } from '../theme';
import { RootStackParamList } from '../navigation/types';

export function HeaderManageButton() {
  const navigation = useNavigation();
  const handlePress = () => {
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('ManageHome');
  };
  return (
    <Pressable onPress={handlePress} hitSlop={12}>
      <Ionicons name="settings-outline" size={22} color={colors.text} />
    </Pressable>
  );
}

export function HeaderCloseButton() {
  const navigation = useNavigation();
  return (
    <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.pill}>
      <Text style={styles.pillText}>Fechar</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pillText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.text,
  },
});
