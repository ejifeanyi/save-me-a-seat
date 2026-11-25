import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, type, radius, spacing, LOGO_GLYPH } from '../../lib/theme';
import { useGuestSession } from '../../lib/store/guestSession';

function formatCode(code: string) {
  return code.match(/.{1,4}/g)?.join(' ') ?? code;
}

export default function GuestCodeEntry() {
  const { redeem } = useGuestSession();
  const [rawCode, setRawCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(text: string) {
    const raw = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12);
    setRawCode(raw);
    if (error) setError(null);
  }

  async function handleSubmit() {
    if (rawCode.length !== 12) {
      setError('Enter the full 12-character code');
      return;
    }
    setLoading(true);
    const { error } = await redeem(rawCode);
    setLoading(false);
    if (error) setError(error);
    else router.replace('/(guest)/pass');
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Pressable style={styles.adminLink} onPress={() => router.push('/(auth)/log-in')} hitSlop={10}>
        <Text style={styles.adminLinkText}>Admin</Text>
      </Pressable>

      <View style={styles.logoCircle}>
        <Text style={styles.logoGlyph}>{LOGO_GLYPH}</Text>
      </View>

      <View style={styles.headingBlock}>
        <Text style={[type.h1, styles.center]}>Enter your invitation code</Text>
        <Text style={[type.bodyRegular, styles.center, { width: 300 }]}>
          Your host sent you a 12-character code to unlock your invitation and QR pass.
        </Text>
      </View>

      <TextInput
        style={[styles.codeInput, error && styles.codeInputError]}
        value={formatCode(rawCode)}
        onChangeText={handleChange}
        placeholder="A7K9 PQ3M XT2R"
        placeholderTextColor={colors.border}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      {error ? (
        <View style={styles.errorRow}>
          <Text style={{ color: colors.danger }}>⚠</Text>
          <Text style={[type.caption, { color: colors.danger }]}>{error}</Text>
        </View>
      ) : (
        <Text style={[type.caption, styles.center]}>Paste or type the code exactly as you received it</Text>
      )}

      <View style={{ flex: 1 }} />

      <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={type.bodyMedium}>{loading ? 'Checking...' : 'Unlock Invitation'}</Text>
      </Pressable>

      <Text style={[type.caption, styles.center, { color: colors.primary }]}>Didn't get a code? Contact your host</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.xxl,
  },
  adminLink: { position: 'absolute', top: spacing.lg, right: spacing.lg, zIndex: 1, padding: spacing.xs },
  adminLinkText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlyph: { fontFamily: 'Inter_700Bold', fontSize: 24, color: colors.primary },
  headingBlock: { gap: 8, alignItems: 'center' },
  center: { textAlign: 'center' },
  codeInput: {
    width: 342,
    height: 64,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    letterSpacing: 2.4,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  codeInputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
    color: colors.danger,
  },
  errorRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    width: '100%',
  },
});