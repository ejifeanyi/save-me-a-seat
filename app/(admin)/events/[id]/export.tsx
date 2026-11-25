import { File, Paths } from 'expo-file-system';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getEvent } from '../../../../lib/events';
import { exportCheckins, toCsv } from '../../../../lib/guestCodes';
import { colors, radius, spacing, type } from '../../../../lib/theme';
import type { CheckinExportRow, EventWithCounts } from '../../../../lib/types';

function firstName(fullName: string | null) {
  if (!fullName) return 'Admin';
  return fullName.trim().split(/\s+/)[0];
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function ExportCheckins() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<EventWithCounts | null>(null);
  const [rows, setRows] = useState<CheckinExportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      (async () => {
        setLoading(true);
        const [eventData, exportRows] = await Promise.all([getEvent(id), exportCheckins(id)]);
        setEvent(eventData);
        setRows(exportRows);
        setLoading(false);
      })();
    }, [id])
  );

  const admitted = rows
    .filter((r) => r.status === 'admitted' && r.checked_in_at)
    .sort((a, b) => new Date(b.checked_in_at!).getTime() - new Date(a.checked_in_at!).getTime());

  const admittedCount = admitted.length;
  const cap = event?.guest_cap ?? 0;
  const percent = cap > 0 ? Math.round((admittedCount / cap) * 100) : 0;

  async function handleShare() {
    setError(null);
    setExporting(true);
    try {
      const csv = toCsv(rows);
      const fileName = `${(event?.name ?? 'event').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-checkins.csv`;
      const file = new File(Paths.document, fileName);
      file.create({ overwrite: true });
      file.write(csv);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri,{ mimeType: 'text/csv', dialogTitle: 'Export Check-ins' });
      } else {
        setError('Sharing is not available on this device');
      }
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong exporting');
    } finally {
      setExporting(false);
    }
  }

  if (loading || !event) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <FlatList
        data={admitted.slice(0, 3)}
        keyExtractor={(item) => item.code}
        ListHeaderComponent={
          <View style={{ gap: spacing.lg }}>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.backLink}>← {event.name}</Text>
            </Pressable>

            <View style={{ gap: 2 }}>
              <Text style={type.h1}>Check-in Summary</Text>
              <Text style={type.caption}>Kept for 90 days after the event ends</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {admittedCount} of {cap}
              </Text>
              <Text style={styles.statLabel}>GUESTS ADMITTED · {percent}%</Text>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable style={styles.button} onPress={handleShare} disabled={exporting || rows.length === 0}>
              <Text style={styles.buttonLabel}>{exporting ? 'Preparing...' : '⬇ Export as CSV'}</Text>
            </Pressable>

            <Text style={styles.sectionLabel}>CHECKED-IN GUESTS</Text>
          </View>
        }
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xxl }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={styles.guestName}>{item.label || item.code}</Text>
              <Text style={type.caption}>Scanned by {firstName(item.scanned_by_name)}</Text>
            </View>
            <Text style={type.caption}>{item.checked_in_at ? formatTime(item.checked_in_at) : ''}</Text>
          </View>
        )}
        ListFooterComponent={
          admittedCount > 3 ? (
            <Text style={styles.footerNote}>
              Showing 3 of {admittedCount} · scroll for more
            </Text>
          ) : undefined
        }
        ListEmptyComponent={<Text style={type.bodyRegular}>No guests admitted yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  backLink: { fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textSecondary },
  statCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: 12,
  },
  statNumber: { fontFamily: 'Inter_700Bold', fontSize: 24, lineHeight: 30, color: colors.primary },
  statLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    color: colors.primary,
  },
  error: { ...type.caption, color: colors.error },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  buttonLabel: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#fff' },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    color: colors.textSecondary,
  },
  guestName: { fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textPrimary },
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
  footerNote: { ...type.caption, textAlign: 'center', marginTop: spacing.sm },
});