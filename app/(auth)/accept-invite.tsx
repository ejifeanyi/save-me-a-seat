import { getAdminInvite, acceptAdminInvite } from '../../lib/admin';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PasswordField } from '../../components/PasswordField';
import { supabase } from '../../lib/supabase';
import { colors, radius, spacing, type } from '../../lib/theme';

type Invite = {
  event_name: string;
  invited_email: string;
  inviter_name: string | null;
  invite_expires_at: string;
  accepted_at: string | null;
};

export default function AcceptInvite() {
  const [token, setToken] = useState('');
  const [invite, setInvite] = useState<Invite | null>(null);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLookup() {
    setError(null);
    setLoading(true);
    try {
      const data = await getAdminInvite(token);
      if (data.accepted_at) {
        setError('This invite has already been accepted');
        return;
      }
      if (new Date(data.invite_expires_at) < new Date()) {
        setError('This invite has expired — ask your host to send a new one');
        return;
      }
      setInvite(data);
    } catch {
      setError("Invite code not found — check it and try again");
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept() {
    if (!invite) return;
    setError(null);
    if (!fullName.trim()) return setError('Enter your name');
    if (password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: invite.invited_email,
        password,
        options: { data: { full_name: fullName.trim() } },
      });
      if (signUpError) throw signUpError;

      await acceptAdminInvite(token);
      router.replace('/(admin)/events');
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const expiresInDays = invite
    ? Math.max(0, Math.ceil((new Date(invite.invite_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (!invite) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={{ gap: 4 }}>
          <Text style={type.h1}>Enter your invite code</Text>
          <Text style={type.bodyRegular}>Paste the code your host shared with you.</Text>
        </View>
        <TextInput
          style={styles.input}
          value={token}
          onChangeText={setToken}
          placeholder="Invite code"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable style={styles.button} onPress={handleLookup} disabled={loading || !token.trim()}>
          <Text style={type.bodyMedium}>{loading ? 'Looking up...' : 'Look Up Invite'}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.badge}>
        <Text style={[type.labelSmall, { color: colors.primary }]}>Admin Invite</Text>
      </View>

      <View style={{ gap: 4 }}>
        <Text style={type.h1}>You've been invited</Text>
        <Text style={type.bodyRegular}>
          {invite.inviter_name || 'The event host'} invited you to help manage check-in for {invite.event_name}. This
          invite expires in {expiresInDays} day{expiresInDays === 1 ? '' : 's'}.
        </Text>
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={type.labelSmall}>Your Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="e.g. Tomiwa Balogun"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={type.labelSmall}>Set a Password</Text>
        <PasswordField value={password} onChangeText={setPassword} />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleAccept} disabled={loading}>
        <Text style={type.bodyMedium}>{loading ? 'Joining...' : 'Accept & Join Team'}</Text>
      </Pressable>

      <Pressable onPress={() => setInvite(null)}>
        <Text style={[type.caption, { textAlign: 'center' }]}>Decline invitation</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  badge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
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
  error: { ...type.caption, color: colors.error },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});