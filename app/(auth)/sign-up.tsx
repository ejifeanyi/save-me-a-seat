import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { PasswordField } from '../../components/PasswordField';
import { useAuth } from '../../lib/store/auth';
import { colors, LOGO_GLYPH, radius, spacing, type } from '../../lib/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUp() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    const { error } = await signUp(fullName, email, password);
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
        <Text style={type.h1}>Create your account</Text>
        <Text style={type.bodyRegular}>Set up events and manage check-ins</Text>
      </View>

      <View style={styles.field}>
        <Text style={type.labelSmall}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="e.g. Ifeanyi Emmanuel"
          placeholderTextColor={colors.textSecondary}
        />
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

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={type.bodyMedium}>{loading ? 'Creating account...' : 'Create Account'}</Text>
      </Pressable>

      <View style={styles.footerRow}>
        <Text style={type.caption}>Already have an account? </Text>
        <Link href="/(auth)/log-in"><Text style={[type.caption, styles.link]}>Log In</Text></Link>
      </View>

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
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlyph: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
    color: colors.primary,
  },
  headingBlock: { gap: 4 },
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
  error: { ...type.caption, color: colors.error },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.lg,
  },
  footerRow: { flexDirection: 'row', justifyContent: 'center', width: '100%' },
  link: { color: colors.primary, fontFamily: 'Inter_600SemiBold' },
});