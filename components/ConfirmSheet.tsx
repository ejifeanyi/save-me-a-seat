import { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../lib/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  icon: 'alert' | 'close' | 'delete';
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  confirming?: boolean;
  /** When set, the confirm button stays disabled until the user types this exact text. */
  requireTypedConfirmation?: string;
};

export function ConfirmSheet({
  visible,
  onClose,
  icon,
  title,
  body,
  confirmLabel,
  onConfirm,
  confirming = false,
  requireTypedConfirmation,
}: Props) {
  const [typed, setTyped] = useState('');
  useEffect(() => {
    if (!visible) setTyped('');
  }, [visible]);
  const locked = !!requireTypedConfirmation && typed !== requireTypedConfirmation;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.iconCircle}>
            {icon === 'close' ? (
              <Ionicons name="close" size={28} color={colors.error} />
            ) : (
              <Text style={styles.iconGlyph}>{icon === 'delete' ? '🗑' : '!'}</Text>
            )}
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>

          {requireTypedConfirmation && (
            <View style={{ width: '100%', gap: 6 }}>
              <Text style={styles.fieldLabel}>TYPE &quot;{requireTypedConfirmation}&quot; TO CONFIRM</Text>
              <TextInput
                style={styles.input}
                value={typed}
                onChangeText={setTyped}
                autoCapitalize="characters"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          )}

          <Pressable
            style={[styles.dangerButton, (locked || confirming) && { opacity: 0.5 }]}
            onPress={onConfirm}
            disabled={locked || confirming}
          >
            <Text style={styles.dangerButtonLabel}>{confirming ? 'Please wait...' : confirmLabel}</Text>
          </Pressable>

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonLabel}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.lg,
    width: '100%',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: { fontFamily: 'Inter_700Bold', fontSize: 24, color: colors.error },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 18, lineHeight: 24, color: colors.textPrimary, textAlign: 'center' },
  body: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22, color: colors.textSecondary, textAlign: 'center' },
  fieldLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.textPrimary,
    width: '100%',
  },
  dangerButton: { backgroundColor: colors.error, borderRadius: radius.pill, paddingVertical: spacing.lg, alignItems: 'center', width: '100%' },
  dangerButtonLabel: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#fff' },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    width: '100%',
  },
  cancelButtonLabel: { fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textPrimary },
});