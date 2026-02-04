import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Envelope } from '../hooks/useBlessingStore';
import { COLORS } from '../constants/colors';

interface Props {
  envelope: Envelope;
  onPress: () => void;
}

export default function EnvelopeCard({ envelope, onPress }: Props) {
  // 日期格式 MM/dd（保留前导零，如 01/31）
  const [, m, d] = envelope.createdAt.split('-');
  const displayDate = `${m}/${d}`;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <LinearGradient
        colors={[COLORS.cardStart, COLORS.cardEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.card}
      >
        <Text style={styles.date}>{displayDate}</Text>
        <View style={styles.textWrapper}>
          <Text
            style={styles.blessingText}
            numberOfLines={1}
            ellipsizeMode="clip"
          >
            {envelope.blessingText}
          </Text>
          {/* 右侧渐隐遮罩：从透明过渡到卡片尾色 */}
          <LinearGradient
            colors={['transparent', COLORS.cardEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.textMask}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: 'rgb(107,45,45)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  date: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '400',
    width: 50,
  },
  textWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  blessingText: {
    fontSize: 15,
    color: COLORS.blessing,
    fontWeight: '400',
    letterSpacing: 1,
  },
  textMask: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
});
