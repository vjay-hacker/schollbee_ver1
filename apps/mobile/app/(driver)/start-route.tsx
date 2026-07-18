import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Compass } from 'lucide-react-native';

export default function StartRouteScreen() {
  const router = useRouter();
  const [isStarted, setIsStarted] = useState(false);

  const handleToggle = () => {
    if (isStarted) {
      Alert.alert('Trip Ended', 'Route trip completed successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      setIsStarted(true);
    }
  };

  return (
    <View className="flex-1 bg-[#0F0F23] px-4 pt-12">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-[#1A1A3E] rounded-full border border-[#25254B]">
          <ChevronLeft color="#FFFFFF" size={20} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Route 12 Navigation</Text>
      </View>

      <View className="flex-1 bg-[#1A1A3E] rounded-3xl p-6 border border-[#25254B] justify-center items-center">
        <Compass color={isStarted ? '#00B894' : '#FD79A8'} size={64} className="mb-4" />
        <Text className="text-white text-lg font-bold">{isStarted ? 'Trip In Progress...' : 'Trip Not Started'}</Text>
        <Text className="text-gray-400 text-xs mt-2 text-center leading-5 px-6">
          {isStarted ? 'Your live location is being shared with parents on the Route 12 list.' : 'Tap the button below to start sharing GPS and begin stops collection.'}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleToggle}
        className="my-6 rounded-2xl py-4 items-center"
        style={{ backgroundColor: isStarted ? '#E17055' : '#00B894' }}
      >
        <Text className="text-white font-bold text-sm">{isStarted ? 'End Trip Session' : 'Begin Trip Session'}</Text>
      </TouchableOpacity>
    </View>
  );
}
