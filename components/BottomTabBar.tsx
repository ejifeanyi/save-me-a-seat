import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, type } from '../lib/theme';

const TABS = [
  { key: 'events', label: 'EVENTS', icon: 'calendar-outline' as const, route: '/(admin)/events' },
  { key: 'scan', label: 'SCAN', icon: 'scan-outline' as const, route: '/(admin)/scan' },
  { key: 'profile', label: 'PROFILE', icon: 'person-outline' as const, route: '/(admin)/profile' },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const active = pathname.startsWith(`/${tab.key}`) || pathname.includes(`/${tab.key}`);
        const color = active ? colors.primary : colors.textSecondary;
        return (
          <Pressable key={tab.key} style={styles.tab} onPress={() => router.replace(tab.route as any)}>
            <Ionicons name={tab.icon} size={22} color={color} />
            <Text style={[type.labelSmall, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 80,
    paddingHorizontal: 32,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  tab: { alignItems: 'center', gap: 2 },
});