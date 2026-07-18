import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { logout } from '../../../src/store/slices/authSlice';
import { User, LogOut } from 'lucide-react-native';

export default function TeacherProfileTab() {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 bg-[#0F0F23] px-4 pt-12 items-center justify-center">
      <View className="w-24 h-24 bg-[#00CEC9] rounded-full justify-center items-center mb-4">
        <User color="#0F0F23" size={48} />
      </View>
      <Text className="text-white text-xl font-bold">Sarah Jenkins</Text>
      <Text className="text-gray-400 text-xs mt-1 mb-8">sarah.jenkins@schoolbee.com</Text>

      <TouchableOpacity onPress={handleLogout} className="bg-[#1A1A3E] px-8 py-3 rounded-full border border-[#25254B] flex-row items-center">
        <LogOut color="#E17055" size={18} className="mr-2" />
        <Text className="text-[#E17055] font-bold text-sm">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
