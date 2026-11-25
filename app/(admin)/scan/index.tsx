import { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, type, radius, spacing } from '../../../lib/theme';
import { listMyEvents, formatEventDateTime } from '../../../lib/events';
import type { EventWithCounts } from '../../../lib/types';
import { BottomTabBar } from '../../../components/BottomTabBar';

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
        <Text style={type.bodyRegular}>
          No events are live right now. Scanning opens once an event's start time arrives.
        </Text>
      ) : (
        <FlatList
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
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 2,
  },
});