import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, type } from '../../../lib/theme';

// Placeholder: the camera scanner for an event will live here.
export default function ScanActive() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Text style={type.h1}>Scanning</Text>
      <Text style={type.bodyRegular}>Event: {eventId}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.md },
});
