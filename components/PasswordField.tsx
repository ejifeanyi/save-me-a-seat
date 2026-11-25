import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing, type } from '../lib/theme';

export function PasswordField({
  value,
  onChangeText,
  placeholder = '••••••••••',
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.box}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={!visible}
        autoCapitalize="none"
      />
      <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8}>
        <Text style={styles.toggle}>{visible ? 'Hide' : 'Show'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    width: '100%',
  },
  input: {
    flex: 1,
    ...type.bodyRegular,
    color: colors.textPrimary,
    padding: 0,
  },
  toggle: {
    ...type.caption,
    color: colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
});