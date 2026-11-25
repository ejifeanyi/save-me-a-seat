import { useCallback, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, type, radius, spacing } from '../../../../lib/theme';
import { getEvent } from '../../../../lib/events';
import { listEventAdmins, inviteEventAdmin, removeEventAdmin } from '../../../../lib/admin';
import type { EventWithCounts, EventAdmin } from '../../../../lib/types';

export default function ManageAdmins() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<EventWithCounts | null>(null);
  const [admins, setAdmins] = useState<EventAdmin[]>([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    const [eventData, adminsData] = await Promise.all([getEvent(id), listEventAdmins(id)]);
    setEvent(eventData);
    setAdmins(adminsData);
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleInvite() {
    setError(null);
    if (!email.includes('@')) return setError('Enter a valid email address');
    if (admins.length >= 7) return setError('All 7 admin seats are already used for this event');

    setSending(true);
    try {
      await inviteEventAdmin(event!.id, email);
      setEmail('');
      await load();
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setSending(false);
    }
  }

  function confirmRemove(admin: EventAdmin) {
    const displayName = admin.profile_full_name || admin.invited_email;
    Alert.alert(
      `Remove ${displayName}?`,
      "They'll immediately lose access to scan codes or view guest data for this event.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove Admin',
          style: 'destructive',
          onPress: async () => {
            await removeEventAdmin(event!.id, admin.invited_email);
            load();
          },
        },
      ]
    );
  }

  async function copyInviteCode(admin: EventAdmin) {
    await Clipboard.setStringAsync(admin.invite_token);
    Alert.alert('Copied', 'Invite code copied — share it with your admin to accept.');
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
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backLink}>← {event.name}</Text>
      </Pressable>

      <View style={{ gap: 2 }}>
        <Text style={type.h1}>Manage Admins</Text>
        <Text style={type.caption}>{admins.length} of 7 seats used for this event</Text>
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={type.labelSmall}>Invite by Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="admin@email.com"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleInvite} disabled={sending}>
        <Text style={type.bodyMedium}>{sending ? 'Sending...' : 'Send Invite'}</Text>
      </Pressable>

      <Text style={[type.labelSmall, { marginTop: spacing.sm }]}>Team</Text>

      <FlatList
        data={admins}
        keyExtractor={(item) => item.invited_email}
        contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xxl }}
        renderItem={({ item }) => {
          const isActive = !!item.accepted_at;
          return (
            <Pressable
              style={styles.row}
              onLongPress={() => confirmRemove(item)}
              onPress={() => (!isActive ? copyInviteCode(item) : undefined)}
            >
              <View style={styles.avatar} />
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textPrimary }}>
                  {item.profile_full_name || item.invited_email}
                </Text>
                <Text style={type.caption}>{item.invited_email}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: isActive ? colors.successSoft : colors.primarySoft }]}>
                <Text style={[type.labelSmall, { color: isActive ? colors.success : colors.primary }]}>
                  {isActive ? 'Active' : 'Pending'}
                </Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={<Text style={type.bodyRegular}>No admins invited yet.</Text>}
      />

      <Text style={[type.caption, { textAlign: 'center' }]}>
        Tap a pending invite to copy its code · long-press any row to remove
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.lg },
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
  error: { ...type.caption, color: colors.error },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
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
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primarySoft },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
});