import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Modal,
} from 'react-native';
import {
  Send,
  Search,
  Bell,
  MessageSquare,
  ChevronRight,
  Check,
  CheckCheck,
  BellRing,
  Users,
  X,
  Megaphone,
  AlertTriangle,
  Info,
} from 'lucide-react-native';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const CONVERSATIONS = [
  {
    id: 'c1',
    name: 'Mrs. Kavitha (Science)',
    role: 'Teacher',
    avatar: '👩‍🔬',
    lastMessage: 'Alice\'s science project is looking great! She\'s been very focused.',
    time: '2m ago',
    unread: 2,
    online: true,
  },
  {
    id: 'c2',
    name: 'Mr. Suresh (Math)',
    role: 'Teacher',
    avatar: '👨‍🏫',
    lastMessage: 'Please remind her to submit calculus exercises by tomorrow.',
    time: '1h ago',
    unread: 0,
    online: false,
  },
  {
    id: 'c3',
    name: 'Ms. Priya (English)',
    role: 'Teacher',
    avatar: '👩‍🏫',
    lastMessage: 'The sonnet analysis was well-written. Score: 22/25.',
    time: 'Yesterday',
    unread: 1,
    online: true,
  },
  {
    id: 'c4',
    name: 'School Administration',
    role: 'Admin',
    avatar: '🏫',
    lastMessage: 'Annual Day registration is now open. Deadline: Jul 30.',
    time: '2d ago',
    unread: 0,
    online: true,
  },
];

const CHAT_MESSAGES = {
  c1: [
    { id: 'm1', sender: 'other', text: 'Good morning! How is Alice doing at home with her science project?', time: '9:15 AM', read: true },
    { id: 'm2', sender: 'me', text: 'She\'s been working on it every day! Really passionate about the photosynthesis topic.', time: '9:22 AM', read: true },
    { id: 'm3', sender: 'other', text: 'That\'s wonderful to hear! She\'s been very attentive in class too.', time: '9:25 AM', read: true },
    { id: 'm4', sender: 'me', text: 'Thank you for encouraging her. We appreciate all your effort!', time: '9:30 AM', read: true },
    { id: 'm5', sender: 'other', text: 'Alice\'s science project is looking great! She\'s been very focused.', time: '10:47 AM', read: false },
    { id: 'm6', sender: 'other', text: 'Also, the assignment submission deadline is tomorrow at 4PM. Please remind her!', time: '10:48 AM', read: false },
  ],
  c2: [
    { id: 'm1', sender: 'other', text: 'Hi! Just wanted to check in about Alice\'s calculus progress.', time: 'Yesterday', read: true },
    { id: 'm2', sender: 'me', text: 'She says the exercises are challenging but she\'s working through them.', time: 'Yesterday', read: true },
    { id: 'm3', sender: 'other', text: 'Please remind her to submit calculus exercises by tomorrow.', time: '2h ago', read: true },
  ],
};

const CIRCULARS = [
  {
    id: 'n1',
    type: 'urgent',
    title: 'School Annual Day — Registration Open',
    preview: 'Annual Day celebrations are scheduled for August 15. Registrations are now open for all cultural events.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'info',
    title: 'Alice marked Present',
    preview: 'Attendance recorded successfully at 9:02 AM by Class Teacher Mrs. Kavitha. Route 12 arrival confirmed.',
    time: '3 hours ago',
    read: true,
  },
  {
    id: 'n3',
    type: 'warning',
    title: 'Science Homework Due Tomorrow',
    preview: 'Reminder: Photosynthesis Diagram assignment is due tomorrow at 4:00 PM. Please ensure it is submitted.',
    time: '1 day ago',
    read: true,
  },
  {
    id: 'n4',
    type: 'info',
    title: 'Bus Route 12 Trip Started',
    preview: 'The morning school bus trip has started. Estimated pickup in 15 minutes from your stop.',
    time: '1 day ago',
    read: true,
  },
  {
    id: 'n5',
    type: 'info',
    title: 'Parent-Teacher Meeting',
    preview: 'Quarterly PTM is scheduled for July 28, 2026 from 10:00 AM – 1:00 PM. Your slot: 11:30 AM.',
    time: '3 days ago',
    read: true,
  },
];

