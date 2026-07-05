import React, { useState, useEffect, Suspense, lazy, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Joyride, Step, EventData, STATUS } from 'react-joyride';
import { 
  Home, Plus, Calendar, BarChart2, MessageSquare, Award, Settings, 
  Search, Bell, User, LogOut, ShieldAlert, Sparkles, Sun, Moon, Menu, X, Loader2
} from 'lucide-react';

import { Hobby, Achievement, ChatMessage, PrivacySettings, UserProfile } from './types';
import { INITIAL_HOBBIES, INITIAL_ACHIEVEMENTS } from './data';
import { auth, db } from './firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc, onSnapshot } from 'firebase/firestore';

// Lazy loaded component imports
const SplashView = lazy(() => import('./components/SplashView'));
const OnboardingView = lazy(() => import('./components/OnboardingView'));
const LoginView = lazy(() => import('./components/LoginView'));
const DashboardView = lazy(() => import('./components/DashboardView'));
const MyHobbiesView = lazy(() => import('./components/MyHobbiesView'));
const HeatmapsView = lazy(() => import('./components/HeatmapsView'));
const AnalyticsView = lazy(() => import('./components/AnalyticsView'));
const CoachChatView = lazy(() => import('./components/CoachChatView'));
const AchievementsView = lazy(() => import('./components/AchievementsView'));
const SettingsView = lazy(() => import('./components/SettingsView'));
const NavBar = lazy(() => import('./components/NavBar'));
const RemindersView = lazy(() => import('./components/RemindersView'));
const CommunityView = lazy(() => import('./components/CommunityView'));
const ProfileView = lazy(() => import('./components/ProfileView'));

// Loading Fallback
const ViewLoading = () => (
  <div className="h-full w-full flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      <p className="text-sm font-mono text-purple-400 animate-pulse uppercase tracking-widest">Initializing Module...</p>
    </div>
  </div>
);

