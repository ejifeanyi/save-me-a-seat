import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scanGuestCode, type ScanResult } from '../../../lib/scan';

function formatTime(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

const STATUS_COPY: Record<string, string> = {
  not_found: 'Code Not Found',
  not_authorized: 'Not Authorized',
  event_ended: 'Event Has Ended',
  not_yet_started: 'Event Hasn\u2019t Started',
};

export default function ScanResults() {
  const params = useLocalSearchParams<{ result: string; code: string }>();
  const [result, setResult] = useState<ScanResult>(() => JSON.parse(params.result));
  const [overriding, setOverriding] = useState(false);

  const isAdmitted = result.result === 'admitted';
  const isAlreadyCheckedIn = result.result === 'already_checked_in';
  const backgroundColor = isAdmitted ? '#1e8e5a' : '#c8352e';

  async function handleOverride() {
    setOverriding(true);
    try {
      const updated = await scanGuestCode(params.code, true);
      setResult(updated);
    } finally {
      setOverriding(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.iconCircle}>
        <Ionicons name={isAdmitted ? 'checkmark' : 'close'} size={48} color="#fff" />
      </View>

      <Text style={styles.title}>
        {isAdmitted ? 'Admitted' : isAlreadyCheckedIn ? 'Already Checked In' : STATUS_COPY[result.result] ?? 'Not Admitted'}
      </Text>

      {result.label && <Text style={styles.guestName}>{result.label}</Text>}

      {isAdmitted && (
        <Text style={styles.detail}>Checked in at {formatTime(result.checked_in_at)}</Text>
      )}
      {isAlreadyCheckedIn && (
        <Text style={styles.detail}>
          First scanned at {formatTime(result.first_scanned_at)}
          {result.first_scanned_by_name ? ` by ${result.first_scanned_by_name}` : ''}
        </Text>
      )}

      {isAdmitted && (
        <View style={styles.statChip}>
          <Text style={styles.statNumber}>
            {result.admitted_count} of {result.guest_cap}
          </Text>
          <Text style={styles.statLabel}>GUESTS ADMITTED</Text>
        </View>
      )}

      <View style={{ flex: 1 }} />

      {isAlreadyCheckedIn && (
        <View style={styles.overrideCard}>
          <Text style={styles.overrideTitle}>Is this a genuine re-entry?</Text>
          <Text style={styles.overrideSubtitle}>Overriding is logged with your name and the time</Text>
          <Pressable style={styles.overrideButton} onPress={handleOverride} disabled={overriding}>
            <Text style={styles.overrideButtonLabel}>{overriding ? 'Please wait...' : 'Override & Admit'}</Text>
          </Pressable>
        </View>
      )}

      <Pressable style={styles.continueButton} onPress={() => router.back()}>
        <Text style={styles.continueLabel}>Continue Scanning</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 24, paddingVertical: 32 },
  iconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Inter_700Bold', fontSize: 24, lineHeight: 30, color: '#fff', textAlign: 'center' },
  guestName: { fontFamily: 'Inter_500Medium', fontSize: 15, lineHeight: 22, color: '#fff', textAlign: 'center' },
  detail: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18, color: '#fff', opacity: 0.85, textAlign: 'center' },
  statChip: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center' },
  statNumber: { fontFamily: 'Inter_600SemiBold', fontSize: 18, lineHeight: 24, color: '#fff' },
  statLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, lineHeight: 16, letterSpacing: 0.48, color: '#fff' },
  overrideCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', gap: 10, width: '100%' },
  overrideTitle: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#1c1b1a', textAlign: 'center' },
  overrideSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#716e67', textAlign: 'center' },
  overrideButton: { backgroundColor: '#c8352e', borderRadius: 999, paddingVertical: 12, paddingHorizontal: 24, width: '100%', alignItems: 'center' },
  overrideButtonLabel: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#fff' },
  continueButton: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingVertical: 16, paddingHorizontal: 24, width: '100%', alignItems: 'center' },
  continueLabel: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#fff' },
});