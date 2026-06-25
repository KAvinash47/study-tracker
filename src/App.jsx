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
  VolumeX,
  Code2,
  AlertTriangle,
  FileSpreadsheet
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
  { id: 1, text: "Revise Operating Systems Paging concepts", completed: true },
  { id: 2, text: "Solve 5 LeetCode Medium problems on Dynamic Programming", completed: false },
  { id: 3, text: "Enter yesterday's DBMS mistake in the Mistake Notebook", completed: false }
];

const INITIAL_TARGETS = [
  { day: "Monday", targetHours: 6, actualHours: 5.5 },
  { day: "Tuesday", targetHours: 6, actualHours: 6.5 },
  { day: "Wednesday", targetHours: 5, actualHours: 0 }, 
  { day: "Thursday", targetHours: 6, actualHours: 5.0 },
  { day: "Friday", targetHours: 7, actualHours: 4.5 },
  { day: "Saturday", targetHours: 7, actualHours: 8.0 },
  { day: "Sunday", targetHours: 5, actualHours: 0 }
];

const INITIAL_GATE_SYLLABUS = {
  "Operating Systems": [
    { chapter: "Process", status: "completed" },
    { chapter: "Threads", status: "completed" },
    { chapter: "Scheduling", status: "not-started" },
    { chapter: "Deadlock", status: "not-started" },
    { chapter: "Memory Management", status: "not-started" },
    { chapter: "Paging & Segmentation", status: "not-started" },
    { chapter: "File System", status: "not-started" }
  ],
  "Database Management Systems": [
    { chapter: "ER Model", status: "completed" },
    { chapter: "Relational Algebra", status: "completed" },
    { chapter: "SQL Queries", status: "in-progress" },
    { chapter: "Normalization", status: "not-started" },
    { chapter: "Transactions & Concurrency Control", status: "not-started" }
  ],
  "Computer Networks": [
    { chapter: "OSI & TCP/IP Stack Layers", status: "completed" },
    { chapter: "IP Addressing & Subnetting", status: "in-progress" },
    { chapter: "Routing Protocols", status: "not-started" },
    { chapter: "TCP/UDP & Flow Control", status: "not-started" }
  ],
  "Algorithms & DSA": [
    { chapter: "Asymptotic Complexity", status: "completed" },
    { chapter: "Searching & Sorting", status: "completed" },
    { chapter: "Divide and Conquer / Greedy", status: "in-progress" },
    { chapter: "Dynamic Programming", status: "not-started" },
    { chapter: "Graph Algorithms (DFS/BFS/Dijkstra)", status: "not-started" }
  ]
};

const INITIAL_MISTAKES = [
  { id: 1, question: "GATE 2022 OS Scheduling question - Gantt chart error", reason: "Calculation error", concept: "CPU Scheduling", revisionDate: "2026-06-28", done: false },
  { id: 2, question: "DBMS Normalization finding candidate key", reason: "Conceptual gap", concept: "Functional Dependency", revisionDate: "2026-06-26", done: true }
];

const INITIAL_PYQS = [
  { id: 1, subject: "Operating Systems", topic: "CPU Scheduling", difficulty: "Medium", year: "2023", attempt: "Solved", analysis: "Got standard Gantt chart solved, watch out for context switch overhead." },
  { id: 2, subject: "Computer Networks", topic: "TCP Congestion Control", difficulty: "Hard", year: "2024", attempt: "Re-attempt needed", analysis: "Formula for threshold reduction on 3 duplicate ACKs vs timeout." }
];

const INITIAL_NOTES = [
  { id: 1, title: "OS: Process vs Thread Notes", type: "Markdown", content: "### Process vs Thread\n- Process: Independent execution unit, has own memory space.\n- Thread: Lightweight sub-process, shares memory space of parent.", date: "2026-06-24" },
  { id: 2, title: "DBMS: Normalization Handouts", type: "PDF", content: "Standard PDF reference of 1NF, 2NF, 3NF, BCNF", date: "2026-06-25", progress: 60 }
];

const INITIAL_FLASHCARDS = [
  { id: 1, question: "What is the condition for Deadlock prevention in Havender's algorithm?", answer: "Eliminate one of: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.", subject: "Operating Systems", reviewNeeded: false },
  { id: 2, question: "Difference between 3NF and BCNF?", answer: "BCNF does not allow a non-prime attribute to determine a prime attribute. In BCNF, X -> Y requires X to be a super key.", subject: "Database Systems", reviewNeeded: true }
];

