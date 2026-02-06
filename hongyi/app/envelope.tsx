import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBlessingStore, Envelope } from '../hooks/useBlessingStore';
import { COLORS } from '../constants/colors';
import EnvelopeCard from '../components/EnvelopeCard';

export default function EnvelopePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const loadEnvelopes = useBlessingStore((s) => s.loadEnvelopes);
  const viewEnvelope = useBlessingStore((s) => s.viewEnvelope);
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);

  useEffect(() => {
    loadEnvelopes().then(setEnvelopes);
  }, []);

  const handlePress = (envelope: Envelope) => {
    viewEnvelope(envelope);
    router.back();
  };

  return (
    <LinearGradient
      colors={[...COLORS.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* 顶部栏 */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>红意信封</Text>
          {/* 标题下方装饰线 */}
          <View style={styles.titleDecorLine} />
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.closeText}>关闭</Text>
        </TouchableOpacity>
      </View>

      {/* 信封列表 / 空态 */}
      {envelopes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>尚无红意信封</Text>
        </View>
      ) : (
        <FlatList
          data={envelopes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EnvelopeCard
              envelope={item}
              onPress={() => handlePress(item)}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titleContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: 3,
  },
  titleDecorLine: {
    width: 32,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(201,169,110,0.25)',
    marginTop: 12,
    marginBottom: 4,
  },
  closeText: {
    fontSize: 14,
    color: COLORS.accent,
  },
  listContent: {
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
});
