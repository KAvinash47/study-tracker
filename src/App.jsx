import React, { useState, useEffect, useRef } from 'react';
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
  TrendingUp,
  RotateCcw,
  Sparkles,
  ClipboardList,
  ChevronRight,
  Timer,
  Compass,
  Share2,
  Play,
  Pause,
  Volume2,
  VolumeX
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
  { id: 3, text: "Hook up local storage state", completed: false }
];

const INITIAL_TARGETS = [
  { day: "Monday", targetHours: 5, actualHours: 4.5 },
  { day: "Tuesday", targetHours: 5, actualHours: 6.0 },
  { day: "Wednesday", targetHours: 4, actualHours: 0 }, 
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
  ]
};

// Preloaded logs database containing Energy Levels
const INITIAL_LOGS = {
  "2026-06-19": { studied: true, hours: 4.5, energy: "Medium", topics: "React fundamentals & hooks", notes: "Very productive day" },
  "2026-06-20": { studied: true, hours: 6.0, energy: "High", topics: "JavaScript arrays & map/reduce", notes: "Completed homework" },
  "2026-06-21": { studied: false, hours: 0, energy: "Low", reason: "Illness / tired", notes: "Severe fever, took full rest" },
  "2026-06-22": { studied: true, hours: 5.0, energy: "High", topics: "R3F custom shaders", notes: "Tough concepts but exciting output" },
  "2026-06-23": { studied: true, hours: 3.5, energy: "Medium", topics: "Vite config & styling", notes: "Setup grid layout" },
  "2026-06-24": { studied: true, hours: 7.0, energy: "High", topics: "ChartJS integration & database setup", notes: "Scaffolded routes" }
};