// Preloaded logs database containing Energy Levels
const INITIAL_LOGS = {
  "2026-06-19": { studied: true, hours: 4.5, energy: "Medium", topics: "Operating Systems basic paging", notes: "Very productive day" },
  "2026-06-20": { studied: true, hours: 6.0, energy: "High", topics: "Normalization in DBMS", notes: "Completed homework" },
  "2026-06-21": { studied: false, hours: 0, energy: "Low", reason: "Illness / tired", notes: "Severe fever, took full rest" },
  "2026-06-22": { studied: true, hours: 5.0, energy: "High", topics: "Graphs & DFS algorithms", notes: "Tough concepts but exciting output" },
  "2026-06-23": { studied: true, hours: 3.5, energy: "Medium", topics: "IP Addressing in CN", notes: "Setup subnet math" },
  "2026-06-24": { studied: true, hours: 7.0, energy: "High", topics: "transactions and concurrency", notes: "Worked on conflict serializability" }
};

// Default initial spaced repetition reviews
const INITIAL_REVIEWS = [
  { id: "sr-mock-1", chapter: "Process", subject: "Operating Systems", scheduledDate: "2026-06-25", completed: false },
  { id: "sr-mock-2", chapter: "ER Model", subject: "Database Management Systems", scheduledDate: "2026-06-25", completed: false }
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
    const saved = localStorage.getItem('gate_syllabus');
    return saved ? JSON.parse(saved) : INITIAL_GATE_SYLLABUS;
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

  // GATE Preparation Custom States
  // 1. Digital Notes & Flashcards
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('gate_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });
  const [flashcards, setFlashcards] = useState(() => {
    const saved = localStorage.getItem('gate_flashcards');
    return saved ? JSON.parse(saved) : INITIAL_FLASHCARDS;
  });
  const [searchNotesQuery, setSearchNotesQuery] = useState('');
  const [currentFCIndex, setCurrentFCIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);

  // 2. Coding Practice states
  const [leetcodeCount, setLeetcodeCount] = useState(() => {
    const saved = localStorage.getItem('coding_leetcode');
    return saved ? parseInt(saved) : 45;
  });
  const [gfgCount, setGfgCount] = useState(() => {
    const saved = localStorage.getItem('coding_gfg');
    return saved ? parseInt(saved) : 60;
  });
  const [hackerRankCount, setHackerRankCount] = useState(() => {
    const saved = localStorage.getItem('coding_hackerrank');
    return saved ? parseInt(saved) : 25;
  });
  const [aiAnalysis, setAiAnalysis] = useState(() => {
    const saved = localStorage.getItem('coding_ai_analysis');
    return saved ? saved : "Average time complexity is O(N log N). Space complexity optimization is needed on Graph questions. Focus on Dynamic Programming to improve LeetCode ratio.";
  });
  const [isAnalyzingCoding, setIsAnalyzingCoding] = useState(false);

  // 3. Mistake Notebook states
  const [mistakes, setMistakes] = useState(() => {
    const saved = localStorage.getItem('gate_mistakes');
    return saved ? JSON.parse(saved) : INITIAL_MISTAKES;
  });

  // 4. PYQ Engine states
  const [pyqsList, setPyqsList] = useState(() => {
    const saved = localStorage.getItem('gate_pyqs');
    return saved ? JSON.parse(saved) : INITIAL_PYQS;
  });

  // Form states for new inputs
  const [noteTitle, setNoteTitle] = useState('');
  const [noteType, setNoteType] = useState('Markdown'); // 'Markdown' | 'Handwritten' | 'PDF'
  const [noteContent, setNoteContent] = useState('');
  const [noteProgress, setNoteProgress] = useState(0);

  const [fcQuestion, setFcQuestion] = useState('');
  const [fcAnswer, setFcAnswer] = useState('');
  const [fcSubject, setFcSubject] = useState('Operating Systems');

  const [mistakeQ, setMistakeQ] = useState('');
  const [mistakeReason, setMistakeReason] = useState('Calculation error');
  const [mistakeConcept, setMistakeConcept] = useState('');
  const [mistakeDate, setMistakeDate] = useState('2026-06-26');
  const [searchMistakeQuery, setSearchMistakeQuery] = useState('');

  const [pyqSubj, setPyqSubj] = useState('Operating Systems');
  const [pyqTopic, setPyqTopic] = useState('');
  const [pyqDifficulty, setPyqDifficulty] = useState('Medium');
  const [pyqYear, setPyqYear] = useState('2024');
  const [pyqAttempt, setPyqAttempt] = useState('Solved');
  const [pyqAnalysis, setPyqAnalysis] = useState('');
  const [searchPyqQuery, setSearchPyqQuery] = useState('');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('targets', JSON.stringify(targets));
  }, [targets]);

  useEffect(() => {
    localStorage.setItem('gate_syllabus', JSON.stringify(syllabus));
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
    localStorage.setItem('gate_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('gate_flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    localStorage.setItem('coding_leetcode', leetcodeCount);
  }, [leetcodeCount]);

  useEffect(() => {
    localStorage.setItem('coding_gfg', gfgCount);
  }, [gfgCount]);

  useEffect(() => {
    localStorage.setItem('coding_hackerrank', hackerRankCount);
  }, [hackerRankCount]);

  useEffect(() => {
    localStorage.setItem('coding_ai_analysis', aiAnalysis);
  }, [aiAnalysis]);

  useEffect(() => {
    localStorage.setItem('gate_mistakes', JSON.stringify(mistakes));
  }, [mistakes]);

  useEffect(() => {
    localStorage.setItem('gate_pyqs', JSON.stringify(pyqsList));
  }, [pyqsList]);

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

  // Digital Notes helper functions
  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    const newNote = {
      id: Date.now(),
      title: noteTitle.trim(),
      type: noteType,
      content: noteContent.trim(),
      progress: noteType === 'PDF' ? parseInt(noteProgress) : undefined,
      date: todayDateStr
    };
    setNotes(prev => [newNote, ...prev]);
    setNoteTitle('');
    setNoteContent('');
    setNoteProgress(0);
    alert('Note added successfully!');
  };

  const handleDeleteNote = (id) => {
    if (!window.confirm('Delete this note?')) return;
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleUpdateNoteProgress = (id, prog) => {
    setNotes(prev => prev.map(n => {
      if (n.id === id) return { ...n, progress: Math.min(100, Math.max(0, parseInt(prog))) };
      return n;
    }));
  };

  // Flashcards helper functions
  const handleAddFlashcard = (e) => {
    e.preventDefault();
    if (!fcQuestion.trim() || !fcAnswer.trim()) return;
    const newFC = {
      id: Date.now(),
      question: fcQuestion.trim(),
      answer: fcAnswer.trim(),
      subject: fcSubject,
      reviewNeeded: false
    };
    setFlashcards(prev => [...prev, newFC]);
    setFcQuestion('');
    setFcAnswer('');
    alert('Flashcard added successfully!');
  };

  const handleToggleFlashcardReview = (id) => {
    setFlashcards(prev => prev.map(fc => {
      if (fc.id === id) return { ...fc, reviewNeeded: !fc.reviewNeeded };
      return fc;
    }));
  };

  const handleDeleteFlashcard = (id) => {
    if (!window.confirm('Delete this flashcard?')) return;
    setFlashcards(prev => prev.filter(fc => fc.id !== id));
    if (currentFCIndex >= flashcards.length - 1 && currentFCIndex > 0) {
      setCurrentFCIndex(currentFCIndex - 1);
    }
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

  // Mistake Notebook helper functions
  const handleAddMistake = (e) => {
    e.preventDefault();
    if (!mistakeQ.trim() || !mistakeConcept.trim()) return;
    const newMistake = {
      id: Date.now(),
      question: mistakeQ.trim(),
      reason: mistakeReason,
      concept: mistakeConcept.trim(),
      revisionDate: mistakeDate,
      done: false
    };
    setMistakes(prev => [newMistake, ...prev]);
    setMistakeQ('');
    setMistakeConcept('');
    alert('Mistake logged successfully!');
  };

  const handleToggleMistake = (id) => {
    setMistakes(prev => prev.map(m => {
      if (m.id === id) return { ...m, done: !m.done };
      return m;
    }));
  };

  const handleDeleteMistake = (id) => {
    if (!window.confirm('Delete this mistake log?')) return;
    setMistakes(prev => prev.filter(m => m.id !== id));
  };

  // PYQ Engine helper functions
  const handleAddPyq = (e) => {
    e.preventDefault();
    if (!pyqTopic.trim() || !pyqAnalysis.trim()) return;
    const newPyq = {
      id: Date.now(),
      subject: pyqSubj,
      topic: pyqTopic.trim(),
      difficulty: pyqDifficulty,
      year: pyqYear,
      attempt: pyqAttempt,
      analysis: pyqAnalysis.trim()
    };
    setPyqsList(prev => [newPyq, ...prev]);
    setPyqTopic('');
    setPyqAnalysis('');
    alert('PYQ attempt logged successfully!');
  };

  const handleUpdatePyqAttempt = (id, attempt) => {
    setPyqsList(prev => prev.map(p => {
      if (p.id === id) return { ...p, attempt };
      return p;
    }));
  };

  const handleDeletePyq = (id) => {
    if (!window.confirm('Delete this PYQ record?')) return;
    setPyqsList(prev => prev.filter(p => p.id !== id));
  };

  // AI Coding Performance Analysis Simulation
  const handleTriggerAiAnalysis = () => {
    setIsAnalyzingCoding(true);
    setTimeout(() => {
      const total = leetcodeCount + gfgCount + hackerRankCount;
      let review = "";
      if (total < 50) {
        review = `Total problems solved: ${total}. Action Required: Problem count is low. Set a goal of solving 2 problems daily on LeetCode. Focus on Arrays, Linked Lists and Stacks first for basic strength.`;
      } else if (total < 150) {
        review = `Total problems solved: ${total} (LeetCode: ${leetcodeCount}, GFG: ${gfgCount}, HackerRank: ${hackerRankCount}). Good start! Solidify concepts by trying Medium level Dynamic Programming and Graph problems. Optimize time complexities to O(N log N) or O(N).`;
      } else {
        review = `Total problems solved: ${total} (LeetCode: ${leetcodeCount}, GFG: ${gfgCount}, HackerRank: ${hackerRankCount}). Advanced level! Focus on system optimization, recursion trees, and competitive programming. Master hard segment trees and heavy math-based algorithmic PYQs.`;
      }
      setAiAnalysis(review);
      setIsAnalyzingCoding(false);
      alert("AI analysis updated based on your current coding metrics!");
    }, 1500);
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

  // Calculate specific subject progress
  const getSubjectProgress = (subj) => {
    const chapters = syllabus[subj] || [];
    if (chapters.length === 0) return 0;
    const completed = chapters.filter(c => c.status === 'completed').length;
    return Math.round((completed / chapters.length) * 100);
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
    { id: 'notes', label: 'Digital Notes', icon: FileText },
    { id: 'coding', label: 'Coding Practice', icon: Code2 },
    { id: 'mistakes', label: 'Mistake Notebook', icon: AlertTriangle },
    { id: 'pyqs', label: 'PYQ Engine', icon: FileSpreadsheet },
    { id: 'syllabus', label: 'Topic Roadmap', icon: Book },
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

          {/* TAB: DIGITAL NOTES & FLASHCARDS */}
          {activeTab === 'notes' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" /> Digital Notes & Flashcards
                  </h3>
                  <p className="text-xs text-gray-500">Organize GATE CS study materials, scan handwritten notes, and train with flashcards</p>
                </div>
                
                {/* Search notes bar */}
                <input
                  type="text"
                  value={searchNotesQuery}
                  onChange={(e) => setSearchNotesQuery(e.target.value)}
                  placeholder="Search notes..."
                  className="px-4 py-2 text-xs w-64"
                />
              </div>

              {/* Flashcards player widget */}
              <div className="glass-card p-6 border border-purple-500/10">
                <h4 className="text-sm font-bold text-purple-300 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" /> Spaced Repetition Flashcards Player
                </h4>
                
                {flashcards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    
                    {/* Left: Add Flashcard form */}
                    <div className="glass bg-white/5 p-4 rounded-xl space-y-3">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Add Flashcard</span>
                      <form onSubmit={handleAddFlashcard} className="space-y-2">
                        <input
                          type="text"
                          value={fcQuestion}
                          onChange={(e) => setFcQuestion(e.target.value)}
                          placeholder="Question (e.g. What is ACID?)"
                          className="w-full text-xs"
                          required
                        />
                        <input
                          type="text"
                          value={fcAnswer}
                          onChange={(e) => setFcAnswer(e.target.value)}
                          placeholder="Answer summary"
                          className="w-full text-xs"
                          required
                        />
                        <select
                          value={fcSubject}
                          onChange={(e) => setFcSubject(e.target.value)}
                          className="w-full text-xs mt-1"
                        >
                          <option>Operating Systems</option>
                          <option>Database Management Systems</option>
                          <option>Computer Networks</option>
                          <option>Algorithms & DSA</option>
                        </select>
                        <button type="submit" className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg mt-2">
                          Create Card
                        </button>
                      </form>
                    </div>

                    {/* Middle: 3D Flip Card */}
                    <div className="md:col-span-2 flex flex-col items-center">
                      <div 
                        onClick={() => setFcFlipped(!fcFlipped)}
                        className="flashcard-container w-full max-w-md h-48 cursor-pointer"
                      >
                        <div className={`flashcard-inner w-full h-full relative rounded-2xl border transition-all duration-500 ${
                          fcFlipped ? 'flashcard-flipped border-purple-500 bg-purple-950/20 shadow-purple-500/10' : 'border-white/5 bg-white/5'
                        }`}>
                          
                          {/* Front side */}
                          <div className="flashcard-front absolute inset-0 p-6 flex flex-col justify-between items-center text-center">
                            <span className="text-[9px] uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded text-purple-400 font-extrabold">
                              {flashcards[currentFCIndex]?.subject} (Front)
                            </span>
                            <p className="text-sm font-semibold text-white px-2">
                              {flashcards[currentFCIndex]?.question}
                            </p>
                            <span className="text-[9px] text-gray-500 font-medium">Click to see Answer</span>
                          </div>

                          {/* Back side */}
                          <div className="flashcard-back absolute inset-0 p-6 flex flex-col justify-between items-center text-center">
                            <span className="text-[9px] uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-400 font-extrabold">
                              Answer (Back)
                            </span>
                            <p className="text-xs text-gray-300 px-2 leading-relaxed">
                              {flashcards[currentFCIndex]?.answer}
                            </p>
                            <span className="text-[9px] text-gray-500 font-medium">Click to show Question</span>
                          </div>

                        </div>
                      </div>

                      {/* Card Nav Controls */}
                      <div className="flex gap-4 items-center mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFcFlipped(false);
                            setCurrentFCIndex(idx => (idx - 1 + flashcards.length) % flashcards.length);
                          }}
                          className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-xs hover:text-white"
                        >
                          Prev
                        </button>
                        
                        <span className="text-xs text-gray-500">
                          {currentFCIndex + 1} / {flashcards.length}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFcFlipped(false);
                            setCurrentFCIndex(idx => (idx + 1) % flashcards.length);
                          }}
                          className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-xs hover:text-white"
                        >
                          Next
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFlashcardReview(flashcards[currentFCIndex].id);
                          }}
                          className={`ml-2 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                            flashcards[currentFCIndex]?.reviewNeeded 
                              ? 'bg-rose-500/20 border-rose-500 text-rose-300' 
                              : 'bg-white/5 border-white/5 text-gray-400 hover:text-rose-400'
                          }`}
                        >
                          {flashcards[currentFCIndex]?.reviewNeeded ? '★ Flagged for review' : '☆ Mark review'}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFlashcard(flashcards[currentFCIndex].id);
                          }}
                          className="text-gray-500 hover:text-rose-500 p-1 text-xs"
                          title="Delete Card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-white/10 rounded-xl">
                    <p className="text-gray-500 text-sm font-semibold">No flashcards added yet</p>
                  </div>
                )}
              </div>

              {/* Digital Notes Catalog Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Notes Input Panel */}
                <div className="glass-card p-6">
                  <h4 className="text-sm font-bold text-gray-300 mb-4">Create Note File</h4>
                  <form onSubmit={handleAddNote} className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-semibold">Title</label>
                      <input
                        type="text"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        placeholder="e.g. Processes and Threads"
                        className="w-full text-xs"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-semibold">Note Format</label>
                      <div className="flex gap-2">
                        {['Markdown', 'Handwritten', 'PDF'].map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setNoteType(type)}
                            className={`flex-grow py-2 rounded-lg border text-xs font-bold transition ${
                              noteType === type 
                                ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10' 
                                : 'bg-white/5 border-white/5 text-gray-400'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {noteType === 'PDF' && (
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs text-gray-400 font-semibold">Study Progress</label>
                          <span className="text-cyan-400 text-xs font-bold">{noteProgress}%</span>
                        </div>
                        <input
                          type="range" min="0" max="100" step="5" value={noteProgress}
                          onChange={(e) => setNoteProgress(e.target.value)}
                          className="w-full accent-purple-500"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-semibold">
                        {noteType === 'Markdown' ? 'Note Content (supports MD)' : noteType === 'Handwritten' ? 'Link handwritten scans or draw details' : 'PDF Study reference details'}
                      </label>
                      <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder={
                          noteType === 'Markdown' 
                            ? "### Thread Types\n- User Level Threads\n- Kernel Level Threads..." 
                            : "Enter handwritten source folder, scan metadata or drag sketches description..."
                        }
                        rows="6"
                        className="w-full text-xs"
                        required
                      />
                    </div>

                    <button type="submit" className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-lg">
                      <Plus className="w-3.5 h-3.5" /> Save Note File
                    </button>
                  </form>
                </div>

                {/* Notes List Display */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="text-sm font-bold text-gray-300">Saved Study Notes ({notes.length})</h4>
                  
                  <div className="space-y-4">
                    {notes
                      .filter(n => n.title.toLowerCase().includes(searchNotesQuery.toLowerCase()) || n.content.toLowerCase().includes(searchNotesQuery.toLowerCase()))
                      .map(note => (
                        <div key={note.id} className="glass-card p-5 border border-white/5 relative group animate-fadeIn">
                          
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                                note.type === 'Markdown' 
                                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                                  : note.type === 'Handwritten' 
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                                    : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                              }`}>
                                {note.type}
                              </span>
                              <h5 className="text-base font-bold text-white mt-2">{note.title}</h5>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-500 font-semibold">{note.date}</span>
                              <button 
                                onClick={() => handleDeleteNote(note.id)}
                                className="text-gray-500 hover:text-rose-500 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Content format display */}
                          {note.type === 'Markdown' && (
                            <div className="p-3 bg-slate-900/50 rounded-lg text-xs font-mono text-gray-300 border border-white/5 leading-relaxed whitespace-pre-wrap">
                              {note.content}
                            </div>
                          )}

                          {note.type === 'Handwritten' && (
                            <div className="p-4 bg-slate-900/50 rounded-lg text-xs text-gray-300 border border-white/5 border-dashed flex flex-col items-center justify-center text-center gap-2">
                              <span className="text-amber-400 font-extrabold text-[10px] uppercase">Handwritten Canvas Scanner</span>
                              <p className="text-[11px] text-gray-500 max-w-xs">{note.content}</p>
                              <button 
                                type="button" 
                                onClick={() => alert("Drawing canvas & scan upload is a mock! Connect local camera to capture written sheets.")}
                                className="bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 px-3 py-1 rounded text-[10px] font-bold"
                              >
                                Trigger Scan Sheets
                              </button>
                            </div>
                          )}

                          {note.type === 'PDF' && (
                            <div className="space-y-3 bg-slate-900/50 p-3 rounded-lg border border-white/5">
                              <div className="flex justify-between text-xs items-center font-semibold">
                                <span className="text-gray-400">PDF Reader Completed:</span>
                                <span className="text-cyan-400">{note.progress || 0}%</span>
                              </div>
                              <input 
                                type="range" min="0" max="100" step="5" value={note.progress || 0}
                                onChange={(e) => handleUpdateNoteProgress(note.id, e.target.value)}
                                className="w-full accent-cyan-500"
                              />
                              <p className="text-[11px] text-gray-500 italic mt-1">{note.content}</p>
                            </div>
                          )}

                        </div>
                      ))}
                    
                    {notes.length === 0 && (
                      <div className="text-center py-10 border border-dashed border-white/10 rounded-xl text-gray-500">
                        No notes recorded yet. Start logging details above.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: CODING PRACTICE */}
          {activeTab === 'coding' && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-400" /> Coding Practice Tracker
              </h3>
              <p className="text-xs text-gray-500">Track and log your problem-solving metrics on LeetCode, GFG, and HackerRank.</p>

              {/* Counter Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* LeetCode */}
                <div className="glass-card p-6 border border-amber-500/10 hover:border-amber-500/20 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-400">LeetCode</h4>
                      <p className="text-xs text-gray-500">Solve daily challenges</p>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      LeetCode
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-extrabold text-white">{leetcodeCount}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setLeetcodeCount(prev => Math.max(0, prev - 1))}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center font-bold text-lg text-gray-300"
                      >
                        -
                      </button>
                      <button 
                        onClick={() => setLeetcodeCount(prev => prev + 1)}
                        className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/35 transition flex items-center justify-center font-bold text-lg text-amber-400"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* GeeksforGeeks */}
                <div className="glass-card p-6 border border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-400">GeeksforGeeks</h4>
                      <p className="text-xs text-gray-500">Practice core concepts</p>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      GFG
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-extrabold text-white">{gfgCount}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setGfgCount(prev => Math.max(0, prev - 1))}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center font-bold text-lg text-gray-300"
                      >
                        -
                      </button>
                      <button 
                        onClick={() => setGfgCount(prev => prev + 1)}
                        className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/35 transition flex items-center justify-center font-bold text-lg text-emerald-400"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* HackerRank */}
                <div className="glass-card p-6 border border-cyan-500/10 hover:border-cyan-500/20 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-400">HackerRank</h4>
                      <p className="text-xs text-gray-500">Speed and syntax skill</p>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      HackerRank
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-extrabold text-white">{hackerRankCount}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setHackerRankCount(prev => Math.max(0, prev - 1))}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center font-bold text-lg text-gray-300"
                      >
                        -
                      </button>
                      <button 
                        onClick={() => setHackerRankCount(prev => prev + 1)}
                        className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-500/35 transition flex items-center justify-center font-bold text-lg text-cyan-400"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI performance analysis section */}
              <div className="glass-card p-6 border border-purple-500/10 hover:border-purple-500/20 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h4 className="text-md font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" /> AI Performance Analysis
                    </h4>
                    <p className="text-xs text-gray-500">Evaluate solved problem ratios and receive custom optimization roadmap insights.</p>
                  </div>
                  
                  <button
                    onClick={handleTriggerAiAnalysis}
                    disabled={isAnalyzingCoding}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold px-5 py-2 rounded-xl transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {isAnalyzingCoding ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Trigger AI Review
                      </>
                    )}
                  </button>
                </div>

                <div className="p-5 bg-black/40 rounded-xl border border-white/5">
                  <h5 className="text-xs font-black uppercase tracking-wider text-purple-400 mb-2">Diagnostic Summary</h5>
                  <p className="text-sm font-medium text-gray-300 leading-relaxed italic text-start">
                    &ldquo;{aiAnalysis}&ldquo;
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MISTAKE NOTEBOOK */}
          {activeTab === 'mistakes' && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Mistake Notebook
              </h3>
              <p className="text-xs text-gray-500">Log every mistake, analyze the failure reason, and revision schedule.</p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form column */}
                <div className="glass-card p-6 h-fit">
                  <h4 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-purple-400" /> Log New Mistake
                  </h4>
                  <form onSubmit={handleAddMistake} className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Question / Problem Description</label>
                      <textarea
                        value={mistakeQ}
                        onChange={(e) => setMistakeQ(e.target.value)}
                        placeholder="e.g. Find Candidate Key - missed transitive dependency X -> Z"
                        rows="3"
                        className="w-full"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Reason for Error</label>
                      <select
                        value={mistakeReason}
                        onChange={(e) => setMistakeReason(e.target.value)}
                        className="w-full"
                      >
                        <option value="Calculation error">Calculation error</option>
                        <option value="Conceptual gap">Conceptual gap</option>
                        <option value="Silly mistake">Silly mistake</option>
                        <option value="Time pressure">Time pressure</option>
                        <option value="Misread question">Misread question</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Concept / Topic</label>
                      <input
                        type="text"
                        value={mistakeConcept}
                        onChange={(e) => setMistakeConcept(e.target.value)}
                        placeholder="e.g. Candidate Key, DBMS Normalization"
                        className="w-full"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Target Revision Date</label>
                      <input
                        type="date"
                        value={mistakeDate}
                        onChange={(e) => setMistakeDate(e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Save Mistake Log
                    </button>
                  </form>
                </div>

                {/* List column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Search and Filters */}
                  <div className="glass-card p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <input
                      type="text"
                      value={searchMistakeQuery}
                      onChange={(e) => setSearchMistakeQuery(e.target.value)}
                      placeholder="Search mistakes by question, concept or reason..."
                      className="w-full md:w-96 text-sm"
                    />
                    <div className="flex gap-4 text-xs font-semibold text-gray-400">
                      <div>Total: <span className="text-white">{mistakes.length}</span></div>
                      <div>Pending: <span className="text-amber-400">{mistakes.filter(m => !m.done).length}</span></div>
                      <div>Revised: <span className="text-emerald-400">{mistakes.filter(m => m.done).length}</span></div>
                    </div>
                  </div>

                  {/* List Container */}
                  <div className="space-y-4">
                    {mistakes.filter(m => 
                      m.question.toLowerCase().includes(searchMistakeQuery.toLowerCase()) ||
                      m.concept.toLowerCase().includes(searchMistakeQuery.toLowerCase()) ||
                      m.reason.toLowerCase().includes(searchMistakeQuery.toLowerCase())
                    ).map((m, index, arr) => {
                      // Color schemes depending on reason
                      let badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                      if (m.reason === "Conceptual gap") badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                      if (m.reason === "Silly mistake") badgeColor = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
                      if (m.reason === "Time pressure") badgeColor = "bg-purple-500/10 text-purple-400 border-purple-500/20";
                      if (m.reason === "Misread question") badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";

                      return (
                        <div 
                          key={m.id} 
                          className={`glass-card p-5 border transition-all duration-300 ${
                            m.done 
                              ? 'border-emerald-500/20 bg-emerald-950/5 opacity-60' 
                              : 'border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase">
                                  Mistake #{arr.length - index}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${badgeColor}`}>
                                  {m.reason}
                                </span>
                                {m.done && (
                                  <span className="px-2 py-0.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold">
                                    Revised
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm font-medium text-white leading-relaxed ${m.done ? 'line-through text-gray-500' : ''}`}>
                                {m.question}
                              </p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs text-gray-400">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-gray-500">Concept:</span>
                                  <span className="text-gray-300 font-medium">{m.concept}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                  <span className="font-semibold text-gray-500">Revision Date:</span>
                                  <span className="text-gray-300 font-medium">{m.revisionDate}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleMistake(m.id)}
                                className={`p-2 rounded-lg border transition-all duration-200 ${
                                  m.done 
                                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400'
                                }`}
                                title={m.done ? "Mark as Pending Revision" : "Mark as Revised"}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMistake(m.id)}
                                className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 transition-all duration-200"
                                title="Delete Log"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {mistakes.length === 0 && (
                      <div className="text-center py-12 glass-card border border-white/5 text-gray-500 text-sm">
                        No mistakes logged yet. Click "Log New Mistake" to start keeping track of errors!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PYQ ENGINE */}
          {activeTab === 'pyqs' && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-cyan-400" /> PYQ Engine
              </h3>
              <p className="text-xs text-gray-500">Track GATE Previous Year Questions (PYQs), difficulty levels, and solution reviews.</p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form column */}
                <div className="glass-card p-6 h-fit">
                  <h4 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-cyan-400" /> Log PYQ Attempt
                  </h4>
                  <form onSubmit={handleAddPyq} className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Subject</label>
                      <select
                        value={pyqSubj}
                        onChange={(e) => setPyqSubj(e.target.value)}
                        className="w-full"
                      >
                        <option value="Operating Systems">Operating Systems</option>
                        <option value="Database Management Systems">Database Management Systems</option>
                        <option value="Computer Networks">Computer Networks</option>
                        <option value="Algorithms & DSA">Algorithms & DSA</option>
                        <option value="General Aptitude">General Aptitude</option>
                        <option value="Engineering Mathematics">Engineering Mathematics</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Topic / Sub-topic</label>
                      <input
                        type="text"
                        value={pyqTopic}
                        onChange={(e) => setPyqTopic(e.target.value)}
                        placeholder="e.g. TCP Congestion Window Math"
                        className="w-full"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Difficulty</label>
                        <select
                          value={pyqDifficulty}
                          onChange={(e) => setPyqDifficulty(e.target.value)}
                          className="w-full"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">GATE Year</label>
                        <input
                          type="text"
                          value={pyqYear}
                          onChange={(e) => setPyqYear(e.target.value)}
                          placeholder="e.g. 2024"
                          className="w-full"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Attempt Status</label>
                      <select
                        value={pyqAttempt}
                        onChange={(e) => setPyqAttempt(e.target.value)}
                        className="w-full"
                      >
                        <option value="Solved">Solved</option>
                        <option value="Re-attempt needed">Re-attempt needed</option>
                        <option value="Unsolved">Unsolved</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Analysis & Key Insights</label>
                      <textarea
                        value={pyqAnalysis}
                        onChange={(e) => setPyqAnalysis(e.target.value)}
                        placeholder="What was tricky? Explain the concept/formula for revision."
                        rows="3"
                        className="w-full"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Log PYQ Entry
                    </button>
                  </form>
                </div>

                {/* List column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Search and Filters */}
                  <div className="glass-card p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <input
                      type="text"
                      value={searchPyqQuery}
                      onChange={(e) => setSearchPyqQuery(e.target.value)}
                      placeholder="Search PYQs by subject, topic or insight..."
                      className="w-full md:w-96 text-sm"
                    />
                    <div className="flex gap-4 text-xs font-semibold text-gray-400">
                      <div>Total Logs: <span className="text-white">{pyqsList.length}</span></div>
                      <div>Solved: <span className="text-emerald-400">{pyqsList.filter(p => p.attempt === 'Solved').length}</span></div>
                      <div>Re-attempt: <span className="text-amber-400">{pyqsList.filter(p => p.attempt === 'Re-attempt needed').length}</span></div>
                    </div>
                  </div>

                  {/* List Container */}
                  <div className="space-y-4">
                    {pyqsList.filter(p => 
                      p.subject.toLowerCase().includes(searchPyqQuery.toLowerCase()) ||
                      p.topic.toLowerCase().includes(searchPyqQuery.toLowerCase()) ||
                      p.analysis.toLowerCase().includes(searchPyqQuery.toLowerCase())
                    ).map((p) => {
                      // Difficulty badge style
                      let diffColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                      if (p.difficulty === "Medium") diffColor = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
                      if (p.difficulty === "Hard") diffColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";

                      // Attempt badge style
                      let attemptColor = "bg-white/5 border-white/10 text-gray-400";
                      if (p.attempt === "Solved") attemptColor = "bg-emerald-500/20 border-emerald-500/30 text-emerald-300";
                      if (p.attempt === "Re-attempt needed") attemptColor = "bg-amber-500/20 border-amber-500/30 text-amber-300";

                      return (
                        <div key={p.id} className="glass-card p-5 border border-white/5 hover:border-white/10 transition-all duration-300">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
                                  GATE {p.year}
                                </span>
                                <span className="text-xs text-gray-500 font-bold">•</span>
                                <span className="text-xs text-gray-300 font-bold">{p.subject}</span>
                                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${diffColor}`}>
                                  {p.difficulty}
                                </span>
                              </div>
                              
                              <h5 className="text-sm font-semibold text-white">{p.topic}</h5>
                              
                              <div className="p-3 bg-black/30 rounded-lg border border-white/5 text-xs text-gray-400 italic">
                                &ldquo;{p.analysis}&rdquo;
                              </div>

                              <div className="flex items-center gap-4 pt-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 font-semibold">Status:</span>
                                  <select
                                    value={p.attempt}
                                    onChange={(e) => handleUpdatePyqAttempt(p.id, e.target.value)}
                                    className={`py-0.5 px-2 rounded border text-[11px] font-bold ${attemptColor}`}
                                  >
                                    <option value="Solved" className="bg-slate-900 text-emerald-400">Solved</option>
                                    <option value="Re-attempt needed" className="bg-slate-900 text-amber-400">Re-attempt needed</option>
                                    <option value="Unsolved" className="bg-slate-900 text-gray-400">Unsolved</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeletePyq(p.id)}
                              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 transition-all duration-200"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {pyqsList.length === 0 && (
                      <div className="text-center py-12 glass-card border border-white/5 text-gray-500 text-sm">
                        No PYQ records logged yet. Use the log form to record your first Previous Year Question attempt!
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
