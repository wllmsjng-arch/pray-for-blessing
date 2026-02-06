import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';

interface Props {
  animated: boolean;
}

export default function SuccessState({ animated }: Props) {
  // animated=true（从 descend 转场进入）：播放淡入
  // animated=false（冷启动恢复）：直接呈现
  const sealOpacity = useSharedValue(animated ? 0 : 1);
  const sealScale = useSharedValue(animated ? 0.8 : 1);
  const titleOpacity = useSharedValue(animated ? 0 : 1);
  const subtitleOpacity = useSharedValue(animated ? 0 : 1);
  const timestampOpacity = useSharedValue(animated ? 0 : 1);

  useEffect(() => {
    if (animated) {
      // 朱印：比标题早 200ms，opacity 0→1 + scale 0.8→1, 500ms, easeOut
      sealOpacity.value = withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.quad),
      });
      sealScale.value = withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.quad),
      });
      // 朱印出现时触发轻震动
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 100);

      // 「红意已入封」淡入 600ms，delay 200ms
      titleOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
      // +300ms 后「今日已祈福」淡入 600ms
      subtitleOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
      // 时间戳最后淡入
      timestampOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    }
  }, []);

  const sealStyle = useAnimatedStyle(() => ({
    opacity: sealOpacity.value,
    transform: [{ scale: sealScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const timestampStyle = useAnimatedStyle(() => ({
    opacity: timestampOpacity.value,
  }));

  // 获取当前时间 HH:MM
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const timestamp = `${hours}:${minutes}`;

  return (
    <View style={styles.container}>
      {/* 朱印装饰 */}
      <Animated.View style={[styles.seal, sealStyle]}>
        <Text style={styles.sealText}>福</Text>
      </Animated.View>

      <Animated.Text style={[styles.title, titleStyle]}>
        红意已入封
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, subtitleStyle]}>
        今日已祈福
      </Animated.Text>

      {/* 时间戳 */}
      <Animated.Text style={[styles.timestamp, timestampStyle]}>
        {timestamp}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  seal: {
    width: 64,
    height: 64,
    borderWidth: 2,
    borderColor: 'rgba(139,45,0,0.18)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    transform: [{ rotate: '-3deg' }],
  },
  sealText: {
    fontSize: 28,
    fontWeight: '300',
    color: 'rgba(139,45,0,0.22)',
  },
  title: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: '300',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 16,
    fontWeight: '400',
  },
  timestamp: {
    fontSize: 11,
    color: 'rgba(158,145,138,0.4)',
    marginTop: 40,
  },
});
