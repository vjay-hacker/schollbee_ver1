import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  FlatList,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Filter,
  ChevronRight,
  FileText,
  Zap,
} from 'lucide-react-native';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const SUBJECTS = ['All', 'Science', 'Mathematics', 'History', 'English', 'Computer Science'];

const HOMEWORK_LIST = [
  {
    id: '1',
    subject: 'Science',
    subjectColor: '#00CEC9',
    title: 'Photosynthesis Diagram',
    description: 'Draw and label all stages of photosynthesis with annotations.',
    due: 'Tomorrow, 4:00 PM',
    dueDate: '2026-07-19',
    status: 'pending',
    priority: 'high',
    maxMarks: 20,
    assignedBy: 'Mrs. Kavitha',
    attachments: 1,
  },
  {
    id: '2',
    subject: 'Mathematics',
    subjectColor: '#6C5CE7',
    title: 'Calculus Exercises 4.2',
    description: 'Complete problems 1–15 from Chapter 4, Section 2. Show all working steps.',
    due: 'July 21, 2026',
    dueDate: '2026-07-21',
    status: 'pending',
    priority: 'normal',
    maxMarks: 50,
    assignedBy: 'Mr. Suresh',
    attachments: 0,
  },
  {
    id: '3',
    subject: 'History',
    subjectColor: '#FD79A8',
    title: 'World War II Essay Summary',
    description: 'Write a 500-word summary covering key events of WWII and their global impact.',
    due: 'Submitted',
    dueDate: '2026-07-15',
    status: 'submitted',
    priority: 'normal',
    maxMarks: 30,
    score: 28,
    assignedBy: 'Mr. Rajan',
    attachments: 2,
  },
  {
    id: '4',
    subject: 'English',
    subjectColor: '#FDCB6E',
    title: 'Shakespeare Sonnet Analysis',
    description: 'Analyze Sonnet 18 and write a 200-word literary critique.',
    due: 'Overdue',
    dueDate: '2026-07-14',
    status: 'overdue',
    priority: 'high',
    maxMarks: 25,
    assignedBy: 'Ms. Priya',
    attachments: 0,
  },
  {
    id: '5',
    subject: 'Computer Science',
    subjectColor: '#00B894',
    title: 'Python Loops Project',
    description: 'Build a small Python program using for/while loops to print prime numbers up to 1000.',
    due: 'July 25, 2026',
    dueDate: '2026-07-25',
    status: 'pending',
    priority: 'low',
    maxMarks: 40,
    assignedBy: 'Mr. Arun',
    attachments: 1,
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getStatusConfig(status: string) {
  switch (status) {
    case 'submitted': return { label: 'Submitted', color: '#00B894', bg: '#00B89420', icon: CheckCircle };
    case 'overdue': return { label: 'Overdue', color: '#FF7675', bg: '#FF767520', icon: AlertCircle };
    default: return { label: 'Pending', color: '#FDCB6E', bg: '#FDCB6E20', icon: Clock };
  }
}

function getPriorityColor(priority: string) {
  if (priority === 'high') return '#FF7675';
  if (priority === 'low') return '#00B894';
  return '#FDCB6E';
}

// ─── SUMMARY BAR ─────────────────────────────────────────────────────────────

function SummaryBar() {
  const pending = HOMEWORK_LIST.filter((h) => h.status === 'pending').length;
  const submitted = HOMEWORK_LIST.filter((h) => h.status === 'submitted').length;
  const overdue = HOMEWORK_LIST.filter((h) => h.status === 'overdue').length;

  return (
    <View className="flex-row gap-3 mb-6">
      {[
        { label: 'Pending', count: pending, color: '#FDCB6E', bg: '#FDCB6E15' },
        { label: 'Submitted', count: submitted, color: '#00B894', bg: '#00B89415' },
        { label: 'Overdue', count: overdue, color: '#FF7675', bg: '#FF767515' },
      ].map((s) => (
        <View
          key={s.label}
          className="flex-1 rounded-2xl p-3 items-center"
          style={{ backgroundColor: s.bg, borderWidth: 1, borderColor: s.color + '30' }}
        >
          <Text className="font-black text-2xl" style={{ color: s.color }}>{s.count}</Text>
          <Text className="text-xs mt-0.5" style={{ color: s.color + 'CC' }}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── HOMEWORK CARD ────────────────────────────────────────────────────────────

function HomeworkCard({ item, onPress }: { item: typeof HOMEWORK_LIST[0]; onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const statusCfg = getStatusConfig(item.status);
  const StatusIcon = statusCfg.icon;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => onPress());
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 12 }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={{
          backgroundColor: '#1A1A3E',
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor: '#25254B',
          borderLeftWidth: 4,
          borderLeftColor: item.subjectColor,
        }}
      >
        {/* Subject + Priority row */}
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center gap-2">
            <View
              className="px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: item.subjectColor + '25' }}
            >
              <Text className="text-xs font-bold" style={{ color: item.subjectColor }}>
                {item.subject.toUpperCase()}
              </Text>
            </View>
            {item.priority === 'high' && (
              <View className="flex-row items-center gap-1">
                <Zap size={10} color="#FF7675" fill="#FF7675" />
                <Text className="text-xs font-bold text-[#FF7675]">HIGH</Text>
              </View>
            )}
          </View>
          <View
            className="flex-row items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ backgroundColor: statusCfg.bg }}
          >
            <StatusIcon size={12} color={statusCfg.color} />
            <Text className="text-xs font-bold" style={{ color: statusCfg.color }}>
              {statusCfg.label}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text className="text-white font-bold text-base mb-1 leading-5">{item.title}</Text>
        <Text className="text-gray-400 text-xs leading-4 mb-3" numberOfLines={2}>
          {item.description}
        </Text>

        {/* Footer */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-1.5">
            <Calendar size={12} color="#6C5CE7" />
            <Text className="text-xs text-gray-400">{item.due}</Text>
          </View>
          <View className="flex-row items-center gap-3">
            {item.attachments > 0 && (
              <View className="flex-row items-center gap-1">
                <FileText size={11} color="#9D9DC7" />
                <Text className="text-xs text-gray-500">{item.attachments}</Text>
              </View>
            )}
            <Text className="text-xs text-gray-500">Max: {item.maxMarks} marks</Text>
            <ChevronRight size={14} color="#555578" />
          </View>
        </View>

        {/* Score if submitted */}
        {item.status === 'submitted' && item.score !== undefined && (
          <View
            className="mt-3 pt-3 flex-row items-center justify-between"
            style={{ borderTopWidth: 1, borderTopColor: '#25254B' }}
          >
            <Text className="text-xs text-gray-400">Score received</Text>
            <Text className="text-base font-black text-[#00B894]">
              {item.score}/{item.maxMarks} ✓
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────

function HomeworkDetailModal({
  visible,
  item,
  onClose,
}: {
  visible: boolean;
  item: typeof HOMEWORK_LIST[0] | null;
  onClose: () => void;
}) {
  if (!item) return null;
  const statusCfg = getStatusConfig(item.status);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: '#00000080' }} onPress={onClose}>
        <View style={{ flex: 1 }} />
        <Pressable
          style={{
            backgroundColor: '#1A1A3E',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 24,
            paddingBottom: 40,
          }}
          onPress={() => {}}
        >
          {/* Handle */}
          <View className="w-10 h-1 bg-[#25254B] rounded-full self-center mb-6" />

          {/* Subject Pill */}
          <View className="flex-row items-center gap-3 mb-4">
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: item.subjectColor + '25' }}
            >
              <Text className="text-sm font-bold" style={{ color: item.subjectColor }}>
                {item.subject}
              </Text>
            </View>
            <View
              className="flex-row items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ backgroundColor: statusCfg.bg }}
            >
              <Text className="text-xs font-bold" style={{ color: statusCfg.color }}>
                {statusCfg.label}
              </Text>
            </View>
          </View>

          <Text className="text-white text-xl font-black mb-2">{item.title}</Text>
          <Text className="text-gray-400 text-sm leading-6 mb-5">{item.description}</Text>

          {/* Info Grid */}
          <View className="bg-[#0F0F23] rounded-2xl p-4 mb-5 gap-3">
            {[
              { label: 'Assigned by', value: item.assignedBy },
              { label: 'Due date', value: item.due },
              { label: 'Maximum marks', value: `${item.maxMarks}` },
              { label: 'Attachments', value: `${item.attachments} file(s)` },
            ].map((row) => (
              <View key={row.label} className="flex-row justify-between">
                <Text className="text-gray-500 text-sm">{row.label}</Text>
                <Text className="text-white text-sm font-semibold">{row.value}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          {item.status === 'pending' && (
            <TouchableOpacity
              className="py-4 rounded-2xl items-center"
              style={{ backgroundColor: '#6C5CE7' }}
              onPress={onClose}
            >
              <Text className="text-white font-bold text-base">Mark as Complete</Text>
            </TouchableOpacity>
          )}
          {item.status === 'submitted' && item.score !== undefined && (
            <View
              className="py-4 rounded-2xl items-center"
              style={{ backgroundColor: '#00B89420', borderWidth: 1, borderColor: '#00B894' }}
            >
              <Text className="text-[#00B894] font-bold text-base">
                ✓ Scored {item.score}/{item.maxMarks} — {item.assignedBy}
              </Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────

export default function HomeworkScreen() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedItem, setSelectedItem] = useState<typeof HOMEWORK_LIST[0] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const filtered = selectedSubject === 'All'
    ? HOMEWORK_LIST
    : HOMEWORK_LIST.filter((h) => h.subject === selectedSubject);

  return (
    <View className="flex-1 bg-[#0F0F23]">
      {/* Header */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <View className="px-5 pt-14 pb-4">
          <View className="flex-row items-center mb-1">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 p-2 bg-[#1A1A3E] rounded-full border border-[#25254B]"
            >
              <ChevronLeft color="#FFFFFF" size={20} />
            </TouchableOpacity>
            <View>
              <Text className="text-gray-400 text-xs font-semibold tracking-widest">ALICE JOHNSON • GRADE 10-A</Text>
              <Text className="text-white text-2xl font-black">Homework & Tasks</Text>
            </View>
          </View>
        </View>

        {/* Summary */}
        <View className="px-5">
          <SummaryBar />
        </View>

        {/* Subject Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="pl-5 mb-5"
          contentContainerStyle={{ paddingRight: 20, gap: 8 }}
        >
          {SUBJECTS.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSelectedSubject(s)}
              className="px-4 py-2 rounded-full"
              style={{
                backgroundColor: selectedSubject === s ? '#6C5CE7' : '#1A1A3E',
                borderWidth: 1,
                borderColor: selectedSubject === s ? '#6C5CE7' : '#25254B',
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: selectedSubject === s ? '#FFFFFF' : '#9D9DC7' }}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <HomeworkCard
            item={item}
            onPress={() => {
              setSelectedItem(item);
              setModalVisible(true);
            }}
          />
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            <BookOpen size={48} color="#25254B" />
            <Text className="text-gray-600 mt-4 text-base">No homework for this subject</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <HomeworkDetailModal
        visible={modalVisible}
        item={selectedItem}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
