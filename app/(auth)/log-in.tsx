import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../lib/store/auth';

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
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>

      <Text style={styles.label}>EMAIL</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@email.com" autoCapitalize="none" keyboardType="email-address" />

      <Text style={styles.label}>PASSWORD</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••••" secureTextEntry />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
      </Pressable>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <Link href="/(auth)/sign-up"><Text style={styles.link}>Sign Up</Text></Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80, backgroundColor: '#FAFAFA' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 32 },
  label: { fontSize: 12, fontWeight: '600', color: '#6B6B6B', marginBottom: 6, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#E6E1DC', borderRadius: 12, padding: 16, fontSize: 15 },
  error: { color: '#D64545', marginTop: 12 },
  button: { backgroundColor: '#423088', borderRadius: 999, padding: 16, alignItems: 'center', marginTop: 32 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#6B6B6B' },
  link: { color: '#423088', fontWeight: '600' },
});