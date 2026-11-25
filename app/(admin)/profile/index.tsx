import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBar } from '../../../components/BottomTabBar';
import { screenStyles } from '../../../lib/screenStyles';
import { useAuth } from '../../../lib/store/auth';
import { getProfileData, type ProfileData } from '../../../lib/profile';
import { colors, radius, spacing } from '../../../lib/theme';

const NAV_ITEMS = [
  { label: 'Edit profile', icon: 'pencil-outline' as const, route: '/(admin)/profile/edit' },
  { label: 'Change password', icon: 'lock-closed-outline' as const, route: '/(admin)/profile/change-password' },
  { label: 'Notifications', icon: 'notifications-outline' as const, route: '/(admin)/profile/notifications' },
  { label: 'Help & support', icon: 'help-circle-outline' as const, route: '/(admin)/profile/help' },
];

function initials(fullName: string) {
  return fullName.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
}

export default function Profile() {
  const { logOut } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getProfileData()
        .then(setProfile)
        .finally(() => setLoading(false));
    }, [])
  );

  async function handleLogOut() {
    setSigningOut(true);
    try {
      await logOut();
      router.replace('/(guest)');
    } finally {
      setSigningOut(false);
    }
  }

  if (loading || !profile) {
    return (
      <SafeAreaView style={[screenStyles.container, { justifyContent: 'center', alignItems: 'center' }]} edges={['top']}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={screenStyles.container} edges={['top']}>
      <View style={{ flex: 1, gap: spacing.lg }}>
        <Text style={screenStyles.h1}>Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: colors.primary }}>
              {initials(profile.full_name)}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textPrimary }}>
              {profile.full_name}
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary }}>
              {profile.email}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>SUPER ADMIN</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT</Text>

        {NAV_ITEMS.map((item) => (
          <Pressable key={item.label} style={screenStyles.row} onPress={() => router.push(item.route as any)}>
            <Ionicons name={item.icon} size={20} color={colors.textPrimary} />
            <Text style={{ flex: 1, fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textPrimary }}>
              {item.label}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </Pressable>
        ))}

        <View style={{ flex: 1 }} />

        <Pressable style={styles.logOutButton} onPress={handleLogOut} disabled={signingOut}>
          <Text style={styles.logOutLabel}>{signingOut ? 'Signing out...' : 'Log Out'}</Text>
        </Pressable>
      </View>

      <BottomTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  badge: { backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 2 },
  badgeLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 0.48, color: colors.primary },
  sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 0.48, color: colors.textSecondary },
  logOutButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  logOutLabel: { fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.error },
});