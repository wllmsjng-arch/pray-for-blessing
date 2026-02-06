import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
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

SplashScreen.preventAutoHideAsync();

export default function Home() {
  const { homeState, isFromDescend, selectedEnvelope, checkTodayStatus } =
    useBlessingStore();

  useEffect(() => {
    checkTodayStatus().then(() => {
      SplashScreen.hideAsync();
    });
  }, []);

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
      {/* 中心暖光晕层 */}
      <View style={styles.centerGlow} pointerEvents="none" />
      <GridBackground />
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
  centerGlow: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    marginLeft: -160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(168,98,64,0.04)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
