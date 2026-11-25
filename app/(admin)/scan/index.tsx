import { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, type, radius, spacing } from '../../../lib/theme';
import { listMyEvents, formatEventDateTime } from '../../../lib/events';
import type { EventWithCounts } from '../../../lib/types';
import { BottomTabBar } from '../../../components/BottomTabBar';
import { screenStyles } from '../../../lib/screenStyles';

export default function ScanPicker() {
  const [events, setEvents] = useState<EventWithCounts[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      listMyEvents().then((data) => {
        const now = new Date();
        const scannable = data.filter(
          (e) => e.status !== 'ended' && new Date(e.starts_at) <= now && now <= new Date(e.ends_at)
        );
        setEvents(scannable);
        setLoading(false);
      });
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={[type.h1, { marginBottom: spacing.lg }]}>Scan</Text>
      {events.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyCircle}>
            <Ionicons name="scan-outline" size={32} color={colors.primary} />
          </View>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Text style={type.h2}>No events are live right now</Text>
            <Text style={[type.bodyRegular, { textAlign: 'center', width: 290 }]}>
              Scanning opens when an event&apos;s start time arrives. Check back then to admit your guests.
            </Text>
          </View>
          <Pressable style={[screenStyles.secondaryButton, { alignSelf: 'stretch' }]} onPress={() => router.replace('/(admin)/events')}>
            <Text style={screenStyles.secondaryButtonLabel}>View My Events</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: spacing.md }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/(admin)/scan/active?eventId=${item.id}`)}
            >
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textPrimary }}>
                {item.name}
              </Text>
              <Text style={type.caption}>{formatEventDateTime(item.starts_at)}</Text>
            </Pressable>
          )}
        />
      )}
      <BottomTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  emptyCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 2,
  },
});