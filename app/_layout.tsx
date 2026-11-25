import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../lib/store/auth';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const { session, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!session ? (
        <Stack.Screen name="(auth)" />
      ) : (
        <Stack.Screen name="(admin)" />
      )}
      <Stack.Screen name="(guest)" />
    </Stack>
  );
}