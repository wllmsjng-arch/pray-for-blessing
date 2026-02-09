import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Envelope } from '../hooks/useBlessingStore';
import { FU_THEMES } from '../data/fuThemes';
import { COLORS } from '../constants/colors';

interface Props {
  envelope: Envelope;
}

export default function ViewingState({ envelope }: Props) {
  // 通过 fuId 查找符主题，获取图片
  const fuTheme = FU_THEMES.find((t) => t.id === envelope.fuId);

  // 光晕缓呼吸动画（回看态：只做 scale，不做 opacity 闪烁）
  const glowScale = useSharedValue(1);

  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.0, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, []);

  const glowPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  // 日期格式 YYYY/M/D（不补零，如 2026/2/2）
  const [y, m, d] = envelope.createdAt.split('-');
  const displayDate = `${y}/${parseInt(m)}/${parseInt(d)}`;

  return (
    <View style={styles.container}>
      {/* 主内容居中 */}
      <View style={styles.center}>
        {/* 符图片：静态展示，带光晕 */}
        <View style={styles.fuWrapper}>
          {/* 装饰光晕层：PNG图片 + 缓呼吸动画 */}
          <View style={styles.glowContainer}>
            <Animated.Image
              source={require('../assets/ember-glow.png')}
              style={[styles.glowImage, glowPulseStyle]}
              resizeMode="cover"
            />
          </View>
          {fuTheme && (
            <Image
              source={fuTheme.image as any}
              style={styles.fuImage}
              resizeMode="contain"
            />
          )}
        </View>
        {/* 祝福句：带装饰线 */}
        <View style={styles.blessingRow}>
          <View style={styles.decorLine} />
          <Text style={styles.blessingText}>{envelope.blessingText}</Text>
          <View style={styles.decorLine} />
        </View>
      </View>

      {/* 日期：页面下方，温灰色小字 */}
      <Text style={styles.date}>{displayDate}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fuWrapper: {
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowContainer: {
    position: 'absolute',
    width: 260,
    height: 260,
    overflow: 'hidden',
    borderRadius: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowImage: {
    width: 260,
    height: 260,
    opacity: 0.6,
  },
  fuImage: {
    width: 220,
    height: 220,
  },
  blessingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
  },
  decorLine: {
    width: 20,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(201,169,110,0.2)',
    marginHorizontal: 12,
  },
  blessingText: {
    fontSize: 17,
    color: COLORS.blessing,
    fontWeight: '400',
    letterSpacing: 2,
  },
  date: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '400',
    marginBottom: 40,
  },
});
