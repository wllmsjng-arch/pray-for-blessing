import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../constants/colors';

const GRID_SPACING = 40;

export default function GridBackground() {
  const { width, height } = Dimensions.get('window');
  const verticalCount = Math.ceil(width / GRID_SPACING);
  const horizontalCount = Math.ceil(height / GRID_SPACING);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: verticalCount }, (_, i) => (
        <View
          key={`v${i}`}
          style={[
            styles.line,
            {
              left: i * GRID_SPACING,
              top: 0,
              width: StyleSheet.hairlineWidth,
              height: '100%',
            },
          ]}
        />
      ))}
      {Array.from({ length: horizontalCount }, (_, i) => (
        <View
          key={`h${i}`}
          style={[
            styles.line,
            {
              top: i * GRID_SPACING,
              left: 0,
              height: StyleSheet.hairlineWidth,
              width: '100%',
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    backgroundColor: COLORS.grid,
  },
});