// ─── TAB BAR ─────────────────────────────────────────────────────────────────

type TabType = 'messages' | 'circulars';

function TabBar({ activeTab, onTabChange }: { activeTab: TabType; onTabChange: (t: TabType) => void }) {
  const TABS: { id: TabType; label: string; icon: any }[] = [
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'circulars', label: 'Circulars', icon: BellRing },
  ];

  return (
    <View className="flex-row px-5 gap-3 mb-4">
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl"
          style={{
            backgroundColor: activeTab === tab.id ? '#6C5CE7' : '#1A1A3E',
            borderWidth: 1,
            borderColor: activeTab === tab.id ? '#6C5CE7' : '#25254B',
          }}
        >
          <tab.icon size={16} color={activeTab === tab.id ? '#FFFFFF' : '#9D9DC7'} />
          <Text
            className="font-bold text-sm"
            style={{ color: activeTab === tab.id ? '#FFFFFF' : '#9D9DC7' }}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── CIRCULAR CARD ────────────────────────────────────────────────────────────

function circularTypeConfig(type: string) {
  if (type === 'urgent') return { color: '#FF7675', bg: '#FF767515', icon: AlertTriangle };
  if (type === 'warning') return { color: '#FDCB6E', bg: '#FDCB6E15', icon: Bell };
  return { color: '#6C5CE7', bg: '#6C5CE715', icon: Info };
}

function CircularCard({ item }: { item: typeof CIRCULARS[0] }) {
  const cfg = circularTypeConfig(item.type);
  const Icon = cfg.icon;

  return (
    <TouchableOpacity
      className="mb-3"
      style={{
        backgroundColor: '#1A1A3E',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: item.read ? '#25254B' : cfg.color + '40',
      }}
      activeOpacity={0.85}
    >
      <View className="flex-row items-start gap-3">
        <View
          className="w-10 h-10 rounded-2xl items-center justify-center shrink-0"
          style={{ backgroundColor: cfg.bg, borderWidth: 1, borderColor: cfg.color + '40' }}
        >
          <Icon size={18} color={cfg.color} />
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <Text
              className="font-bold text-sm flex-1 mr-3 leading-5"
              style={{ color: item.read ? '#CCCCCC' : '#FFFFFF' }}
            >
              {item.title}
            </Text>
            <View className="items-end">
              <Text className="text-gray-500 text-xs">{item.time}</Text>
              {!item.read && (
                <View
                  className="w-2 h-2 rounded-full mt-1 self-end"
                  style={{ backgroundColor: cfg.color }}
                />
              )}
            </View>
          </View>
          <Text className="text-gray-400 text-xs leading-5 mt-1.5" numberOfLines={2}>
            {item.preview}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── CHAT DETAIL MODAL ───────────────────────────────────────────────────────

function ChatDetailModal({
  visible,
  conversation,
  onClose,
}: {
  visible: boolean;
  conversation: typeof CONVERSATIONS[0] | null;
  onClose: () => void;
}) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const flatRef = useRef<FlatList>(null);
  const sendBounce = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (conversation) {
      setMessages((CHAT_MESSAGES as any)[conversation.id] || []);
    }
  }, [conversation]);

  const handleSend = useCallback(() => {
    if (!message.trim()) return;

    // Bounce animation
    Animated.sequence([
      Animated.timing(sendBounce, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.timing(sendBounce, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    const newMsg = {
      id: `m_${Date.now()}`,
      sender: 'me',
      text: message.trim(),
      time: 'Just now',
      read: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessage('');
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  }, [message]);

  if (!conversation) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#0F0F23' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View
          className="flex-row items-center px-5 pt-14 pb-4 border-b border-[#1A1A3E]"
          style={{ backgroundColor: '#0F0F23' }}
        >
          <TouchableOpacity onPress={onClose} className="mr-4 p-2 bg-[#1A1A3E] rounded-full">
            <X size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: '#1A1A3E' }}
          >
            <Text style={{ fontSize: 20 }}>{conversation.avatar}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold">{conversation.name}</Text>
            <View className="flex-row items-center gap-1.5">
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: conversation.online ? '#00B894' : '#555578' }}
              />
              <Text className="text-xs" style={{ color: conversation.online ? '#00B894' : '#9D9DC7' }}>
                {conversation.online ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
          <TouchableOpacity className="p-2 bg-[#1A1A3E] rounded-full">
            <Users size={18} color="#9D9DC7" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          onLayout={() => flatRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const isMe = item.sender === 'me';
            return (
              <View
                style={{
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    backgroundColor: isMe ? '#6C5CE7' : '#1A1A3E',
                    borderRadius: 18,
                    borderBottomRightRadius: isMe ? 4 : 18,
                    borderBottomLeftRadius: isMe ? 18 : 4,
                    padding: 12,
                    maxWidth: '80%',
                    borderWidth: isMe ? 0 : 1,
                    borderColor: '#25254B',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 14, lineHeight: 20 }}>{item.text}</Text>
                </View>
                <View
                  className="flex-row items-center gap-1 mt-1"
                  style={{ paddingRight: isMe ? 4 : 0, paddingLeft: isMe ? 0 : 4 }}
                >
                  <Text className="text-gray-600 text-xs">{item.time}</Text>
                  {isMe && (
                    item.read
                      ? <CheckCheck size={12} color="#6C5CE7" />
                      : <Check size={12} color="#555578" />
                  )}
                </View>
              </View>
            );
          }}
        />

        {/* Input */}
        <View
          className="px-4 py-3 flex-row items-end gap-3"
          style={{
            backgroundColor: '#0F0F23',
            borderTopWidth: 1,
            borderTopColor: '#1A1A3E',
            paddingBottom: Platform.OS === 'ios' ? 28 : 16,
          }}
        >
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor="#555578"
            multiline
            maxLength={500}
            style={{
              flex: 1,
              backgroundColor: '#1A1A3E',
              color: '#FFFFFF',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#25254B',
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 14,
              maxHeight: 100,
              lineHeight: 20,
            }}
          />
          <Animated.View style={{ transform: [{ scale: sendBounce }] }}>
            <TouchableOpacity
              onPress={handleSend}
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                backgroundColor: message.trim() ? '#6C5CE7' : '#25254B',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.8}
            >
              <Send size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── CONVERSATION LIST ITEM ───────────────────────────────────────────────────

function ConversationItem({
  item,
  onPress,
}: {
  item: typeof CONVERSATIONS[0];
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => onPress());
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 8 }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        className="flex-row items-center p-4 rounded-2xl"
        style={{
          backgroundColor: '#1A1A3E',
          borderWidth: 1,
          borderColor: item.unread > 0 ? '#6C5CE740' : '#25254B',
        }}
      >
        {/* Avatar */}
        <View className="relative mr-3">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center"
            style={{ backgroundColor: '#25254B' }}
          >
            <Text style={{ fontSize: 24 }}>{item.avatar}</Text>
          </View>
          {item.online && (
            <View
              className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0F0F23]"
              style={{ backgroundColor: '#00B894' }}
            />
          )}
        </View>

        {/* Info */}
        <View className="flex-1 mr-2">
          <View className="flex-row justify-between items-center mb-0.5">
            <Text className="text-white font-bold text-sm">{item.name}</Text>
            <Text className="text-gray-500 text-xs">{item.time}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Text
              className="text-xs flex-1 leading-4"
              style={{ color: item.unread > 0 ? '#CCCCCC' : '#666688' }}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>
          </View>
        </View>

        {/* Unread badge or chevron */}
        {item.unread > 0 ? (
          <View
            className="w-6 h-6 rounded-full items-center justify-center"
            style={{ backgroundColor: '#6C5CE7' }}
          >
            <Text className="text-white text-xs font-black">{item.unread}</Text>
          </View>
        ) : (
          <ChevronRight size={16} color="#555578" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────

export default function MessagesTab() {
  const [activeTab, setActiveTab] = useState<TabType>('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConvo, setSelectedConvo] = useState<typeof CONVERSATIONS[0] | null>(null);
  const [chatVisible, setChatVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const totalUnread = CONVERSATIONS.reduce((sum, c) => sum + c.unread, 0);
  const unreadCirculars = CIRCULARS.filter((c) => !c.read).length;

  const filteredConvos = CONVERSATIONS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-[#0F0F23]">
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        {/* Header */}
        <View className="px-5 pt-14 pb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-gray-400 text-xs font-semibold tracking-widest">SCHOOLBEE</Text>
              <Text className="text-white text-2xl font-black">Inbox</Text>
            </View>
            <View className="flex-row gap-2">
              {totalUnread > 0 && (
                <View
                  className="px-3 py-1.5 rounded-full flex-row items-center gap-1.5"
                  style={{ backgroundColor: '#6C5CE720', borderWidth: 1, borderColor: '#6C5CE740' }}
                >
                  <MessageSquare size={12} color="#6C5CE7" />
                  <Text className="text-[#6C5CE7] text-xs font-black">{totalUnread} new</Text>
                </View>
              )}
              {unreadCirculars > 0 && (
                <View
                  className="px-3 py-1.5 rounded-full flex-row items-center gap-1.5"
                  style={{ backgroundColor: '#FF767520', borderWidth: 1, borderColor: '#FF767540' }}
                >
                  <BellRing size={12} color="#FF7675" />
                  <Text className="text-[#FF7675] text-xs font-black">{unreadCirculars}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Search (messages tab only) */}
        {activeTab === 'messages' && (
          <View className="px-5 mb-4">
            <View
              className="flex-row items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ backgroundColor: '#1A1A3E', borderWidth: 1, borderColor: '#25254B' }}
            >
              <Search size={16} color="#555578" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search messages..."
                placeholderTextColor="#555578"
                className="flex-1 text-white text-sm"
                style={{ fontSize: 14 }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color="#555578" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Content */}
        {activeTab === 'messages' ? (
          <FlatList
            data={filteredConvos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text className="text-gray-500 text-xs font-semibold tracking-widest mb-3">
                CONVERSATIONS • {filteredConvos.length}
              </Text>
            }
            renderItem={({ item }) => (
              <ConversationItem
                item={item}
                onPress={() => {
                  setSelectedConvo(item);
                  setChatVisible(true);
                }}
              />
            )}
            ListEmptyComponent={
              <View className="items-center py-16">
                <MessageSquare size={48} color="#25254B" />
                <Text className="text-gray-600 mt-4 text-base">No conversations found</Text>
              </View>
            }
          />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          >
            {/* Urgent first */}
            {CIRCULARS.filter((c) => c.type === 'urgent').length > 0 && (
              <>
                <View className="flex-row items-center gap-2 mb-3">
                  <AlertTriangle size={14} color="#FF7675" />
                  <Text className="text-[#FF7675] text-xs font-bold tracking-widest">URGENT</Text>
                </View>
                {CIRCULARS.filter((c) => c.type === 'urgent').map((c) => (
                  <CircularCard key={c.id} item={c} />
                ))}
                <Text className="text-gray-500 text-xs font-semibold tracking-widest mb-3 mt-2">
                  ALL UPDATES
                </Text>
              </>
            )}
            {CIRCULARS.filter((c) => c.type !== 'urgent').map((c) => (
              <CircularCard key={c.id} item={c} />
            ))}
          </ScrollView>
        )}
      </Animated.View>

      {/* Chat Modal */}
      <ChatDetailModal
        visible={chatVisible}
        conversation={selectedConvo}
        onClose={() => setChatVisible(false)}
      />
    </View>
  );
}
