import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  BookOpen,
  BarChart3,
  Star,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const STUDENT = {
  name: 'Alice Johnson',
  class: 'Grade 10 — Section A',
  avatar: '👧',
  overall_percentage: 88.4,
  overall_grade: 'A',
  rank: 3,
  total_students: 42,
  academic_year: '2025–2026',
};

const SUBJECT_GRADES = [
  { id: 's1', subject: 'Mathematics', code: 'MATH', percentage: 94, grade: 'A+', trend: 'up', totalAssignments: 8, color: '#6C5CE7' },
  { id: 's2', subject: 'English Literature', code: 'ENG', percentage: 91, grade: 'A', trend: 'stable', totalAssignments: 6, color: '#00CEC9' },
  { id: 's3', subject: 'Science', code: 'SCI', percentage: 88, grade: 'A', trend: 'up', totalAssignments: 7, color: '#00B894' },
  { id: 's4', subject: 'Computer Science', code: 'CS', percentage: 96, grade: 'A+', trend: 'up', totalAssignments: 5, color: '#FD79A8' },
  { id: 's5', subject: 'History', code: 'HIST', percentage: 78, grade: 'B+', trend: 'down', totalAssignments: 6, color: '#FDCB6E' },
  { id: 's6', subject: 'Physical Education', code: 'PE', percentage: 85, grade: 'A', trend: 'stable', totalAssignments: 4, color: '#E17055' },
];

const RECENT_GRADES = [
  { subject: 'Mathematics', assignment: 'Calculus Test 4', obtained: 47, max: 50, date: 'Jul 17' },
  { subject: 'Computer Science', assignment: 'Python Loops Quiz', obtained: 38, max: 40, date: 'Jul 15' },
  { subject: 'Science', assignment: 'Photosynthesis Diagram', obtained: 18, max: 20, date: 'Jul 14' },
  { subject: 'History', assignment: 'WWII Essay', obtained: 23, max: 30, date: 'Jul 12' },
  { subject: 'English', assignment: 'Sonnet Analysis', obtained: 22, max: 25, date: 'Jul 10' },
];

const TREND_MONTHS = [
  { month: 'Feb', pct: 81 },
  { month: 'Mar', pct: 84 },
  { month: 'Apr', pct: 82 },
  { month: 'May', pct: 86 },
  { month: 'Jun', pct: 89 },
  { month: 'Jul', pct: 88 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function gradeColor(pct: number): string {
  if (pct >= 90) return '#00B894';
  if (pct >= 75) return '#6C5CE7';
  if (pct >= 60) return '#FDCB6E';
  if (pct >= 50) return '#E17055';
  return '#FF7675';
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <TrendingUp size={14} color="#00B894" />;
  if (trend === 'down') return <TrendingDown size={14} color="#FF7675" />;
  return <Minus size={14} color="#FDCB6E" />;
}

// ─── CIRCULAR PROGRESS ───────────────────────────────────────────────────────

function CircularScore({ percentage, grade }: { percentage: number; grade: string }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const ringSize = 140;
  const color = gradeColor(percentage);

  return (
    <View className="items-center justify-center">
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
          backgroundColor: color + '15',
          borderWidth: 4,
          borderColor: color + '60',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: ringSize - 20,
            height: ringSize - 20,
            borderRadius: (ringSize - 20) / 2,
            backgroundColor: '#1A1A3E',
            borderWidth: 3,
            borderColor: color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text className="font-black text-3xl" style={{ color }}>{percentage}%</Text>
          <Text className="font-bold text-xl" style={{ color: color + 'CC' }}>{grade}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── MINI TREND CHART ─────────────────────────────────────────────────────────

function MiniTrendChart() {
  const chartHeight = 60;
  const chartWidth = width - 80;
  const maxPct = Math.max(...TREND_MONTHS.map((m) => m.pct));
  const minPct = Math.min(...TREND_MONTHS.map((m) => m.pct));
  const range = maxPct - minPct || 1;

  const points = TREND_MONTHS.map((m, i) => {
    const x = (i / (TREND_MONTHS.length - 1)) * chartWidth;
    const y = chartHeight - ((m.pct - minPct) / range) * chartHeight;
    return { x, y, ...m };
  });

  const anim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: false }).start();
  }, []);

  return (
    <View style={{ height: chartHeight + 30 }}>
      {/* Y axis line */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: chartWidth,
          height: chartHeight,
        }}
      >
        {/* Bars */}
        {points.map((p, i) => {
          const barH = ((p.pct - minPct) / range) * chartHeight + 4;
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: p.x - 8,
                bottom: 0,
                width: 16,
                height: barH,
                borderRadius: 4,
                backgroundColor: '#6C5CE7' + '60',
              }}
            />
          );
        })}
      </View>
      {/* Month labels */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        {TREND_MONTHS.map((m) => (
          <Text key={m.month} className="text-xs text-gray-600">{m.month}</Text>
        ))}
      </View>
    </View>
  );
}

