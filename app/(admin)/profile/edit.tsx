import { useCallback, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../lib/theme';
import { screenStyles } from '../../../lib/screenStyles';
import { getProfileData, updateProfileName } from '../../../lib/profile';

function initials(fullName: string) {
  return fullName.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
}

export default function EditProfile() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getProfileData().then((p) => {
        setFullName(p.full_name);
        setEmail(p.email);
        setLoading(false);
      });
    }, [])
  );

  async function handleSave() {
    setError(null);
    if (!fullName.trim()) return setError('Name is required');
    setSaving(true);
    try {
      await updateProfileName(fullName);
      router.back();
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[screenStyles.container, { justifyContent: 'center', alignItems: 'center' }]} edges={['top', 'bottom']}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={screenStyles.container} edges={['top', 'bottom']}>
      <View style={{ gap: 12, flex: 1 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={screenStyles.backLink}>← Profile</Text>
        </Pressable>

        <View style={{ gap: 2 }}>
          <Text style={screenStyles.h1}>Edit Profile</Text>
          <Text style={screenStyles.subtitle}>Update your name and contact details</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View style={styles.avatar}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: colors.primary }}>
              {initials(fullName)}
            </Text>
          </View>
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.primary }}>Change photo</Text>
        </View>

        <View style={{ gap: 6 }}>
          <Text style={screenStyles.fieldLabel}>FULL NAME</Text>
          <TextInput style={screenStyles.input} value={fullName} onChangeText={setFullName} />
        </View>

        <View style={{ gap: 6 }}>
          <Text style={screenStyles.fieldLabel}>EMAIL</Text>
          <View style={[screenStyles.input, { opacity: 0.6 }]}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: colors.textSecondary }}>{email}</Text>
          </View>
        </View>

        {error && <Text style={screenStyles.error}>{error}</Text>}

        <View style={{ flex: 1 }} />

        <Pressable style={screenStyles.primaryButton} onPress={handleSave} disabled={saving}>
          <Text style={screenStyles.primaryButtonLabel}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 56, height: 56, borderRadius: 999, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
});