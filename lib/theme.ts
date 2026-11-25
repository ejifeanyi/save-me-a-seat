export const colors = {
  background: '#fafaf9',
  surface: '#ffffff',
  primary: '#423088',
  primarySoft: '#edeaf8',
  textPrimary: '#1c1b1a',
  textSecondary: '#716e67',
  textOnPrimary: '#ffffff',
  border: '#e6e2dc',
  error: '#d64545',
  danger: '#c8352e',
  success: '#1e8e5a',
  successSoft: '#e1f5ea',
};

export const radius = {
  sm: 10,
  md: 12,
  lg: 16,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const type = {
  h1: { fontFamily: 'Inter_700Bold', fontSize: 24, lineHeight: 30, color: colors.textPrimary },
  h2: { fontFamily: 'Inter_600SemiBold', fontSize: 18, lineHeight: 24, color: colors.textPrimary },
  bodyRegular: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  bodyMedium: { fontFamily: 'Inter_500Medium', fontSize: 15, lineHeight: 22, color: colors.textOnPrimary },
  bodyMediumPrimary: { fontFamily: 'Inter_500Medium', fontSize: 15, lineHeight: 22, color: colors.primary },
  labelSmall: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
  },
  caption: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18, color: colors.textSecondary },
};

export const LOGO_GLYPH = '✺';