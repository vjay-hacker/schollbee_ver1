import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { logout } from '../../../src/store/slices/authSlice';
import { Settings, LogOut, User, Lock } from 'lucide-react-native';

export default function ProfileTab() {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView className="flex-1 bg-[#0F0F23] px-4 pt-12">
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-[#6C5CE7] rounded-full justify-center items-center mb-4">
          <User color="#FFFFFF" size={48} />
        </View>
        <Text className="text-white text-xl font-bold">Vjay Doe</Text>
        <Text className="text-gray-400 text-xs mt-1">vjay@schoolbee.com</Text>
      </View>

      <View className="bg-[#1A1A3E] rounded-3xl p-4 border border-[#25254B] mb-6">
        <TouchableOpacity className="flex-row items-center justify-between p-3 border-b border-[#25254B]">
          <View className="flex-row items-center">
            <User color="#6C5CE7" size={20} className="mr-3" />
            <Text className="text-white text-sm">Account Settings</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-between p-3 border-b border-[#25254B]">
          <View className="flex-row items-center">
            <Lock color="#6C5CE7" size={20} className="mr-3" />
            <Text className="text-white text-sm">Change Password</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-between p-3">
          <View className="flex-row items-center">
            <LogOut color="#E17055" size={20} className="mr-3" />
            <Text className="text-[#E17055] text-sm">Sign Out</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
