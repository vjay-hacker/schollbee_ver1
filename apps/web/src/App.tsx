import React, { useState, useEffect, useRef } from 'react';
import { 
  Building, 
  Users, 
  Bus, 
  Utensils, 
  ShieldAlert, 
  MessageSquare, 
  Bot, 
  Layers, 
  Sparkles, 
  Calendar, 
  Plus, 
  MapPin, 
  Bell, 
  LogOut, 
  Check, 
  X, 
  Search, 
  GraduationCap, 
  QrCode, 
  Sliders, 
  Sun, 
  Moon, 
  Play, 
  Square,
  HelpCircle,
  Clock,
  TrendingUp,
  Map,
  Settings,
  Heart,
  ChevronRight
} from 'lucide-react';

// ============================================================================
// MOCK DATA FOR EMULATION & INITIAL STATE
// ============================================================================

const MOCK_SCHOOLS = [
  { id: '1', name: 'Oakridge International School', code: 'OIS', city: 'Hyderabad', plan: 'Professional', status: 'active', students: 840, revenue: '$4,200/mo' },
  { id: '2', name: 'Greenwood High School', code: 'GHS', city: 'Bangalore', plan: 'Enterprise', status: 'active', students: 1250, revenue: '$8,750/mo' },
  { id: '3', name: 'Delhi Public School', code: 'DPS', city: 'New Delhi', plan: 'Starter', status: 'active', students: 430, revenue: '$1,290/mo' },
  { id: '4', name: 'Silver Oaks School', code: 'SOS', city: 'Visakhapatnam', plan: 'Starter', status: 'suspended', students: 120, revenue: '$0' }
];

