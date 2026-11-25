import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, type } from '../lib/theme';

export function NoConnectionScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="close" size={28} color={colors.error} />
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text style={type.h1}>No Internet Connection</Text>
        <Text style={[type.bodyRegular, { textAlign: 'center', width: 300 }]}>
          Check your connection and try again. Your progress hasn&apos;t been lost.
        </Text>
      </View>
      <Pressable style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonLabel}>Try Again</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  iconCircle: { width: 72, height: 72, borderRadius: 999, backgroundColor: colors.dangerSoft, alignItems: 'center', justifyContent: 'center' },
  button: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
  buttonLabel: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#fff' },
});
