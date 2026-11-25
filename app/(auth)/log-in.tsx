import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PasswordField } from '../../components/PasswordField';
import { useAuth } from '../../lib/store/auth';
import { colors, LOGO_GLYPH, radius, spacing, type } from '../../lib/theme';

export default function LogIn() {
  const { logIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    const { error } = await logIn(email, password);
    setLoading(false);
    if (error) setError(error);
    else router.replace('/(admin)/events');
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoGlyph}>{LOGO_GLYPH}</Text>
      </View>

      <View style={styles.headingBlock}>
        <Text style={[type.h1, styles.center]}>Save Me A Seat</Text>
        <Text style={[type.bodyRegular, styles.center]}>Log in to manage your events</Text>
      </View>

      <View style={styles.field}>
        <Text style={type.labelSmall}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.field}>
        <Text style={type.labelSmall}>Password</Text>
        <PasswordField value={password} onChangeText={setPassword} />
      </View>

      <Text style={styles.forgot}>Forgot password?</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={type.bodyMedium}>{loading ? 'Logging in...' : 'Log In'}</Text>
      </Pressable>

      <View style={styles.footerRow}>
        <Text style={type.caption}>New here? </Text>
        <Link href="/(auth)/sign-up"><Text style={[type.caption, styles.link]}>Create an account</Text></Link>
      </View>

      <Pressable onPress={() => router.push('/(auth)/accept-invite')}>
        <Text style={[type.caption, styles.link]}>Have an admin invite code?</Text>
      </Pressable>

      <Pressable style={{ alignSelf: 'center' }} onPress={() => router.replace('/(guest)')}>
        <Text style={[type.caption, styles.link]}>← Back to invitation code</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlyph: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    lineHeight: 30,
    color: colors.primary,
  },
  headingBlock: { gap: 4, alignItems: 'center' },
  center: { textAlign: 'center' },
  field: { gap: spacing.sm, width: '100%' },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    ...type.bodyRegular,
    color: colors.textPrimary,
  },
  forgot: { ...type.caption, color: colors.primary, alignSelf: 'flex-end' },
  error: { ...type.caption, color: colors.error },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    width: '100%',
  },
  footerRow: { flexDirection: 'row', justifyContent: 'center' },
  link: { color: colors.primary, fontFamily: 'Inter_600SemiBold' },
});