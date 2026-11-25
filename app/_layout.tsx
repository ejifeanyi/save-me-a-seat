import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../lib/store/auth';
import { restoreGuestSession, useGuestSession } from '../lib/store/guestSession';
import { colors } from '../lib/theme';

export default function RootLayout() {
  const { session, initializing: authInitializing } = useAuth();
  const { initializing: guestInitializing } = useGuestSession();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    restoreGuestSession();
  }, []);

  if (authInitializing || guestInitializing || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {session ? <Stack.Screen name="(admin)" /> : <Stack.Screen name="(guest)" />}
        <Stack.Screen name="(auth)" />
      </Stack>
    </SafeAreaProvider>
  );
}