// Default initial spaced repetition reviews (e.g. mock reviews scheduled for today)
const INITIAL_REVIEWS = [
  { id: "sr-mock-1", chapter: "Fiber Canvas & Camera", subject: "React & WebGL", scheduledDate: "2026-06-25", completed: false },
  { id: "sr-mock-2", chapter: "Binary Search Trees", subject: "JavaScript & DSA", scheduledDate: "2026-06-25", completed: false }
];

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
  const [spacedReviews, setSpacedReviews] = useState(() => {
    const saved = localStorage.getItem('spaced_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // Feature 1: Pomodoro States
  const [pomoMinutes, setPomoMinutes] = useState(() => {
    const saved = localStorage.getItem('pomo_minutes');
    return saved ? parseInt(saved) : 25;
  });
  const [pomoBreakMinutes, setPomoBreakMinutes] = useState(() => {
    const saved = localStorage.getItem('pomo_break_minutes');
    return saved ? parseInt(saved) : 5;
  });
  const [pomoLongBreakMinutes, setPomoLongBreakMinutes] = useState(() => {
    const saved = localStorage.getItem('pomo_long_break_minutes');
    return saved ? parseInt(saved) : 15;
  });
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [pomoMode, setPomoMode] = useState('focus'); // 'focus' | 'shortBreak' | 'longBreak'
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoCount, setPomoCount] = useState(() => {
    const saved = localStorage.getItem('pomo_count');
    return saved ? parseInt(saved) : 0;
  });
  const [ambientSound, setAmbientSound] = useState('none');
  const audioContextRef = useRef(null);
  const audioNodesRef = useRef({});

  // Feature 2: AI Roadmap Planner States
  const [roadmapSubject, setRoadmapSubject] = useState('');
  const [roadmapExamDate, setRoadmapExamDate] = useState('2026-07-15');
  const [roadmapTopics, setRoadmapTopics] = useState('');
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [generatedMilestones, setGeneratedMilestones] = useState(() => {
    const saved = localStorage.getItem('generated_milestones');
    return saved ? JSON.parse(saved) : [];
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

  useEffect(() => {
    localStorage.setItem('spaced_reviews', JSON.stringify(spacedReviews));
  }, [spacedReviews]);

  useEffect(() => {
    localStorage.setItem('pomo_minutes', pomoMinutes);
  }, [pomoMinutes]);

  useEffect(() => {
    localStorage.setItem('pomo_break_minutes', pomoBreakMinutes);
  }, [pomoBreakMinutes]);

  useEffect(() => {
    localStorage.setItem('pomo_long_break_minutes', pomoLongBreakMinutes);
  }, [pomoLongBreakMinutes]);

  useEffect(() => {
    localStorage.setItem('pomo_count', pomoCount);
  }, [pomoCount]);

  useEffect(() => {
    localStorage.setItem('generated_milestones', JSON.stringify(generatedMilestones));
  }, [generatedMilestones]);

  // Form states
  const [newTodo, setNewTodo] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newChapter, setNewChapter] = useState('');
  const [selectedSubjectForChapter, setSelectedSubjectForChapter] = useState('');
  
  // Today's log states
  const todayDateStr = "2026-06-25"; // Static date matching metadata
  const [todayStudied, setTodayStudied] = useState(true);
  const [todayHours, setTodayHours] = useState(4);
  const [todayEnergy, setTodayEnergy] = useState('High');
  const [todayTopics, setTodayTopics] = useState('');
  const [todayReason, setTodayReason] = useState('Felt lazy / unmotivated');
  const [todayNotes, setTodayNotes] = useState('');

  // Cleanup ambient sound on unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  const stopAmbientSound = () => {
    if (audioNodesRef.current) {
      Object.values(audioNodesRef.current).forEach(node => {
        try { node.stop(); } catch (e) {}
        try { node.disconnect(); } catch (e) {}
      });
      audioNodesRef.current = {};
    }
  };

  const startAmbientSound = (type) => {
    stopAmbientSound();
    if (type === 'none') return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const nodes = {};

      if (type === 'white') {
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const gain = ctx.createGain();
        gain.gain.value = 0.15;

        noise.connect(gain).connect(ctx.destination);
        noise.start();

        nodes.source = noise;
        nodes.gain = gain;
      } else if (type === 'binaural') {
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        
        oscL.type = 'sine';
        oscL.frequency.value = 100;
        oscR.type = 'sine';
        oscR.frequency.value = 104; // 4Hz delta (Theta waves)

        const gainL = ctx.createGain();
        const gainR = ctx.createGain();
        gainL.gain.value = 0.08;
        gainR.gain.value = 0.08;

        if (ctx.createStereoPanner) {
          const panL = ctx.createStereoPanner();
          const panR = ctx.createStereoPanner();
          panL.pan.value = -1;
          panR.pan.value = 1;
          oscL.connect(gainL).connect(panL).connect(ctx.destination);
          oscR.connect(gainR).connect(panR).connect(ctx.destination);
          nodes.panL = panL;
          nodes.panR = panR;
        } else {
          oscL.connect(gainL).connect(ctx.destination);
          oscR.connect(gainR).connect(ctx.destination);
        }

        oscL.start();
        oscR.start();

        nodes.oscL = oscL;
        nodes.oscR = oscR;
        nodes.gainL = gainL;
        nodes.gainR = gainR;
      } else if (type === 'ocean') {
        const bufferSize = 4 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = 0.95 * lastOut + 0.05 * white;
          lastOut = output[i];
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        const gain = ctx.createGain();
        gain.gain.value = 0.15;

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.12;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 150;

        lfo.connect(lfoGain).connect(filter.frequency);
        noise.connect(filter).connect(gain).connect(ctx.destination);

        lfo.start();
        noise.start();

        nodes.source = noise;
        nodes.filter = filter;
        nodes.gain = gain;
        nodes.lfo = lfo;
        nodes.lfoGain = lfoGain;
      }

      audioNodesRef.current = nodes;
    } catch (e) {
      console.error('Failed to play sound:', e);
    }
  };

  const playChime = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.5);
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now);
      osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.5);
      
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      
      osc1.stop(now + 1.3);
      osc2.stop(now + 1.3);
    } catch (e) {
      console.error('Failed to play chime:', e);
    }
  };

  // Pomodoro countdown timer logic
  useEffect(() => {
    let interval = null;
    if (pomoRunning) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setPomoRunning(false);
            playChime();
            
            if (pomoMode === 'focus') {
              setPomoCount(c => c + 1);
              const focusHrs = parseFloat((pomoMinutes / 60).toFixed(2));
              
              setLogs(prevLogs => {
                const todayLog = prevLogs[todayDateStr] || { studied: true, hours: 0, energy: 'Medium', topics: '', notes: '' };
                const currentHours = todayLog.studied ? todayLog.hours : 0;
                const newHours = parseFloat((currentHours + focusHrs).toFixed(2));
                return {
                  ...prevLogs,
                  [todayDateStr]: {
                    ...todayLog,
                    studied: true,
                    hours: newHours,
                    topics: todayLog.topics ? `${todayLog.topics}, Completed Pomodoro Focus` : 'Completed Pomodoro Focus',
                    notes: todayLog.notes ? `${todayLog.notes}\n[Pomodoro: completed 1 session]` : '[Pomodoro: completed 1 session]'
                  }
                };
              });

              setTargets(prevTargs => prevTargs.map(t => {
                if (t.day === "Thursday") {
                  return { ...t, actualHours: parseFloat((t.actualHours + focusHrs).toFixed(2)) };
                }
                return t;
              }));

              setTodos(prevTodos => [
                ...prevTodos,
                { id: Date.now(), text: `Completed Pomodoro focus session (${pomoMinutes}m)`, completed: true }
              ]);

              alert(`Pomodoro complete! Added ${focusHrs}h to today's study hours and checked off a task!`);
              setPomoMode('shortBreak');
              return pomoBreakMinutes * 60;
            } else {
              alert("Break's over! Let's focus.");
              setPomoMode('focus');
              return pomoMinutes * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [pomoRunning, pomoMode, pomoMinutes, pomoBreakMinutes, pomoLongBreakMinutes]);

  useEffect(() => {
    if (!pomoRunning) {
      if (pomoMode === 'focus') {
        setTimeLeft(pomoMinutes * 60);
      } else if (pomoMode === 'shortBreak') {
        setTimeLeft(pomoBreakMinutes * 60);
      } else if (pomoMode === 'longBreak') {
        setTimeLeft(pomoLongBreakMinutes * 60);
      }
    }
  }, [pomoMinutes, pomoBreakMinutes, pomoLongBreakMinutes, pomoMode, pomoRunning]);

  // Handle ambient sound state change
  useEffect(() => {
    startAmbientSound(ambientSound);
  }, [ambientSound]);

  // Feature 2: AI Roadmap Planner helper
  const handleGenerateRoadmap = (e) => {
    e.preventDefault();
    if (!roadmapSubject.trim() || !roadmapTopics.trim()) return;
    
    setIsGeneratingRoadmap(true);
    setTimeout(() => {
      const topicsArr = roadmapTopics.split(/[,\n]/)
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      const today = new Date(todayDateStr);
      const exam = new Date(roadmapExamDate);
      const diffTime = Math.max(0, exam - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const milestones = topicsArr.map((topic, idx) => {
        const targetDay = Math.min(diffDays - 1, Math.round(((idx + 1) / (topicsArr.length + 1)) * diffDays));
        const milestoneDate = new Date(today);
        milestoneDate.setDate(milestoneDate.getDate() + targetDay);
        
        return {
          id: `milestone-${idx}-${Date.now()}`,
          phase: `Phase ${idx + 1}`,
          title: topic,
          targetHours: Math.min(8, 2 + (idx % 3)),
          scheduledDate: milestoneDate.toISOString().split('T')[0]
        };
      });

      setGeneratedMilestones(milestones);
      setIsGeneratingRoadmap(false);
    }, 1500);
  };

  const handleImportRoadmap = () => {
    if (generatedMilestones.length === 0 || !roadmapSubject.trim()) return;
    
    const subjName = roadmapSubject.trim();
    
    setSyllabus(prev => {
      const existingChapters = prev[subjName] || [];
      const newChapters = generatedMilestones.map(m => ({
        chapter: m.title,
        status: 'not-started'
      }));
      
      const mergedChapters = [...existingChapters];
      newChapters.forEach(nc => {
        if (!mergedChapters.some(c => c.chapter === nc.chapter)) {
          mergedChapters.push(nc);
        }
      });
      
      return {
        ...prev,
        [subjName]: mergedChapters
      };
    });

    setTodos(prev => {
      const newTodos = generatedMilestones.map(m => ({
        id: Date.now() + Math.random(),
        text: `Study ${subjName}: ${m.title} (Target: ${m.targetHours}h by ${m.scheduledDate})`,
        completed: false
      }));
      return [...prev, ...newTodos];
    });

    alert(`Successfully imported subject "${subjName}" with ${generatedMilestones.length} chapters to your Syllabus Tracker & created study tasks!`);
    setGeneratedMilestones([]);
    setRoadmapSubject('');
    setRoadmapTopics('');
    setActiveTab('syllabus');
  };

  // Auto-fill form values if today's log already exists in database
  useEffect(() => {
    if (logs[todayDateStr]) {
      const todayLog = logs[todayDateStr];
      setTodayStudied(todayLog.studied);
      if (todayLog.studied) {
        setTodayHours(todayLog.hours);
        setTodayEnergy(todayLog.energy || 'High');
        setTodayTopics(todayLog.topics || '');
      } else {
        setTodayReason(todayLog.reason || 'Felt lazy / unmotivated');
      }
      setTodayNotes(todayLog.notes || '');
    }
  }, [logs]);

  // Save/Submit Today's log
  const handleSaveLog = (e) => {
    e.preventDefault();
    const logData = todayStudied 
      ? { studied: true, hours: parseFloat(todayHours), energy: todayEnergy, topics: todayTopics, notes: todayNotes }
      : { studied: false, hours: 0, energy: 'Low', reason: todayReason, notes: todayNotes };
    
    setLogs(prev => ({
      ...prev,
      [todayDateStr]: logData
    }));

    // Update targets state for Thursday (which represents 2026-06-25)
    setTargets(prev => prev.map(t => {
      if (t.day === "Thursday") {
        return { ...t, actualHours: todayStudied ? parseFloat(todayHours) : 0 };
      }
      return t;
    }));
    alert("Today's log saved successfully! Gamified WebGL canvas updated.");
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

  // Toggle Chapter status + Trigger Spaced Repetition
  const toggleChapterStatus = (subj, idx) => {
    setSyllabus(prev => {
      const list = [...prev[subj]];
      const currentStatus = list[idx].status;
      let nextStatus = 'not-started';
      
      if (currentStatus === 'not-started') {
        nextStatus = 'in-progress';
      } else if (currentStatus === 'in-progress') {
        nextStatus = 'completed';
        // Trigger Spaced Repetition Review schedules at +1, +7, and +30 days!
        scheduleSpacedRepetition(list[idx].chapter, subj);
      }
      
      list[idx] = { ...list[idx], status: nextStatus };
      return { ...prev, [subj]: list };
    });
  };

  // Helper to schedule Spaced Repetition Reviews
  const scheduleSpacedRepetition = (chapterName, subjectName) => {
    const intervals = [1, 7, 30];
    const today = new Date(todayDateStr);
    const newReviews = intervals.map(days => {
      const reviewDate = new Date(today);
      reviewDate.setDate(reviewDate.getDate() + days);
      const dateStr = reviewDate.toISOString().split('T')[0];
      return {
        id: `sr-${Date.now()}-${days}-${Math.random().toString(36).substr(2, 4)}`,
        chapter: chapterName,
        subject: subjectName,
        scheduledDate: dateStr,
        completed: false
      };
    });
    setSpacedReviews(prev => [...prev, ...newReviews]);
  };

  // Toggle review completion status
  const toggleReviewCompletion = (id) => {
    setSpacedReviews(prev => prev.map(r => {
      if (r.id === id) return { ...r, completed: !r.completed };
      return r;
    }));
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

  // Active Recall reviews scheduled for today
  const activeTodayReviews = spacedReviews.filter(r => r.scheduledDate === todayDateStr);

  // Energy vs Study Productivity calculations
  const getEnergyVsProductivityData = () => {
    const totals = { High: 0, Medium: 0, Low: 0 };
    const counts = { High: 0, Medium: 0, Low: 0 };

    Object.values(logs).forEach(log => {
      const energy = log.energy || 'Medium';
      if (log.studied) {
        totals[energy] += log.hours;
        counts[energy]++;
      } else {
        counts['Low']++; // Unstudied defaults to low energy
      }
    });

    const averages = ['High', 'Medium', 'Low'].map(e => {
      return counts[e] === 0 ? 0 : parseFloat((totals[e] / counts[e]).toFixed(1));
    });

    return {
      labels: ['High Energy', 'Medium Energy', 'Low Energy'],
      datasets: [{
        label: 'Average Hours Studied',
        data: averages,
        backgroundColor: [
          'rgba(34, 197, 94, 0.75)', // Green
          'rgba(234, 179, 8, 0.75)',  // Yellow
          'rgba(239, 68, 68, 0.75)'   // Red
        ],
        borderColor: ['#22c55e', '#eab308', '#ef4444'],
        borderWidth: 1.5,
        borderRadius: 8
      }]
    };
  };

  // Definition of weeklyHoursData (Actual vs Target study hours)
  const weeklyHoursData = {
    labels: targets.map(t => t.day),
    datasets: [
      {
        label: 'Target Hours',
        data: targets.map(t => t.targetHours),
        backgroundColor: 'rgba(168, 85, 247, 0.25)',
        borderColor: '#a855f7',
        borderWidth: 1.5,
        borderRadius: 6
      },
      {
        label: 'Actual Hours',
        data: targets.map(t => t.actualHours),
        backgroundColor: 'rgba(6, 182, 212, 0.75)',
        borderColor: '#06b6d4',
        borderWidth: 1.5,
        borderRadius: 6
      }
    ]
  };

  // Skip distraction reasons doughnut chart data
  const getSkipReasonsData = () => {
    const reasons = [
      'Social media distraction',
      'Felt lazy / unmotivated',
      'Illness / tired',
      'Travel / Outing',
      'Other commitments'
    ];
    const counts = {
      'Social media distraction': 0,
      'Felt lazy / unmotivated': 0,
      'Illness / tired': 0,
      'Travel / Outing': 0,
      'Other commitments': 0
    };

    Object.values(logs).forEach(log => {
      if (!log.studied && log.reason) {
        if (counts[log.reason] !== undefined) {
          counts[log.reason]++;
        } else {
          counts['Other commitments']++;
        }
      }
    });

    return {
      labels: reasons,
      datasets: [{
        label: 'Days Skipped',
        data: reasons.map(r => counts[r]),
        backgroundColor: [
          'rgba(236, 72, 153, 0.75)',
          'rgba(168, 85, 247, 0.75)',
          'rgba(239, 68, 68, 0.75)',
          'rgba(234, 179, 8, 0.75)',
          'rgba(6, 182, 212, 0.75)'
        ],
        borderColor: ['#ec4899', '#a855f7', '#ef4444', '#eab308', '#06b6d4'],
        borderWidth: 1.5
      }]
    };
  };

  // Study reports export handlers
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ logs, syllabus, todos, targets, spacedReviews }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `study_metrics_report_${todayDateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportMarkdown = () => {
    const totalHours = Object.values(logs).reduce((acc, l) => acc + (l.hours || 0), 0);
    const studyDays = Object.values(logs).filter(l => l.studied).length;
    const skippedDays = Object.values(logs).filter(l => !l.studied).length;
    const attendanceRate = Object.keys(logs).length === 0 ? 0 : Math.round((studyDays / Object.keys(logs).length) * 100);
    
    let md = `# MetricStudy - Progress Report (${todayDateStr})\n\n`;
    md += `## Overall Metrics\n`;
    md += `- **Total Hours Studied**: ${totalHours} hours\n`;
    md += `- **Attendance Rate**: ${attendanceRate}% (${studyDays} Studied / ${skippedDays} Skipped)\n`;
    md += `- **Current Streak**: ${getStreak()} Days\n`;
    md += `- **Syllabus Progress**: ${getSyllabusStats()}%\n\n`;
    
    md += `## Subject Completion Details\n`;
    Object.keys(syllabus).forEach(subj => {
      const chapters = syllabus[subj];
      const completed = chapters.filter(c => c.status === 'completed').length;
      const pct = chapters.length === 0 ? 0 : Math.round((completed / chapters.length) * 100);
      md += `### ${subj} (${pct}% Done)\n`;
      chapters.forEach(ch => {
        md += `- [${ch.status === 'completed' ? 'x' : ' '}] ${ch.chapter} (${ch.status})\n`;
      });
      md += `\n`;
    });
    
    md += `\n## Recent Activity Logs\n`;
    Object.keys(logs).sort((a,b) => new Date(b) - new Date(a)).forEach(date => {
      const log = logs[date];
      md += `- **${date}**: ${log.studied ? `Studied ${log.hours}h (Energy: ${log.energy})` : `Skipped (${log.reason})`}\n`;
      if (log.notes) md += `  *Notes: ${log.notes}*\n`;
    });

    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `study_progress_report_${todayDateStr}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyShareable = () => {
    const studyDays = Object.values(logs).filter(l => l.studied).length;
    const attendanceRate = Object.keys(logs).length === 0 ? 0 : Math.round((studyDays / Object.keys(logs).length) * 100);
    const totalHours = Object.values(logs).reduce((acc, l) => acc + (l.hours || 0), 0);
    
    const summary = `🔥 METRICSTUDY PROGRESS UPDATE 🔥\n📅 Date: ${todayDateStr}\n⚡ Active Streak: ${getStreak()} Days\n⏱️ Total Focus: ${totalHours} Hours\n✅ Attendance Rate: ${attendanceRate}%\n📚 Syllabus Complete: ${getSyllabusStats()}%\n\nLogged using WebGL MetricStudy Tracker. Keep grinding! 🚀`;
    
    navigator.clipboard.writeText(summary);
    alert("Shareable summary copied to clipboard!");
  };

  // Nav Items array
  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'todos', label: 'Daily Tasks', icon: CheckSquare },
    { id: 'targets', label: 'Weekly Targets', icon: Calendar },
    { id: 'pomodoro', label: 'Pomodoro Focus', icon: Timer },
    { id: 'roadmap', label: 'Roadmap Planner', icon: Compass },
    { id: 'syllabus', label: 'Syllabus Tracker', icon: Book },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 }
  ];

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row text-slate-100 overflow-x-hidden">
      {/* 3D WebGL background linked to streak & daily completion */}
      <Background3D 
        streak={getStreak()} 
        studiedToday={logs[todayDateStr]?.studied || false} 
      />

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
                    <div className="space-y-6 animate-fadeIn">
                      
                      {/* Energy Level Input */}
                      <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                        <label className="block text-sm text-purple-300 mb-2.5 font-bold flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-400" /> Day's Focus Energy level
                        </label>
                        <div className="flex gap-3">
                          {['High', 'Medium', 'Low'].map(lvl => {
                            const active = todayEnergy === lvl;
                            let color = 'border-emerald-500/30 text-emerald-400';
                            if (lvl === 'Medium') color = 'border-yellow-500/30 text-yellow-400';
                            if (lvl === 'Low') color = 'border-rose-500/30 text-rose-400';
                            return (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => setTodayEnergy(lvl)}
                                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-extrabold tracking-wider uppercase transition ${
                                  active 
                                    ? (lvl === 'High' ? 'bg-emerald-500/25 border-emerald-500' : lvl === 'Medium' ? 'bg-yellow-500/25 border-yellow-500' : 'bg-rose-500/25 border-rose-500')
                                    : 'bg-white/5 border-white/5 text-gray-400'
                                }`}
                              >
                                {lvl}
                              </button>
                            );
                          })}
                        </div>
                      </div>

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
              {/* Active Recall Reviews Scheduled */}
              {activeTodayReviews.length > 0 && (
                <div className="glass-card p-5 border border-purple-500/20 bg-purple-500/5">
                  <h4 className="text-xs uppercase tracking-widest text-purple-400 font-extrabold flex items-center gap-2 mb-3">
                    <RotateCcw className="w-4 h-4 text-purple-400 animate-spin-slow" /> Active Recall Reviews Due Today
                  </h4>
                  <div className="space-y-2">
                    {activeTodayReviews.map(review => (
                      <div 
                        key={review.id}
                        className={`p-3 rounded-lg border flex justify-between items-center transition ${
                          review.completed 
                            ? 'border-emerald-500/20 bg-emerald-500/5 text-gray-500 line-through' 
                            : 'border-purple-500/20 bg-purple-500/10 text-white'
                        }`}
                        onClick={() => toggleReviewCompletion(review.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${review.completed ? 'border-emerald-500 bg-emerald-500' : 'border-purple-500'}`}>
                            {review.completed && <Check className="w-3 h-3 text-slate-900" />}
                          </div>
                          <span className="text-xs font-semibold">
                            Review: {review.subject} &gt; {review.chapter}
                          </span>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider">
                          {review.completed ? 'Done' : 'Review Due'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

          {/* TAB: POMODORO FOCUS */}
          {activeTab === 'pomodoro' && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Timer className="w-5 h-5 text-purple-400" /> Pomodoro Focus Timer
              </h3>
              <p className="text-xs text-gray-500">Immersive Pomodoro sessions with brainwave sound synthesis</p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Timer Display Card */}
                <div className="lg:col-span-2 glass-card p-8 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  {/* Timer Circular Progress */}
                  <div className="relative w-64 h-64 mb-6">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.03)" strokeWidth="4" fill="transparent" />
                      <circle 
                        cx="50" cy="50" r="44" 
                        stroke="url(#timerGradient)" strokeWidth="5" fill="transparent" 
                        strokeDasharray={2 * Math.PI * 44}
                        strokeDashoffset={2 * Math.PI * 44 * (1 - timeLeft / ((pomoMode === 'focus' ? pomoMinutes : pomoMode === 'shortBreak' ? pomoBreakMinutes : pomoLongBreakMinutes) * 60))}
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                      <defs>
                        <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-white tracking-tighter">
                        {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </span>
                      <span className="text-xs uppercase tracking-wider font-extrabold text-purple-400 mt-1">
                        {pomoMode === 'focus' ? 'Focus Session' : pomoMode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                      </span>
                    </div>
                  </div>

                  {/* Timer Controls */}
                  <div className="flex gap-4 items-center">
                    <button
                      onClick={() => setPomoRunning(!pomoRunning)}
                      className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all ${
                        pomoRunning 
                          ? 'bg-rose-500/10 border-rose-500 text-rose-500 hover:bg-rose-500/20' 
                          : 'bg-purple-600 border-purple-500 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/20'
                      }`}
                    >
                      {pomoRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
                    </button>
                    
                    <button
                      onClick={() => {
                        setPomoRunning(false);
                        setTimeLeft((pomoMode === 'focus' ? pomoMinutes : pomoMode === 'shortBreak' ? pomoBreakMinutes : pomoLongBreakMinutes) * 60);
                      }}
                      className="p-3 bg-white/5 border border-white/5 text-gray-300 hover:text-white rounded-xl transition"
                      title="Reset Timer"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Equalizer Animation (Visualizer) */}
                  {pomoRunning && ambientSound !== 'none' && (
                    <div className="flex gap-1 justify-center items-end h-8 mt-6">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div 
                          key={i} 
                          className="w-1 bg-purple-500 rounded-t-full animate-pulse" 
                          style={{
                            height: `${30 + Math.random() * 70}%`,
                            transformOrigin: 'bottom'
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="mt-6 text-sm font-semibold text-gray-400">
                    Sessions Completed Today: <span className="text-white font-bold text-base">{pomoCount}</span>
                  </div>
                </div>

                {/* Settings & Ambient Sound Card */}
                <div className="space-y-6">
                  
                  {/* Mode Selector */}
                  <div className="glass-card p-6">
                    <h4 className="text-sm font-bold text-gray-300 mb-3">Timer Mode</h4>
                    <div className="flex gap-2">
                      {['focus', 'shortBreak', 'longBreak'].map(m => (
                        <button
                          key={m}
                          onClick={() => {
                            setPomoRunning(false);
                            setPomoMode(m);
                            setTimeLeft((m === 'focus' ? pomoMinutes : m === 'shortBreak' ? pomoBreakMinutes : pomoLongBreakMinutes) * 60);
                          }}
                          className={`flex-grow py-2.5 rounded-lg border text-xs font-bold capitalize transition-all ${
                            pomoMode === m 
                              ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-md' 
                              : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ambient Sounds */}
                  <div className="glass-card p-6">
                    <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center justify-between">
                      <span>Ambient Sound generator</span>
                      {ambientSound !== 'none' ? <Volume2 className="w-4 h-4 text-purple-400 animate-pulse" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
                    </h4>
                    <div className="space-y-2">
                      {[
                        { id: 'none', label: 'Silence' },
                        { id: 'white', label: 'White Noise Focus' },
                        { id: 'binaural', label: 'Binaural Beats (Theta)' },
                        { id: 'ocean', label: 'Ambient Ocean Waves' }
                      ].map(sound => (
                        <button
                          key={sound.id}
                          onClick={() => setAmbientSound(sound.id)}
                          className={`w-full py-2.5 px-4 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                            ambientSound === sound.id 
                              ? 'bg-cyan-950/20 border-cyan-500 text-cyan-300 shadow-md' 
                              : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <span>{sound.label}</span>
                          <span className={`w-2 h-2 rounded-full ${ambientSound === sound.id ? 'bg-cyan-400 animate-ping' : 'bg-transparent'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interval Settings */}
                  <div className="glass-card p-6 space-y-4">
                    <h4 className="text-sm font-bold text-gray-300">Adjust Interval (Min)</h4>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-400">Focus Duration</span>
                        <span className="text-white">{pomoMinutes}m</span>
                      </div>
                      <input 
                        type="range" min="5" max="60" step="5" value={pomoMinutes} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setPomoMinutes(val);
                          if (!pomoRunning && pomoMode === 'focus') setTimeLeft(val * 60);
                        }}
                        className="w-full accent-purple-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-400">Short Break Duration</span>
                        <span className="text-white">{pomoBreakMinutes}m</span>
                      </div>
                      <input 
                        type="range" min="1" max="20" step="1" value={pomoBreakMinutes} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setPomoBreakMinutes(val);
                          if (!pomoRunning && pomoMode === 'shortBreak') setTimeLeft(val * 60);
                        }}
                        className="w-full accent-purple-500"
                      />
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB: SYLLABUS ROADMAP PLANNER */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" /> Syllabus Roadmap Planner
              </h3>
              <p className="text-xs text-gray-500">Auto-generate customized cognitive study milestones spacing based on exam dates</p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form Card */}
                <div className="glass-card p-6">
                  <h4 className="text-sm font-bold text-gray-300 mb-4">Plan Parameters</h4>
                  <form onSubmit={handleGenerateRoadmap} className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5 font-semibold">Subject Title</label>
                      <input
                        type="text"
                        value={roadmapSubject}
                        onChange={(e) => setRoadmapSubject(e.target.value)}
                        placeholder="e.g. Computer Networks"
                        className="w-full"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5 font-semibold">Target Exam Date</label>
                      <input
                        type="date"
                        value={roadmapExamDate}
                        onChange={(e) => setRoadmapExamDate(e.target.value)}
                        className="w-full text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5 font-semibold">Syllabus Chapters (comma/line-separated)</label>
                      <textarea
                        value={roadmapTopics}
                        onChange={(e) => setRoadmapTopics(e.target.value)}
                        placeholder="e.g. Physical Layer, IP Addressing, Routing Protocols, TCP/UDP Flow Control"
                        rows="5"
                        className="w-full text-xs"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isGeneratingRoadmap}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isGeneratingRoadmap ? (
                        <>
                          <RotateCcw className="w-4 h-4 animate-spin" /> Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> Generate Study Roadmap
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Milestones Card */}
                <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-300 mb-4 flex items-center justify-between">
                      <span>Generated Study Milestones</span>
                      {generatedMilestones.length > 0 && (
                        <button
                          onClick={handleImportRoadmap}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-1.5 px-3.5 rounded-lg transition flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Import to Syllabus Tracker
                        </button>
                      )}
                    </h4>

                    {isGeneratingRoadmap ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative w-16 h-16 mb-4">
                          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
                          <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin" />
                        </div>
                        <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest animate-pulse">Running Cognitive Model Planner...</p>
                        <p className="text-[10px] text-gray-500 mt-1">Analyzing syllabus density and spacing review periods</p>
                      </div>
                    ) : generatedMilestones.length > 0 ? (
                      <div className="relative border-l border-white/10 pl-6 ml-2 space-y-6 my-2">
                        {generatedMilestones.map((m, idx) => (
                          <div key={m.id} className="relative group">
                            {/* SVG node point */}
                            <div className="absolute -left-9 top-1.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-cyan-500 flex items-center justify-center text-[10px] font-bold text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-900 transition">
                              {idx + 1}
                            </div>
                            
                            <div>
                              <div className="flex flex-wrap items-baseline justify-between mb-1">
                                <span className="font-bold text-white text-sm">{m.title}</span>
                                <span className="text-[10px] text-gray-500 font-mono">{m.scheduledDate}</span>
                              </div>
                              <p className="text-xs text-gray-400 flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-black uppercase text-cyan-400">
                                  {m.phase}
                                </span>
                                <span>Target: {m.targetHours} Hours focus study</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/10 rounded-2xl">
                        <Compass className="w-12 h-12 text-gray-600 mb-2" />
                        <div className="text-gray-500 font-bold text-sm">No Roadmap Generated Yet</div>
                        <div className="text-gray-600 text-[11px] mt-0.5 text-center px-4">Fill out the parameters on the left to organize your study sequence</div>
                      </div>
                    )}
                  </div>
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 lg:col-span-2">
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
                  <h4 className="text-sm font-bold text-gray-300 mb-4">Focus Distractions Skip Category</h4>
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
                              position: 'bottom',
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

              {/* NEW CHART: Circadian Energy Level vs. Study Hours */}
              <div className="grid grid-cols-1 gap-6">
                <div className="glass-card p-6">
                  <h4 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" /> Circadian Rhythm Analysis (Energy Level vs Productivity)
                  </h4>
                  <p className="text-xs text-gray-500 mb-6">Correlates how many hours you study based on logged mental energy level</p>
                  
                  <div className="h-64 flex justify-center items-center">
                    <Bar
                      data={getEnergyVsProductivityData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false }
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
                        <th className="py-3 px-4">Energy</th>
                        <th className="py-3 px-4">Hours</th>
                        <th className="py-3 px-4">Details / Skip Reason</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {Object.keys(logs).sort((a,b) => new Date(b) - new Date(a)).map(date => {
                        const log = logs[date];
                        let energyColor = 'text-emerald-400';
                        if (log.energy === 'Medium') energyColor = 'text-yellow-400';
                        if (log.energy === 'Low') energyColor = 'text-rose-400';
                        
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
                            <td className={`py-3.5 px-4 font-bold text-xs uppercase ${energyColor}`}>
                              {log.energy || 'N/A'}
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

              {/* Feature 3: Performance Report Card & Shareable Stats Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                
                {/* Visual Share Card */}
                <div className="lg:col-span-2 glass-card p-6 border border-purple-500/20 bg-gradient-to-br from-purple-950/15 via-slate-950/20 to-cyan-950/15 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div>
                    <h4 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-purple-400" /> Shareable Achievement Card
                    </h4>
                    
                    {/* Glowing Share Widget Layout */}
                    <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/50 space-y-4 shadow-xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-purple-400 font-extrabold block">MetricStudy Achievement</span>
                          <span className="text-lg font-black text-white">Student Progress Summary</span>
                        </div>
                        <div className="bg-purple-600/20 border border-purple-500/30 px-3 py-1 rounded-lg text-xs font-bold text-purple-300">
                          {todayDateStr}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 border-t border-b border-white/5 py-4">
                        <div>
                          <span className="text-[10px] text-gray-500 uppercase block">Total Study Time</span>
                          <span className="text-xl font-bold text-white">
                            {Object.values(logs).reduce((acc, l) => acc + (l.hours || 0), 0)} Hours
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 uppercase block">Active Streak</span>
                          <span className="text-xl font-bold text-orange-400 flex items-center gap-1">
                            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" /> {getStreak()} Days
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 uppercase block">Attendance Rate</span>
                          <span className="text-xl font-bold text-emerald-400">
                            {Object.keys(logs).length === 0 ? 0 : Math.round((Object.values(logs).filter(l => l.studied).length / Object.keys(logs).length) * 100)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 uppercase block">Syllabus Completion</span>
                          <span className="text-xl font-bold text-pink-400">
                            {getSyllabusStats()}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold leading-none">
                        <span>STUDENT: Avinash Kumar</span>
                        <span className="tracking-widest text-cyan-400/80">METRICSTUDY SAAS</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={handleCopyShareable}
                      className="flex-grow py-2.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Copy Shareable Summary Emojis
                    </button>
                  </div>
                </div>

                {/* Exporters Card */}
                <div className="glass-card p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-300 mb-4">Export Performance Report</h4>
                    <p className="text-xs text-gray-500 mb-6">Download your study tracker metrics database in standard formats</p>
                    
                    <div className="space-y-3">
                      <button
                        onClick={handleExportJSON}
                        className="w-full py-3 px-4 bg-white/5 border border-white/5 hover:border-cyan-500/20 text-white hover:bg-white/10 rounded-xl transition flex items-center justify-between text-xs font-bold"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          <span>Export Metrics Database (JSON)</span>
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-gray-500 font-black">.json</span>
                      </button>

                      <button
                        onClick={handleExportMarkdown}
                        className="w-full py-3 px-4 bg-white/5 border border-white/5 hover:border-purple-500/20 text-white hover:bg-white/10 rounded-xl transition flex items-center justify-between text-xs font-bold"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-400" />
                          <span>Export Summary Report (Markdown)</span>
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-gray-500 font-black">.md</span>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 mt-6 text-[10px] text-gray-600 text-center font-medium">
                    Backed up locally. Your logs stay 100% private in browser storage.
                  </div>
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
