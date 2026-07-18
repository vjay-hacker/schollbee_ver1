import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, BookOpen, Route, Trophy, ChefHat, Heart, Settings, LogOut, Sparkles } from 'lucide-react-native';

const QUICK_ACTIONS = [
  { label: 'Attendance', icon: Calendar, color: '#6C5CE7', path: '/(parent)/attendance' },
  { label: 'Homework', icon: BookOpen, color: '#00CEC9', path: '/(parent)/homework' },
  { label: 'Grades', icon: Trophy, color: '#FD79A8', path: '/(parent)/grades' },
  { label: 'Leave Req', icon: Settings, path: '/(parent)/leave-request', color: '#FDCB6E' },
  { label: 'Food Log', icon: ChefHat, path: '/(parent)/food', color: '#FD79A8' },
  { label: 'Health Status', icon: Heart, path: '/(parent)/health', color: '#E17055' },
  { label: 'AI Assistant', icon: Sparkles, path: '/(parent)/ai-assistant', color: '#00CEC9' },
];


export default function ParentDashboard() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-[#0F0F23] px-4 pt-12">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-gray-400 text-xs font-semibold">WELCOME BACK</Text>
          <Text className="text-white text-2xl font-bold">Mr. Vjay</Text>
        </View>
        <TouchableOpacity className="bg-[#1A1A3E] px-4 py-2 rounded-full border border-[#25254B]">
          <Text className="text-[#00CEC9] text-xs font-bold">Child: Alice</Text>
        </TouchableOpacity>
      </View>

      {/* Children Overview Card */}
      <View className="bg-[#1A1A3E] p-6 rounded-3xl mb-6 border border-[#25254B]">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-lg font-bold">Alice Doe</Text>
            <Text className="text-gray-400 text-xs mt-1">Class 5-A | Admission No: SB1029</Text>
          </View>
          <View className="bg-[#00B894] px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">At Campus</Text>
          </View>
        </View>
        <View className="border-t border-[#25254B] mt-4 pt-4 flex-row justify-between">
          <View>
            <Text className="text-gray-400 text-xs">Today's Attendance</Text>
            <Text className="text-white text-sm font-semibold mt-1">Present (9:02 AM)</Text>
          </View>
          <View>
            <Text className="text-gray-400 text-xs">Bus Route</Text>
            <Text className="text-white text-sm font-semibold mt-1">Route 12 - Departed</Text>
          </View>
        </View>
      </View>

      {/* Quick Action Grid */}
      <Text className="text-white text-sm font-bold mb-4">Quick Actions</Text>
      <View className="flex-row flex-wrap justify-between mb-6">
        {QUICK_ACTIONS.map((action, index) => {
          const Icon = action.icon;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(action.path as any)}
              className="bg-[#1A1A3E] w-[48%] p-4 rounded-2xl mb-4 border border-[#25254B] flex-row items-center"
            >
              <View className="p-2 rounded-lg mr-3" style={{ backgroundColor: `${action.color}20` }}>
                <Icon color={action.color} size={20} />
              </View>
              <Text className="text-white text-xs font-semibold">{action.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Timeline */}
      <Text className="text-white text-sm font-bold mb-4">Today's Timeline</Text>
      <View className="bg-[#1A1A3E] p-4 rounded-3xl border border-[#25254B] mb-12">
        <View className="flex-row mb-4">
          <View className="items-center mr-4">
            <View className="w-3 h-3 rounded-full bg-[#00B894]" />
            <View className="w-0.5 h-12 bg-[#25254B]" />
          </View>
          <View>
            <Text className="text-white text-sm font-bold">Entered School Campus</Text>
            <Text className="text-gray-400 text-xs mt-1">9:02 AM - Marked Present by system gateway</Text>
          </View>
        </View>

        <View className="flex-row">
          <View className="items-center mr-4">
            <View className="w-3 h-3 rounded-full bg-[#6C5CE7]" />
          </View>
          <View>
            <Text className="text-white text-sm font-bold">Boarded Morning School Bus</Text>
            <Text className="text-gray-400 text-xs mt-1">8:15 AM - Scanned by Driver on Route 12</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
