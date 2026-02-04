import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

// 占位组件，Task 5（Step 7）完整实现
export default function ButtonState() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>请红意（占位）</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
});
