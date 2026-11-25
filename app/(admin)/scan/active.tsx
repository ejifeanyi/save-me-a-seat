import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scanGuestCode } from '../../../lib/scan';
import { screenStyles } from '../../../lib/screenStyles';
import { colors, spacing, type } from '../../../lib/theme';

export default function ScanActive() {
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);
  // A ref (not state) so a burst of camera callbacks can't start two scans.
  const busy = useRef(false);

  // Re-arm the scanner every time this screen comes back into focus (e.g. after the result screen).
  useFocusEffect(
    useCallback(() => {
      busy.current = false;
      setError(null);
    }, [])
  );

  async function handleScanned({ data }: { data: string }) {
    if (busy.current) return;
    busy.current = true;
    setError(null);
    try {
      const res = await scanGuestCode(data);
      router.push({
        pathname: '/(admin)/scan/result',
        params: { result: JSON.stringify(res), code: data },
      });
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
      setTimeout(() => {
        busy.current = false;
      }, 1500);
    }
  }

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.permissionIconCircle}>
          <Ionicons name="scan-outline" size={36} color={colors.primary} />
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={type.h1}>Camera Access Needed</Text>
          <Text style={[type.bodyRegular, { textAlign: 'center', width: 320 }]}>
            Save Me A Seat uses your camera to scan guest QR codes at the door. We don&apos;t store or share any photos.
          </Text>
        </View>
        <Pressable style={[screenStyles.primaryButton, styles.fullWidth]} onPress={requestPermission}>
          <Text style={screenStyles.primaryButtonLabel}>Allow Camera Access</Text>
        </Pressable>
        <Pressable style={[screenStyles.secondaryButton, styles.fullWidth]} onPress={() => router.back()}>
          <Text style={screenStyles.secondaryButtonLabel}>Not Now</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.cameraScreen}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleScanned}
      />
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']} pointerEvents="box-none">
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.overlayLink}>✕  Close</Text>
        </Pressable>

        <View style={{ flex: 1 }} pointerEvents="none" />

        {error && <Text style={styles.overlayError}>{error}</Text>}
        <Text style={styles.overlayHint}>Point the camera at the guest&apos;s QR code</Text>
        <Pressable style={screenStyles.secondaryButton} onPress={() => router.push('/(admin)/scan/manual-entry')}>
          <Text style={screenStyles.secondaryButtonLabel}>Enter code manually</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraScreen: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg, gap: spacing.md },
  overlayLink: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#fff' },
  overlayHint: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#fff', textAlign: 'center' },
  overlayError: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#fff', textAlign: 'center', backgroundColor: colors.error, borderRadius: 8, padding: spacing.md },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: spacing.xl,
  },
  permissionIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { width: '100%' },
});
