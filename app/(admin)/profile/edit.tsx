import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProfileData, updateProfileName, uploadAvatar } from '../../../lib/profile';
import { screenStyles } from '../../../lib/screenStyles';
import { colors } from '../../../lib/theme';

function initials(fullName: string) {
  return fullName.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
}

export default function EditProfile() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getProfileData().then((p) => {
        setFullName(p.full_name);
        setEmail(p.email);
        setAvatarUrl(p.avatar_url);
        setLoading(false);
      });
    }, [])
  );

  async function handleChangePhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to change your profile photo.');
      return;
    }

   const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.7,
});
    if (result.canceled) return;

    setUploadingPhoto(true);
    setError(null);
    try {
      const newUrl = await uploadAvatar(result.assets[0].uri);
      setAvatarUrl(newUrl);
    } catch (e: any) {
      setError(e.message ?? 'Could not upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  }

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
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: colors.primary }}>
                {initials(fullName)}
              </Text>
            )}
          </View>
          <Pressable onPress={handleChangePhoto} disabled={uploadingPhoto}>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.primary }}>
              {uploadingPhoto ? 'Uploading...' : 'Change photo'}
            </Text>
          </Pressable>
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
  avatar: { width: 56, height: 56, borderRadius: 999, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: 56, height: 56 },
});