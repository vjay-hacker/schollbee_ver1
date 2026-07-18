import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppSelector } from '../src/store/hooks';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check authentication and route to the appropriate dashboard
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace('/(auth)/login');
      } else {
        switch (role) {
          case 'parent':
            router.replace('/(parent)/(tabs)/dashboard');
            break;
          case 'teacher':
            router.replace('/(teacher)/(tabs)/dashboard');
            break;
          case 'driver':
            router.replace('/(driver)/(tabs)/dashboard');
            break;
          default:
            router.replace('/(auth)/login');
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, role]);

  return (
    <View className="flex-1 justify-center items-center bg-[#0F0F23]">
      <ActivityIndicator size="large" color="#6C5CE7" />
    </View>
  );
}
