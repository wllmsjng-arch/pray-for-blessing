import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBlessingStore } from '../hooks/useBlessingStore';
import { COLORS } from '../constants/colors';

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
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={styles.button}
        >
          <View style={styles.highlight} />
          <Text style={styles.text}>请红意</Text>
        </LinearGradient>
      </TouchableOpacity>
      {/* 按钮下方装饰线 */}
      <View style={styles.decorLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  decorLine: {
    width: 40,
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: 'rgba(201,169,110,0.25)',
    borderRadius: 0.5,
    marginTop: 28,
    alignSelf: 'center',
  },
});
