import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 占位页面，Task 6（Step 11）完整实现
export default function EnvelopePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>红意信封（占位）</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F4F0',
  },
  text: {
    fontSize: 16,
    color: '#9E918A',
  },
});
