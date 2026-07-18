import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Compass, Navigation } from 'lucide-react-native';

export default function TrackingTab() {
  return (
    <View className="flex-1 bg-[#0F0F23] px-4 pt-12">
      <View className="mb-6">
        <Text className="text-gray-400 text-xs font-semibold">BUS GPS MONITORING</Text>
        <Text className="text-white text-2xl font-bold">Route 12 Tracking</Text>
      </View>

      {/* Map Mockup Component */}
      <View className="flex-1 bg-[#1A1A3E] rounded-3xl overflow-hidden border border-[#25254B] justify-center items-center relative mb-6">
        {/* Custom premium design element instead of Google Maps API during setup */}
        <View className="absolute top-4 left-4 right-4 bg-[#0F0F23] p-4 rounded-xl border border-[#25254B] flex-row justify-between items-center z-10">
          <View>
            <Text className="text-white text-xs font-bold">Estimated Arrival (ETA)</Text>
            <Text className="text-[#00CEC9] text-lg font-bold">12 Mins (2.4 miles away)</Text>
          </View>
          <Navigation color="#00CEC9" size={24} />
        </View>

        <Compass color="#6C5CE7" size={64} className="mb-4" />
        <Text className="text-white font-bold text-lg">GPS Live Feed Mockup</Text>
        <Text className="text-gray-400 text-xs mt-1">Stops: 4/12 Completed | Active Speed: 32mph</Text>
      </View>
    </View>
  );
}
