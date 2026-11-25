import { useCallback, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, ScrollView, Image } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, type, radius, spacing } from '../../../../lib/theme';
import { getEvent, updateEvent, formatEventDateTime } from '../../../../lib/events';
import type { EventWithCounts } from '../../../../lib/types';

export default function EditEvent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<EventWithCounts | null>(null);
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState(new Date());
  const [endsAt, setEndsAt] = useState(new Date());
  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);
  const [newInvitation, setNewInvitation] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      (async () => {
        const data = await getEvent(id);
        setEvent(data);
        setName(data.name);
        setVenue(data.venue ?? '');
        setDescription(data.description ?? '');
        setStartsAt(new Date(data.starts_at));
        setEndsAt(new Date(data.ends_at));
        setLoading(false);
      })();
    }, [id])
  );

  async function handleChangeInvitation() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      setNewInvitation(result.assets[0]);
    }
  }

  async function handleSave() {
    if (!event) return;
    setError(null);
    if (!name.trim()) return setError('Event name is required');
    if (endsAt <= startsAt) return setError('End time must be after start time');

    setSaving(true);
    try {
      await updateEvent(event.id, {
        name,
        venue,
        description: description || null,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        invitationAsset: newInvitation
          ? {
              uri: newInvitation.uri,
              fileName: newInvitation.fileName ?? 'invitation.jpg',
              mimeType: newInvitation.mimeType ?? 'image/jpeg',
            }
          : null,
      });
      router.back();
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setSaving(false);
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
      <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>← {event.name}</Text>
        </Pressable>

        <View style={{ gap: 2 }}>
          <Text style={type.h1}>Edit Event</Text>
          <Text style={type.caption}>Guest cap can't be changed once set</Text>
        </View>

        <Pressable style={styles.invitationRow} onPress={handleChangeInvitation}>
          {newInvitation ? (
            <Image source={{ uri: newInvitation.uri }} style={styles.invitationThumb} />
          ) : event.invitation_url ? (
            <Image source={{ uri: event.invitation_url }} style={styles.invitationThumb} />
          ) : (
            <View style={[styles.invitationThumb, { backgroundColor: colors.primary }]} />
          )}
          <View style={{ flex: 1, gap: 1 }}>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textPrimary }}>
              {newInvitation ? 'New invitation selected' : 'Invitation uploaded'}
            </Text>
            <Text style={type.caption}>
              {newInvitation?.fileName ?? 'Tap to change'}
            </Text>
          </View>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.primary }}>Change</Text>
        </Pressable>

        <Field label="EVENT NAME" value={name} onChangeText={setName} />
        <Field label="VENUE" value={venue} onChangeText={setVenue} />

        <Field
          label="DATE & START TIME"
          value={formatEventDateTime(startsAt.toISOString())}
          onPress={() => setShowPicker('start')}
          editable={false}
        />
        <Field
          label="END TIME"
          value={formatEventDateTime(endsAt.toISOString())}
          onPress={() => setShowPicker('end')}
          editable={false}
        />

        <Field label="GUEST CAP  🔒" value={String(event.guest_cap)} editable={false} />

        <Field
          label="DESCRIPTION (OPTIONAL)"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable style={styles.button} onPress={handleSave} disabled={saving}>
          <Text style={styles.buttonLabel}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </Pressable>
      </ScrollView>

      {showPicker && (
        <DateTimePicker
          value={showPicker === 'start' ? startsAt : endsAt}
          mode="datetime"
          display="spinner"
          onChange={(_, selected) => {
            setShowPicker(null);
            if (!selected) return;
            if (showPicker === 'start') setStartsAt(selected);
            else setEndsAt(selected);
          }}
        />
      )}
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  onPress,
  editable = true,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText?: (v: string) => void;
  onPress?: () => void;
  editable?: boolean;
  multiline?: boolean;
}) {
  const content = (
    <View style={styles.input}>
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 15,
          color: editable ? colors.textPrimary : colors.textSecondary,
        }}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {onPress ? (
        <Pressable onPress={onPress}>{content}</Pressable>
      ) : editable ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          placeholderTextColor={colors.textSecondary}
        />
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  backLink: { fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textSecondary },
  fieldLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    color: colors.textSecondary,
  },
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
  invitationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  invitationThumb: { width: 48, height: 60, borderRadius: 8 },
  error: { ...type.caption, color: colors.error },
  button: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: spacing.lg, alignItems: 'center' },
  buttonLabel: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#fff' },
});