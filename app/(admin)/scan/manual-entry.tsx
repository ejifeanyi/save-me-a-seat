import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scanGuestCode } from '../../../lib/scan';

export default function ManualEntry() {
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    if (!code.trim()) return;
    setError(null);
    setVerifying(true);
    try {
      const result = await scanGuestCode(code.trim().toUpperCase());
      router.replace({
        pathname: '/(admin)/scan/result',
        params: { result: JSON.stringify(result), code: code.trim().toUpperCase() },
      });
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backLink}>✕  Back to Scanner</Text>
      </Pressable>

      <View style={{ alignItems: 'center', gap: 6 }}>
        <Text style={styles.title}>Enter code manually</Text>
        <Text style={styles.subtitle}>Use this if the guest's QR code won't scan</Text>
      </View>

      <TextInput
        style={styles.codeInput}
        value={code}
        onChangeText={setCode}
        placeholder="A7K9 PQ3M XT2R"
        placeholderTextColor="rgba(255,255,255,0.3)"
        autoCapitalize="characters"
        autoCorrect={false}
        autoFocus
        maxLength={14}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={{ flex: 1 }} />

      <Pressable style={styles.verifyButton} onPress={handleVerify} disabled={verifying || !code.trim()}>
        <Text style={styles.verifyLabel}>{verifying ? 'Verifying...' : 'Verify & Check In'}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141417',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    gap: 24,
  },
  backLink: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#716e67' },
  title: { fontFamily: 'Inter_700Bold', fontSize: 24, lineHeight: 30, color: '#fff' },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22, color: '#716e67' },
  codeInput: {
    height: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    letterSpacing: 2,
    color: '#fff',
  },
  error: { color: '#ff6b6b', fontFamily: 'Inter_400Regular', fontSize: 13, textAlign: 'center' },
  verifyButton: { backgroundColor: '#423088', borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  verifyLabel: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#fff' },
});