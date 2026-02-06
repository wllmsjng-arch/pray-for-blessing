import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useBlessingStore } from '../hooks/useBlessingStore';
import { COLORS } from '../constants/colors';
import FuImage from './FuImage';

export default function DescendState() {
  const currentBlessing = useBlessingStore((s) => s.currentBlessing);
  const saveBlessing = useBlessingStore((s) => s.saveBlessing);
  const [saving, setSaving] = useState(false);

  // Phase 1: 凝现动画（符图片 opacity + scale）
  const fuOpacity = useSharedValue(0);
  const fuScale = useSharedValue(0.92);

  // 光晕动画（比符图凝现慢 300ms）
  const glowOpacity = useSharedValue(0);

  // Phase 2: 祝福句淡入（+2000ms）
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(8);

  // Phase 3:「收下祝福」按钮显现（+2400ms）
  const buttonOpacity = useSharedValue(0);

  // Phase 4: 收纳化散动画（点击后触发）
  const containerOpacity = useSharedValue(1);
  const containerScale = useSharedValue(1);

  useEffect(() => {
    // 挂载瞬间触发轻震动
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Phase 1: 符凝现 — opacity 0→1, scale 0.92→1, 1200ms, easeOut
    fuOpacity.value = withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.quad),
    });
    fuScale.value = withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.quad),
    });

    // 光晕：比符图凝现慢 300ms，1500ms, easeOut
    glowOpacity.value = withDelay(
      300,
      withTiming(1, {
        duration: 1500,
        easing: Easing.out(Easing.quad),
      })
    );

    // Phase 2: 祝福句 — 符落定 800ms 后淡入，opacity 0→1 + translateY 8→0, 800ms
    textOpacity.value = withDelay(2000, withTiming(1, { duration: 800 }));
    textTranslateY.value = withDelay(2000, withTiming(0, { duration: 800 }));

    // Phase 3: 按钮 — 祝福句出现 400ms 后显现，opacity 0→1, 600ms
    buttonOpacity.value = withDelay(2400, withTiming(1, { duration: 600 }));
  }, []);

  const onCollectionComplete = () => {
    useBlessingStore.setState({ homeState: 'success', isFromDescend: true });
  };

  const handleSave = () => {
    if (saving) return;
    setSaving(true);

    // 立即执行数据持久化（不等动画）
    saveBlessing();

    // 收纳化散动画 — opacity 1→0, scale 1→0.85, 1000ms, easeIn
    containerOpacity.value = withTiming(0, {
      duration: 1000,
      easing: Easing.in(Easing.quad),
    });
    containerScale.value = withTiming(
      0.85,
      {
        duration: 1000,
        easing: Easing.in(Easing.quad),
      },
      (finished) => {
        if (finished) {
          runOnJS(onCollectionComplete)();
        }
      },
    );
  };

  // 符凝现动画样式
  const fuAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fuOpacity.value,
    transform: [{ scale: fuScale.value }],
  }));

  // 光晕动画样式
  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // 祝福句淡入样式
  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  // 按钮显现样式
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  // 收纳化散容器样式
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  if (!currentBlessing) return null;

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* 符图片：凝现 + 光晕 */}
      <View style={styles.fuWrapper}>
        {/* 光晕层 */}
        <Animated.View style={[styles.glow, glowAnimatedStyle]} />
        {/* 符图片 */}
        <Animated.View style={fuAnimatedStyle}>
          <FuImage theme={currentBlessing.fuTheme} />
        </Animated.View>
      </View>

      {/* 祝福句（带装饰线） */}
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <View style={styles.blessingRow}>
          <View style={styles.decorLine} />
          <Text style={styles.blessingText}>{currentBlessing.blessingText}</Text>
          <View style={styles.decorLine} />
        </View>
      </Animated.View>

      {/* 「收下祝福」按钮 */}
      <Animated.View style={[styles.buttonWrapper, buttonAnimatedStyle]}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 24, right: 24 }}
        >
          <Text style={styles.buttonText}>收下祝福</Text>
          <View style={styles.buttonUnderline} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fuWrapper: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(139,58,58,0.05)',
  },
  textContainer: {
    marginTop: 32,
  },
  blessingRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  buttonWrapper: {
    marginTop: 48,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    color: COLORS.accent,
    fontWeight: '400',
    letterSpacing: 2,
  },
  buttonUnderline: {
    width: 60,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(166,124,91,0.3)',
    marginTop: 4,
    alignSelf: 'center',
  },
});
