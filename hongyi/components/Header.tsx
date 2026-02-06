import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBlessingStore, getToday } from '../hooks/useBlessingStore';
import { COLORS } from '../constants/colors';

export default function Header() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const homeState = useBlessingStore((s) => s.homeState);
  const exitViewing = useBlessingStore((s) => s.exitViewing);

  const today = getToday();
  const [y, m, d] = today.split('-');
  const displayDate = `${y}年${parseInt(m)}月${parseInt(d)}日`;

  const isViewing = homeState === 'viewing';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.title}>红意</Text>
          <Text style={styles.date}>{displayDate}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (isViewing) {
              exitViewing();
            } else {
              router.push('/envelope');
            }
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.action}>
            {isViewing ? '返回' : '红意信封'}
          </Text>
        </TouchableOpacity>
      </View>
      {/* 底部分割线 */}
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: 6,
  },
  date: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  action: {
    fontSize: 14,
    color: COLORS.accent,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(180,170,160,0.08)',
    marginTop: 12,
  },
});
