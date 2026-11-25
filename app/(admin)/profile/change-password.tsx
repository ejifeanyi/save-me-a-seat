import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { screenStyles } from '../../../lib/screenStyles';
import { changePassword } from '../../../lib/profile';
import { PasswordField } from '../../../components/PasswordField';

export default function ChangePassword() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate() {
    setError(null);
    if (next.length < 6) return setError('New password must be at least 6 characters');
    if (next !== confirm) return setError('Passwords do not match');

    setSaving(true);
    try {
      await changePassword(current, next);
      router.back();
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={screenStyles.container} edges={['top', 'bottom']}>
      <View style={{ gap: 12, flex: 1 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={screenStyles.backLink}>← Profile</Text>
        </Pressable>

        <View style={{ gap: 2 }}>
          <Text style={screenStyles.h1}>Change Password</Text>
          <Text style={screenStyles.subtitle}>Use a strong password you don't use elsewhere</Text>
        </View>

        <View style={{ gap: 6 }}>
          <Text style={screenStyles.fieldLabel}>CURRENT PASSWORD</Text>
          <PasswordField value={current} onChangeText={setCurrent} />
        </View>

        <View style={{ gap: 6 }}>
          <Text style={screenStyles.fieldLabel}>NEW PASSWORD</Text>
          <PasswordField value={next} onChangeText={setNext} />
        </View>

        <View style={{ gap: 6 }}>
          <Text style={screenStyles.fieldLabel}>CONFIRM NEW PASSWORD</Text>
          <PasswordField value={confirm} onChangeText={setConfirm} />
        </View>

        {error && <Text style={screenStyles.error}>{error}</Text>}

        <View style={{ flex: 1 }} />

        <Pressable style={screenStyles.primaryButton} onPress={handleUpdate} disabled={saving}>
          <Text style={screenStyles.primaryButtonLabel}>{saving ? 'Updating...' : 'Update Password'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}