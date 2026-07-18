import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Coffee, Utensils, Apple } from 'lucide-react-native';

const FOOD_LOGS = [
  { id: '1', date: 'July 18, 2026', breakfast: 'Taken (Milk & Oats)', lunch: 'Taken (Pasta)', snack: 'Taken (Banana)', statusColor: '#00B894' },
  { id: '2', date: 'July 17, 2026', breakfast: 'Taken (Cereal)', lunch: 'Taken (Fried Rice)', snack: 'Not Taken', statusColor: '#FDCB6E' },
  { id: '3', date: 'July 16, 2026', breakfast: 'Taken (Egg & Toast)', lunch: 'Taken (Salad)', snack: 'Taken (Apple)', statusColor: '#00B894' },
];

export default function FoodStatusScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#0F0F23] px-4 pt-12">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-[#1A1A3E] rounded-full border border-[#25254B]">
          <ChevronLeft color="#FFFFFF" size={20} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Food Tracking</Text>
      </View>

      <FlatList
        data={FOOD_LOGS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-[#1A1A3E] p-5 rounded-3xl mb-4 border border-[#25254B]">
            <Text className="text-[#00CEC9] text-xs font-bold mb-3">{item.date}</Text>
            
            <View className="flex-row justify-between mb-2">
              <View className="flex-row items-center">
                <Coffee color="#A0A0C0" size={16} className="mr-2" />
                <Text className="text-gray-300 text-xs">Breakfast</Text>
              </View>
              <Text className="text-white text-xs font-semibold">{item.breakfast}</Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <View className="flex-row items-center">
                <Utensils color="#A0A0C0" size={16} className="mr-2" />
                <Text className="text-gray-300 text-xs">Lunch</Text>
              </View>
              <Text className="text-white text-xs font-semibold">{item.lunch}</Text>
            </View>

            <View className="flex-row justify-between">
              <View className="flex-row items-center">
                <Apple color="#A0A0C0" size={16} className="mr-2" />
                <Text className="text-gray-300 text-xs">Snack</Text>
              </View>
              <Text className="text-white text-xs font-semibold">{item.snack}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
