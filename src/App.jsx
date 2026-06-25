import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  Flame, 
  Clock, 
  Book, 
  Plus, 
  Trash2, 
  Check, 
  X,
  FileText,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  User,
  Settings,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import Background3D from './components/Background3D';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const INITIAL_TODOS = [
  { id: 1, text: "Revise React Three Fiber basics", completed: true },
  { id: 2, text: "Design 3D background shapes", completed: true },
  { id: 3, text: "Hook up local storage state", completed: false },
  { id: 4, text: "Build analytics dashboard charts", completed: false }
];

const INITIAL_TARGETS = [
  { day: "Monday", targetHours: 5, actualHours: 4.5 },
  { day: "Tuesday", targetHours: 5, actualHours: 6.0 },
  { day: "Wednesday", targetHours: 4, actualHours: 0 }, // Illness
  { day: "Thursday", targetHours: 5, actualHours: 5.0 },
  { day: "Friday", targetHours: 6, actualHours: 3.5 },
  { day: "Saturday", targetHours: 6, actualHours: 7.0 },
  { day: "Sunday", targetHours: 4, actualHours: 0 }
];

const INITIAL_SYLLABUS = {
  "React & WebGL": [
    { chapter: "Fiber Canvas & Camera", status: "completed" },
    { chapter: "Floating Mesh Geometries", status: "completed" },
    { chapter: "Orbit Controls & Drei Hooks", status: "in-progress" },
    { chapter: "Custom shaders & Lighting", status: "not-started" }
  ],
  "JavaScript & DSA": [
    { chapter: "Array Iteration & Map/Reduce", status: "completed" },
    { chapter: "Binary Search Trees", status: "completed" },
    { chapter: "Graph Traversals", status: "not-started" }
  ],
  "System Architecture": [
    { chapter: "REST APIs & Webhooks", status: "completed" },
    { chapter: "SQLite Schema Designing", status: "completed" },
    { chapter: "Model Context Protocol", status: "in-progress" }
  ]
};

