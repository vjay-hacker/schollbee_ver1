import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, HeartPulse, Activity } from 'lucide-react-native';

const HEALTH_LOGS = [
  { id: '1', date: 'July 18, 2026', type: 'Nurse Visit', desc: 'Complained of slight headache. Rested 20 mins. Administered water.', severity: 'Minor', color: '#00B894' },
  { id: '2', date: 'July 15, 2026', type: 'Daily Check', desc: 'Temperature: 98.6 F. Normal active status.', severity: 'Normal', color: '#00CEC9' },
  { id: '3', date: 'July 10, 2026', type: 'First Aid', desc: 'Minor scrape on left knee during soccer playtime. Cleaned & bandaged.', severity: 'Minor', color: '#00B894' },
];

export default function HealthStatusScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#0F0F23] px-4 pt-12">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-[#1A1A3E] rounded-full border border-[#25254B]">
          <ChevronLeft color="#FFFFFF" size={20} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Health Status</Text>
      </View>

      <FlatList
        data={HEALTH_LOGS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-[#1A1A3E] p-5 rounded-3xl mb-4 border border-[#25254B] flex-row items-start">
            <View className="p-3 bg-[#E17055]20 rounded-2xl mr-4" style={{ backgroundColor: `${item.color}20` }}>
              <HeartPulse color={item.color} size={22} />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white font-bold text-sm">{item.type}</Text>
                <Text className="text-gray-400 text-xs">{item.date}</Text>
              </View>
              <Text className="text-gray-300 text-xs leading-5 mb-3">{item.desc}</Text>
              <View className="flex-row items-center">
                <Activity color={item.color} size={14} className="mr-1" />
                <Text className="text-xs font-semibold" style={{ color: item.color }}>Severity: {item.severity}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}
