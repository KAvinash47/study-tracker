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
  HelpCircle
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

// Initial state mock data for showcase purposes
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
    const sortedDates = Object.keys(logs).sort((a, b) => new Date(b) - new Date(a));
    // Check if we studied today or yesterday to continue the streak
    let checkDate = new Date(todayDateStr);
    
    // If today is logged and we studied
    if (logs[todayDateStr] && logs[todayDateStr].studied) {
      streak++;
    } else if (logs[todayDateStr] && !logs[todayDateStr].studied) {
      // today logged but did not study, streak broken
      return 0;
    }
    
    // Go backwards through the sorted logs
    let d = new Date(todayDateStr);
    while (true) {
      d.setDate(d.getDate() - 1);
      const dateStr = d.toISOString().split('T')[0];
      if (logs[dateStr]) {
        if (logs[dateStr].studied) {
          streak++;
        } else {
          break; // Streak broken
        }
      } else {
        break; // No log, stop streak count
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
        backgroundColor: 'rgba(168, 85, 247, 0.65)',
        borderColor: '#a855f7',
        borderWidth: 1.5,
        borderRadius: 6
      },
      {
        label: 'Target Hours',
        data: targets.map(t => t.targetHours),
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1.5,
        borderRadius: 6
      }
    ]
  };

  // Calculate skip reasons count
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
          '#ef4444', // Red
          '#f59e0b', // Amber
          '#06b6d4', // Cyan
          '#10b981', // Emerald
          '#6366f1'  // Indigo
        ],
        borderWidth: 1,
        borderColor: '#1e1b4b'
      }]
    };
  };

  return (
    <div className="relative min-h-screen pb-12">
      {/* 3D background */}
      <Background3D />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8 glass p-6 rounded-2xl border border-purple-500/20">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              METRICSTUDY
            </h1>
            <p className="text-gray-400 text-sm mt-1">Next-Gen WebGL Learning & Progress Dashboard</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-xl border border-purple-500/20">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
              <span className="font-bold text-white text-lg">{getStreak()} Days Streak</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">SYSTEM DATE</div>
              <div className="font-mono text-cyan-400 text-sm font-semibold">{todayDateStr}</div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex gap-2 p-1.5 glass rounded-xl border border-white/5 mb-8 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
            { id: 'todos', label: 'Daily Tasks', icon: CheckSquare },
            { id: 'targets', label: 'Weekly Targets', icon: Calendar },
            { id: 'syllabus', label: 'Syllabus Tracker', icon: Book },
            { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  active 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 border-b border-purple-400' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content Wrapper */}
        <main className="glass-panel p-8 min-h-[500px]">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Quick Stats */}
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <h3 className="text-lg text-gray-400 mb-4 font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" /> Today's Focus
                  </h3>
                  <div className="flex items-center justify-center py-4">
                    {/* SVG Radial Progress Ring */}
                    <div className="relative w-36 h-36">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                        <circle 
                          cx="50" cy="50" r="40" 
                          stroke="#a855f7" strokeWidth="8" fill="transparent" 
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - (logs[todayDateStr]?.hours || 0) / 6)}
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-extrabold text-white">{logs[todayDateStr]?.hours || 0}h</span>
                        <span className="text-xs text-gray-500">of 6h Target</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-400 mt-2">
                    Status: <span className={logs[todayDateStr]?.studied ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                      {logs[todayDateStr] ? (logs[todayDateStr].studied ? "Studied ✅" : "Skipped ❌") : "Not Logged Yet ⏳"}
                    </span>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-lg text-gray-400 mb-2 font-semibold flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-cyan-400" /> Daily Task Progress
                  </h3>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Tasks Completed</span>
                      <span className="text-white font-bold">
                        {todos.filter(t => t.completed).length} / {todos.length}
                      </span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${todos.length === 0 ? 0 : (todos.filter(t => t.completed).length / todos.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-lg text-gray-400 mb-2 font-semibold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-pink-400" /> Syllabus Tracker
                  </h3>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Overall Progress</span>
                      <span className="text-white font-bold">{getSyllabusStats()}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-pink-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${getSyllabusStats()}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Columns: Daily Attendance Log Form */}
              <div className="md:col-span-2 glass-card p-6 border-l-2 border-purple-500/30">
                <h2 className="text-2xl mb-4 font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                  <FileText className="w-6 h-6 text-purple-400" /> Today's Log & Attendance
                </h2>
                
                <form onSubmit={handleSaveLog} className="space-y-6">
                  <div>
                    <label className="block text-gray-400 mb-2 font-medium">Did you study today?</label>
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
                        <Check className="w-5 h-5 text-emerald-400" /> Yes, I Studied
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
                        <X className="w-5 h-5 text-rose-500" /> No, I Skipped
                      </button>
                    </div>
                  </div>

                  {todayStudied ? (
                    <div className="space-y-4 animate-fadeIn">
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-gray-400 font-medium">How many hours?</label>
                          <span className="text-cyan-400 font-bold text-lg">{todayHours} Hours</span>
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
                        <label className="block text-gray-400 mb-2 font-medium">What topics did you read?</label>
                        <input
                          type="text"
                          value={todayTopics}
                          onChange={(e) => setTodayTopics(e.target.value)}
                          placeholder="e.g. Completed React Three Fiber layout config..."
                          className="w-full"
                          required={todayStudied}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fadeIn">
                      <div>
                        <label className="block text-gray-400 mb-2 font-medium">Select primary reason for skipping:</label>
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
                    <label className="block text-gray-400 mb-2 font-medium">Day Notes & General Review:</label>
                    <textarea
                      value={todayNotes}
                      onChange={(e) => setTodayNotes(e.target.value)}
                      placeholder="Write down any issues, achievements, or targets for tomorrow..."
                      rows="4"
                      className="w-full"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 px-6 rounded-xl border-b border-purple-400/40 transition-all hover:-translate-y-0.5 shadow-lg shadow-purple-500/25"
                  >
                    Save Log & Complete Day
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2: DAILY TASKS (TODO) */}
          {activeTab === 'todos' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CheckSquare className="w-6 h-6 text-cyan-400" /> Daily Target Checklist
              </h2>
              
              <form onSubmit={handleAddTodo} className="flex gap-2">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add a new study task (e.g. Solve 5 Leetcode questions)"
                  className="flex-grow"
                />
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 rounded-lg font-bold flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Add Task
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
                  <div className="text-center py-12 text-gray-500">
                    No tasks added. Add some goals for today!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WEEKLY TARGETS */}
          {activeTab === 'targets' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-400" /> Weekly Target Hours Config
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Targets config form */}
                <div className="glass-card p-6 space-y-6">
                  <h3 className="text-lg font-bold text-gray-300">Adjust Target Hours</h3>
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

                {/* Tracking View */}
                <div className="glass-card p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-cyan-400 mb-4">Target Completion Status</h3>
                    <div className="space-y-4">
                      {targets.map(t => {
                        const progress = t.targetHours === 0 ? 0 : Math.round((t.actualHours / t.targetHours) * 100);
                        const statusColor = progress >= 100 ? 'bg-emerald-500' : progress > 50 ? 'bg-amber-500' : 'bg-rose-500';
                        return (
                          <div key={t.day} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-white">{t.day}</span>
                              <span className="text-gray-400">
                                {t.actualHours}h / {t.targetHours}h ({progress}%)
                              </span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${statusColor}`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="border-t border-white/5 pt-4 mt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Weekly Average Target</span>
                      <span className="text-white font-bold">
                        {Math.round(targets.reduce((acc, c) => acc + c.targetHours, 0) / 7)} Hours/Day
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Form column */}
                <div className="space-y-6">
                  {/* Add Subject */}
                  <div className="glass-card p-6">
                    <h3 className="text-base font-bold text-gray-300 mb-3">Add Subject</h3>
                    <form onSubmit={handleAddSubject} className="space-y-3">
                      <input
                        type="text"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="Subject Name (e.g. Physics)"
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
                    <h3 className="text-base font-bold text-gray-300 mb-3">Add Chapter / Topic</h3>
                    <form onSubmit={handleAddChapter} className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Select Subject:</label>
                        <select
                          value={selectedSubjectForChapter}
                          onChange={(e) => setSelectedSubjectForChapter(e.target.value)}
                          className="w-full"
                        >
                          <option value="">-- Choose Subject --</option>
                          {Object.keys(syllabus).map(subj => (
                            <option key={subj} value={subj}>{subj}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Chapter Name:</label>
                        <input
                          type="text"
                          value={newChapter}
                          onChange={(e) => setNewChapter(e.target.value)}
                          placeholder="e.g. Chapter 4: Integration"
                          className="w-full"
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={!selectedSubjectForChapter}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-lg disabled:opacity-55"
                      >
                        Add Chapter
                      </button>
                    </form>
                  </div>
                </div>

                {/* Display column (Subject-wise Syllabus List) */}
                <div className="md:col-span-2 space-y-6">
                  {Object.keys(syllabus).map(subj => {
                    const chapters = syllabus[subj];
                    const completed = chapters.filter(c => c.status === 'completed').length;
                    const progress = chapters.length === 0 ? 0 : Math.round((completed / chapters.length) * 100);
                    
                    return (
                      <div key={subj} className="glass-card p-6">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-white">{subj}</h3>
                            <button
                              onClick={() => handleDeleteSubject(subj)}
                              className="text-gray-500 hover:text-rose-500 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-pink-400 font-bold">{progress}% Done</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-4">
                          <div 
                            className="bg-pink-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        {/* Chapters list */}
                        <div className="space-y-2">
                          {chapters.map((ch, idx) => {
                            let statusColor = "text-gray-500 border-white/5 hover:border-white/10";
                            let badge = "Not Started";
                            if (ch.status === 'in-progress') {
                              statusColor = "text-amber-400 border-amber-500/20 bg-amber-500/5";
                              badge = "In Progress";
                            } else if (ch.status === 'completed') {
                              statusColor = "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
                              badge = "Completed";
                            }
                            return (
                              <div 
                                key={idx}
                                onClick={() => toggleChapterStatus(subj, idx)}
                                className={`p-3 rounded-lg border flex justify-between items-center cursor-pointer transition-all duration-200 ${statusColor}`}
                              >
                                <span className="font-medium text-sm">{ch.chapter}</span>
                                <span className="text-xs font-bold uppercase tracking-wider">{badge}</span>
                              </div>
                            );
                          })}

                          {chapters.length === 0 && (
                            <div className="text-center text-xs text-gray-500 py-4">
                              No chapters added. Add one above!
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {Object.keys(syllabus).length === 0 && (
                    <div className="glass-card p-12 text-center text-gray-500">
                      No subjects added yet. Start by defining your syllabus on the left.
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: ANALYTICS & REPORTS */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-cyan-400" /> Interactive Performance Analytics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Total Stats summary */}
                <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
                  <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 mb-3">
                    <Clock className="w-8 h-8 text-purple-400" />
                  </div>
                  <span className="text-3xl font-extrabold text-white">
                    {targets.reduce((acc, c) => acc + c.actualHours, 0)} Hours
                  </span>
                  <span className="text-sm text-gray-400 mt-1">Total Hours Studied This Week</span>
                </div>

                <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
                  <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 mb-3">
                    <CheckSquare className="w-8 h-8 text-cyan-400" />
                  </div>
                  <span className="text-3xl font-extrabold text-white">
                    {Object.values(logs).filter(l => l.studied).length} / {Object.keys(logs).length}
                  </span>
                  <span className="text-sm text-gray-400 mt-1">Study Log Attendance Rate</span>
                </div>

                <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
                  <div className="p-4 bg-pink-500/10 rounded-2xl border border-pink-500/20 mb-3">
                    <AlertCircle className="w-8 h-8 text-pink-400" />
                  </div>
                  <span className="text-3xl font-extrabold text-white">
                    {Object.values(logs).filter(l => !l.studied).length} Days
                  </span>
                  <span className="text-sm text-gray-400 mt-1">Days Skipped / Missed Focus</span>
                </div>

              </div>

              {/* Chart Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Daily Study Hours Chart */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-gray-300 mb-4">Daily Study Hours (Target vs Actual)</h3>
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
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: '#94a3b8' }
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Distractions Doughnut Chart */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-gray-300 mb-4">Distraction / Skip Reasons Distribution</h3>
                  <div className="h-64 flex justify-center items-center">
                    {Object.values(logs).filter(l => !l.studied).length === 0 ? (
                      <div className="text-center text-gray-500 text-sm">
                        Great job! No days skipped yet this week.
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
                                font: { family: 'Outfit', size: 11 }
                              }
                            }
                          }
                        }}
                      />
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-500 mt-8">
          MetricStudy Tracking Tool &copy; 2026. Made with WebGL & React.
        </footer>

      </div>
    </div>
  );
}
