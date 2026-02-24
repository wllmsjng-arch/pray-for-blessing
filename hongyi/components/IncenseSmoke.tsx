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
const CANVAS_W = 76;
const CANVAS_H = 90;

// 6条烟道等间距10px，严格居中于76px画布
// 起点x: 13, 23, 33, 43, 53, 63（烟道群中心 = 38 = 76/2）

// --- 烟道路径定义 ---
// 左三条：S形（先左弯后右弯）
const PATH_L1 = 'M 13 85 C 5 65, 21 45, 10 5';
const PATH_L2 = 'M 23 85 C 15 65, 31 45, 20 5';
const PATH_L3 = 'M 33 85 C 25 65, 41 45, 30 5';
// 右三条：反S形（先右弯后左弯）
const PATH_R1 = 'M 43 85 C 51 65, 35 45, 46 5';
const PATH_R2 = 'M 53 85 C 61 65, 45 45, 56 5';
const PATH_R3 = 'M 63 85 C 71 65, 55 45, 66 5';

// --- 贝塞尔控制点（用于粒子位置计算） ---
interface BezierCurve {
  p0: { x: number; y: number };
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  p3: { x: number; y: number };
}

const CURVE_L1: BezierCurve = { p0: { x: 13, y: 85 }, p1: { x: 5,  y: 65 }, p2: { x: 21, y: 45 }, p3: { x: 10, y: 5 } };
const CURVE_L2: BezierCurve = { p0: { x: 23, y: 85 }, p1: { x: 15, y: 65 }, p2: { x: 31, y: 45 }, p3: { x: 20, y: 5 } };
const CURVE_L3: BezierCurve = { p0: { x: 33, y: 85 }, p1: { x: 25, y: 65 }, p2: { x: 41, y: 45 }, p3: { x: 30, y: 5 } };
const CURVE_R1: BezierCurve = { p0: { x: 43, y: 85 }, p1: { x: 51, y: 65 }, p2: { x: 35, y: 45 }, p3: { x: 46, y: 5 } };
const CURVE_R2: BezierCurve = { p0: { x: 53, y: 85 }, p1: { x: 61, y: 65 }, p2: { x: 45, y: 45 }, p3: { x: 56, y: 5 } };
const CURVE_R3: BezierCurve = { p0: { x: 63, y: 85 }, p1: { x: 71, y: 65 }, p2: { x: 55, y: 45 }, p3: { x: 66, y: 5 } };

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
  return Math.atan2(dx, -dy) * (180 / Math.PI);
}

// --- 粒子配置 ---
interface ParticleConfig {
  curve: BezierCurve;
  duration: number;
  delay: number;
  easing: EasingFunctionFactory;
  length: number;
}

const PARTICLES: ParticleConfig[] = [
  // 烟道1（左1）
  { curve: CURVE_L1, duration: 4200, delay: 0,    easing: Easing.bezier(0.4, 0, 0.6, 1), length: 10 },
  { curve: CURVE_L1, duration: 5800, delay: 1500, easing: Easing.bezier(0.2, 0, 0.8, 1), length: 8  },
  // 烟道2（左2）
  { curve: CURVE_L2, duration: 3800, delay: 800,  easing: Easing.bezier(0.5, 0, 0.5, 1), length: 11 },
  { curve: CURVE_L2, duration: 6200, delay: 2300, easing: Easing.bezier(0.3, 0, 0.7, 1), length: 9  },
  // 烟道3（左3）
  { curve: CURVE_L3, duration: 5100, delay: 400,  easing: Easing.bezier(0.6, 0, 0.4, 1), length: 12 },
  { curve: CURVE_L3, duration: 4600, delay: 1900, easing: Easing.bezier(0.4, 0, 0.6, 1), length: 7  },
  // 烟道4（右1）
  { curve: CURVE_R1, duration: 4900, delay: 300,  easing: Easing.bezier(0.3, 0, 0.7, 1), length: 9  },
  { curve: CURVE_R1, duration: 3600, delay: 2100, easing: Easing.bezier(0.5, 0, 0.5, 1), length: 11 },
  // 烟道5（右2）
  { curve: CURVE_R2, duration: 5500, delay: 1100, easing: Easing.bezier(0.2, 0, 0.8, 1), length: 8  },
  { curve: CURVE_R2, duration: 4300, delay: 2700, easing: Easing.bezier(0.6, 0, 0.4, 1), length: 13 },
  // 烟道6（右3）
  { curve: CURVE_R3, duration: 6100, delay: 700,  easing: Easing.bezier(0.4, 0, 0.6, 1), length: 10 },
  { curve: CURVE_R3, duration: 3900, delay: 1600, easing: Easing.bezier(0.3, 0, 0.7, 1), length: 9  },
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
          withTiming(0, { duration: 0 }),
        ),
        -1,
      ),
    );
  }, []);

  const particleStyle = useAnimatedStyle(() => {
    const t = progress.value;
    const pos = cubicBezierPoint(t, config.curve);
    const angle = cubicBezierTangent(t, config.curve);
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
      <Svg width={CANVAS_W} height={CANVAS_H} style={styles.svg}>
        <Defs>
          <SvgLinearGradient id="smokeTrailGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor="rgb(166,124,91)" stopOpacity="0"    />
            <Stop offset="70%"  stopColor="rgb(166,124,91)" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="rgb(166,124,91)" stopOpacity="0.15" />
          </SvgLinearGradient>
        </Defs>
        {/* 左三条烟道：S形 */}
        <Path d={PATH_L1} stroke="url(#smokeTrailGrad)" strokeWidth={2.5} strokeLinecap="round" fill="none" />
        <Path d={PATH_L2} stroke="url(#smokeTrailGrad)" strokeWidth={2.5} strokeLinecap="round" fill="none" />
        <Path d={PATH_L3} stroke="url(#smokeTrailGrad)" strokeWidth={2.5} strokeLinecap="round" fill="none" />
        {/* 右三条烟道：反S形 */}
        <Path d={PATH_R1} stroke="url(#smokeTrailGrad)" strokeWidth={2}   strokeLinecap="round" fill="none" />
        <Path d={PATH_R2} stroke="url(#smokeTrailGrad)" strokeWidth={2}   strokeLinecap="round" fill="none" />
        <Path d={PATH_R3} stroke="url(#smokeTrailGrad)" strokeWidth={2}   strokeLinecap="round" fill="none" />
      </Svg>

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
