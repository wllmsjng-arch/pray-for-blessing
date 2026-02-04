import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

// 占位组件，Task 5（Step 10）完整实现
interface Props {
  animated: boolean;
}

export default function SuccessState({ animated }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>红意已入封（占位）</Text>
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
