import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';

// ============================================================
// 按钮外发光（呼吸光晕）
// 职责：仅负责按钮外围的呼吸发光效果，overflow:visible 向外扩散
// 光泽扫过已迁移至 ButtonSheen（放在按钮内部）
// ============================================================

// --- 尺寸 ---
const BUTTON_W = 160;
const BUTTON_H = 56;
const EXPAND = 30;                       // 光晕可见扩展范围
const BLEED = 40;                        // 额外溢出量——让渐变在椭圆边界之前归零
const GLOW_W = BUTTON_W + EXPAND * 2;
const GLOW_H = BUTTON_H + EXPAND * 2;
const SVG_W = GLOW_W + BLEED * 2;
const SVG_H = GLOW_H + BLEED * 2;

// 渐变在椭圆半径的 60% 处归零，60%~100% 是完全透明的缓冲带
const FADE_END = 0.6;

// --- 颜色 ---
const GLOW_COLOR = 'rgb(139,58,58)';

export default function ButtonGlow() {
  const breathOpacity = useSharedValue(0.4);

  React.useEffect(() => {
    breathOpacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.4,  { duration: 1000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, []);

  const breathStyle = useAnimatedStyle(() => ({
    opacity: breathOpacity.value,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {/* 呼吸光晕：超大 SVG 椭圆 + 径向渐变提前归零，四方向无硬边 */}
      <Animated.View style={[styles.glowLayer, breathStyle]}>
        <Svg width={SVG_W} height={SVG_H}>
          <Defs>
            <RadialGradient id="breathGlow" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%"                    stopColor={GLOW_COLOR} stopOpacity="0.4" />
              <Stop offset="20%"                   stopColor={GLOW_COLOR} stopOpacity="0.25" />
              <Stop offset="40%"                   stopColor={GLOW_COLOR} stopOpacity="0.12" />
              <Stop offset={`${FADE_END * 100}%`}  stopColor={GLOW_COLOR} stopOpacity="0" />
              <Stop offset="100%"                  stopColor={GLOW_COLOR} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Ellipse
            cx={SVG_W / 2}
            cy={SVG_H / 2}
            rx={SVG_W / 2}
            ry={SVG_H / 2}
            fill="url(#breathGlow)"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: GLOW_W,
    height: GLOW_H,
    left: -EXPAND,
    top: -EXPAND,
  },
  glowLayer: {
    position: 'absolute',
    left: -BLEED,
    top: -BLEED,
    width: SVG_W,
    height: SVG_H,
  },
});