// ─── SUBJECT ROW ─────────────────────────────────────────────────────────────

function SubjectRow({ item, index }: { item: typeof SUBJECT_GRADES[0]; index: number }) {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const color = gradeColor(item.percentage);

  return (
    <Animated.View
      style={{
        transform: [{ translateX: slideAnim }],
        opacity: opacAnim,
        marginBottom: 10,
      }}
    >
      <View
        style={{
          backgroundColor: '#1A1A3E',
          borderRadius: 16,
          padding: 14,
          borderWidth: 1,
          borderColor: '#25254B',
        }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-3">
            <View
              className="w-9 h-9 rounded-xl items-center justify-center"
              style={{ backgroundColor: item.color + '25' }}
            >
              <Text className="text-xs font-black" style={{ color: item.color }}>{item.code}</Text>
            </View>
            <View>
              <Text className="text-white font-bold text-sm">{item.subject}</Text>
              <Text className="text-gray-500 text-xs">{item.totalAssignments} assignments</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <TrendIcon trend={item.trend} />
            <View
              className="px-3 py-1 rounded-full items-center"
              style={{ backgroundColor: color + '20', minWidth: 48 }}
            >
              <Text className="font-black text-sm" style={{ color }}>{item.grade}</Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="h-2 bg-[#0F0F23] rounded-full overflow-hidden">
          <View
            style={{
              height: '100%',
              width: `${item.percentage}%`,
              backgroundColor: item.color,
              borderRadius: 999,
            }}
          />
        </View>
        <View className="flex-row justify-between mt-1">
          <Text className="text-gray-600 text-xs">0%</Text>
          <Text className="text-xs font-semibold" style={{ color }}>
            {item.percentage}%
          </Text>
          <Text className="text-gray-600 text-xs">100%</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────

type TabType = 'overview' | 'subjects' | 'recent';

export default function GradesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const TABS: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'subjects', label: 'By Subject' },
    { id: 'recent', label: 'Recent' },
  ];

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
              <Text className="text-gray-400 text-xs font-semibold tracking-widest">
                {STUDENT.class}
              </Text>
              <Text className="text-white text-2xl font-black">Academic Grades</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row px-5 mb-4 gap-2">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className="flex-1 py-2.5 rounded-xl items-center"
              style={{
                backgroundColor: activeTab === tab.id ? '#6C5CE7' : '#1A1A3E',
                borderWidth: 1,
                borderColor: activeTab === tab.id ? '#6C5CE7' : '#25254B',
              }}
            >
              <Text
                className="text-sm font-bold"
                style={{ color: activeTab === tab.id ? '#FFFFFF' : '#9D9DC7' }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <View className="px-5">
            {/* Hero Score Card */}
            <View
              className="rounded-3xl p-6 mb-5"
              style={{
                backgroundColor: '#1A1A3E',
                borderWidth: 1,
                borderColor: '#25254B',
              }}
            >
              {/* Student name + rank */}
              <View className="flex-row justify-between items-start mb-5">
                <View>
                  <Text className="text-white font-black text-lg">{STUDENT.name}</Text>
                  <Text className="text-gray-400 text-xs mt-0.5">{STUDENT.academic_year}</Text>
                </View>
                <View
                  className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: '#FDCB6E20', borderWidth: 1, borderColor: '#FDCB6E40' }}
                >
                  <Award size={14} color="#FDCB6E" />
                  <Text className="text-xs font-black text-[#FDCB6E]">
                    Rank #{STUDENT.rank} of {STUDENT.total_students}
                  </Text>
                </View>
              </View>

              {/* Circular score */}
              <View className="items-center mb-5">
                <CircularScore percentage={STUDENT.overall_percentage} grade={STUDENT.overall_grade} />
                <Text className="text-gray-400 text-sm mt-3">Overall Performance</Text>
              </View>

              {/* Quick stats */}
              <View className="flex-row gap-3">
                {[
                  { label: 'Subjects', value: `${SUBJECT_GRADES.length}`, icon: BookOpen, color: '#6C5CE7' },
                  { label: 'A+ Grades', value: `${SUBJECT_GRADES.filter(s => s.grade === 'A+').length}`, icon: Star, color: '#FDCB6E' },
                  { label: 'Improving', value: `${SUBJECT_GRADES.filter(s => s.trend === 'up').length}`, icon: TrendingUp, color: '#00B894' },
                ].map((stat) => (
                  <View
                    key={stat.label}
                    className="flex-1 rounded-2xl p-3 items-center"
                    style={{ backgroundColor: stat.color + '15' }}
                  >
                    <stat.icon size={18} color={stat.color} />
                    <Text className="font-black text-xl mt-1" style={{ color: stat.color }}>
                      {stat.value}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5">{stat.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Trend Chart */}
            <View
              className="rounded-3xl p-5 mb-5"
              style={{ backgroundColor: '#1A1A3E', borderWidth: 1, borderColor: '#25254B' }}
            >
              <View className="flex-row items-center gap-2 mb-4">
                <BarChart3 size={18} color="#6C5CE7" />
                <Text className="text-white font-bold">Performance Trend</Text>
                <View className="ml-auto">
                  <Text className="text-gray-500 text-xs">Last 6 months</Text>
                </View>
              </View>
              <MiniTrendChart />
              <View className="flex-row justify-between mt-2">
                {TREND_MONTHS.map((m) => (
                  <Text key={m.month} className="text-xs font-bold text-[#6C5CE7]">{m.pct}%</Text>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── SUBJECTS TAB ─────────────────────────────────────────────── */}
        {activeTab === 'subjects' && (
          <View className="px-5">
            <Text className="text-gray-400 text-xs font-semibold tracking-widest mb-4">
              ALL SUBJECTS • {SUBJECT_GRADES.length} TOTAL
            </Text>
            {SUBJECT_GRADES.map((s, i) => (
              <SubjectRow key={s.id} item={s} index={i} />
            ))}
          </View>
        )}

        {/* ── RECENT GRADES TAB ────────────────────────────────────────── */}
        {activeTab === 'recent' && (
          <View className="px-5">
            <Text className="text-gray-400 text-xs font-semibold tracking-widest mb-4">
              LATEST RESULTS
            </Text>
            {RECENT_GRADES.map((g, i) => {
              const pct = Math.round((g.obtained / g.max) * 100);
              const color = gradeColor(pct);
              return (
                <View
                  key={i}
                  className="bg-[#1A1A3E] rounded-2xl p-4 mb-3"
                  style={{ borderWidth: 1, borderColor: '#25254B' }}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-4">
                      <Text className="text-[#6C5CE7] text-xs font-bold uppercase tracking-wider mb-0.5">
                        {g.subject}
                      </Text>
                      <Text className="text-white font-bold text-sm">{g.assignment}</Text>
                      <Text className="text-gray-500 text-xs mt-1">{g.date}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="font-black text-xl" style={{ color }}>
                        {g.obtained}/{g.max}
                      </Text>
                      <Text className="text-sm font-bold mt-0.5" style={{ color }}>
                        {pct}%
                      </Text>
                    </View>
                  </View>
                  {/* Score bar */}
                  <View className="mt-3 h-1.5 bg-[#0F0F23] rounded-full overflow-hidden">
                    <View
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: color,
                        borderRadius: 999,
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
