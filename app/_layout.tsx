// app/_layout.tsx
// Single stack layout — tidak ada (tabs), hanya 1 halaman utama

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#04080F" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
