import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Check, X, AlertTriangle } from 'lucide-react-native';

const INITIAL_ROSTER = [
  { id: '1', name: 'Alice Doe', status: 'present' },
  { id: '2', name: 'Bob Smith', status: 'present' },
  { id: '3', name: 'Charlie Brown', status: 'absent' },
];

export default function MarkAttendanceScreen() {
  const router = useRouter();
  const [roster, setRoster] = useState(INITIAL_ROSTER);

  const toggleStatus = (id: string, status: string) => {
    setRoster(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleSave = () => {
    Alert.alert('Success', 'Attendance session saved successfully', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View className="flex-1 bg-[#0F0F23] px-4 pt-12">
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-[#1A1A3E] rounded-full border border-[#25254B]">
            <ChevronLeft color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Mark Attendance</Text>
        </View>
        <TouchableOpacity onPress={handleSave} className="bg-[#00CEC9] px-4 py-2 rounded-full">
          <Text className="text-[#0F0F23] text-xs font-bold">Save All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={roster}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-[#1A1A3E] p-4 rounded-2xl mb-3 border border-[#25254B] flex-row justify-between items-center">
            <Text className="text-white font-semibold text-sm">{item.name}</Text>
            
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => toggleStatus(item.id, 'present')}
                className="w-10 h-10 rounded-full justify-center items-center mr-2"
                style={{ backgroundColor: item.status === 'present' ? '#00B894' : '#0F0F23' }}
              >
                <Check color={item.status === 'present' ? '#FFFFFF' : '#A0A0C0'} size={18} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => toggleStatus(item.id, 'absent')}
                className="w-10 h-10 rounded-full justify-center items-center mr-2"
                style={{ backgroundColor: item.status === 'absent' ? '#E17055' : '#0F0F23' }}
              >
                <X color={item.status === 'absent' ? '#FFFFFF' : '#A0A0C0'} size={18} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => toggleStatus(item.id, 'late')}
                className="w-10 h-10 rounded-full justify-center items-center"
                style={{ backgroundColor: item.status === 'late' ? '#FDCB6E' : '#0F0F23' }}
              >
                <AlertTriangle color={item.status === 'late' ? '#FFFFFF' : '#A0A0C0'} size={18} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
