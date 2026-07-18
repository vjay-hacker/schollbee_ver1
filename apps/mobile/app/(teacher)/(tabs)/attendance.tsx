import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function TeacherAttendanceTab() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#0F0F23] px-4 pt-12 justify-center items-center">
      <Text className="text-white text-lg font-bold">Attendance Tab</Text>
      <Text className="text-gray-400 text-xs mt-2 mb-6">Manage Class 5-A daily schedules</Text>
      <TouchableOpacity
        onPress={() => router.push('/(teacher)/mark-attendance')}
        className="bg-[#00CEC9] px-6 py-3 rounded-full"
      >
        <Text className="text-[#0F0F23] font-bold text-sm">Launch Session Marker</Text>
      </TouchableOpacity>
    </View>
  );
}
