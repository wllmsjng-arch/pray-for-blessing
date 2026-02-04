import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';

interface Props {
  animated: boolean;
}

export default function SuccessState({ animated }: Props) {
  // animated=true（从 descend 转场进入）：播放淡入
  // animated=false（冷启动恢复）：直接呈现
  const titleOpacity = useSharedValue(animated ? 0 : 1);
  const subtitleOpacity = useSharedValue(animated ? 0 : 1);

  useEffect(() => {
    if (animated) {
      // 「红意已入封」淡入 600ms
      titleOpacity.value = withTiming(1, { duration: 600 });
      // +300ms 后「今日已祈福」淡入 600ms
      subtitleOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    }
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.title, titleStyle]}>
        红意已入封
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, subtitleStyle]}>
        今日已祈福
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    color: COLORS.primary,
    fontWeight: '400',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 12,
    fontWeight: '400',
  },
});
