import { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { colors, type, radius, spacing } from '../../lib/theme';
import { useGuestSession } from '../../lib/store/guestSession';

function formatCode(code: string) {
  return code.match(/.{1,4}/g)?.join(' ') ?? code;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatFullDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function GuestPass() {
  const { event } = useGuestSession();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (!event) router.replace('/(guest)');
  }, [event]);

  if (!event) return null;

  const now = new Date();
  const hasEnded = event.eventStatus === 'ended' || now > new Date(event.endsAt);
  const hasStarted = now >= new Date(event.startsAt);
  const showPlaceholder = !event.invitationUrl || imageFailed;

  if (hasEnded) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top', 'bottom']}>
        <View style={styles.endedIcon}>
          <Text style={{ fontSize: 24 }}>⏱</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={[type.h1, styles.center]}>This event has ended</Text>
          <Text style={[type.bodyRegular, styles.center, { width: 300 }]}>
            {event.eventName} took place on {formatFullDate(event.startsAt)}. Your QR pass is no longer active.
          </Text>
        </View>
        <View style={styles.thanksCard}>
          <Text style={[type.bodyMediumPrimary, { color: colors.textSecondary }]}>Thank you for celebrating with us</Text>
          {event.description ? (
            <Text style={[type.caption, { color: colors.textSecondary }]}>— {event.description}</Text>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {showPlaceholder ? (
        <View style={[styles.invitationImage, styles.invitationPlaceholder]}>
          <Text style={[type.bodyRegular, styles.center]}>
            {event.invitationUrl ? "Couldn't load the invitation image" : "Your host hasn't uploaded an invitation yet"}
          </Text>
        </View>
      ) : (
        <Image
          source={{ uri: event.invitationUrl! }}
          style={styles.invitationImage}
          resizeMode="cover"
          onError={() => setImageFailed(true)}
        />
      )}

      <View style={{ alignItems: 'center', gap: 4 }}>
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textPrimary }}>
          {event.venue} · {formatDateTime(event.startsAt)}
        </Text>
        <Text style={type.caption}>Guest pass</Text>
      </View>

      <View style={styles.qrCard}>
        <QRCode value={event.code} size={180} color={colors.textPrimary} backgroundColor={colors.surface} />
        <Text style={[type.caption, styles.center]}>Hold steady for the admin to scan</Text>
        {!hasStarted && (
          <Text style={[type.labelSmall, { color: colors.primary, textTransform: 'none', letterSpacing: 0 }]}>
            Scannable from {formatDateTime(event.startsAt)} on event day
          </Text>
        )}
      </View>

      <Text style={[type.caption, styles.center]}>Code: {formatCode(event.code)}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  centered: { justifyContent: 'center', gap: spacing.lg },
  center: { textAlign: 'center' },
  invitationImage: { width: 342, height: 420, borderRadius: 24, backgroundColor: '#1b1538' },
  invitationPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrCard: {
    width: 342,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  endedIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thanksCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    opacity: 0.7,
  },
});