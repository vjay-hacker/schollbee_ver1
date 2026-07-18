import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, User } from 'lucide-react-native';

export default function StudentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <ScrollView className="flex-1 bg-[#0F0F23] px-4 pt-12">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-[#1A1A3E] rounded-full border border-[#25254B]">
          <ChevronLeft color="#FFFFFF" size={20} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Student Profile</Text>
      </View>

      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-[#00CEC9] rounded-full justify-center items-center mb-4">
          <User color="#0F0F23" size={48} />
        </View>
        <Text className="text-white text-xl font-bold">Alice Doe</Text>
        <Text className="text-gray-400 text-xs mt-1">Class 5-A | Admission No: SB1029</Text>
      </View>

      <View className="bg-[#1A1A3E] rounded-3xl p-6 border border-[#25254B] mb-6">
        <Text className="text-[#00CEC9] text-xs font-bold uppercase tracking-wider mb-4">Contact Info</Text>
        
        <View className="mb-4">
          <Text className="text-gray-400 text-xs">Primary Parent</Text>
          <Text className="text-white text-sm font-semibold mt-1">Vjay Doe (Father)</Text>
        </View>

        <View className="mb-4">
          <Text className="text-gray-400 text-xs">Emergency Phone</Text>
          <Text className="text-white text-sm font-semibold mt-1">+1 (555) 123-4567</Text>
        </View>

        <View>
          <Text className="text-gray-400 text-xs">Blood Group</Text>
          <Text className="text-[#FD79A8] text-sm font-semibold mt-1">O+</Text>
        </View>
      </View>
    </ScrollView>
  );
}
