import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function LeaveRequestScreen() {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = () => {
    if (!reason || !startDate || !endDate) {
      Alert.alert('Error', 'Please fill in all the required fields');
      return;
    }

    Alert.alert('Success', 'Leave request submitted successfully', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-[#0F0F23] px-4 pt-12">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-[#1A1A3E] rounded-full border border-[#25254B]">
          <ChevronLeft color="#FFFFFF" size={20} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Request Student Leave</Text>
      </View>

      <View className="bg-[#1A1A3E] p-6 rounded-3xl border border-[#25254B]">
        <View className="mb-4">
          <Text className="text-gray-300 text-xs font-semibold mb-2">Start Date (YYYY-MM-DD)</Text>
          <TextInput
            placeholder="2026-07-20"
            placeholderTextColor="#505070"
            value={startDate}
            onChangeText={setStartDate}
            className="bg-[#0F0F23] border border-[#25254B] rounded-xl px-4 py-3 text-white text-sm"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-300 text-xs font-semibold mb-2">End Date (YYYY-MM-DD)</Text>
          <TextInput
            placeholder="2026-07-21"
            placeholderTextColor="#505070"
            value={endDate}
            onChangeText={setEndDate}
            className="bg-[#0F0F23] border border-[#25254B] rounded-xl px-4 py-3 text-white text-sm"
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-300 text-xs font-semibold mb-2">Reason for Leave</Text>
          <TextInput
            placeholder="State the reason clearly (e.g. Family function, sick leave)"
            placeholderTextColor="#505070"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            className="bg-[#0F0F23] border border-[#25254B] rounded-xl px-4 py-3 text-white text-sm h-32"
          />
        </View>

        <TouchableOpacity onPress={handleSubmit} className="bg-[#6C5CE7] rounded-xl py-4 items-center">
          <Text className="text-white font-bold text-sm">Submit Request</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
