import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const STUDENTS = [
  { id: '1', name: 'Alice Doe', admission: 'SB1029', status: 'Present' },
  { id: '2', name: 'Bob Smith', admission: 'SB1030', status: 'Present' },
  { id: '3', name: 'Charlie Brown', admission: 'SB1031', status: 'Absent' },
];

export default function TeacherStudentsTab() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#0F0F23] px-4 pt-12">
      <View className="mb-6">
        <Text className="text-gray-400 text-xs font-semibold">CLASS 5-A ROSTER</Text>
        <Text className="text-white text-2xl font-bold">Students Directory</Text>
      </View>

      <FlatList
        data={STUDENTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/(teacher)/student-detail', params: { id: item.id } })}
            className="bg-[#1A1A3E] p-4 rounded-2xl mb-3 border border-[#25254B] flex-row justify-between items-center"
          >
            <View>
              <Text className="text-white font-bold text-sm">{item.name}</Text>
              <Text className="text-gray-400 text-xs mt-1">Roll No: {item.admission}</Text>
            </View>
            <Text className="text-gray-400 text-xs">View Details</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
