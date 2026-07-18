import React from 'react';
import { Stack } from 'expo-router';

export default function ParentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="attendance" />
      <Stack.Screen name="homework" />
      <Stack.Screen name="grades" />
      <Stack.Screen name="leave-request" />
    </Stack>
  );
}
