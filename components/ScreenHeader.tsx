import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

export function ScreenHeader({
  label,
  title,
  rightSlot,
  showBlob = false,
}: {
  label: string;
  title: string;
  rightSlot?: React.ReactNode;
  showBlob?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      {showBlob && <View style={styles.blob} pointerEvents="none" />}
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        {rightSlot}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  blob: {
    position: 'absolute',
    top: -60,
    left: -40,
    width: 240,
    height: 180,
    backgroundColor: colors.primary,
    opacity: 0.1,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 70,
    borderBottomRightRadius: 120,
    borderBottomLeftRadius: 80,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 2,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.text,
  },
});
