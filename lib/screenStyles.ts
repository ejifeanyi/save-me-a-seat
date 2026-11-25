import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from './theme';

export const screenStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  backLink: { fontFamily: 'Inter_400Regular', fontSize: 15, color: colors.textSecondary },
  h1: { fontFamily: 'Inter_700Bold', fontSize: 24, lineHeight: 30, color: colors.textPrimary },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22, color: colors.textSecondary },
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
  },
  primaryButton: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: spacing.lg, alignItems: 'center' },
  primaryButtonLabel: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#fff' },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  secondaryButtonLabel: { fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textPrimary },
  error: { color: colors.error, fontFamily: 'Inter_400Regular', fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});