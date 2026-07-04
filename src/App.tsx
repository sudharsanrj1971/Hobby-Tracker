import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Plus, Calendar, BarChart2, MessageSquare, Award, Settings, 
  Search, Bell, User, LogOut, ShieldAlert, Sparkles, Sun, Moon, Menu, X
} from 'lucide-react';

import { Hobby, Achievement, ChatMessage, PrivacySettings } from './types';
import { INITIAL_HOBBIES, INITIAL_ACHIEVEMENTS } from './data';
import { auth, db } from './firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';

// Component imports
import SplashView from './components/SplashView';
import OnboardingView from './components/OnboardingView';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import HobbyCreationView from './components/HobbyCreationView';
import HeatmapsView from './components/HeatmapsView';
import AnalyticsView from './components/AnalyticsView';
import CoachChatView from './components/CoachChatView';
import AchievementsView from './components/AchievementsView';
import SettingsView from './components/SettingsView';

type AppFlow = 'splash' | 'onboarding' | 'login' | 'app';
type AppTab = 'dashboard' | 'create' | 'heatmap' | 'analytics' | 'coach' | 'achievements' | 'settings';

export default function App() {
  // State 1: Current application flow phase
  const [flow, setFlow] = useState<AppFlow>(() => {
    const saved = localStorage.getItem('hobbysync_flow');
    return (saved as AppFlow) || 'splash';
  });

  // State 2: Nickname/username of user
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('hobbysync_username') || 'sudharsan';
  });

  // State 3: Active tab index inside logged-in workspace
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    const saved = localStorage.getItem('hobbysync_tab');
    return (saved as AppTab) || 'dashboard';
  });

  // State 4: Hobbies database list
  const [hobbies, setHobbies] = useState<Hobby[]>(() => {
    const saved = localStorage.getItem('hobbysync_hobbies');
    return saved ? JSON.parse(saved) : INITIAL_HOBBIES;
  });

  // State 5: Achievements list
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('hobbysync_achievements');
    return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
  });

  // State 6: Habit Coach chat dialogue
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('hobbysync_chat');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'init',
        sender: 'coach',
        text: "Great job! You've maintained your reading habit for 5 days straight. Keep going!",
        timestamp: new Date().toISOString()
      }
    ];
  });

  // State 7: Toggles settings configuration
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => {
    const saved = localStorage.getItem('hobbysync_settings');
    if (saved) return JSON.parse(saved);
    return {
      emailPreferences: true,
      passwordSecurity: false,
      whatsappNotifications: true,
      hobbyAiAssistant: true,
      autoCategorization: true,
      insightsEngine: true
    };
  });

  // State 8: Dark / Light Mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('hobbysync_darkmode');
    return saved === 'true';
  });

  const [isCoachTyping, setIsCoachTyping] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync state to localstorage
  useEffect(() => {
    localStorage.setItem('hobbysync_flow', flow);
    localStorage.setItem('hobbysync_username', userName);
    localStorage.setItem('hobbysync_tab', activeTab);
    localStorage.setItem('hobbysync_hobbies', JSON.stringify(hobbies));
    localStorage.setItem('hobbysync_achievements', JSON.stringify(achievements));
    localStorage.setItem('hobbysync_chat', JSON.stringify(chatHistory));
    localStorage.setItem('hobbysync_settings', JSON.stringify(privacySettings));
    localStorage.setItem('hobbysync_darkmode', String(isDarkMode));
  }, [flow, userName, activeTab, hobbies, achievements, chatHistory, privacySettings, isDarkMode]);

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Auth & Cloud Firestore Sync State Engine
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        setFlow('app');
        setUserName(firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'sudharsan');
        
        if (db) {
          try {
            // 1. Sync User Profile
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              if (userData.privacySettings) setPrivacySettings(userData.privacySettings);
              if (typeof userData.isDarkMode === 'boolean') setIsDarkMode(userData.isDarkMode);
            } else {
              await setDoc(userRef, {
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName || 'Member',
                email: firebaseUser.email || '',
                photoURL: firebaseUser.photoURL || '',
                createdAt: new Date().toISOString(),
                isDarkMode,
                privacySettings
              }, { merge: true });
            }

            // 2. Sync Hobbies Subcollection
            const hobbiesRef = collection(db, 'users', firebaseUser.uid, 'hobbies');
            const hobbiesSnap = await getDocs(hobbiesRef);
            if (!hobbiesSnap.empty) {
              const cloudHobbies: Hobby[] = [];
              hobbiesSnap.forEach((doc) => {
                cloudHobbies.push({ ...doc.data(), id: doc.id } as Hobby);
              });
              setHobbies(cloudHobbies);
            } else {
              // Upload existing localStorage/INITIAL hobbies to cloud
              for (const h of hobbies) {
                await setDoc(doc(hobbiesRef, h.id), h);
              }
            }

            // 3. Sync Achievements Subcollection
            const achievementsRef = collection(db, 'users', firebaseUser.uid, 'achievements');
            const achievementsSnap = await getDocs(achievementsRef);
            if (!achievementsSnap.empty) {
              const cloudAch: Achievement[] = [];
              achievementsSnap.forEach((doc) => {
                cloudAch.push({ ...doc.data(), id: doc.id } as Achievement);
              });
              setAchievements(cloudAch);
            } else {
              for (const a of achievements) {
                await setDoc(doc(achievementsRef, a.id), a);
              }
            }

            // 4. Sync Chat History Subcollection
            const chatRef = collection(db, 'users', firebaseUser.uid, 'chat_messages');
            const chatSnap = await getDocs(chatRef);
            if (!chatSnap.empty) {
              const cloudChat: ChatMessage[] = [];
              chatSnap.forEach((doc) => {
                cloudChat.push({ ...doc.data(), id: doc.id } as ChatMessage);
              });
              cloudChat.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
              setChatHistory(cloudChat);
            } else {
              for (const c of chatHistory) {
                await setDoc(doc(chatRef, c.id), c);
              }
            }
          } catch (e) {
            console.warn("Firestore collection sync warn (standard sandbox/offline behavior):", e);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Action: Transition splash to onboarding
  const handleSplashComplete = () => {
    if (flow === 'splash') {
      setFlow('onboarding');
    }
  };

  // Action: Transition onboarding to login
  const handleOnboardingComplete = () => {
    setFlow('login');
  };

  // Action: Complete login authentication
  const handleLoginComplete = (selectedName: string) => {
    setUserName(selectedName);
    setFlow('app');
  };

  // Action: Logout session reset
  const handleLogout = () => {
    localStorage.clear();
    if (auth) {
      signOut(auth).catch(console.error);
    }
    setFlow('login');
    setUserName('sudharsan');
    setHobbies(INITIAL_HOBBIES);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setChatHistory([
      {
        id: 'init',
        sender: 'coach',
        text: "Great job! You've maintained your reading habit for 5 days straight. Keep going!",
        timestamp: new Date().toISOString()
      }
    ]);
    setActiveTab('dashboard');
  };

  // Action: Log duration/activities done today for a specific hobby
  const handleLogProgress = (hobbyId: string, duration: number, notes: string) => {
    let updatedObj: Hobby | null = null;
    setHobbies((prev) => 
      prev.map((hobby) => {
        if (hobby.id === hobbyId) {
          const completedTodayNow = true;
          // Calculate streak change if newly completed today
          const streakNow = hobby.completedToday ? hobby.streak : hobby.streak + 1;
          const xpGained = duration * 10; // 10 XP per minute

          const newLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            duration,
            notes
          };

          updatedObj = {
            ...hobby,
            completedToday: completedTodayNow,
            streak: streakNow,
            totalXp: (hobby.totalXp || 0) + xpGained,
            logs: [newLog, ...hobby.logs]
          };
          return updatedObj;
        }
        return hobby;
      })
    );

    if (currentUser && db) {
      setTimeout(() => {
        if (updatedObj) {
          setDoc(doc(db, 'users', currentUser.uid, 'hobbies', hobbyId), updatedObj).catch(console.error);
        }
      }, 50);
    }

    // Dynamic award unlock checks
    setTimeout(() => {
      setAchievements((prev) => 
        prev.map((ach) => {
          if (ach.id === '100day' && !ach.unlocked) {
            const updatedAch = {
              ...ach,
              unlocked: true,
              unlockedAt: new Date().toISOString()
            };
            if (currentUser && db) {
              setDoc(doc(db, 'users', currentUser.uid, 'achievements', '100day'), updatedAch).catch(console.error);
            }
            return updatedAch;
          }
          return ach;
        })
      );
    }, 1200);
  };

  // Action: Update details of custom hobby (e.g. name, description, priority, category)
  const handleUpdateHobby = (hobbyId: string, updatedData: Partial<Hobby>) => {
    setHobbies((prev) => 
      prev.map((hobby) => {
        if (hobby.id === hobbyId) {
          const updated = { ...hobby, ...updatedData };
          if (currentUser && db) {
            setDoc(doc(db, 'users', currentUser.uid, 'hobbies', hobbyId), updated).catch(console.error);
          }
          return updated;
        }
        return hobby;
      })
    );
  };

  // Action: Remove / Delete custom hobby
  const handleDeleteHobby = (hobbyId: string) => {
    setHobbies((prev) => prev.filter((hobby) => hobby.id !== hobbyId));
    if (currentUser && db) {
      deleteDoc(doc(db, 'users', currentUser.uid, 'hobbies', hobbyId)).catch(console.error);
    }
  };

  // Action: Delete individual progress log entry from timeline
  const handleDeleteLog = (hobbyId: string, logId: string) => {
    setHobbies((prev) => 
      prev.map((hobby) => {
        if (hobby.id === hobbyId) {
          const updated = {
            ...hobby,
            logs: hobby.logs.filter((l) => l.id !== logId)
          };
          if (currentUser && db) {
            setDoc(doc(db, 'users', currentUser.uid, 'hobbies', hobbyId), updated).catch(console.error);
          }
          return updated;
        }
        return hobby;
      })
    );
  };

  // Action: Synchronize hobbies collection from Cloud Firestore
  const syncHobbiesFromCloud = async () => {
    if (currentUser && db) {
      try {
        const hobbiesRef = collection(db, 'users', currentUser.uid, 'hobbies');
        const hobbiesSnap = await getDocs(hobbiesRef);
        if (!hobbiesSnap.empty) {
          const cloudHobbies: Hobby[] = [];
          hobbiesSnap.forEach((doc) => {
            cloudHobbies.push({ ...doc.data(), id: doc.id } as Hobby);
          });
          setHobbies(cloudHobbies);
        }
      } catch (e) {
        console.warn("Error manually pulling hobbies from cloud:", e);
      }
    }
  };

  // Action: Toggle App visual Theme Mode
  const handleToggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (currentUser && db) {
      updateDoc(doc(db, 'users', currentUser.uid), {
        isDarkMode: nextMode
      }).catch(console.error);
    }
  };

  // Action: Insert a newly structured custom hobby
  const handleCreateHobby = (hobbyData: {
    name: string;
    category: string;
    emoji: string;
    coverImage: string;
    dailyGoal: number;
    weeklyGoal: number;
    description: string;
    priority: 'low' | 'medium' | 'high';
    themeColor: string;
    reminders: any[];
  }) => {
    const newHobby: Hobby = {
      id: `custom-${Date.now()}`,
      name: hobbyData.name,
      category: hobbyData.category,
      emoji: hobbyData.emoji,
      coverImage: hobbyData.coverImage,
      dailyGoal: hobbyData.dailyGoal,
      weeklyGoal: hobbyData.weeklyGoal,
      description: hobbyData.description,
      priority: hobbyData.priority,
      themeColor: hobbyData.themeColor,
      reminders: hobbyData.reminders,
      streak: 1, // Start on day 1 streak
      createdAt: new Date().toISOString(),
      completedToday: false,
      totalXp: 100, // Starts with base creator XP
      logs: []
    };

    setHobbies((prev) => {
      const updated = [...prev, newHobby];
      if (currentUser && db) {
        setDoc(doc(db, 'users', currentUser.uid, 'hobbies', newHobby.id), newHobby).catch(console.error);
      }
      return updated;
    });
    setActiveTab('dashboard'); // Transition immediately back
  };

  // Action: Send custom messages and call real-time Gemini Coach API
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setIsCoachTyping(true);

    if (currentUser && db) {
      setDoc(doc(db, 'users', currentUser.uid, 'chat_messages', userMsg.id), userMsg).catch(console.error);
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatHistory.slice(-6) // Send recent message list for model memory
        })
      });

      const data = await res.json();
      const coachMsg: ChatMessage = {
        id: `coach-${Date.now()}`,
        sender: 'coach',
        text: data.text,
        timestamp: new Date().toISOString()
      };
      
      setChatHistory((prev) => [...prev, coachMsg]);
      if (currentUser && db) {
        setDoc(doc(db, 'users', currentUser.uid, 'chat_messages', coachMsg.id), coachMsg).catch(console.error);
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Fallback
      setTimeout(() => {
        const fallbackMsg: ChatMessage = {
          id: `coach-${Date.now()}`,
          sender: 'coach',
          text: `✨ Coach Gemini Advice: Sustaining progress requires setting specific daily triggers! For "${text}", make sure to schedule small blocks of action immediately following physical triggers.`,
          timestamp: new Date().toISOString()
        };
        setChatHistory((prev) => [...prev, fallbackMsg]);
        if (currentUser && db) {
          setDoc(doc(db, 'users', currentUser.uid, 'chat_messages', fallbackMsg.id), fallbackMsg).catch(console.error);
        }
      }, 1000);
    } finally {
      setIsCoachTyping(false);
    }
  };

  // Action: Toggle Account / Privacy toggles
  const handleToggleSetting = (key: keyof PrivacySettings) => {
    setPrivacySettings((prev) => {
      const updated = {
        ...prev,
        [key]: !prev[key]
      };
      if (currentUser && db) {
        updateDoc(doc(db, 'users', currentUser.uid), {
          privacySettings: updated
        }).catch(console.error);
      }
      return updated;
    });
  };

  // Render Flows
  if (flow === 'splash') {
    return <SplashView onComplete={handleSplashComplete} />;
  }

  if (flow === 'onboarding') {
    return <OnboardingView onComplete={handleOnboardingComplete} />;
  }

  if (flow === 'login') {
    return <LoginView onLogin={handleLoginComplete} isDarkMode={isDarkMode} />;
  }

  // Active workspace application renders below
  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-[#06040d] text-slate-100' 
        : 'ambient-bg text-slate-900'
    }`}>
      
      {/* Glow aura elements in page background */}
      <div className={`absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-5000 ${
        isDarkMode ? 'bg-purple-900/15' : 'bg-purple-300/10'
      }`} />
      <div className={`absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse duration-6000 ${
        isDarkMode ? 'bg-indigo-900/10' : 'bg-indigo-300/10'
      }`} />

      {/* Primary Navigation Glassmorphic Header */}
      <nav className="sticky top-4 z-40 w-full max-w-5xl mx-auto px-4">
        <div className={`rounded-2xl py-3 px-5 flex items-center justify-between shadow-md border ${
          isDarkMode ? 'glass-panel-dark border-purple-900/40' : 'glass-panel border-white/60'
        }`}>
          
          {/* Logo element */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold font-display shadow-xs">
              H
            </div>
            <span className={`font-display font-bold text-base tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Hobby Tracker</span>
          </div>

          {/* Desktop Navigation Link Tabs */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { id: 'dashboard', label: 'Home', icon: Home },
              { id: 'create', label: 'Create', icon: Plus },
              { id: 'heatmap', label: 'Heatmaps', icon: Calendar },
              { id: 'analytics', label: 'Analytics', icon: BarChart2 },
              { id: 'coach', label: 'AI Coach', icon: MessageSquare },
              { id: 'achievements', label: 'Badges', icon: Award },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AppTab)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-purple-600 text-white shadow-xs' 
                      : isDarkMode 
                        ? 'text-slate-400 hover:text-purple-400 hover:bg-purple-950/40' 
                        : 'text-gray-500 hover:text-purple-600 hover:bg-white/40'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Header Side elements */}
          <div className="flex items-center gap-2.5 relative">
            
            {/* Quick theme toggler */}
            <button 
              onClick={handleToggleTheme}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                isDarkMode ? 'text-amber-400 hover:bg-purple-950/60' : 'text-gray-500 hover:text-purple-600 hover:bg-white/55'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification bell trigger */}
            <button className={`p-2 rounded-full transition-all cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:bg-purple-950/60' : 'text-gray-500 hover:text-purple-600 hover:bg-white/55'
            }`}>
              <Bell className="w-4 h-4" />
            </button>

            {/* Profile trigger */}
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-100 to-indigo-50 border border-purple-200 flex items-center justify-center text-purple-700 font-semibold text-xs shadow-xs hover:border-purple-300 transition-all cursor-pointer overflow-hidden"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-full transition-all cursor-pointer ${
                isDarkMode ? 'text-slate-400 hover:bg-purple-950/60' : 'text-gray-500 hover:text-purple-600 hover:bg-white/55'
              }`}
              title="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Profile Dropdown menu */}
            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    className={`absolute right-0 top-11 rounded-2xl p-2.5 w-48 shadow-xl border z-50 space-y-1 ${
                      isDarkMode 
                        ? 'bg-[#120e24] border-purple-900/60 text-slate-100' 
                        : 'bg-white/95 backdrop-blur-md border-purple-100/50'
                    }`}
                  >
                    <div className="px-3.5 py-2 border-b border-purple-50/10">
                      <div className="font-semibold text-xs font-display capitalize">{userName}</div>
                      <div className="text-[9px] text-gray-400 font-mono tracking-wide lowercase mt-0.5">{userName}@hobbysync.io</div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setActiveTab('settings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left py-2 px-3 hover:bg-purple-500/10 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-gray-400" />
                      Settings Configuration
                    </button>

                    <button 
                      onClick={handleLogout}
                      className="w-full text-left py-2 px-3 hover:bg-rose-500/10 rounded-xl text-xs font-semibold text-rose-500 flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      Logout Session
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Mobile Navigation Drawer Backdrop & Sheet */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <>
                  {/* Glassmorphic backdrop */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
                  />
                  
                  {/* Sliding Drawer Container */}
                  <motion.div 
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className={`fixed right-0 top-0 bottom-0 w-80 max-w-[90vw] h-full shadow-2xl z-50 p-6 flex flex-col justify-between md:hidden border-l ${
                      isDarkMode 
                        ? 'bg-[#0f0c1c] border-purple-900/60 text-slate-100' 
                        : 'bg-white border-purple-100 text-slate-900'
                    }`}
                  >
                    <div className="space-y-6">
                      {/* Drawer Header */}
                      <div className="flex items-center justify-between pb-4 border-b border-purple-500/10">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold font-display shadow-xs">
                            H
                          </div>
                          <span className="font-display font-bold text-lg tracking-tight">Hobby Pages</span>
                        </div>
                        <button 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="p-1.5 rounded-full hover:bg-purple-500/10 text-gray-400 hover:text-purple-400 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* User Welcoming */}
                      <div className="px-3.5 py-3 bg-purple-500/5 rounded-xl border border-purple-500/10 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 text-sm font-semibold capitalize">
                          {userName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold font-display capitalize">Hello, {userName}!</div>
                          <div className="text-[9px] text-gray-400 font-mono">Premium Account Active</div>
                        </div>
                      </div>

                      {/* Navigation Pages List */}
                      <div className="space-y-1.5 max-h-[55vh] overflow-y-auto pr-1">
                        {[
                          { id: 'dashboard', label: 'Home Dashboard', icon: Home, desc: 'Logs, streaks, and Diagnostics' },
                          { id: 'create', label: 'Create Hobby', icon: Plus, desc: 'Add habits & setup triggers' },
                          { id: 'heatmap', label: 'Consistency Heatmaps', icon: Calendar, desc: 'High-density activity calendars' },
                          { id: 'analytics', label: 'Habit Analytics', icon: BarChart2, desc: 'Log hours & completion trends' },
                          { id: 'coach', label: 'AI Habit Coach', icon: MessageSquare, desc: 'Talk to smart Gemini AI' },
                          { id: 'achievements', label: 'Milestone Badges', icon: Award, desc: 'Earn badges and level up' },
                          { id: 'settings', label: 'Settings & Alerts', icon: Settings, desc: 'Configure SMS & privacy rules' },
                        ].map((tab) => {
                          const TabIcon = tab.icon;
                          const isActive = activeTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => {
                                setActiveTab(tab.id as AppTab);
                                setIsMobileMenuOpen(false);
                              }}
                              className={`w-full text-left p-3 rounded-xl flex items-start gap-3.5 transition-all cursor-pointer ${
                                isActive 
                                  ? 'bg-purple-600 text-white shadow-xs' 
                                  : isDarkMode 
                                    ? 'text-slate-300 hover:text-purple-400 hover:bg-purple-950/40' 
                                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50/50'
                              }`}
                            >
                              <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isActive ? 'bg-white/20' : 'bg-purple-500/10 text-purple-400'}`}>
                                <TabIcon className="w-4 h-4" />
                              </div>
                              <div className="space-y-0.5">
                                <div className="text-xs font-bold">{tab.label}</div>
                                <p className={`text-[10px] leading-snug ${isActive ? 'text-purple-100' : 'text-gray-400'}`}>{tab.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Drawer Footer Actions */}
                    <div className="space-y-3.5 pt-4 border-t border-purple-500/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 font-mono">Theme Preferences</span>
                        <button 
                          onClick={handleToggleTheme}
                          className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                            isDarkMode 
                              ? 'border-purple-900/60 bg-purple-950/40 text-amber-400' 
                              : 'border-purple-100 bg-purple-50/30 text-purple-600'
                          }`}
                        >
                          {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                      </div>

                      <button 
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl text-center font-bold text-xs bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out Account
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

          </div>

        </div>
      </nav>

      {/* Main Workspace Frame content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full"
          >
            {activeTab === 'dashboard' && (
              <DashboardView
                currentUser={currentUser}
                userName={userName}
                hobbies={hobbies}
                allAchievements={achievements}
                isDarkMode={isDarkMode}
                onLogProgress={handleLogProgress}
                onNavigateToCreate={() => setActiveTab('create')}
                onNavigateToProfile={() => setActiveTab('settings')}
                onUpdateHobby={handleUpdateHobby}
                onDeleteHobby={handleDeleteHobby}
                onDeleteLog={handleDeleteLog}
                onRefreshHobbies={syncHobbiesFromCloud}
              />
            )}
            {activeTab === 'create' && (
              <HobbyCreationView onCreateHobby={handleCreateHobby} isDarkMode={isDarkMode} />
            )}
            {activeTab === 'heatmap' && (
              <HeatmapsView hobbies={hobbies} isDarkMode={isDarkMode} />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsView hobbies={hobbies} isDarkMode={isDarkMode} />
            )}
            {activeTab === 'coach' && (
              <CoachChatView
                chatHistory={chatHistory}
                isDarkMode={isDarkMode}
                onSendMessage={handleSendMessage}
                isCoachTyping={isCoachTyping}
              />
            )}
            {activeTab === 'achievements' && (
              <AchievementsView achievements={achievements} isDarkMode={isDarkMode} />
            )}
            {activeTab === 'settings' && (
              <SettingsView
                settings={privacySettings}
                isDarkMode={isDarkMode}
                onToggleSetting={handleToggleSetting}
                onToggleTheme={handleToggleTheme}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Sticky Footer Bar Navigation (highly responsive for mobile viewports) */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 py-2.5 px-6 flex justify-between items-center shadow-lg border-t ${
        isDarkMode 
          ? 'bg-[#0f0c1c]/95 backdrop-blur-md border-purple-900/40 text-slate-100' 
          : 'bg-white/90 backdrop-blur-md border-purple-100 text-gray-800'
      }`}>
        {[
          { id: 'dashboard', icon: Home },
          { id: 'create', icon: Plus },
          { id: 'heatmap', icon: Calendar },
          { id: 'analytics', icon: BarChart2 },
          { id: 'coach', icon: MessageSquare },
          { id: 'achievements', icon: Award },
          { id: 'settings', icon: Settings },
        ].map((tab) => {
          const MobileIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AppTab)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isActive 
                  ? 'bg-purple-500/20 text-purple-400 scale-110' 
                  : isDarkMode 
                    ? 'text-slate-500 hover:text-purple-400' 
                    : 'text-gray-400 hover:text-purple-600'
              }`}
            >
              <MobileIcon className="w-5 h-5" />
            </button>
          );
        })}
      </nav>

      {/* Web Footer Content matching layouts */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-6 mt-12 pb-24 md:pb-8 border-t border-purple-50/10">
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('dashboard')} className="hover:text-purple-400 transition-colors cursor-pointer">Hobby</button>
            <button className="hover:text-purple-400 transition-colors cursor-pointer">Privacy</button>
            <button className="hover:text-purple-400 transition-colors cursor-pointer">Terms of Service</button>
            <button className="hover:text-purple-400 transition-colors cursor-pointer">Support</button>
          </div>
          <div>
            {activeTab === 'heatmap' && <span>Version 2.2.0 - Premium Edition</span>}
            {activeTab === 'analytics' && <span>Version 2.2.0 - Light-SaaS Edition</span>}
            {activeTab === 'dashboard' && <span>Version 2.1.0 - Cyber-Minimalist Edition</span>}
            {activeTab === 'create' && <span>Version 2.1.0 - Cyber-Minimalist Edition</span>}
            {activeTab === 'coach' && <span>Version 2.1.0 - Cyber-Minimalist Edition</span>}
            {activeTab === 'achievements' && <span>Version 2.1.0 - Premium Light Edition</span>}
            {activeTab === 'settings' && <span>Version 2.2.0</span>}
          </div>
        </div>
      </footer>

    </div>
  );
}
