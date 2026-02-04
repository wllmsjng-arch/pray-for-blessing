import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Envelope } from '../hooks/useBlessingStore';
import { COLORS } from '../constants/colors';

// 占位组件，Task 6（Step 11）完整实现
interface Props {
  envelope: Envelope;
}

export default function ViewingState({ envelope }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>回看态（占位）</Text>
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
