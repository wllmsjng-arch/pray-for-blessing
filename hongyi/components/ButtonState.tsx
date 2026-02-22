import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBlessingStore } from '../hooks/useBlessingStore';
import { COLORS } from '../constants/colors';
import ButtonGlow from './ButtonGlow';
import ButtonSheen from './ButtonSheen';
import DecorLineSheen from './DecorLineSheen';
import IncenseSmoke from './IncenseSmoke';

export default function ButtonState() {
  const generateBlessing = useBlessingStore((s) => s.generateBlessing);
  const [disabled, setDisabled] = useState(false);

  const handlePress = () => {
    if (disabled) return;
    setDisabled(true);
    generateBlessing();
  };

  return (
    <View style={styles.container}>
      {/* 按钮 + 光晕区域 */}
      <View style={styles.buttonWrapper}>
        {/* Layer 0: 按钮外发光（最底层） */}
        <ButtonGlow />

        {/* Layer 1: 按钮本体 */}
        <TouchableOpacity
          onPress={handlePress}
          disabled={disabled}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            style={styles.button}
          >
            {/* Layer 1a: 微透明白色蒙版 */}
            <View style={styles.highlight} />

            {/* Layer 1b: 斜向高光扫过（被按钮 overflow:hidden + borderRadius 裁切） */}
            <ButtonSheen />

            {/* Layer 1c: 按钮文字（最上层） */}
            <Text style={styles.text}>请红意</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Layer 2: 装饰线 + 光泽扫过 */}
      <DecorLineSheen />

      {/* Layer 3: 檀烟烟道 + 粒子 */}
      <IncenseSmoke />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.primaryGlow,
    shadowColor: 'rgb(107,45,45)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  highlight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  text: {
    fontSize: 18,
    color: COLORS.textOnButton,
    fontWeight: '400',
    letterSpacing: 4,
  },
});
