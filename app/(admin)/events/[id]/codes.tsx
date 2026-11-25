import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getEvent } from '../../../../lib/events';
import { formatCode, listGuestCodes } from '../../../../lib/guestCodes';
import { colors, radius, spacing, type } from '../../../../lib/theme';
import type { EventWithCounts, GuestCode } from '../../../../lib/types';

export default function GuestCodesList() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<EventWithCounts | null>(null);
  const [codes, setCodes] = useState<GuestCode[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    const [eventData, codesData] = await Promise.all([getEvent(id), listGuestCodes(id)]);
    setEvent(eventData);
    setCodes(codesData);
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading || !event) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  const used = codes.filter((c) => c.checked_in_at).length;
  const unused = codes.length - used;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backLink}>← {event.name}</Text>
      </Pressable>

      <Pressable onPress={() => router.push(`/(admin)/events/${id}/export`)}>
        <Text style={[type.caption, { color: colors.primary }]}>Export Guest Codes</Text>
      </Pressable>

      <View style={{ gap: 2, marginBottom: spacing.md }}>
        <Text style={type.h1}>Guest Codes</Text>
        <Text style={type.caption}>
          {used} used · {unused} unused · {codes.length} total
        </Text>
      </View>

      <FlatList
        data={codes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xxl }}
        ListFooterComponent={
          codes.length > 0 ? (
            <Text style={[type.caption, { textAlign: 'center' }]}>
              Showing {codes.length} of {event.guest_cap}
            </Text>
          ) : undefined
        }
        ListEmptyComponent={
          <Text style={[type.bodyRegular, { textAlign: 'center', marginTop: spacing.xxxl }]}>
            No codes generated yet.
          </Text>
        }
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={styles.guestLabel}>{item.label || `Guest #${codes.length - index}`}</Text>
              <Text style={type.caption}>{formatCode(item.code)}</Text>
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: item.checked_in_at ? colors.successSoft : colors.primarySoft },
              ]}
            >
              <Text style={[type.labelSmall, { color: item.checked_in_at ? colors.success : colors.primary }]}>
                {item.checked_in_at ? 'Used' : 'Unused'}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  backLink: { fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textSecondary, marginBottom: spacing.sm },
  row: {
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
  guestLabel: { fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textPrimary },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
});