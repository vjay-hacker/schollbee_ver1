import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Users, Award, BookOpen } from 'lucide-react-native';

export default function TeacherDashboard() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-[#0F0F23] px-4 pt-12">
      <View className="mb-6">
        <Text className="text-gray-400 text-xs font-semibold">TEACHER PORTAL</Text>
        <Text className="text-white text-2xl font-bold">Mrs. Sarah Jenkins</Text>
      </View>

      {/* Class summary card */}
      <View className="bg-[#1A1A3E] p-6 rounded-3xl mb-6 border border-[#25254B]">
        <Text className="text-[#00CEC9] text-xs font-bold uppercase tracking-wider">Primary Class</Text>
        <Text className="text-white text-xl font-bold mt-1">Class 5-A Overview</Text>
        
        <View className="flex-row justify-between mt-6 border-t border-[#25254B] pt-4">
          <View className="items-center">
            <Text className="text-gray-400 text-xs">Total Students</Text>
            <Text className="text-white text-lg font-bold mt-1">32</Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-400 text-xs">Present Today</Text>
            <Text className="text-[#00B894] text-lg font-bold mt-1">29</Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-400 text-xs">Pending Tasks</Text>
            <Text className="text-[#FD79A8] text-lg font-bold mt-1">3</Text>
          </View>
        </View>
      </View>

      {/* Quick Action Grid */}
      <Text className="text-white text-sm font-bold mb-4">Class Management</Text>
      <View className="flex-row justify-between mb-6">
        <TouchableOpacity
          onPress={() => router.push('/(teacher)/mark-attendance')}
          className="bg-[#1A1A3E] w-[48%] p-5 rounded-2xl border border-[#25254B] items-center"
        >
          <Calendar color="#00CEC9" size={28} className="mb-2" />
          <Text className="text-white text-xs font-bold">Mark Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(teacher)/(tabs)/students')}
          className="bg-[#1A1A3E] w-[48%] p-5 rounded-2xl border border-[#25254B] items-center"
        >
          <Users color="#6C5CE7" size={28} className="mb-2" />
          <Text className="text-white text-xs font-bold">Students Roster</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
