import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { useBlessingStore } from '../hooks/useBlessingStore';
import { COLORS } from '../constants/colors';
import GridBackground from '../components/GridBackground';
import Header from '../components/Header';
import ButtonState from '../components/ButtonState';
import DescendState from '../components/DescendState';
import SuccessState from '../components/SuccessState';
import ViewingState from '../components/ViewingState';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// 花枝尺寸计算
const BRANCH_W = SCREEN_W * 0.55;
const LEFT_H = BRANCH_W * (362 / 542);
const RIGHT_H = BRANCH_W * (1024 / 1536);
const CENTER_GAP = 30; // 花枝到中轴线的间距

SplashScreen.preventAutoHideAsync();

export default function Home() {
  const { homeState, isFromDescend, selectedEnvelope, checkTodayStatus } =
    useBlessingStore();

  // 花枝装饰动画
  const branchOpacity = useSharedValue(0);
  const leftRotate = useSharedValue(0);
  const leftScale = useSharedValue(1);
  const rightRotate = useSharedValue(0);
  const rightScale = useSharedValue(1);

  const showBranches = homeState === 'descend' || homeState === 'viewing';

  useEffect(() => {
    checkTodayStatus().then(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  useEffect(() => {
    if (showBranches) {
      // 花枝淡入
      branchOpacity.value = withTiming(1, {
        duration: 1500,
        easing: Easing.out(Easing.quad),
      });
      // 左枝微风摇曳 — reverse:true 自动回放，起止帧一致无跳帧
      leftRotate.value = withRepeat(
        withTiming(1.2, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
        -1, true,
      );
      leftScale.value = withRepeat(
        withTiming(1.02, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
        -1, true,
      );
      // 右枝：方向相反、周期错开，与左枝形成自然的相位差
      rightRotate.value = withRepeat(
        withTiming(-1.0, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
        -1, true,
      );
      rightScale.value = withRepeat(
        withTiming(1.02, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
        -1, true,
      );
    } else {
      // 非展示状态：淡出并重置
      branchOpacity.value = withTiming(0, { duration: 600 });
      leftRotate.value = withTiming(0, { duration: 600 });
      leftScale.value = withTiming(1, { duration: 600 });
      rightRotate.value = withTiming(0, { duration: 600 });
      rightScale.value = withTiming(1, { duration: 600 });
    }
  }, [showBranches]);

  const branchFadeStyle = useAnimatedStyle(() => ({
    opacity: branchOpacity.value,
  }));
  const leftSwayStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${leftRotate.value}deg` },
      { scale: leftScale.value },
    ],
  }));
  const rightSwayStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rightRotate.value}deg` },
      { scale: rightScale.value },
    ],
  }));

  if (homeState === 'loading') {
    return (
      <LinearGradient
        colors={[...COLORS.background]}
        style={styles.container}
      />
    );
  }

  return (
    <LinearGradient colors={[...COLORS.background]} style={styles.container}>
      {/* 宣纸纹理叠加层 */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Image
          source={require('../assets/paper-texture.png')}
          style={styles.paperTexture}
          resizeMode="cover"
        />
      </View>
      <GridBackground />

      {/* 花枝装饰层：贴屏幕左右两侧，上下错落 */}
      <Animated.View style={[styles.branchLayer, branchFadeStyle]} pointerEvents="none">
        {/* 左侧花枝 — 贴左边缘，偏上 */}
        <Animated.Image
          source={require('../assets/branch-left.png')}
          style={[styles.branchLeft, leftSwayStyle]}
          resizeMode="contain"
        />
        {/* 右侧花枝（反转对称）— 贴右边缘，偏下 */}
        <Animated.Image
          source={require('../assets/branch-right.png')}
          style={[styles.branchRight, rightSwayStyle]}
          resizeMode="contain"
        />
      </Animated.View>

      <Header />
      <View style={styles.content}>
        {homeState === 'button' && <ButtonState />}
        {homeState === 'descend' && <DescendState />}
        {homeState === 'success' && (
          <SuccessState animated={isFromDescend} />
        )}
        {homeState === 'viewing' && selectedEnvelope && (
          <ViewingState envelope={selectedEnvelope} />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  paperTexture: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_W,
    height: SCREEN_H,
    opacity: 0.15,
  },
  branchLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  branchLeft: {
    position: 'absolute',
    left: -20,
    top: SCREEN_H / 2 - CENTER_GAP - LEFT_H,
    width: BRANCH_W,
    height: LEFT_H,
  },
  branchRight: {
    position: 'absolute',
    right: -20,
    top: SCREEN_H / 2 + CENTER_GAP,
    width: BRANCH_W,
    height: RIGHT_H,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
