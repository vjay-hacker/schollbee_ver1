import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, ChevronLeft } from 'lucide-react-native';

const ATTENDANCE_HISTORY = [
  { date: 'July 18, 2026', status: 'Present', time: '9:02 AM', statusColor: '#00B894' },
  { date: 'July 17, 2026', status: 'Present', time: '8:58 AM', statusColor: '#00B894' },
  { date: 'July 16, 2026', status: 'Present', time: '9:05 AM', statusColor: '#00B894' },
  { date: 'July 15, 2026', status: 'Late', time: '9:25 AM', statusColor: '#FDCB6E' },
  { date: 'July 14, 2026', status: 'Present', time: '8:59 AM', statusColor: '#00B894' },
  { date: 'July 13, 2026', status: 'Absent', time: '-', statusColor: '#E17055' },
];

export default function AttendanceScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#0F0F23] px-4 pt-12">
      {/* Navbar header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-[#1A1A3E] rounded-full border border-[#25254B]">
          <ChevronLeft color="#FFFFFF" size={20} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Attendance History</Text>
      </View>

      {/* Top metrics summary */}
      <View className="bg-[#1A1A3E] p-6 rounded-3xl mb-6 border border-[#25254B] flex-row justify-around">
        <View className="items-center">
          <Text className="text-gray-400 text-xs">Total Days</Text>
          <Text className="text-white text-2xl font-bold mt-1">180</Text>
        </View>
        <View className="items-center">
          <Text className="text-gray-400 text-xs">Present</Text>
          <Text className="text-[#00B894] text-2xl font-bold mt-1">172</Text>
        </View>
        <View className="items-center">
          <Text className="text-gray-400 text-xs">Attendance %</Text>
          <Text className="text-[#00CEC9] text-2xl font-bold mt-1">95.5%</Text>
        </View>
      </View>

      {/* List logs */}
      <Text className="text-white text-sm font-bold mb-4">Past Sessions</Text>
      <FlatList
        data={ATTENDANCE_HISTORY}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View className="bg-[#1A1A3E] p-4 rounded-2xl mb-3 border border-[#25254B] flex-row justify-between items-center">
            <View>
              <Text className="text-white font-semibold text-sm">{item.date}</Text>
              <Text className="text-gray-400 text-xs mt-1">Arrived: {item.time}</Text>
            </View>
            <View className="px-3 py-1 rounded-full" style={{ backgroundColor: `${item.statusColor}20` }}>
              <Text className="text-xs font-bold" style={{ color: item.statusColor }}>{item.status}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