export type AppFlow = 'splash' | 'onboarding' | 'login' | 'app';
export type AppTab = 'dashboard' | 'hobbies' | 'analytics' | 'coach' | 'achievements' | 'calendar' | 'reminders' | 'community' | 'profile' | 'settings';

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

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const profileUnsubRef = useRef<(() => void) | null>(null);
  const [isCoachTyping, setIsCoachTyping] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // App Tour State
  const [runTour, setRunTour] = useState(false);
  const tourSteps: Step[] = [
    {
      target: '.tour-welcome',
      content: 'Welcome to Hobby Tracker! Let\'s take a quick tour of your new dashboard.',
      skipBeacon: true,
    },
    {
      target: '.tour-stats',
      content: 'Here you can track your total XP, current level, and active streak. Stay consistent to level up!',
    },
    {
      target: '.tour-nav-hobbies',
      content: 'Manage your hobbies, explore new ones, or use the Roulette feature if you can\'t decide what to do!',
    },
    {
      target: '.tour-hobby-card',
      content: 'This is one of your active hobbies. You can log your progress right from here.',
    },
    {
      target: '.tour-focus-btn',
      content: 'New Feature! Use the Focus Timer to run a Pomodoro session and log your deep work states and energy impact.',
    },
    {
      target: '.tour-nav-analytics',
      content: 'Dive deep into your consistency heatmaps, energy levels, and flow state metrics.',
    }
  ];

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRunTour(false);
    }
  };

  const handleStartTour = () => {
    setActiveTab('dashboard'); // Switch to dashboard to ensure targets exist
    setTimeout(() => {
      setRunTour(true);
    }, 300);
  };

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

  // 1. Auth State Engine
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        setFlow('app');
        setUserName(firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'sudharsan');
      } else {
        setFlow('login');
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time User Profile & Sub-collection Sync Engine
  useEffect(() => {
    if (!currentUser || !db) {
      if (profileUnsubRef.current) {
        profileUnsubRef.current();
        profileUnsubRef.current = null;
      }
      return;
    }

    const userRef = doc(db, 'users', currentUser.uid);
    profileUnsubRef.current = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const fullProfile: UserProfile = {
          uid: currentUser.uid,
          username: data.username || currentUser.email?.split('@')[0] || 'user_' + currentUser.uid.slice(0, 5),
          displayName: data.displayName || currentUser.displayName || 'Member',
          email: data.email || currentUser.email || '',
          profileImage: data.profileImage || currentUser.photoURL || '',
          socialLinks: data.socialLinks || {},
          xp: data.xp || 0,
          level: data.level || 1,
          achievementsCount: data.achievementsCount || 0,
          currentTheme: data.currentTheme || (isDarkMode ? 'dark' : 'light'),
          notificationPreferences: data.notificationPreferences || {
            push: true,
            sms: true,
            whatsapp: true,
            email: true
          },
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          ...data
        };
        setUserProfile(fullProfile);
        setUserName(fullProfile.displayName);
        
        // Only update theme if it differs to avoid re-render loops
        setIsDarkMode(prev => {
          const cloudTheme = fullProfile.currentTheme === 'dark';
          return prev === cloudTheme ? prev : cloudTheme;
        });
      } else {
        // Create initial profile if missing
        const initialProfile: UserProfile = {
          uid: currentUser.uid,
          username: currentUser.email?.split('@')[0] || 'user_' + currentUser.uid.slice(0, 5),
          displayName: currentUser.displayName || 'Member',
          email: currentUser.email || '',
          profileImage: currentUser.photoURL || '',
          socialLinks: {},
          xp: 0,
          level: 1,
          achievementsCount: 0,
          currentTheme: 'dark', // Default to dark for new profiles
          notificationPreferences: {
            push: true,
            sms: true,
            whatsapp: true,
            email: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        try {
          await setDoc(userRef, initialProfile);
          setUserProfile(initialProfile); // Set immediately to avoid stuck loading
        } catch (e) {
          console.error("Failed to create initial profile:", e);
        }
      }
    });

    const syncSubcollections = async () => {
      try {
        // Sync Hobbies
        const hobbiesRef = collection(db, 'users', currentUser.uid, 'hobbies');
        const hobbiesSnap = await getDocs(hobbiesRef);
        if (!hobbiesSnap.empty) {
          const cloudHobbies: Hobby[] = [];
          hobbiesSnap.forEach((doc) => {
            cloudHobbies.push({ ...doc.data(), id: doc.id } as Hobby);
          });
          setHobbies(cloudHobbies);
        } else {
          // Upload local hobbies concurrently
          await Promise.all(hobbies.map(h => setDoc(doc(hobbiesRef, h.id), h)));
        }

        // Sync Achievements
        const achievementsRef = collection(db, 'users', currentUser.uid, 'achievements');
        const achievementsSnap = await getDocs(achievementsRef);
        if (!achievementsSnap.empty) {
          const cloudAch: Achievement[] = [];
          achievementsSnap.forEach((doc) => {
            cloudAch.push({ ...doc.data(), id: doc.id } as Achievement);
          });
          setAchievements(cloudAch);
        } else {
          await Promise.all(achievements.map(a => setDoc(doc(achievementsRef, a.id), a)));
        }

        // Sync Chat History
        const chatRef = collection(db, 'users', currentUser.uid, 'chat_messages');
        const chatSnap = await getDocs(chatRef);
        if (!chatSnap.empty) {
          const cloudChat: ChatMessage[] = [];
          chatSnap.forEach((doc) => {
            cloudChat.push({ ...doc.data(), id: doc.id } as ChatMessage);
          });
          cloudChat.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          setChatHistory(cloudChat);
        } else {
          await Promise.all(chatHistory.map(c => setDoc(doc(chatRef, c.id), c)));
        }
      } catch (e) {
        console.warn("Firestore sub-sync warning:", e);
      }
    };

    syncSubcollections();

    return () => {
      if (profileUnsubRef.current) {
        profileUnsubRef.current();
        profileUnsubRef.current = null;
      }
    };
  }, [currentUser?.uid, db]);

  // Action: Transition splash to onboarding
  const handleSplashComplete = () => {
    if (flow === 'splash') {
      const hasCompletedTour = localStorage.getItem('hobbysync_tour_completed');
      if (!hasCompletedTour) {
        setFlow('onboarding');
      } else if (currentUser) {
        setFlow('app');
      } else {
        setFlow('login');
      }
    }
  };

  // Action: Transition onboarding to login
  const handleOnboardingComplete = () => {
    localStorage.setItem('hobbysync_tour_completed', 'true');
    if (currentUser) {
      setFlow('app');
    } else {
      setFlow('login');
    }
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
  const handleLogProgress = (hobbyId: string, duration: number, notes: string, flowState?: boolean, energyDelta?: number) => {
    let updatedObj: Hobby | null = null;
    setHobbies((prev) => 
      prev.map((hobby) => {
        if (hobby.id === hobbyId) {
          const completedTodayNow = true;
          // Calculate streak change if newly completed today
          const streakNow = hobby.completedToday ? hobby.streak : hobby.streak + 1;
          const xpGained = duration * 10 + (flowState ? 50 : 0); // 10 XP per minute + 50 for flow state

          const newLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            duration,
            notes,
            flowState,
            energyDelta
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
      
      {/* Tour Overlay */}
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        onEvent={handleJoyrideCallback}
        options={{
          primaryColor: '#9333ea', // purple-600
          backgroundColor: isDarkMode ? '#1e1b4b' : '#ffffff', // slate-900 approx or white
          textColor: isDarkMode ? '#f8fafc' : '#0f172a',
          arrowColor: isDarkMode ? '#1e1b4b' : '#ffffff',
          showProgress: true,
          buttons: ['back', 'primary', 'skip'], // Include skip button
        }}
      />

      {/* Glow aura elements in page background */}
      <div className={`absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-5000 ${
        isDarkMode ? 'bg-purple-900/15' : 'bg-purple-300/10'
      }`} />
      <div className={`absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse duration-6000 ${
        isDarkMode ? 'bg-indigo-900/10' : 'bg-indigo-300/10'
      }`} />

      {/* Primary Navigation Glassmorphic Header */}
      <NavBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
        handleToggleTheme={handleToggleTheme}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        userName={userName}
        handleLogout={handleLogout}
        onStartTour={handleStartTour}
        userProfile={userProfile}
      />

      {/* Main Workspace Frame content */}
      <main className={`flex-1 w-full max-w-5xl mx-auto px-6 py-8 my-4 relative rounded-3xl border shadow-xl ${
        isDarkMode ? 'glass-panel-dark border-purple-900/40' : 'glass-panel border-white/60'
      }`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full"
          >
            <Suspense fallback={<ViewLoading />}>
              {activeTab === 'dashboard' && (
                <DashboardView
                  currentUser={currentUser}
                  userName={userName}
                  hobbies={hobbies}
                  allAchievements={achievements}
                  isDarkMode={isDarkMode}
                  onLogProgress={handleLogProgress}
                  onNavigateToCreate={() => setActiveTab('hobbies')}
                  onNavigateToProfile={() => setActiveTab('settings')}
                  onUpdateHobby={handleUpdateHobby}
                  onDeleteHobby={handleDeleteHobby}
                  onDeleteLog={handleDeleteLog}
                  onRefreshHobbies={syncHobbiesFromCloud}
                  userProfile={userProfile}
                />
              )}
              {activeTab === 'hobbies' && (
                <MyHobbiesView 
                  hobbies={hobbies} 
                  isDarkMode={isDarkMode} 
                  onCreateHobby={handleCreateHobby} 
                  onDeleteHobby={handleDeleteHobby} 
                />
              )}
              {activeTab === 'calendar' && (
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
                  userProfile={userProfile}
                />
              )}
              {activeTab === 'achievements' && (
                <AchievementsView achievements={achievements} isDarkMode={isDarkMode} />
              )}
              {activeTab === 'reminders' && (
                <RemindersView isDarkMode={isDarkMode} />
              )}
              {activeTab === 'community' && (
                <CommunityView isDarkMode={isDarkMode} />
              )}
              {activeTab === 'profile' && (
                <ProfileView 
                  userProfile={userProfile} 
                  isDarkMode={isDarkMode} 
                />
              )}
              {activeTab === 'settings' && (
                <SettingsView
                  settings={privacySettings}
                  isDarkMode={isDarkMode}
                  onToggleSetting={handleToggleSetting}
                  onToggleTheme={handleToggleTheme}
                />
              )}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Sticky Footer Bar Navigation (highly responsive for mobile viewports) */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 py-2.5 px-6 flex justify-between items-center shadow-lg border-t ${
        isDarkMode 
          ? 'bg-[#0f0c1c]/95 backdrop-blur-md border-purple-900/40 text-slate-100' 
          : 'bg-white/90 backdrop-blur-md border-purple-100 text-gray-800'
      }`}>
        {[
          { id: 'dashboard', icon: Home },
          { id: 'hobbies', icon: Plus },
          { id: 'analytics', icon: BarChart2 },
          { id: 'coach', icon: MessageSquare },
          { id: 'profile', icon: User },
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
          </div>
        </div>
      </footer>

    </div>
  );
}
