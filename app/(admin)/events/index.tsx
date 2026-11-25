import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { BottomTabBar } from '../../../components/BottomTabBar';
import { StatusBadge } from '../../../components/StatusBadge';
import { formatEventDateTime, listMyEvents, statusLabel } from '../../../lib/events';
import { colors, LOGO_GLYPH, radius, spacing, type } from '../../../lib/theme';
import type { EventWithCounts } from '../../../lib/types';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventsList() {
  const [events, setEvents] = useState<EventWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await listMyEvents();
      setEvents(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (events.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header />
        <View style={styles.emptyWrap}>
          <View style={styles.emptyCircle}>
            <Text style={styles.emptyGlyph}>{LOGO_GLYPH}</Text>
          </View>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Text style={type.h2}>No events yet</Text>
            <Text style={[type.bodyRegular, { textAlign: 'center', width: 280 }]}>
              Create your first event to start issuing guest codes and scanning check-ins
            </Text>
          </View>
        </View>
        <Pressable style={styles.createButton} onPress={() => router.push('/(admin)/events/create')}>
          <Text style={type.bodyMedium}>+ Create Your First Event</Text>
        </Pressable>
        <BottomTabBar />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.lg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListHeaderComponent={
          <Pressable style={styles.createButton} onPress={() => router.push('/(admin)/events/create')}>
            <Text style={type.bodyMedium}>+ Create New Event</Text>
          </Pressable>
        }
        ListHeaderComponentStyle={{ marginBottom: spacing.lg }}
        renderItem={({ item }) => {
          const label = statusLabel(item.status);
          const pct = item.guest_cap > 0 ? Math.min(1, item.checked_in_count / item.guest_cap) : 0;
          return (
            <Pressable style={styles.card} onPress={() => router.push(`/(admin)/events/${item.id}`)}>
              <View style={styles.cardTopRow}>
                <View style={{ gap: 2 }}>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, lineHeight: 22, color: colors.textPrimary }}>
                    {item.name}
                  </Text>
                  <Text style={type.caption}>{formatEventDateTime(item.starts_at)}</Text>
                </View>
                <StatusBadge status={label} />
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
              </View>
              <Text style={type.caption}>
                {item.checked_in_count} of {item.guest_cap} guests admitted
              </Text>
            </Pressable>
          );
        }}
      />
      <BottomTabBar />
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View style={styles.headerRow}>
      <View style={{ gap: 2 }}>
        <Text style={type.h1}>Your Events</Text>
        <Text style={type.caption}>Super admin · Ifeanyi</Text>
      </View>
      <Pressable style={styles.avatar} onPress={() => router.push('/(admin)/profile')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  centered: { justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 10,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.primarySoft, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.primary },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  emptyCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGlyph: { fontFamily: 'Inter_700Bold', fontSize: 24, color: colors.primary },
});