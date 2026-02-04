import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { FuTheme } from '../data/fuThemes';

interface Props {
  theme: FuTheme;
}

export default function FuImage({ theme }: Props) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    // 漂浮循环：±3px，周期 4.5s（上 2.25s + 下 2.25s）
    translateY.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 2250 }),
        withTiming(0, { duration: 2250 }),
      ),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Image
        source={theme.image}
        style={styles.image}
        contentFit="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 220,
    height: 220,
  },
});
