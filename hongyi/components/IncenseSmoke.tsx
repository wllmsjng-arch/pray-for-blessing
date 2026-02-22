import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  EasingFunctionFactory,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Path } from 'react-native-svg';

// --- 画布尺寸 ---
const CANVAS_W = 50;
const CANVAS_H = 90;

// --- 烟道路径定义 ---
// 左烟道：轻微 S 形
const LEFT_PATH = 'M 20 85 C 12 65, 28 45, 17 5';
// 右烟道：反 S 形
const RIGHT_PATH = 'M 30 85 C 38 60, 22 40, 33 5';

// --- 贝塞尔控制点（用于粒子位置计算） ---
interface BezierCurve {
  p0: { x: number; y: number };
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  p3: { x: number; y: number };
}

const LEFT_CURVE: BezierCurve = {
  p0: { x: 20, y: 85 },
  p1: { x: 12, y: 65 },
  p2: { x: 28, y: 45 },
  p3: { x: 17, y: 5 },
};

const RIGHT_CURVE: BezierCurve = {
  p0: { x: 30, y: 85 },
  p1: { x: 38, y: 60 },
  p2: { x: 22, y: 40 },
  p3: { x: 33, y: 5 },
};

// --- 三次贝塞尔插值 ---
function cubicBezierPoint(t: number, curve: BezierCurve) {
  'worklet';
  const u = 1 - t;
  const u2 = u * u;
  const u3 = u2 * u;
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: u3 * curve.p0.x + 3 * u2 * t * curve.p1.x + 3 * u * t2 * curve.p2.x + t3 * curve.p3.x,
    y: u3 * curve.p0.y + 3 * u2 * t * curve.p1.y + 3 * u * t2 * curve.p2.y + t3 * curve.p3.y,
  };
}

// 贝塞尔切线方向（一阶导数）
function cubicBezierTangent(t: number, curve: BezierCurve) {
  'worklet';
  const u = 1 - t;
  const dx =
    3 * u * u * (curve.p1.x - curve.p0.x) +
    6 * u * t * (curve.p2.x - curve.p1.x) +
    3 * t * t * (curve.p3.x - curve.p2.x);
  const dy =
    3 * u * u * (curve.p1.y - curve.p0.y) +
    6 * u * t * (curve.p2.y - curve.p1.y) +
    3 * t * t * (curve.p3.y - curve.p2.y);
  // 返回角度（弧度→度）
  return Math.atan2(dx, -dy) * (180 / Math.PI); // 注意 y 轴向下
}

// --- 粒子配置 ---
interface ParticleConfig {
  curve: BezierCurve;
  duration: number;    // 一次运动时长
  delay: number;       // 启动延迟
  easing: EasingFunctionFactory;
  length: number;      // 拖尾长度
}

const PARTICLES: ParticleConfig[] = [
  // 左烟道 3 个粒子
  { curve: LEFT_CURVE, duration: 4000, delay: 0, easing: Easing.bezier(0.4, 0, 0.6, 1), length: 10 },
  { curve: LEFT_CURVE, duration: 5500, delay: 1200, easing: Easing.bezier(0.2, 0, 0.8, 1), length: 8 },
  { curve: LEFT_CURVE, duration: 3500, delay: 2800, easing: Easing.bezier(0.5, 0, 0.5, 1), length: 12 },
  // 右烟道 2 个粒子
  { curve: RIGHT_CURVE, duration: 4800, delay: 600, easing: Easing.bezier(0.3, 0, 0.7, 1), length: 9 },
  { curve: RIGHT_CURVE, duration: 6000, delay: 2000, easing: Easing.bezier(0.6, 0, 0.4, 1), length: 11 },
];

// --- 单个粒子组件 ---
function SmokeParticle({ config }: { config: ParticleConfig }) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: config.duration, easing: config.easing }),
          withTiming(0, { duration: 0 }), // 瞬间复位到起点
        ),
        -1,
      ),
    );
  }, []);

  const particleStyle = useAnimatedStyle(() => {
    const t = progress.value;
    const pos = cubicBezierPoint(t, config.curve);
    const angle = cubicBezierTangent(t, config.curve);
    // 透明度随高度渐隐：底部最亮，顶部消散
    const opacity = 0.25 * (1 - t);

    return {
      transform: [
        { translateX: pos.x - config.length / 2 },
        { translateY: pos.y - 1 },
        { rotate: `${angle}deg` },
      ],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        { width: config.length, height: 2 },
        particleStyle,
      ]}
    />
  );
}

// --- 主组件 ---
export default function IncenseSmoke() {
  return (
    <View style={styles.container}>
      {/* 烟道：两条 S 形贝塞尔路径 */}
      <Svg width={CANVAS_W} height={CANVAS_H} style={styles.svg}>
        <Defs>
          <SvgLinearGradient id="smokeTrailGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="rgb(166,124,91)" stopOpacity="0" />
            <Stop offset="70%" stopColor="rgb(166,124,91)" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="rgb(166,124,91)" stopOpacity="0.15" />
          </SvgLinearGradient>
        </Defs>
        {/* 左烟道 */}
        <Path
          d={LEFT_PATH}
          stroke="url(#smokeTrailGrad)"
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="none"
        />
        {/* 右烟道 */}
        <Path
          d={RIGHT_PATH}
          stroke="url(#smokeTrailGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>

      {/* 5 个粒子 */}
      {PARTICLES.map((config, index) => (
        <SmokeParticle key={index} config={config} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CANVAS_W,
    height: CANVAS_H,
    marginTop: 12,
    alignSelf: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  particle: {
    position: 'absolute',
    borderRadius: 1,
    backgroundColor: 'rgba(166,124,91,0.30)',
  },
});
