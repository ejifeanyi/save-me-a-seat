import { useEffect, useState } from 'react';
import { View, Text, Switch, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { colors } from '../../../lib/theme';
import { screenStyles } from '../../../lib/screenStyles';

const KEY = 'notification_prefs_v1';

type Prefs = { guestCheckedIn: boolean; eventReminders: boolean; adminInvites: boolean; guestCapReached: boolean };
const DEFAULTS: Prefs = { guestCheckedIn: true, eventReminders: true, adminInvites: true, guestCapReached: false };

export default function Notifications() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  useEffect(() => {
    SecureStore.getItemAsync(KEY).then((raw) => {
      if (raw) setPrefs(JSON.parse(raw));
    });
  }, []);

  function toggle(key: keyof Prefs) {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    SecureStore.setItemAsync(KEY, JSON.stringify(updated));
  }

  const ROWS: { key: keyof Prefs; title: string; subtitle: string }[] = [
    { key: 'guestCheckedIn', title: 'Guest checked in', subtitle: 'Get notified each time a guest is scanned in' },
    { key: 'eventReminders', title: 'Event reminders', subtitle: 'Reminder 1 hour before an event starts' },
    { key: 'adminInvites', title: 'Admin invites', subtitle: "When you're invited to help manage an event" },
    { key: 'guestCapReached', title: 'Guest cap reached', subtitle: 'When an event hits its guest limit' },
  ];

  return (
    <SafeAreaView style={screenStyles.container} edges={['top', 'bottom']}>
      <View style={{ gap: 12, flex: 1 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={screenStyles.backLink}>← Profile</Text>
        </Pressable>

        <View style={{ gap: 2 }}>
          <Text style={screenStyles.h1}>Notifications</Text>
          <Text style={screenStyles.subtitle}>Choose what you want to be notified about</Text>
        </View>

        {ROWS.map((row) => (
          <View key={row.key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textPrimary }}>{row.title}</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary, width: 260 }}>
                {row.subtitle}
              </Text>
            </View>
            <Switch
              value={prefs[row.key]}
              onValueChange={() => toggle(row.key)}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor="#fff"
            />
          </View>
        ))}

        <View style={{ flex: 1 }} />
        <Text style={{ ...screenStyles.subtitle, fontSize: 13, textAlign: 'center' }}>Save Me A Seat · v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}