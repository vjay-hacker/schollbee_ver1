import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Send, Sparkles } from 'lucide-react-native';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export default function AiAssistantScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'ai', text: "Hello! I'm SchoolBee AI assistant. Ask me questions like:\n• 'Did my child eat lunch?'\n• 'Is the school bus arriving?'\n• 'Apply leave for tomorrow'" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Mock AI engine parsing triggers
    setTimeout(() => {
      let aiText = "I'm not sure how to assist with that. Try asking: 'Did my child attend school today?'";
      const p = input.toLowerCase();

      if (p.includes('eat') || p.includes('lunch') || p.includes('food')) {
        aiText = "🍔 Alice had her **Lunch** today. Status: **Taken** (12:15 PM). Menu: Pasta & apple slices.";
      } else if (p.includes('attend') || p.includes('present') || p.includes('absent')) {
        aiText = "📊 Checking records... Yes, Alice is **Present** today. Arrived at **9:02 AM**.";
      } else if (p.includes('bus') || p.includes('bus arriving') || p.includes('where is')) {
        aiText = "🚌 Route 12 morning bus is currently active. ETA: **7 mins** to drop-off stop.";
      } else if (p.includes('apply leave') || p.includes('leave for tomorrow')) {
        aiText = "✅ Leave request submitted successfully for Alice for tomorrow. You will receive a notification once the school admin reviews it.";
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: aiText }]);
      setLoading(false);
    }, 1200);
  };

  return (
    <View className="flex-grow flex-1 bg-[#0F0F23] pt-12">
      {/* Navbar */}
      <View className="flex-row items-center justify-between px-4 mb-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-[#1A1A3E] rounded-full border border-[#25254B]">
            <ChevronLeft color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">SchoolBee AI</Text>
        </View>
        <Sparkles color="#00CEC9" size={20} />
      </View>

      {/* Messages Feed */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        renderItem={({ item }) => (
          <View className={`mb-4 max-w-[80%] rounded-2xl p-4 ${item.sender === 'user' ? 'self-end bg-[#6C5CE7]' : 'self-start bg-[#1A1A3E] border border-[#25254B]'}`}>
            <Text className="text-white text-sm leading-5">{item.text}</Text>
          </View>
        )}
      />

      {loading && (
        <View className="flex-row items-center px-6 mb-4">
          <ActivityIndicator size="small" color="#00CEC9" className="mr-2" />
          <Text className="text-gray-400 text-xs">AI is typing...</Text>
        </View>
      )}

      {/* Input container */}
      <View className="p-4 bg-[#1A1A3E] border-t border-[#25254B] flex-row items-center">
        <TextInput
          placeholder="Ask AI e.g. Apply leave tomorrow..."
          placeholderTextColor="#505070"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          className="flex-grow bg-[#0F0F23] border border-[#25254B] rounded-xl px-4 py-3 text-white text-sm mr-3"
        />
        <TouchableOpacity onPress={handleSend} className="bg-[#6C5CE7] p-3 rounded-xl">
          <Send color="#FFFFFF" size={18} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
