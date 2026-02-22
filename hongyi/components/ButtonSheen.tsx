import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

// ============================================================
// 按钮斜向光泽扫过
// 放在按钮 LinearGradient 内部，由按钮自身的 overflow:hidden +
// borderRadius:16 负责裁切，无矩形硬边
// ============================================================

// 与 ButtonState 按钮保持一致的参考宽度（仅用于动画起止范围）
const BUTTON_W = 160;
const SHEEN_W = 72;       // 光泽带宽度（平行四边形宽度）
const SKEW_X = '-30deg';  // 切变角度（替代 rotate，四角被圆角容器干净裁切）

// 钟形白色渐变 stops（还原 bell-curve 不透明度曲线）
const SHEEN_COLORS = [
  'rgba(255,255,255,0)',
  'rgba(255,255,255,0.08)',
  'rgba(255,255,255,0.40)',
  'rgba(255,255,255,0.65)',
  'rgba(255,255,255,0.40)',
  'rgba(255,255,255,0.08)',
  'rgba(255,255,255,0)',
] as const;

const SHEEN_LOCATIONS = [0, 0.20, 0.38, 0.50, 0.62, 0.80, 1] as const;

export default function ButtonSheen() {
  // 起始位置：完全在按钮左侧外（不可见）
  const translateX = useSharedValue(-(SHEEN_W + 50));

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        // 等待 2500ms（光泽带在左侧外，按钮裁切，完全不可见）
        withDelay(
          2500,
          withTiming(BUTTON_W + SHEEN_W + 50, {
            duration: 3500,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
        ),
        // 瞬间复位，无残影
        withTiming(-(SHEEN_W + 50), { duration: 0 }),
      ),
      -1,
    );
  }, []);

  const sheenStyle = useAnimatedStyle(() => ({
    // skewX 将矩形变成平行四边形，translateX 负责水平移动
    // 两者均作用于同一 Animated.View，父容器 overflow:hidden 干净裁切四角
    transform: [{ skewX: SKEW_X }, { translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.sheenBand, sheenStyle]} pointerEvents="none">
      <LinearGradient
        colors={[...SHEEN_COLORS]}
        locations={[...SHEEN_LOCATIONS]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheenBand: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SHEEN_W,
  },
});
