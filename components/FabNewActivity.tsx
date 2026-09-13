import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fonts, radii } from '../theme';
import { RootStackParamList } from '../navigation/types';

export function FabNewActivity() {
  const navigation = useNavigation();
  const [open, setOpen] = useState(false);

  const goTo = (screen: 'RoutineForm' | 'CommitmentForm') => {
    setOpen(false);
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate(screen, {});
  };

  return (
    <>
      <Pressable
        style={styles.fab}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Adicionar nova atividade"
        hitSlop={8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Nova atividade</Text>
            <Pressable style={styles.option} onPress={() => goTo('RoutineForm')}>
              <Ionicons name="pulse-outline" size={20} color={colors.text} />
              <Text style={styles.optionText}>Novo exercício</Text>
            </Pressable>
            <Pressable style={styles.option} onPress={() => goTo('CommitmentForm')}>
              <Ionicons name="checkbox-outline" size={20} color={colors.text} />
              <Text style={styles.optionText}>Nova tarefa</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const FAB_SIZE = 56;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(58,53,55,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: 20,
    paddingBottom: 32,
    gap: 4,
  },
  sheetTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.text,
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  optionText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
  },
});