const INITIAL_LOGS = {
  "2026-06-19": { studied: true, hours: 4.5, topics: "React fundamentals & hooks", notes: "Very productive day" },
  "2026-06-20": { studied: true, hours: 6.0, topics: "JavaScript arrays & map/reduce", notes: "Completed homework" },
  "2026-06-21": { studied: false, hours: 0, reason: "Illness / tired", notes: "Severe fever, took full rest" },
  "2026-06-22": { studied: true, hours: 5.0, topics: "R3F custom shaders", notes: "Tough concepts but exciting output" },
  "2026-06-23": { studied: true, hours: 3.5, topics: "Vite config & styling", notes: "Setup grid layout" },
  "2026-06-24": { studied: true, hours: 7.0, topics: "ChartJS integration & database setup", notes: "Scaffolded routes" }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : INITIAL_TODOS;
  });
  const [targets, setTargets] = useState(() => {
    const saved = localStorage.getItem('targets');
    return saved ? JSON.parse(saved) : INITIAL_TARGETS;
  });
  const [syllabus, setSyllabus] = useState(() => {
    const saved = localStorage.getItem('syllabus');
    return saved ? JSON.parse(saved) : INITIAL_SYLLABUS;
  });
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('targets', JSON.stringify(targets));
  }, [targets]);

  useEffect(() => {
    localStorage.setItem('syllabus', JSON.stringify(syllabus));
  }, [syllabus]);

  useEffect(() => {
    localStorage.setItem('logs', JSON.stringify(logs));
  }, [logs]);

  // Form states for adding items
  const [newTodo, setNewTodo] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newChapter, setNewChapter] = useState('');
  const [selectedSubjectForChapter, setSelectedSubjectForChapter] = useState('');
  
  // Today's log states
  const todayDateStr = "2026-06-25"; // Static date matching metadata
  const [todayStudied, setTodayStudied] = useState(true);
  const [todayHours, setTodayHours] = useState(4);
  const [todayTopics, setTodayTopics] = useState('');
  const [todayReason, setTodayReason] = useState('Felt lazy / unmotivated');
  const [todayNotes, setTodayNotes] = useState('');

  // Save/Submit Today's log
  const handleSaveLog = (e) => {
    e.preventDefault();
    const logData = todayStudied 
      ? { studied: true, hours: parseFloat(todayHours), topics: todayTopics, notes: todayNotes }
      : { studied: false, hours: 0, reason: todayReason, notes: todayNotes };
    
    setLogs(prev => ({
      ...prev,
      [todayDateStr]: logData
    }));

    // Update targets state for Thursday (representing 2026-06-25, which is Thursday)
    setTargets(prev => prev.map(t => {
      if (t.day === "Thursday") {
        return { ...t, actualHours: todayStudied ? parseFloat(todayHours) : 0 };
      }
      return t;
    }));
    alert("Today's log updated successfully!");
  };

  // Add TODO
  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos(prev => [...prev, { id: Date.now(), text: newTodo.trim(), completed: false }]);
    setNewTodo('');
  };

  // Add Subject
  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    const name = newSubject.trim();
    if (syllabus[name]) return;
    setSyllabus(prev => ({
      ...prev,
      [name]: []
    }));
    setNewSubject('');
    if (!selectedSubjectForChapter) {
      setSelectedSubjectForChapter(name);
    }
  };

  // Add Chapter to Subject
  const handleAddChapter = (e) => {
    e.preventDefault();
    if (!newChapter.trim() || !selectedSubjectForChapter) return;
    setSyllabus(prev => ({
      ...prev,
      [selectedSubjectForChapter]: [
        ...prev[selectedSubjectForChapter],
        { chapter: newChapter.trim(), status: 'not-started' }
      ]
    }));
    setNewChapter('');
  };

  // Toggle Chapter status
  const toggleChapterStatus = (subj, idx) => {
    setSyllabus(prev => {
      const list = [...prev[subj]];
      const currentStatus = list[idx].status;
      let nextStatus = 'not-started';
      if (currentStatus === 'not-started') nextStatus = 'in-progress';
      else if (currentStatus === 'in-progress') nextStatus = 'completed';
      list[idx] = { ...list[idx], status: nextStatus };
      return { ...prev, [subj]: list };
    });
  };

  // Delete Subject
  const handleDeleteSubject = (subj) => {
    if (!window.confirm(`Delete subject ${subj}?`)) return;
    setSyllabus(prev => {
      const copy = { ...prev };
      delete copy[subj];
      return copy;
    });
  };

  // Calculate Streak
  const getStreak = () => {
    let streak = 0;
    let checkDate = new Date(todayDateStr);
    
    if (logs[todayDateStr] && logs[todayDateStr].studied) {
      streak++;
    } else if (logs[todayDateStr] && !logs[todayDateStr].studied) {
      return 0;
    }
    
    let d = new Date(todayDateStr);
    while (true) {
      d.setDate(d.getDate() - 1);
      const dateStr = d.toISOString().split('T')[0];
      if (logs[dateStr]) {
        if (logs[dateStr].studied) {
          streak++;
        } else {
          break;
        }
      } else {
        break;
      }
    }
    return streak;
  };

  // Calculate syllabus stats
  const getSyllabusStats = () => {
    let total = 0;
    let completed = 0;
    Object.values(syllabus).forEach(chapters => {
      chapters.forEach(ch => {
        total++;
        if (ch.status === 'completed') completed++;
      });
    });
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  // Data for Charts
  const weeklyHoursData = {
    labels: targets.map(t => t.day),
    datasets: [
      {
        label: 'Hours Studied',
        data: targets.map(t => t.actualHours),
        backgroundColor: 'rgba(168, 85, 247, 0.75)',
        borderColor: '#a855f7',
        borderWidth: 1.5,
        borderRadius: 8
      },
      {
        label: 'Target Hours',
        data: targets.map(t => t.targetHours),
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1.5,
        borderRadius: 8
      }
    ]
  };

  const getSkipReasonsData = () => {
    const reasons = {
      'Social media distraction': 0,
      'Felt lazy / unmotivated': 0,
      'Illness / tired': 0,
      'Travel / Outing': 0,
      'Other commitments': 0
    };
    Object.values(logs).forEach(log => {
      if (log.studied === false && log.reason) {
        reasons[log.reason] = (reasons[log.reason] || 0) + 1;
      }
    });
    return {
      labels: Object.keys(reasons),
      datasets: [{
        data: Object.values(reasons),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(99, 102, 241, 0.8)'
        ],
        borderWidth: 1,
        borderColor: '#1e1b4b'
      }]
    };
  };

  // Nav Items array
  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'todos', label: 'Daily Tasks', icon: CheckSquare },
    { id: 'targets', label: 'Weekly Targets', icon: Calendar },
    { id: 'syllabus', label: 'Syllabus Tracker', icon: Book },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 }
  ];

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row text-slate-100 overflow-x-hidden">
      {/* 3D background */}
      <Background3D />

      {/* TOP BAR (MOBILE VIEW) */}
      <div className="flex md:hidden justify-between items-center px-6 py-4 glass border-b border-white/5 w-full sticky top-0 z-40">
        <h1 className="text-xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
          METRICSTUDY
        </h1>
        <div className="flex items-center gap-2 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
          <span className="font-bold text-white text-xs">{getStreak()} Days</span>
        </div>
      </div>

      {/* LEFT SIDEBAR (DESKTOP VIEW) */}
      <aside className="hidden md:flex w-64 min-h-screen glass-panel rounded-none border-r border-white/5 p-6 flex-col justify-between shrink-0">
        <div>
          {/* Logo & Branding */}
          <div className="mb-8">
            <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
              METRICSTUDY
            </h1>
            <p className="text-gray-500 text-xs mt-1">WebGL Analytics Dashboard</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    active 
                      ? 'bg-purple-600/25 border-l-4 border-purple-500 text-white font-bold' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-purple-400' : 'text-gray-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        <div className="border-t border-white/5 pt-6">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white">
              AK
            </div>
            <div>
              <div className="text-xs text-gray-400">STUDENT PROFILE</div>
              <div className="font-semibold text-sm text-white">Avinash Kumar</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto pb-24 md:pb-10">
        
        {/* TOP STATUS BAR (DESKTOP VIEW ONLY) */}
        <div className="hidden md:flex justify-between items-center mb-8 pb-4 border-b border-white/5">
          <div>
            <h2 className="text-3xl font-extrabold text-white capitalize">{activeTab} Panel</h2>
            <p className="text-xs text-gray-400 mt-1">Review metrics and adjust parameters</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-xl border border-purple-500/20">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
              <span className="font-bold text-white text-sm">{getStreak()} Days Streak</span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-right">
              <span className="text-[10px] block text-gray-500 leading-none">SYSTEM DATE</span>
              <span className="text-xs font-mono font-semibold text-cyan-400">{todayDateStr}</span>
            </div>
          </div>
        </div>

        {/* ACTIVE TAB CONTENT WINDOW */}
        <div className="glass-panel p-6 md:p-8 min-h-[500px]">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Quick Stats */}
              <div className="space-y-6">
                
                {/* Gauge Hour Card */}
                <div className="glass-card p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-purple-400" /> Today's Focus
                  </h3>
                  <div className="flex items-center justify-center py-2">
                    <div className="relative w-36 h-36">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                        <circle 
                          cx="50" cy="50" r="40" 
                          stroke="url(#purpleGradient)" strokeWidth="8" fill="transparent" 
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - (logs[todayDateStr]?.hours || 0) / 6)}
                          strokeLinecap="round"
                          className="transition-all duration-700"
                        />
                        <defs>
                          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-white">{logs[todayDateStr]?.hours || 0}h</span>
                        <span className="text-[10px] uppercase text-gray-500 tracking-wider">of 6h target</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    <span className="text-[11px] uppercase text-gray-500 block mb-1.5 font-bold">Attendance Status</span>
                    {logs[todayDateStr] ? (
                      logs[todayDateStr].studied ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Studied
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Skipped
                        </span>
                      )
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/15 text-gray-400 border border-gray-500/20">
                        Not Logged
                      </span>
                    )}
                  </div>
                </div>

                {/* Tasks Progress Card */}
                <div className="glass-card p-6">
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold flex items-center gap-2 mb-4">
                    <CheckSquare className="w-4 h-4 text-cyan-400" /> Tasks Completion
                  </h3>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-3xl font-black text-white">
                      {todos.filter(t => t.completed).length} <span className="text-sm font-normal text-gray-500">/ {todos.length}</span>
                    </span>
                    <span className="text-xs font-bold text-cyan-400">
                      {todos.length === 0 ? 0 : Math.round((todos.filter(t => t.completed).length / todos.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${todos.length === 0 ? 0 : (todos.filter(t => t.completed).length / todos.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Syllabus Card */}
                <div className="glass-card p-6">
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold flex items-center gap-2 mb-4">
                    <BookOpen className="w-4 h-4 text-pink-400" /> Syllabus Status
                  </h3>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-3xl font-black text-white">
                      {getSyllabusStats()}% <span className="text-xs text-gray-500 font-normal">Complete</span>
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${getSyllabusStats()}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Columns: Daily Attendance Log Form */}
              <div className="lg:col-span-2 glass-card p-6 md:p-8">
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" /> Daily Attendance Logging
                </h3>
                <p className="text-xs text-gray-500 mb-6">Log daily learning metrics directly into storage</p>
                
                <form onSubmit={handleSaveLog} className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-3 font-semibold">Did you study today?</label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setTodayStudied(true)}
                        className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 border font-bold transition-all ${
                          todayStudied 
                            ? 'bg-purple-600/20 border-purple-500 text-white shadow-purple-500/10 shadow-lg' 
                            : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        <Check className="w-4 h-4 text-emerald-400" /> Yes, I Studied
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setTodayStudied(false)}
                        className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 border font-bold transition-all ${
                          !todayStudied 
                            ? 'bg-rose-950/20 border-rose-500 text-white shadow-rose-500/10 shadow-lg' 
                            : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        <X className="w-4 h-4 text-rose-500" /> No, I Skipped
                      </button>
                    </div>
                  </div>

                  {todayStudied ? (
                    <div className="space-y-4 animate-fadeIn">
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm text-gray-400 font-semibold">Hours Studied</label>
                          <span className="text-cyan-400 font-bold text-base">{todayHours} Hours</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="12"
                          step="0.5"
                          value={todayHours}
                          onChange={(e) => setTodayHours(e.target.value)}
                          className="w-full accent-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2 font-semibold">Topics Covered</label>
                        <input
                          type="text"
                          value={todayTopics}
                          onChange={(e) => setTodayTopics(e.target.value)}
                          placeholder="e.g. Mastered React Hook optimization..."
                          className="w-full"
                          required={todayStudied}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fadeIn">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2 font-semibold">Reason for Skip</label>
                        <select
                          value={todayReason}
                          onChange={(e) => setTodayReason(e.target.value)}
                          className="w-full"
                        >
                          <option>Social media distraction</option>
                          <option>Felt lazy / unmotivated</option>
                          <option>Illness / tired</option>
                          <option>Travel / Outing</option>
                          <option>Other commitments</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-semibold">Day Notes & Summary</label>
                    <textarea
                      value={todayNotes}
                      onChange={(e) => setTodayNotes(e.target.value)}
                      placeholder="Write any thoughts, review points, or tomorrow's plans..."
                      rows="4"
                      className="w-full"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-purple-500/25 border-b border-purple-400/30"
                  >
                    Save Today's Log
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2: DAILY TASKS (TODO) */}
          {activeTab === 'todos' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-cyan-400" /> Daily Target Checklist
              </h3>
              
              <form onSubmit={handleAddTodo} className="flex gap-2">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Create a new task..."
                  className="flex-grow"
                />
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 rounded-lg font-bold flex items-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              </form>

              <div className="space-y-3">
                {todos.map(todo => (
                  <div 
                    key={todo.id} 
                    className="glass-card p-4 flex justify-between items-center border border-white/5 hover:border-cyan-500/20"
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-grow">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => {
                          setTodos(prev => prev.map(t => {
                            if (t.id === todo.id) return { ...t, completed: !t.completed };
                            return t;
                          }));
                        }}
                        className="w-5 h-5 accent-cyan-500"
                      />
                      <span className={`text-base font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                        {todo.text}
                      </span>
                    </label>
                    
                    <button 
                      onClick={() => setTodos(prev => prev.filter(t => t.id !== todo.id))}
                      className="text-gray-500 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {todos.length === 0 && (
                  <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
                    <ClipboardList className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <div className="text-gray-500 font-semibold">No tasks added for today</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WEEKLY TARGETS */}
          {activeTab === 'targets' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" /> Weekly Target Setup
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 space-y-6">
                  <h4 className="text-sm uppercase tracking-wider text-gray-500 font-bold">Adjust Target Hours</h4>
                  <div className="space-y-4">
                    {targets.map((t, idx) => (
                      <div key={t.day} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-gray-400">{t.day}</span>
                          <span className="text-purple-400 font-bold">{t.targetHours} Hours</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="12"
                          step="1"
                          value={t.targetHours}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setTargets(prev => prev.map((item, i) => {
                              if (i === idx) return { ...item, targetHours: val };
                              return item;
                            }));
                          }}
                          className="w-full accent-purple-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-4">Completion Status</h4>
                    <div className="space-y-4">
                      {targets.map(t => {
                        const progress = t.targetHours === 0 ? 0 : Math.round((t.actualHours / t.targetHours) * 100);
                        const statusColor = progress >= 100 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                          : progress > 50 
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30';
                        return (
                          <div key={t.day} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold items-center">
                              <span className="text-white">{t.day}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor}`}>
                                {t.actualHours}h / {t.targetHours}h ({progress}%)
                              </span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  progress >= 100 ? 'bg-emerald-500' : progress > 50 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="border-t border-white/5 pt-4 mt-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Weekly Target Total</span>
                      <span className="text-white font-bold text-lg">
                        {targets.reduce((acc, c) => acc + c.targetHours, 0)} Hours
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SYLLABUS TRACKER */}
          {activeTab === 'syllabus' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6">
                  {/* Add Subject */}
                  <div className="glass-card p-6">
                    <h4 className="text-sm font-bold text-gray-300 mb-3">Add Subject</h4>
                    <form onSubmit={handleAddSubject} className="space-y-3">
                      <input
                        type="text"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="Subject Name (e.g. DBMS)"
                        className="w-full"
                      />
                      <button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-lg"
                      >
                        Create Subject
                      </button>
                    </form>
                  </div>

                  {/* Add Chapter */}
                  <div className="glass-card p-6">
                    <h4 className="text-sm font-bold text-gray-300 mb-3">Add Chapter</h4>
                    <form onSubmit={handleAddChapter} className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Select Subject</label>
                        <select
                          value={selectedSubjectForChapter}
                          onChange={(e) => setSelectedSubjectForChapter(e.target.value)}
                          className="w-full"
                        >
                          <option value="">-- Choose --</option>
                          {Object.keys(syllabus).map(subj => (
                            <option key={subj} value={subj}>{subj}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Chapter Name</label>
                        <input
                          type="text"
                          value={newChapter}
                          onChange={(e) => setNewChapter(e.target.value)}
                          placeholder="e.g. Chapter 2: Relational Model"
                          className="w-full"
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={!selectedSubjectForChapter}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-lg disabled:opacity-50"
                      >
                        Add Chapter
                      </button>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  {Object.keys(syllabus).map(subj => {
                    const chapters = syllabus[subj];
                    const completed = chapters.filter(c => c.status === 'completed').length;
                    const progress = chapters.length === 0 ? 0 : Math.round((completed / chapters.length) * 100);
                    
                    return (
                      <div key={subj} className="glass-card p-6">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-bold text-white">{subj}</h4>
                            <button
                              onClick={() => handleDeleteSubject(subj)}
                              className="text-gray-500 hover:text-rose-500 p-1 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-pink-400 font-bold text-sm">{progress}% Done</span>
                        </div>
                        
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-4">
                          <div 
                            className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <div className="space-y-2">
                          {chapters.map((ch, idx) => {
                            let pillStyle = "border-white/5 hover:border-white/10 text-gray-400";
                            let label = "Not Started";
                            if (ch.status === 'in-progress') {
                              pillStyle = "border-amber-500/20 bg-amber-500/5 text-amber-400";
                              label = "In Progress";
                            } else if (ch.status === 'completed') {
                              pillStyle = "border-emerald-500/20 bg-emerald-500/5 text-emerald-400";
                              label = "Completed";
                            }
                            return (
                              <div 
                                key={idx}
                                onClick={() => toggleChapterStatus(subj, idx)}
                                className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all duration-200 ${pillStyle}`}
                              >
                                <span className="font-semibold text-xs">{ch.chapter}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
                              </div>
                            );
                          })}

                          {chapters.length === 0 && (
                            <div className="text-center text-xs text-gray-500 py-4">
                              No chapters added yet
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ANALYTICS & REPORTS */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" /> Performance Analytics
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
                  <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 mb-3">
                    <Clock className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-3xl font-black text-white">
                    {targets.reduce((acc, c) => acc + c.actualHours, 0)} Hours
                  </span>
                  <span className="text-xs text-gray-500 mt-1 uppercase font-bold">Total Studied</span>
                </div>

                <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
                  <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 mb-3">
                    <CheckSquare className="w-6 h-6 text-cyan-400" />
                  </div>
                  <span className="text-3xl font-black text-white">
                    {Object.values(logs).filter(l => l.studied).length} / {Object.keys(logs).length}
                  </span>
                  <span className="text-xs text-gray-500 mt-1 uppercase font-bold">Attendance Rate</span>
                </div>

                <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
                  <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20 mb-3">
                    <AlertCircle className="w-6 h-6 text-pink-400" />
                  </div>
                  <span className="text-3xl font-black text-white">
                    {Object.values(logs).filter(l => !l.studied).length} Days
                  </span>
                  <span className="text-xs text-gray-500 mt-1 uppercase font-bold">Days Skipped</span>
                </div>
              </div>

              {/* Chart Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h4 className="text-sm font-bold text-gray-300 mb-4">Daily Study Hours (Actual vs Target)</h4>
                  <div className="h-64 flex justify-center items-center">
                    <Bar 
                      data={weeklyHoursData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            labels: {
                              color: '#94a3b8',
                              font: { family: 'Outfit' }
                            }
                          }
                        },
                        scales: {
                          x: {
                            grid: { display: false },
                            ticks: { color: '#94a3b8' }
                          },
                          y: {
                            grid: { color: 'rgba(255,255,255,0.03)' },
                            ticks: { color: '#94a3b8' }
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h4 className="text-sm font-bold text-gray-300 mb-4">Distractions Skip Category</h4>
                  <div className="h-64 flex justify-center items-center">
                    {Object.values(logs).filter(l => !l.studied).length === 0 ? (
                      <div className="text-center text-gray-500 text-sm">
                        No skip data logged. Keep up the streak!
                      </div>
                    ) : (
                      <Doughnut 
                        data={getSkipReasonsData()} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                              labels: {
                                color: '#94a3b8',
                                font: { family: 'Outfit', size: 10 }
                              }
                            }
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* B2B Logs List Table */}
              <div className="glass-card p-6">
                <h4 className="text-sm font-bold text-gray-300 mb-4">Recent Attendance Logs Database</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-gray-500 text-xs font-semibold uppercase">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Hours</th>
                        <th className="py-3 px-4">Details / Skip Reason</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {Object.keys(logs).sort((a,b) => new Date(b) - new Date(a)).map(date => {
                        const log = logs[date];
                        return (
                          <tr key={date} className="hover:bg-white/5 transition">
                            <td className="py-3.5 px-4 font-mono font-semibold text-xs text-white">{date}</td>
                            <td className="py-3.5 px-4">
                              {log.studied ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Studied
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                  Skipped
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-white">{log.studied ? `${log.hours}h` : '0h'}</td>
                            <td className="py-3.5 px-4 text-gray-400 text-xs">
                              {log.studied ? log.topics : log.reason}
                              {log.notes && <span className="block text-[10px] text-gray-500 mt-0.5">{log.notes}</span>}
                            </td>
                            <td className="py-3.5 px-4">
                              <button 
                                onClick={() => {
                                  if (!window.confirm("Delete this log?")) return;
                                  setLogs(prev => {
                                    const copy = { ...prev };
                                    delete copy[date];
                                    return copy;
                                  });
                                }}
                                className="text-gray-500 hover:text-rose-500 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* STICKY BOTTOM NAV BAR (MOBILE VIEW ONLY) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass border-t border-white/10 flex justify-around items-center z-50">
        {NAV_ITEMS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-2 text-center transition-all ${
                active ? 'text-purple-500 scale-105' : 'text-gray-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-bold tracking-tight">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
