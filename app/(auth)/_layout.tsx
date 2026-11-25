import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'log-in',
};

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
