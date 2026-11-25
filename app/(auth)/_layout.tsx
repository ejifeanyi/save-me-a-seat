import { Stack } from 'expo-router';

export const unstable_settings = {
  anchor: 'log-in',
};

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
