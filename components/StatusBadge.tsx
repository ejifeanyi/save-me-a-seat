import { StyleSheet, Text, View } from 'react-native';
import { colors, type } from '../lib/theme';

export function StatusBadge({ status }: { status: 'UPCOMING' | 'LIVE' | 'ENDED' }) {
  const isLive = status === 'LIVE';
  const bg = isLive ? colors.successSoft : colors.primarySoft;
  const fg = isLive ? colors.success : colors.primary;

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[type.labelSmall, { color: fg }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
});