import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/app/hooks/use.FrameWork.Ready';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(drawer-settings)" />
        <Stack.Screen name="not.found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
