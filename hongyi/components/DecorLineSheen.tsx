import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Ellipse } from 'react-native-svg';

// ============================================================
// 装饰线 + 光泽扫过动画
// 用 Reanimated + expo-linear-gradient 原生实现，替代 WebView
// ============================================================

// --- 线条尺寸 ---
const LINE_W = 120;          // 线条可见宽度
const LINE_H = 5;            // 线条高度（纤细）
const LINE_R = LINE_H / 2;   // 圆角半径

// --- bloom 区域 ---
const BLOOM_H = 32;          // bloom 垂直高度（模拟 feGaussianBlur stdDeviation=14）
const BLOOM_EXTRA_W = 6;     // bloom 水平方向额外宽度（缩小，减少超出线条后的矩形块宽度）

// --- 光泽带尺寸（渐变本体） ---
const SHEEN_W = LINE_W * 0.45;   // 光泽带宽度（约线条45%）

// --- 颜色 ---
const LINE_COLOR = '#4B1118';     // 酒红色（同 SVG）

// 钟形白色渐变 stops — 还原 SVG 的 bell-curve 不透明度
// SVG 原始: 0→0→0.10→0.25→0.65→1.00→0.65→0.25→0.10→0→0
const SHEEN_COLORS = [
  'rgba(255,255,255,0)',
  'rgba(255,214,214,0)',
  'rgba(255,255,255,0.10)',
  'rgba(255,255,255,0.25)',
  'rgba(255,255,255,0.65)',
  'rgba(255,255,255,1.0)',
  'rgba(255,255,255,0.65)',
  'rgba(255,255,255,0.25)',
  'rgba(255,255,255,0.10)',
  'rgba(255,214,214,0)',
  'rgba(255,255,255,0)',
] as const;

const SHEEN_LOCATIONS = [
  0, 0.22, 0.32, 0.38, 0.42, 0.50, 0.58, 0.62, 0.68, 0.78, 1,
] as const;


export default function DecorLineSheen() {
  // 光泽扫过动画：从左侧完全移出到右侧完全移出
  const translateX = useSharedValue(-SHEEN_W - BLOOM_EXTRA_W);

  useEffect(() => {
    // 扫到右侧后立刻瞬间复位，不等待，避免 bloom 停留在线条右侧可见
    translateX.value = withRepeat(
      withSequence(
        withTiming(LINE_W + BLOOM_EXTRA_W, {
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(-SHEEN_W - BLOOM_EXTRA_W, { duration: 0 }),
      ),
      -1,
    );
  }, []);

  // 高光层（裁切在线条内）
  const sheenStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // bloom 层（不裁切，跟随高光移动）
  const bloomStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.outerContainer}>
      {/* Layer 0: bloom 光溢出（SVG 椭圆，四个方向均渐变消失，无矩形硬边） */}
      <Animated.View style={[styles.bloomLayer, bloomStyle]}>
        <Svg width={SHEEN_W + BLOOM_EXTRA_W * 2} height={BLOOM_H}>
          <Defs>
            <SvgRadialGradient id="bloomGlow" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%"  stopColor="rgb(255,255,255)" stopOpacity="0.35" />
              <Stop offset="45%" stopColor="rgb(255,245,240)" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="rgb(255,255,255)" stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>
          <Ellipse
            cx={(SHEEN_W + BLOOM_EXTRA_W * 2) / 2}
            cy={BLOOM_H / 2}
            rx={(SHEEN_W + BLOOM_EXTRA_W * 2) / 2}
            ry={BLOOM_H / 2}
            fill="url(#bloomGlow)"
          />
        </Svg>
      </Animated.View>

      {/* Layer 1: 酒红底线 + 柔和发光 */}
      <View style={styles.lineBase} />

      {/* Layer 2: 高光扫过（裁切在线条形状内） */}
      <View style={styles.sheenClip}>
        <Animated.View style={[styles.sheenBand, sheenStyle]}>
          <LinearGradient
            colors={[...SHEEN_COLORS]}
            locations={[...SHEEN_LOCATIONS]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.sheenGradient}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    width: LINE_W,
    height: BLOOM_H,
    marginTop: 14,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },

  // --- 底线 ---
  lineBase: {
    width: LINE_W,
    height: LINE_H,
    borderRadius: LINE_R,
    backgroundColor: LINE_COLOR,
    // 模拟 softGlowStrong: 酒红色柔和阴影
    shadowColor: LINE_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 7,
    elevation: 4,
  },

  // --- 高光裁切容器（与线条完全重叠） ---
  sheenClip: {
    position: 'absolute',
    width: LINE_W,
    height: LINE_H,
    borderRadius: LINE_R,
    overflow: 'hidden',
  },

  // --- 高光带 ---
  sheenBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SHEEN_W,
    height: LINE_H,
  },
  sheenGradient: {
    width: '100%',
    height: '100%',
  },

  // --- bloom 光溢出层（left 偏移使椭圆中心对齐高光峰值） ---
  bloomLayer: {
    position: 'absolute',
    width: SHEEN_W + BLOOM_EXTRA_W * 2,
    height: BLOOM_H,
    left: -BLOOM_EXTRA_W,
    opacity: 0.8,
  },
});
