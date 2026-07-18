import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../src/store/slices/authSlice';
import { UserRole } from '@schoolbee/shared-types';

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (role: UserRole) => {
    // Authenticate user mock configuration
    dispatch(setCredentials({
      token: 'mock-jwt-token',
      user: {
        id: '123',
        email: email || 'user@schoolbee.com',
        firstName: 'John',
        lastName: 'Doe',
        role: role,
      },
      role: role,
    }));

    if (role === UserRole.PARENT) router.replace('/(parent)/(tabs)/dashboard');
    if (role === UserRole.TEACHER) router.replace('/(teacher)/(tabs)/dashboard');
    if (role === UserRole.DRIVER) router.replace('/(driver)/(tabs)/dashboard');
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-[#0F0F23]">
      <View className="flex-1 justify-center px-6 py-12">
        <View className="items-center mb-8">
          <Text className="text-[#6C5CE7] text-4xl font-bold tracking-widest">SchoolBee</Text>
          <Text className="text-gray-400 text-sm mt-2">Enterprise School Management Platform</Text>
        </View>

        <View className="bg-[#1A1A3E] p-6 rounded-3xl border border-[#25254B]">
          <Text className="text-white text-2xl font-bold mb-6">Login to your account</Text>

          <View className="mb-4">
            <Text className="text-gray-300 text-xs font-semibold mb-2">Email Address</Text>
            <TextInput
              placeholder="name@school.com"
              placeholderTextColor="#505070"
              value={email}
              onChangeText={setEmail}
              className="bg-[#0F0F23] border border-[#25254B] rounded-xl px-4 py-3 text-white text-sm"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-300 text-xs font-semibold mb-2">Password</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#505070"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="bg-[#0F0F23] border border-[#25254B] rounded-xl px-4 py-3 text-white text-sm"
            />
          </View>

          <Text className="text-gray-400 text-xs font-semibold mb-4 text-center">LOGIN AS PORTAL ROLE:</Text>

          <View className="flex-row justify-between mb-4">
            <TouchableOpacity
              onPress={() => handleLogin(UserRole.PARENT)}
              className="flex-1 bg-[#6C5CE7] rounded-xl py-3 items-center mr-2"
            >
              <Text className="text-white text-xs font-bold">Parent App</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleLogin(UserRole.TEACHER)}
              className="flex-1 bg-[#00CEC9] rounded-xl py-3 items-center mx-1"
            >
              <Text className="text-white text-xs font-bold">Teacher App</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleLogin(UserRole.DRIVER)}
              className="flex-1 bg-[#FD79A8] rounded-xl py-3 items-center ml-2"
            >
              <Text className="text-white text-xs font-bold">Driver App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
