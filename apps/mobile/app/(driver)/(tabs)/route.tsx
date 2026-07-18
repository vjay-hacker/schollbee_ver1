import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function DriverRouteTab() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#0F0F23] px-4 pt-12 justify-center items-center">
      <Text className="text-white text-lg font-bold">Driver Route View</Text>
      <Text className="text-gray-400 text-xs mt-2 mb-6">Start trip to see route stops</Text>
      <TouchableOpacity
        onPress={() => router.push('/(driver)/start-route')}
        className="bg-[#FD79A8] px-6 py-3 rounded-full"
      >
        <Text className="text-white font-bold text-sm">Launch Navigation</Text>
      </TouchableOpacity>
    </View>
  );
}
