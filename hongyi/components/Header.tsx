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
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
  },
  date: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  action: {
    fontSize: 14,
    color: COLORS.accent,
  },
});