const MOCK_STUDENTS = [
  { id: '101', firstName: 'Aarav', lastName: 'Sharma', admissionNumber: 'SB-2026-08', class: 'Grade 5', section: 'A', status: 'present', boarding: 'boarded', route: 'Route 12 (North)', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
  { id: '102', firstName: 'Ananya', lastName: 'Iyer', admissionNumber: 'SB-2026-12', class: 'Grade 5', section: 'A', status: 'present', boarding: 'not_boarded', route: 'Route 12 (North)', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
  { id: '103', firstName: 'Kabir', lastName: 'Verma', admissionNumber: 'SB-2026-44', class: 'Grade 5', section: 'A', status: 'absent', boarding: 'absent', route: 'Route 04 (South)', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: '104', firstName: 'Meera', lastName: 'Reddy', admissionNumber: 'SB-2026-78', class: 'Grade 5', section: 'B', status: 'present', boarding: 'dropped', route: 'Route 04 (South)', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' }
];

const MOCK_TEACHERS = [
  { id: 't01', name: 'Mrs. Priya Rao', employeeId: 'T-8802', subject: 'Mathematics & Science', class: 'Grade 5-A', students: 32 },
  { id: 't02', name: 'Mr. David Miller', employeeId: 'T-1204', subject: 'English Literature', class: 'Grade 6-B', students: 28 }
];

const MOCK_ASSIGNMENTS = [
  { id: 'a1', title: 'Fraction Operations Workbook', subject: 'Mathematics', class: 'Grade 5-A', dueDate: '2026-07-20', totalMarks: 100, submissions: 28, graded: 22 },
  { id: 'a2', title: 'Solar System Model Project', subject: 'Science', class: 'Grade 5-A', dueDate: '2026-07-24', totalMarks: 50, submissions: 14, graded: 0 }
];

const MOCK_COMMUNICATION = [
  { id: 'c1', title: 'Annual Cultural Day Event Details', audience: 'All Parents', priority: 'high', date: 'July 18, 2026', body: 'We are excited to share details about our upcoming Cultural Fest scheduled for next Friday. Student rosters and costume details are attached.' },
  { id: 'c2', title: 'Weather Advisory - School Timings Update', audience: 'All', priority: 'urgent', date: 'July 16, 2026', body: 'Due to heavy rains expected tomorrow, school timings will be modified from 9:30 AM to 1:30 PM. Bus routes will run accordingly.' }
];

// ============================================================================
// MAIN PORTAL CONTAINER
// ============================================================================

export default function App() {
  const [role, setRole] = useState<'super_admin' | 'school_admin' | 'teacher' | 'parent'>('school_admin');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // App UI states
  const [schools, setSchools] = useState(MOCK_SCHOOLS);
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS);
  const [announcements, setAnnouncements] = useState(MOCK_COMMUNICATION);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: '1', sender: 'Teacher', content: 'Hello! Kabir performed exceptionally well in the science workshop today.', time: '3:45 PM' },
    { id: '2', sender: 'You', content: 'That is wonderful to hear! Thank you for the update.', time: '3:48 PM' }
  ]);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  
  // Emulation States
  const [isSimulatingBus, setIsSimulatingBus] = useState(false);
  const [busLatitude, setBusLatitude] = useState(17.4485);
  const [busLongitude, setBusLongitude] = useState(78.3741);
  const [busSpeed, setBusSpeed] = useState(35);
  const [busStopIndex, setBusStopIndex] = useState(0);
  
  // AI assistant drawer
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiConversation, setAiConversation] = useState<any[]>([
    { role: 'assistant', text: 'Hello! I am your SchoolBee AI Assistant. You can ask me queries like "Which students are absent today?", "Where is School Bus 12?", or "Generate a leave summary report."' }
  ]);
  
  // Active child selector (for Parent View)
  const [activeChildIndex, setActiveChildIndex] = useState(0);

  // New School Modal
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');
  const [newSchoolCity, setNewSchoolCity] = useState('');
  const [newSchoolPlan, setNewSchoolPlan] = useState('Starter');

  // Bus stop path for simulation
  const routeStops = [
    { name: 'School Main Gate', lat: 17.4485, lng: 78.3741 },
    { name: 'HITEC City Metro', lat: 17.4435, lng: 78.3772 },
    { name: 'Mindspace Junction', lat: 17.4398, lng: 78.3804 },
    { name: 'Inorbit Mall Stop', lat: 17.4332, lng: 78.3831 },
    { name: 'Oakridge Cross Road', lat: 17.4285, lng: 78.3892 }
  ];

  // Simulated GPS tracker effect
  useEffect(() => {
    let interval: any = null;
    if (isSimulatingBus) {
      interval = setInterval(() => {
        setBusStopIndex((prev) => {
          const nextIndex = (prev + 1) % routeStops.length;
          const stop = routeStops[nextIndex];
          setBusLatitude(stop.lat);
          setBusLongitude(stop.lng);
          setBusSpeed(Math.floor(Math.random() * 25) + 20);
          
          // Boarding status updating dynamically
          if (nextIndex === 0) {
            setStudents(prevStds => prevStds.map(s => s.id === '101' ? { ...s, boarding: 'not_boarded' } : s));
          } else if (nextIndex === 1) {
            setStudents(prevStds => prevStds.map(s => s.id === '101' ? { ...s, boarding: 'boarded' } : s));
          } else if (nextIndex === routeStops.length - 1) {
            setStudents(prevStds => prevStds.map(s => s.id === '101' ? { ...s, boarding: 'dropped' } : s));
          }
          return nextIndex;
        });
      }, 4000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isSimulatingBus]);

  // AI query handler
  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    const userText = aiQuery;
    setAiConversation(prev => [...prev, { role: 'user', text: userText }]);
    setAiQuery('');

    // Generate responsive smart response
    setTimeout(() => {
      let reply = "I'm sorry, I couldn't query that parameter. Please try asking about 'absences', 'bus locations', or 'homework progress'.";
      const q = userText.toLowerCase();

      if (q.includes('absent') || q.includes('attendance') || q.includes('absences')) {
        const absentCount = students.filter(s => s.status === 'absent').length;
        const absentNames = students.filter(s => s.status === 'absent').map(s => `${s.firstName} ${s.lastName}`).join(', ');
        reply = `Based on today's logs, there is ${absentCount} student absent: ${absentNames} (Grade 5-A). The attendance records have been compiled and sent to the administrator database.`;
      } else if (q.includes('bus') || q.includes('route') || q.includes('location') || q.includes('gps')) {
        const activeStop = routeStops[busStopIndex];
        reply = `School Bus Route 12 is currently ${isSimulatingBus ? 'IN TRANSIT' : 'IDLE'}. Current location coordinates are ${busLatitude.toFixed(4)}, ${busLongitude.toFixed(4)} near ${activeStop.name}. Driving Speed is ${busSpeed} km/h.`;
      } else if (q.includes('homework') || q.includes('assignment') || q.includes('grade')) {
        reply = `Grade 5-A has 2 active assignments. 'Fraction Operations Workbook' is due in 2 days (Submissions: 28/32). Average progress score is 84%.`;
      } else if (q.includes('food') || q.includes('meal') || q.includes('lunch')) {
        reply = `Today's menu is set to Rice & Lentil Bowls. 3 students took full meals, 1 student took partial meal. No food allergies were reported in the health logs.`;
      } else if (q.includes('leave') || q.includes('request')) {
        reply = `There is 1 pending leave request from Kabir Verma (Parent requested: Medical Leave, July 19). You can review it inside the Leaves and Absences panel.`;
      }

      setAiConversation(prev => [...prev, { role: 'assistant', text: reply }]);
    }, 800);
  };

  // Add School submit handler
  const handleAddSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName || !newSchoolCode || !newSchoolCity) return;
    const newSchool = {
      id: String(schools.length + 1),
      name: newSchoolName,
      code: newSchoolCode.toUpperCase(),
      city: newSchoolCity,
      plan: newSchoolPlan,
      status: 'active',
      students: 0,
      revenue: '$0'
    };
    setSchools(prev => [...prev, newSchool]);
    setNewSchoolName('');
    setNewSchoolCode('');
    setNewSchoolCity('');
    setShowAddSchool(false);
  };

  // Status handlers
  const handleToggleAttendance = (id: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === 'present' ? 'absent' : 'present' };
      }
      return s;
    }));
  };

  return (
    <div className={`flex min-h-screen ${isDarkMode ? '' : 'light-theme'}`} style={{ backgroundColor: 'var(--bg-dark)' }}>
      {/* ─── SIDEBAR ────────────────────────────────────────────────────────── */}
      <aside className={`glass flex flex-col justify-between transition-all duration-300 z-20 ${sidebarOpen ? 'w-64' : 'w-20'}`} 
             style={{ borderRight: '1px solid var(--border-color)', height: '100vh', position: 'sticky', top: 0 }}>
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between p-6">
            {sidebarOpen ? (
              <div className="flex items-center gap-2">
                <span className="text-3xl">🐝</span>
                <span className="text-xl font-bold tracking-tight font-outfit gradient-text">SchoolBee</span>
              </div>
            ) : (
              <span className="text-3xl mx-auto">🐝</span>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded hover:bg-white/5 hidden md:block">
              <Layers size={18} className="text-text-muted" />
            </button>
          </div>

          {/* Role selector dropdown panel */}
          <div className="px-4 py-2">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              {sidebarOpen && <p className="text-xs text-text-muted mb-1 font-semibold uppercase tracking-wider">Workspace Role</p>}
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-transparent text-sm border-none text-text-main focus:outline-none cursor-pointer"
                style={{ color: 'var(--text-main)' }}
              >
                <option value="school_admin" className="bg-bg-dark text-black">School Admin</option>
                <option value="teacher" className="bg-bg-dark text-black">Class Teacher</option>
                <option value="parent" className="bg-bg-dark text-black">Parent Portal</option>
                <option value="super_admin" className="bg-bg-dark text-black">Super Admin</option>
              </select>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-3 flex flex-col gap-1">
            <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-white/5 text-text-main text-sm font-semibold transition-all">
              <Layers size={18} className="text-primary" />
              {sidebarOpen && <span>Dashboard</span>}
            </button>
            <button onClick={() => setAiOpen(true)} className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-main text-sm transition-all">
              <Bot size={18} className="text-secondary" />
              {sidebarOpen && <span>AI Assistant</span>}
            </button>
            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-main text-sm transition-all">
              <MessageSquare size={18} className="text-accent" />
              {sidebarOpen && <span>Communications</span>}
            </button>
            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-main text-sm transition-all">
              <Bus size={18} className="text-secondary" />
              {sidebarOpen && <span>Bus Log Tracker</span>}
            </button>
          </nav>
        </div>

        {/* User profile / Footer settings */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-white text-sm">
                {role[0].toUpperCase()}
              </div>
              {sidebarOpen && (
                <div>
                  <p className="text-xs font-bold font-outfit" style={{ color: 'var(--text-main)' }}>Vjay Kumar</p>
                  <p className="text-[10px] text-text-muted">Founder (BeeCorp)</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-1.5 rounded hover:bg-white/5 text-text-muted">
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT CONTAINER ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ overflowY: 'auto' }}>
        
        {/* Top Header */}
        <header className="glass flex items-center justify-between px-8 py-4 sticky top-0 z-10" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold font-outfit" style={{ color: 'var(--text-main)' }}>
              {role === 'super_admin' && 'SaaS Super Admin Dashboard'}
              {role === 'school_admin' && 'Oakridge Admin Console'}
              {role === 'teacher' && 'Teacher Portal (Grade 5-A)'}
              {role === 'parent' && 'Parent Dashboard'}
            </h1>
            <div className="flex items-center gap-1.5 bg-secondary/15 border border-secondary/20 px-3 py-1 rounded-full text-xs text-secondary font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Operational Live
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 text-text-muted" size={16} />
              <input 
                type="text" 
                placeholder="Search students, schools, logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border text-sm rounded-lg pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-primary transition-all text-text-main"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>

            {/* Notification trigger */}
            <button className="relative p-2 rounded-lg bg-white/5 border hover:bg-white/10 transition-all text-text-main" style={{ borderColor: 'var(--border-color)' }}>
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 height-2 rounded-full bg-accent" />
            </button>
          </div>
        </header>

        {/* Portal Dashboard Panel */}
        <main className="flex-1 p-8">
          
          {/* ==================================================================
              ROLE 1: SUPER ADMIN PANEL (STARTUP REVENUE & SAAS STATS)
              ================================================================== */}
          {role === 'super_admin' && (
            <div className="flex flex-col gap-8 animate-fade">
              {/* Stat panel */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card glass p-6 rounded-2xl flex flex-col justify-between" style={{ background: 'var(--gradient-card)' }}>
                  <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Annual Recurring Revenue</p>
                    <h3 className="text-3xl font-extrabold font-outfit mt-2">$14,240<span className="text-xs text-secondary ml-1">/mo</span></h3>
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-xs text-secondary">
                    <TrendingUp size={14} /> +24% from last quarter
                  </div>
                </div>

                <div className="card glass p-6 rounded-2xl flex flex-col justify-between" style={{ background: 'var(--gradient-card)' }}>
                  <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Subscribed Schools</p>
                    <h3 className="text-3xl font-extrabold font-outfit mt-2">{schools.length}</h3>
                  </div>
                  <p className="text-xs text-text-muted mt-4">3 Active Tier, 1 Suspended</p>
                </div>

                <div className="card glass p-6 rounded-2xl flex flex-col justify-between" style={{ background: 'var(--gradient-card)' }}>
                  <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total SaaS Students</p>
                    <h3 className="text-3xl font-extrabold font-outfit mt-2">2,640</h3>
                  </div>
                  <p className="text-xs text-text-muted mt-4">Database load metric: 0.12ms query avg</p>
                </div>

                <div className="card glass p-6 rounded-2xl flex flex-col justify-between" style={{ background: 'var(--gradient-card)' }}>
                  <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Active GPS Trips</p>
                    <h3 className="text-3xl font-extrabold font-outfit mt-2">{isSimulatingBus ? '12' : '0'}</h3>
                  </div>
                  <p className="text-xs text-text-muted mt-4">Active tracking signals registered</p>
                </div>
              </div>

              {/* School management table */}
              <div className="card glass p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold font-outfit">SaaS Tenant Management</h2>
                  <button onClick={() => setShowAddSchool(true)} className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                    <Plus size={16} /> Add School
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <th className="pb-3 text-xs font-semibold text-text-muted uppercase">School Name</th>
                        <th className="pb-3 text-xs font-semibold text-text-muted uppercase">City</th>
                        <th className="pb-3 text-xs font-semibold text-text-muted uppercase">Plan Tier</th>
                        <th className="pb-3 text-xs font-semibold text-text-muted uppercase">Status</th>
                        <th className="pb-3 text-xs font-semibold text-text-muted uppercase">Monthly Cost</th>
                        <th className="pb-3 text-xs font-semibold text-text-muted uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schools.map((s) => (
                        <tr key={s.id} className="border-b last:border-0" style={{ borderColor: 'var(--border-color)' }}>
                          <td className="py-4 font-semibold text-sm">{s.name}</td>
                          <td className="py-4 text-sm">{s.city}</td>
                          <td className="py-4">
                            <span className="bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full text-xs text-primary font-semibold">
                              {s.plan}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.status === 'active' ? 'bg-secondary/10 border border-secondary/20 text-secondary' : 'bg-red-500/10 border border-red-500/20 text-red-500'}`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="py-4 font-bold text-sm">{s.revenue}</td>
                          <td className="py-4 text-xs text-primary cursor-pointer hover:underline">Edit Plan</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================
              ROLE 2: SCHOOL ADMIN PANEL (STUDENTS, BUS TRACKING, SIMULATOR)
              ================================================================== */}
          {role === 'school_admin' && (
            <div className="flex flex-col gap-8 animate-fade">
              
              {/* Emulation panel warning */}
              <div className="bg-primary/10 border border-primary/30 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-md text-primary flex items-center gap-2">
                    <Sparkles size={18} /> Startup Live Data Simulator
                  </h3>
                  <p className="text-xs text-text-muted mt-1">This tool runs simulated live bus tracking telemetry. Push "Start Live GPS Route" to simulate bus coordinates moving along the stops.</p>
                </div>
                <button 
                  onClick={() => setIsSimulatingBus(!isSimulatingBus)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${isSimulatingBus ? 'bg-red-500 text-white' : 'bg-secondary text-bg-dark'}`}
                >
                  {isSimulatingBus ? <Square size={16} /> : <Play size={16} />}
                  {isSimulatingBus ? 'Stop GPS Simulation' : 'Start Live GPS Route'}
                </button>
              </div>

              {/* Roster & Tracking grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Student register log */}
                <div className="card glass p-6 rounded-2xl lg:col-span-2">
                  <h2 className="text-lg font-bold font-outfit mb-4">Student Boarding & Attendance Log</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                          <th className="pb-3 text-xs font-semibold text-text-muted uppercase">Student</th>
                          <th className="pb-3 text-xs font-semibold text-text-muted uppercase">Class</th>
                          <th className="pb-3 text-xs font-semibold text-text-muted uppercase">Bus Boarding</th>
                          <th className="pb-3 text-xs font-semibold text-text-muted uppercase">School Gate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s) => (
                          <tr key={s.id} className="border-b last:border-0" style={{ borderColor: 'var(--border-color)' }}>
                            <td className="py-3 flex items-center gap-3">
                              <img src={s.photo} className="w-8 h-8 rounded-full object-cover" alt="" />
                              <div>
                                <p className="text-sm font-semibold">{s.firstName} {s.lastName}</p>
                                <p className="text-[10px] text-text-muted">{s.admissionNumber}</p>
                              </div>
                            </td>
                            <td className="py-3 text-sm">{s.class}-{s.section}</td>
                            <td className="py-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.boarding === 'boarded' ? 'bg-secondary/10 text-secondary border border-secondary/20' : s.boarding === 'dropped' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-white/5 text-text-muted border border-white/10'}`}>
                                {s.boarding}
                              </span>
                            </td>
                            <td className="py-3">
                              <button 
                                onClick={() => handleToggleAttendance(s.id)}
                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${s.status === 'present' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
                              >
                                {s.status}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* GPS Mock Map */}
                <div className="card glass p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-bold font-outfit mb-2">Live GPS Bus Tracker</h2>
                    <p className="text-xs text-text-muted mb-4">Route 12 (North Campus)</p>
                  </div>
                  
                  {/* Visual Map Canvas Box */}
                  <div className="bg-bg-dark/80 border border-white/5 rounded-xl h-48 relative overflow-hidden flex items-center justify-center">
                    {/* Simulated Path line */}
                    <div className="absolute w-full h-1 bg-white/10 top-1/2 left-0 transform -translate-y-1/2" />
                    
                    {/* Bus stop markers */}
                    {routeStops.map((stop, i) => (
                      <div 
                        key={i} 
                        className={`absolute w-3 h-3 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 ${i === busStopIndex ? 'bg-secondary border-bg-dark scale-125' : 'bg-white/20 border-white/5'}`}
                        style={{ left: `${(i / (routeStops.length - 1)) * 80 + 10}%`, top: '50%' }}
                      >
                        <div className="absolute text-[8px] text-text-muted top-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                          {stop.name.substring(0, 10)}
                        </div>
                      </div>
                    ))}

                    {/* Simulating moving bus icon */}
                    <div 
                      className="absolute bg-primary text-white p-1.5 rounded-full shadow-lg transition-all duration-1000 transform -translate-x-1/2 -translate-y-1/2"
                      style={{ 
                        left: `${(busStopIndex / (routeStops.length - 1)) * 80 + 10}%`, 
                        top: '40%',
                        animation: isSimulatingBus ? 'pulse 1.5s infinite' : 'none'
                      }}
                    >
                      <Bus size={14} />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex justify-between text-xs border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
                      <span className="text-text-muted">Status:</span>
                      <span className={`font-semibold ${isSimulatingBus ? 'text-secondary' : 'text-text-muted'}`}>
                        {isSimulatingBus ? 'In Transit' : 'Idle'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
                      <span className="text-text-muted">Latitude:</span>
                      <span className="font-semibold text-text-main">{busLatitude.toFixed(5)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Longitude:</span>
                      <span className="font-semibold text-text-main">{busLongitude.toFixed(5)}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================================================================
              ROLE 3: TEACHER PORTAL (QR ATTENDANCE & GRADING SYSTEM)
              ================================================================== */}
          {role === 'teacher' && (
            <div className="flex flex-col gap-8 animate-fade">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* QR Code attendance panel */}
                <div className="card glass p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-bold font-outfit mb-2">Teacher Attendance Console</h2>
                    <p className="text-xs text-text-muted mb-6">Launch a biometric QR check-in session for class Grade 5-A students.</p>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-8 bg-white/5 border border-white/10 rounded-xl relative">
                    <QrCode size={120} className="text-text-main" />
                    <div className="absolute bg-secondary text-bg-dark text-xs px-3 py-1 rounded-full font-bold top-4 right-4 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-bg-dark animate-ping" />
                      Session Active
                    </div>
                    <p className="text-xs text-text-muted mt-4">Session Token: <span className="font-mono text-text-main">ATTEND_5A_LATEST</span></p>
                  </div>

                  <div className="mt-6 flex justify-between gap-4">
                    <button className="flex-1 bg-white/5 border hover:bg-white/10 text-text-main px-4 py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ borderColor: 'var(--border-color)' }}>
                      Refresh Session
                    </button>
                    <button className="flex-1 bg-primary hover:opacity-90 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
                      Export attendance
                    </button>
                  </div>
                </div>

                {/* Grade and Assignments log */}
                <div className="card glass p-6 rounded-2xl">
                  <h2 className="text-lg font-bold font-outfit mb-4">Class Grading Registry</h2>
                  <div className="flex flex-col gap-4">
                    {assignments.map(a => (
                      <div key={a.id} className="p-4 border rounded-xl bg-white/5 flex flex-col justify-between gap-3" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-sm">{a.title}</h3>
                            <p className="text-[10px] text-text-muted mt-0.5">{a.subject} · Max Marks: {a.totalMarks}</p>
                          </div>
                          <span className="text-xs text-primary font-bold">Due: {a.dueDate}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-text-muted mt-2 border-t pt-2" style={{ borderColor: 'var(--border-color)' }}>
                          <span>Submissions: <strong className="text-text-main">{a.submissions}</strong></span>
                          <span>Graded: <strong className="text-text-main">{a.graded}</strong></span>
                          <button className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded hover:bg-primary/30 transition-all font-semibold">
                            Grade Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================================================================
              ROLE 4: PARENT VIEW (TIMELINE & MESSAGES)
              ================================================================== */}
          {role === 'parent' && (
            <div className="flex flex-col gap-8 animate-fade">
              
              {/* Profile Card & Child Switcher */}
              <div className="card glass p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <img src={students[0].photo} className="w-16 h-16 rounded-full object-cover border-2 border-primary" alt="" />
                  <div>
                    <h2 className="text-lg font-bold font-outfit">{students[0].firstName} {students[0].lastName}</h2>
                    <p className="text-xs text-text-muted">Class Register: {students[0].class} - {students[0].section}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1 items-end">
                  <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Emergency Contacts</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Dr. Reddy (+91 9988776655)</span>
                </div>
              </div>

              {/* Roster & Timeline details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Child daily Timeline */}
                <div className="card glass p-6 rounded-2xl lg:col-span-2">
                  <h2 className="text-lg font-bold font-outfit mb-4">Today's Activity Log</h2>
                  <div className="flex flex-col gap-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                    
                    <div className="relative">
                      <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-secondary border border-bg-dark" />
                      <h4 className="text-sm font-bold">Bus Boarding Event</h4>
                      <p className="text-xs text-text-muted mt-1">Bus Route 12 - boarding logged: <strong className="text-secondary">{students[0].boarding}</strong></p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-primary border border-bg-dark" />
                      <h4 className="text-sm font-bold">Class gate log check-in</h4>
                      <p className="text-xs text-text-muted mt-1">Student registered: <strong className="text-primary">{students[0].status}</strong></p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-accent border border-bg-dark" />
                      <h4 className="text-sm font-bold">Health Care & Medication</h4>
                      <p className="text-xs text-text-muted mt-1">Daily medication: Vitamin check completed. No medical logs recorded.</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-white/20 border border-bg-dark" />
                      <h4 className="text-sm font-bold">Food menu & nutritional stats</h4>
                      <p className="text-xs text-text-muted mt-1">Lunch recorded: Rice bowl taken (Full meal).</p>
                    </div>

                  </div>
                </div>

                {/* Direct Parent-Teacher Chat */}
                <div className="card glass p-6 rounded-2xl flex flex-col justify-between" style={{ height: '350px' }}>
                  <div>
                    <h2 className="text-md font-bold font-outfit mb-3">Message Class Teacher</h2>
                  </div>

                  {/* Chat messages */}
                  <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-2">
                    {chatMessages.map(m => (
                      <div key={m.id} className={`max-w-[80%] p-2.5 rounded-xl text-xs ${m.sender === 'You' ? 'bg-primary text-white self-end rounded-tr-none' : 'bg-white/5 text-text-main self-start rounded-tl-none'}`}>
                        <p>{m.content}</p>
                        <span className="text-[8px] text-text-muted block mt-1 text-right">{m.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Message Input box */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const inputEl = e.currentTarget.elements.namedItem('chatInput') as HTMLInputElement;
                    if (!inputEl.value.trim()) return;
                    setChatMessages(prev => [...prev, {
                      id: String(prev.length + 1),
                      sender: 'You',
                      content: inputEl.value,
                      time: 'Just now'
                    }]);
                    inputEl.value = '';
                  }} className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <input 
                      type="text" 
                      name="chatInput"
                      placeholder="Type a message..."
                      className="flex-1 bg-white/5 border rounded-lg px-3 py-1.5 text-xs text-text-main focus:outline-none"
                      style={{ borderColor: 'var(--border-color)' }}
                    />
                    <button className="bg-primary hover:opacity-90 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                      Send
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* ─── AI ASSISTANT PANEL DRAWER ─────────────────────────────────────── */}
      <div className={`glass fixed right-0 top-0 bottom-0 w-80 shadow-2xl transition-transform duration-300 z-30 flex flex-col justify-between ${aiOpen ? 'translate-x-0' : 'translate-x-full'}`}
           style={{ borderLeft: '1px solid var(--border-color)', background: 'rgba(15, 15, 35, 0.95)' }}>
        
        {/* AI Header */}
        <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <div>
              <h4 className="font-bold text-sm font-outfit" style={{ color: 'var(--text-main)' }}>SchoolBee AI Agent</h4>
              <p className="text-[10px] text-text-muted">Natural Language Database Queries</p>
            </div>
          </div>
          <button onClick={() => setAiOpen(false)} className="p-1 rounded hover:bg-white/5 text-text-muted">
            <X size={18} />
          </button>
        </div>

        {/* Conversation flow */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 text-xs">
          {aiConversation.map((msg, i) => (
            <div key={i} className={`flex gap-2 max-w-[90%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
              <span className="text-lg">{msg.role === 'user' ? '👤' : '🤖'}</span>
              <div className={`p-3 rounded-xl leading-relaxed ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white/5 text-text-main border rounded-tl-none'}`} style={{ borderColor: msg.role === 'user' ? 'none' : 'var(--border-color)' }}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Query Input Box */}
        <form onSubmit={handleAiSubmit} className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ask attendance status, bus stops..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="flex-1 bg-white/5 border rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary"
              style={{ borderColor: 'var(--border-color)' }}
            />
            <button className="bg-secondary text-bg-dark px-3 py-2 rounded-lg text-xs font-bold hover:opacity-90">
              Ask
            </button>
          </div>
        </form>
      </div>

      {/* Floating AI Button (Visible when closed) */}
      {!aiOpen && (
        <button 
          onClick={() => setAiOpen(true)}
          className="fixed bottom-6 right-6 bg-primary hover:opacity-90 text-white p-4 rounded-full shadow-2xl flex items-center justify-center z-20 hover:scale-105 transition-all"
        >
          <Bot size={24} />
        </button>
      )}

      {/* ─── ADD NEW SCHOOL MODAL (SAAS TENANT) ─────────────────────────────── */}
      {showAddSchool && (
        <div className="fixed inset-0 bg-black/60 backdrop-filter backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card glass p-6 rounded-2xl w-full max-w-md animate-fade">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold font-outfit" style={{ color: 'var(--text-main)' }}>Register New School Tenant</h3>
              <button onClick={() => setShowAddSchool(false)} className="p-1 rounded hover:bg-white/5 text-text-muted">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSchoolSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-text-muted block mb-1.5">School Name</label>
                <input 
                  type="text" 
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  placeholder="e.g. Stanford Academy"
                  className="w-full bg-white/5 border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-primary"
                  style={{ borderColor: 'var(--border-color)' }}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted block mb-1.5">Unique Code</label>
                  <input 
                    type="text" 
                    value={newSchoolCode}
                    onChange={(e) => setNewSchoolCode(e.target.value)}
                    placeholder="e.g. SFA"
                    className="w-full bg-white/5 border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-primary"
                    style={{ borderColor: 'var(--border-color)' }}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1.5">City</label>
                  <input 
                    type="text" 
                    value={newSchoolCity}
                    onChange={(e) => setNewSchoolCity(e.target.value)}
                    placeholder="e.g. California"
                    className="w-full bg-white/5 border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-primary"
                    style={{ borderColor: 'var(--border-color)' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-1.5">SaaS Subscription Plan</label>
                <select 
                  value={newSchoolPlan}
                  onChange={(e) => setNewSchoolPlan(e.target.value)}
                  className="w-full bg-bg-dark border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <option value="Starter">Starter Plan ($1,290/mo)</option>
                  <option value="Professional">Professional Plan ($4,200/mo)</option>
                  <option value="Enterprise">Enterprise Plan ($8,750/mo)</option>
                </select>
              </div>

              <div className="flex gap-4 mt-4">
                <button type="button" onClick={() => setShowAddSchool(false)} className="flex-1 bg-white/5 border hover:bg-white/10 text-text-main py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ borderColor: 'var(--border-color)' }}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-primary hover:opacity-90 text-white py-2.5 rounded-xl text-sm font-semibold transition-all">
                  Register Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
