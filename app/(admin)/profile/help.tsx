import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { screenStyles } from '../../../lib/screenStyles';
import { colors } from '../../../lib/theme';

const FAQS = [
  {
    q: 'How do guest codes work?',
    a: 'Each guest gets a unique 12-character code from the event admin. Entering it unlocks their QR pass and invitation — no sign-up needed.',
  },
  {
    q: 'Can I raise the guest cap after creating an event?',
    a: "No — the guest cap is locked in when you create the event and can't be changed afterward, even by the super admin.",
  },
  {
    q: 'What happens if I delete an event?',
    a: 'All guest codes, invitations, and check-in history for that event are permanently removed. This cannot be undone.',
  },
  {
    q: 'How do I remove an admin?',
    a: "Open the event's Manage Admins screen, then long-press that admin's row and confirm removal. They lose access immediately.",
  },
];

export default function HelpSupport() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <SafeAreaView style={screenStyles.container} edges={['top', 'bottom']}>
      <View style={{ gap: 12, flex: 1 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={screenStyles.backLink}>← Profile</Text>
        </Pressable>

        <View style={{ gap: 2 }}>
          <Text style={screenStyles.h1}>Help & Support</Text>
          <Text style={screenStyles.subtitle}>Answers and ways to reach us</Text>
        </View>

        <Text style={screenStyles.fieldLabel}>FREQUENTLY ASKED</Text>

        {FAQS.map((faq, i) => (
          <View key={faq.q}>
            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}
              onPress={() => setExpanded(expanded === i ? null : i)}
            >
              <Ionicons name="help-circle-outline" size={20} color={colors.textPrimary} />
              <Text style={{ flex: 1, fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textPrimary }}>
                {faq.q}
              </Text>
              <Ionicons name={expanded === i ? 'chevron-down' : 'chevron-forward'} size={16} color={colors.textSecondary} />
            </Pressable>
            {expanded === i && (
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary, paddingLeft: 32, paddingBottom: 12 }}>
                {faq.a}
              </Text>
            )}
          </View>
        ))}

        <Pressable
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}
          onPress={() => Linking.openURL('mailto:support@savemeaseat.app')}
        >
          <Ionicons name="mail-outline" size={20} color={colors.textPrimary} />
          <Text style={{ flex: 1, fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textPrimary }}>
            Email support
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </Pressable>

        <View style={{ flex: 1 }} />
        <Text style={{ ...screenStyles.subtitle, fontSize: 13, textAlign: 'center' }}>Save Me A Seat · v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}