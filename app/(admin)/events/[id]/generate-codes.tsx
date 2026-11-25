import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getEvent } from '../../../../lib/events';
import { generateGuestCodes } from '../../../../lib/guestCodes';
import { colors, radius, spacing, type } from '../../../../lib/theme';
import type { EventWithCounts } from '../../../../lib/types';

export default function GenerateCodes() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<EventWithCounts | null>(null);
  const [count, setCount] = useState('20');
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) getEvent(id).then(setEvent);
  }, [id]);

  if (!event) return null;

  const codesLeft = event.guest_cap - event.issued_count;
  const n = parseInt(count, 10) || 0;
  const remainingAfter = codesLeft - n;
  const pct = codesLeft > 0 ? Math.min(1, n / codesLeft) : 0;

  async function handleGenerate() {
    setError(null);
    if (!n || n <= 0) return setError('Enter a number of codes greater than 0');
    if (n > codesLeft) return setError(`Only ${codesLeft} slots remaining — the cap can never be raised`);

    setLoading(true);
    try {
      await generateGuestCodes(event!.id, n, label.trim() || undefined);
      router.replace(`/(admin)/events/${event!.id}/codes`);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backLink}>← {event.name}</Text>
      </Pressable>

      <View style={{ gap: 2 }}>
        <Text style={type.h1}>Generate Codes</Text>
        <Text style={type.bodyRegular}>
          {codesLeft} of {event.guest_cap} slots remaining. Codes are unique, single-use, and never expand the cap.
        </Text>
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={type.labelSmall}>Number of Codes</Text>
        <TextInput
          style={styles.input}
          value={count}
          onChangeText={setCount}
          keyboardType="number-pad"
          placeholder="20"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={type.labelSmall}>Label (optional)</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder="e.g. Bride's side"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={{ gap: 8 }}>
        <Text style={type.caption}>
          {n} new code{n === 1 ? '' : 's'} · {Math.max(0, remainingAfter)} slots will remain after
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, pct * 100))}%` }]} />
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={{ flex: 1 }} />

      <Pressable style={styles.button} onPress={handleGenerate} disabled={loading}>
        <Text style={type.bodyMedium}>{loading ? 'Generating...' : `Generate ${n || 0} Codes`}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  backLink: { fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textSecondary },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.textPrimary,
  },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.primarySoft, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  error: { ...type.caption, color: colors.error },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});