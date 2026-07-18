import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Compass, Users, MapPin } from 'lucide-react-native';

export default function DriverDashboard() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-[#0F0F23] px-4 pt-12">
      <View className="mb-6">
        <Text className="text-gray-400 text-xs font-semibold">DRIVER PORTAL</Text>
        <Text className="text-white text-2xl font-bold">Mr. Michael Vance</Text>
      </View>

      {/* Trip Status Card */}
      <View className="bg-[#1A1A3E] p-6 rounded-3xl mb-6 border border-[#25254B]">
        <Text className="text-[#FD79A8] text-xs font-bold uppercase tracking-wider">Active Bus</Text>
        <Text className="text-white text-xl font-bold mt-1">Bus 12 (Plate: TX-9029)</Text>

        <View className="flex-row justify-between mt-6 border-t border-[#25254B] pt-4">
          <View className="items-center">
            <Text className="text-gray-400 text-xs">Assigned Route</Text>
            <Text className="text-white text-sm font-semibold mt-1">Route 12 (Northside)</Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-400 text-xs">Total Stops</Text>
            <Text className="text-white text-sm font-semibold mt-1">12 Stops</Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-400 text-xs">Expected Pupils</Text>
            <Text className="text-white text-sm font-semibold mt-1">18 Students</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => router.push('/(driver)/start-route')}
        className="bg-[#FD79A8] p-5 rounded-2xl items-center flex-row justify-center mb-6"
      >
        <Compass color="#FFFFFF" size={24} className="mr-2" />
        <Text className="text-white text-sm font-bold">Start Route Trip</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
