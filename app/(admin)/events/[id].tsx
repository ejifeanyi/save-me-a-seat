import { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, type, radius, spacing } from '../../../lib/theme';
import { getEvent, formatEventDateTime, statusLabel, endEventEarly } from '../../../lib/events';
import type { EventWithCounts } from '../../../lib/types';
import { StatusBadge } from '../../../components/StatusBadge';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<EventWithCounts | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    const data = await getEvent(id);
    setEvent(data);
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading || !event) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]} edges={['top', 'bottom']}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  const codesLeft = event.guest_cap - event.issued_count;

  function confirmEndEarly() {
    Alert.alert('End event early?', 'Guests will no longer be able to check in.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Event',
        style: 'destructive',
        onPress: async () => {
          await endEventEarly(event!.id);
          load();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Pressable onPress={() => router.back()}>
        <Text style={type.bodyMediumPrimary}>← Your Events</Text>
      </Pressable>

      <View style={styles.headerRow}>
        <View style={{ gap: 2 }}>
          <Text style={type.h1}>{event.name}</Text>
          <Text style={type.caption}>{formatEventDateTime(event.starts_at)}</Text>
        </View>
        <StatusBadge status={statusLabel(event.status)} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={type.h2}>
            {event.checked_in_count} / {event.guest_cap}
          </Text>
          <Text style={type.caption}>Admitted</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={type.h2}>{codesLeft}</Text>
          <Text style={type.caption}>Codes left</Text>
        </View>
      </View>

      <NavRow
        icon="pricetag-outline"
        title="Guest Codes"
        subtitle="View, copy, or revoke issued codes"
        onPress={() => router.push(`/(admin)/events/${event.id}/codes`)}
      />
      <NavRow
        icon="add-outline"
        title="Generate Codes"
        subtitle={`${codesLeft} of ${event.guest_cap} slots remaining`}
        onPress={() => router.push(`/(admin)/events/${event.id}/generate-codes`)}
      />
      <NavRow
        icon="person-outline"
        title="Manage Admins"
        subtitle="View and invite event admins"
        onPress={() => router.push(`/(admin)/events/${event.id}/admins`)}
      />
      <NavRow
        icon="download-outline"
        title="Export Check-ins"
        subtitle="Download admitted guest list"
        onPress={() => router.push(`/(admin)/events/${event.id}/export`)}
      />

      <View style={{ flex: 1 }} />

      {event.status !== 'ended' && (
        <Pressable style={styles.dangerButton} onPress={confirmEndEarly}>
          <Text style={[type.bodyMedium, { color: colors.danger }]}>End Event Early</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

function NavRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.navRow} onPress={onPress}>
      <View style={styles.navIconWrap}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textPrimary }}>{title}</Text>
        <Text style={type.caption}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: 2,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  navIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});