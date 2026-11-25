import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { createEvent } from '../../../lib/events';
import { colors, radius, spacing, type } from '../../../lib/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateEvent() {
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [startsAt, setStartsAt] = useState<Date>(new Date());
  const [endsAt, setEndsAt] = useState<Date>(new Date(Date.now() + 2 * 60 * 60 * 1000));
  const [guestCap, setGuestCap] = useState('');
  const [description, setDescription] = useState('');
  const [invitationUri, setInvitationUri] = useState<string | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pickInvitation() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setInvitationUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    setError(null);
    const cap = parseInt(guestCap, 10);
    if (!name.trim() || !venue.trim()) return setError('Event name and venue are required');
    if (!cap || cap <= 0) return setError('Guest cap must be a positive number');
    if (endsAt <= startsAt) return setError('End time must be after start time');

    setLoading(true);
    try {
      const event = await createEvent({
        name: name.trim(),
        venue: venue.trim(),
        startsAt,
        endsAt,
        guestCap: cap,
        description: description.trim() || undefined,
        invitationUri,
      });
      router.replace(`/(admin)/events/${event.id}`);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const fmt = (d: Date) =>
    `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })} ${d.getFullYear()} · ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
    <ScrollView style={styles.container} contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xxxl }}>
      <Pressable onPress={() => router.back()}>
        <Text style={type.bodyMediumPrimary}>← Cancel</Text>
      </Pressable>

      <View style={{ gap: 4 }}>
        <Text style={type.h1}>Create Event</Text>
        <Text style={type.caption}>Fields marked 🔒 can't be changed after creation</Text>
      </View>

      <Field label="EVENT NAME">
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Ada & Tobi's Wedding" placeholderTextColor={colors.textSecondary} />
      </Field>

      <Field label="VENUE">
        <TextInput style={styles.input} value={venue} onChangeText={setVenue} placeholder="e.g. The Glasshouse, Lekki Phase 1" placeholderTextColor={colors.textSecondary} />
      </Field>

      <Field label="DATE & START TIME">
        <Pressable style={styles.input} onPress={() => setShowStartPicker(true)}>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: colors.textPrimary }}>{fmt(startsAt)}</Text>
        </Pressable>
        {showStartPicker && (
          <DateTimePicker
            value={startsAt}
            mode="datetime"
            onChange={(_, date) => {
              setShowStartPicker(Platform.OS === 'ios');
              if (date) setStartsAt(date);
            }}
          />
        )}
      </Field>

      <Field label="END TIME">
        <Pressable style={styles.input} onPress={() => setShowEndPicker(true)}>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: colors.textPrimary }}>{fmt(endsAt)}</Text>
        </Pressable>
        {showEndPicker && (
          <DateTimePicker
            value={endsAt}
            mode="datetime"
            onChange={(_, date) => {
              setShowEndPicker(Platform.OS === 'ios');
              if (date) setEndsAt(date);
            }}
          />
        )}
      </Field>

      <Field label="GUEST CAP  🔒">
        <TextInput style={styles.input} value={guestCap} onChangeText={setGuestCap} placeholder="150" placeholderTextColor={colors.textSecondary} keyboardType="number-pad" />
      </Field>

      <Field label="DESCRIPTION (OPTIONAL)">
        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Black tie. Reception to follow." placeholderTextColor={colors.textSecondary} multiline />
      </Field>

      <Pressable style={styles.uploadBox} onPress={pickInvitation}>
        <Text style={type.bodyMediumPrimary}>
          {invitationUri ? '✓ Invitation selected' : '📎  Upload Invitation (JPEG/PNG, up to 10MB)'}
        </Text>
        <Text style={type.caption}>Guests see this after entering their code</Text>
      </Pressable>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={type.bodyMedium}>{loading ? 'Creating...' : 'Create Event'}</Text>
      </Pressable>
    </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm, width: '100%' }}>
      <Text style={type.labelSmall}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl, paddingTop: spacing.md },
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
  uploadBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: 6,
  },
  error: { ...type.caption, color: colors.error },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
  },
});