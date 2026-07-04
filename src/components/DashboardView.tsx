import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Plus, CheckCircle, Search, Bell, Award, User, Clock, PenTool, Check, Archive, Eye, RotateCcw, Trash2, Sparkles, Cpu } from 'lucide-react';
import { Hobby, Achievement } from '../types';
import HobbyDetailsView from './HobbyDetailsView';
import DiagnosticsPanel from './DiagnosticsPanel';

interface DashboardProps {
  currentUser: any;
  userName: string;
  hobbies: Hobby[];
  allAchievements: Achievement[];
  isDarkMode?: boolean;
  onLogProgress: (hobbyId: string, duration: number, notes: string) => void;
  onNavigateToCreate: () => void;
  onNavigateToProfile: () => void;
  onUpdateHobby: (hobbyId: string, updatedData: Partial<Hobby>) => void;
  onDeleteHobby: (hobbyId: string) => void;
  onDeleteLog: (hobbyId: string, logId: string) => void;
  onRefreshHobbies: () => void;
}

export default function DashboardView({
  currentUser,
  userName,
  hobbies,
  allAchievements,
  isDarkMode = false,
  onLogProgress,
  onNavigateToCreate,
  onNavigateToProfile,
  onUpdateHobby,
  onDeleteHobby,
  onDeleteLog,
  onRefreshHobbies,
}: DashboardProps) {
  const [selectedHobbyForDetails, setSelectedHobbyForDetails] = useState<Hobby | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedHobbyForLog, setSelectedHobbyForLog] = useState<Hobby | null>(null);
  const [logMinutes, setLogMinutes] = useState('30');
  const [logNotes, setLogNotes] = useState('');

  // Local state for Smart Reminders analyzer
  const [aiReminders, setAiReminders] = useState<{
    analysis: string;
    suggestions: Array<{
      hobbyName: string;
      channel: string;
      recommendedTime: string;
      timingTrigger: string;
      reason: string;
    }>;
  } | null>(null);
  const [isAnalyzingReminders, setIsAnalyzingReminders] = useState(false);
  const [showNotificationsLog, setShowNotificationsLog] = useState(false);
  
  // Simulated Notification Dispatch Logs
  const [notificationLogs, setNotificationLogs] = useState<Array<{
    id: string;
    timestamp: string;
    hobbyName: string;
    channel: 'Push Notification' | 'SMS' | 'WhatsApp' | 'Email';
    time: string;
    message: string;
  }>>([
    {
      id: 'notif-1',
      timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
      hobbyName: "Sapiens & Science",
      channel: "WhatsApp",
      time: "18:00",
      message: "💬 WhatsApp sent: Time to read Sapiens & Science! Tap to log progress."
    },
    {
      id: 'notif-2',
      timestamp: new Date(Date.now() - 10 * 3600000).toISOString(),
      hobbyName: "Watercolor & Canvas",
      channel: "Push Notification",
      time: "14:15",
      message: "🔔 Push notification sent: Draw for 15 minutes to keep your 5-day streak alive!"
    }
  ]);

  const handleAnalyzeReminders = async () => {
    setIsAnalyzingReminders(true);
    try {
      const res = await fetch('/api/smart-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hobbies })
      });
      const data = await res.json();
      setAiReminders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingReminders(false);
    }
  };

  const handleApplyReminder = (hobbyName: string, channel: string, time: string, timing: string) => {
    const targetHobby = hobbies.find(h => h.name.toLowerCase().includes(hobbyName.toLowerCase()) || hobbyName.toLowerCase().includes(h.name.toLowerCase()));
    if (targetHobby) {
      const newReminder = {
        id: `rem-gen-${Date.now()}`,
        type: (channel.toLowerCase().includes('whatsapp') ? 'whatsapp' : channel.toLowerCase().includes('sms') ? 'sms' : 'push') as any,
        timing: timing as any,
        time: time,
        enabled: true
      };
      const updatedReminders = [...(targetHobby.reminders || []), newReminder];
      onUpdateHobby(targetHobby.id, { reminders: updatedReminders });
      
      // Add simulated notification dispatch log
      const newLog = {
        id: `notif-${Date.now()}`,
        timestamp: new Date().toISOString(),
        hobbyName: targetHobby.name,
        channel: (channel.includes('WhatsApp') ? 'WhatsApp' : channel.includes('SMS') ? 'SMS' : 'Push Notification') as any,
        time: time,
        message: `✨ AI Smart Reminder Activated! Configured ${channel} for ${targetHobby.name} daily at ${time} (${timing} trigger).`
      };
      setNotificationLogs(prev => [newLog, ...prev]);
    } else {
      // Create notification log anyway for fallback/clarity
      const newLog = {
        id: `notif-${Date.now()}`,
        timestamp: new Date().toISOString(),
        hobbyName,
        channel: 'Push Notification' as any,
        time: time,
        message: `✨ Optimized reminder applied: Configured ${channel} daily at ${time} for your hobby.`
      };
      setNotificationLogs(prev => [newLog, ...prev]);
    }
  };

  // Segregate active vs archived hobbies
  const activeHobbies = hobbies.filter(h => !h.archived);
  const archivedHobbies = hobbies.filter(h => h.archived);

  // Calculate overall completeness of active hobbies
  const totalHobbies = activeHobbies.length;
  const completedTodayCount = activeHobbies.filter((h) => h.completedToday).length;
  const progressPercent = totalHobbies > 0 ? Math.round((completedTodayCount / totalHobbies) * 100) : 0;

  // Calculate total XP of all hobbies combined
  const totalXpGained = hobbies.reduce((acc, curr) => acc + (curr.totalXp || 0), 1250);

  const handleOpenLog = (e: React.MouseEvent, hobby: Hobby) => {
    e.stopPropagation(); // Prevent opening details modal
    setSelectedHobbyForLog(hobby);
    setLogMinutes('30');
    setLogNotes('');
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedHobbyForLog) {
      onLogProgress(selectedHobbyForLog.id, Number(logMinutes), logNotes);
      setSelectedHobbyForLog(null);
    }
  };

  return (
    <div className={`space-y-8 max-w-5xl mx-auto py-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* Welcome Banner */}
      <div className="text-center md:text-left space-y-1.5 py-4">
        <motion.h1 
          className="text-4xl md:text-5xl font-display font-bold tracking-tight"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Welcome, {userName || 'Hobbyist'} 👋
        </motion.h1>
        <p className="text-gray-400 text-base md:text-lg tracking-wide font-light">
          "The secret of your future is hidden in your daily routine." Track your passion today.
        </p>
      </div>

      {/* Stats and Achievements Summary Banner Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Today's Progress Card */}
        <div className={`rounded-3xl p-6 shadow-xs flex items-center justify-between border ${
          isDarkMode ? 'glass-panel-dark border-purple-900/30' : 'glass-panel border-white/60'
        }`}>
          <div className="space-y-1">
            <span className="text-gray-400 text-xs font-mono tracking-wider uppercase">Today's Progress</span>
            <div className="text-3xl font-display font-bold">{progressPercent}%</div>
            <p className="text-xs text-gray-400 font-medium">Complete ({completedTodayCount}/{totalHobbies || 0} active done)</p>
          </div>
          
          {/* Circular donut visualizer */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                cx="40" 
                cy="40" 
                r="30" 
                stroke={isDarkMode ? '#1e1a3a' : '#e2e8f0'} 
                strokeWidth="7" 
                fill="transparent" 
              />
              <circle 
                cx="40" 
                cy="40" 
                r="30" 
                stroke="url(#purpleGrad)" 
                strokeWidth="7" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 30}
                strokeDashoffset={2 * Math.PI * 30 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="purpleGrad" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute text-sm font-display font-bold text-purple-400">{progressPercent}%</span>
          </div>
        </div>

        {/* Total XP Card */}
        <div className={`rounded-3xl p-6 shadow-xs flex flex-col justify-center border ${
          isDarkMode ? 'glass-panel-dark border-purple-900/30' : 'glass-panel border-white/60'
        }`}>
          <span className="text-gray-400 text-xs font-mono tracking-wider uppercase mb-1">Total XP Score</span>
          <div className="text-4xl font-display font-bold bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent">
            {totalXpGained} XP
          </div>
          <p className="text-xs text-gray-400 font-medium mt-1">Level 4 Scholar (Top 5% of App)</p>
        </div>

        {/* Quick Motivation Card */}
        <div className={`rounded-3xl p-6 shadow-xs flex items-center gap-4 border ${
          isDarkMode 
            ? 'glass-panel-dark border-purple-900/30 bg-purple-950/10' 
            : 'glass-panel border-white/60 bg-gradient-to-tr from-purple-50/20 to-indigo-50/10'
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 shadow-xs border border-purple-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-purple-400 font-bold text-xs tracking-wider uppercase font-mono">Current Status</span>
            <h4 className="font-semibold text-sm">Consistency King!</h4>
            <p className="text-xs text-gray-400">Streak active: 12 days straight.</p>
          </div>
        </div>

      </div>

      {/* Smart Reminders & AI Recommendations Section */}
      <div className={`rounded-3xl p-6 border shadow-xs space-y-6 ${
        isDarkMode ? 'glass-panel-dark border-purple-900/30' : 'glass-panel border-white/60'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse text-purple-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">AI Smart Reminders Hub</h3>
              <p className="text-xs text-gray-400">Gemini-optimized scheduling triggers across SMS, WhatsApp, and Push.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowNotificationsLog(!showNotificationsLog)}
              className="py-2 px-3.5 rounded-xl text-xs font-semibold bg-gray-500/10 text-gray-300 hover:bg-gray-500/15 border border-gray-500/20 cursor-pointer"
            >
              {showNotificationsLog ? 'Hide Alerts' : `View Active Alerts (${notificationLogs.length})`}
            </button>
            <button
              onClick={handleAnalyzeReminders}
              disabled={isAnalyzingReminders}
              className="py-2 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-55"
            >
              {isAnalyzingReminders ? (
                <>
                  <Cpu className="w-4 h-4 animate-spin" /> Optimizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Run AI Optimizer
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Notification dispatch logs */}
        {showNotificationsLog && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-2xl p-4 bg-black/20 border border-purple-500/5 space-y-3"
          >
            <h4 className="text-xs font-mono tracking-wider uppercase text-purple-400">Active simulated alert queue:</h4>
            {notificationLogs.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No recent alerts triggered.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {notificationLogs.map(log => (
                  <div key={log.id} className="flex justify-between items-start gap-3 bg-white/5 p-2.5 rounded-xl border border-white/5 text-xs">
                    <div className="space-y-1">
                      <p className="font-medium text-slate-200">{log.message}</p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <span className="font-semibold text-purple-400">{log.channel}</span>
                        <span>•</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 bg-white/5 py-0.5 px-1.5 rounded-md">TRIGGERED</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* AI Recommendations returned by Gemini */}
        {isAnalyzingReminders && (
          <div className="py-8 text-center space-y-3">
            <Cpu className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
            <p className="text-sm font-semibold text-purple-400 animate-pulse">Gemini is parsing completion statistics and habit intervals...</p>
            <p className="text-xs text-gray-500">Formulating custom timings to bypass update-gaps and maximize engagement.</p>
          </div>
        )}

        {aiReminders && !isAnalyzingReminders && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 pt-2 border-t border-purple-500/5"
          >
            <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-purple-400">AI Engagement Analytics:</span> {aiReminders.analysis}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiReminders.suggestions.map((sug, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between space-y-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200 truncate pr-1">{sug.hobbyName}</span>
                      <span className="text-[9px] font-mono text-purple-400 bg-purple-400/10 py-0.5 px-1.5 rounded-full uppercase">{sug.channel}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-snug">{sug.reason}</p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-mono">Timing</span>
                      <span className="font-semibold text-slate-200">{sug.recommendedTime} ({sug.timingTrigger})</span>
                    </div>
                    <button
                      onClick={() => handleApplyReminder(sug.hobbyName, sug.channel, sug.recommendedTime, sug.timingTrigger)}
                      className="py-1 px-2.5 rounded-lg text-[10px] font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                    >
                      Apply Trigger
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Hobbies Row */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display font-bold">My Active Passions</h3>
          <button 
            onClick={onNavigateToCreate}
            className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/15 py-2 px-3 rounded-xl transition-all border border-purple-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Custom Hobby
          </button>
        </div>

        {activeHobbies.length === 0 ? (
          <div className={`p-10 rounded-3xl border text-center ${
            isDarkMode ? 'bg-slate-900/30 border-purple-900/10' : 'bg-purple-50/10 border-purple-100/50'
          }`}>
            <p className="text-gray-400 text-sm italic">No active hobbies found. Set up your first customized passion card!</p>
            <button 
              onClick={onNavigateToCreate}
              className="mt-4 inline-flex items-center gap-2 bg-purple-600 text-white font-semibold text-xs py-2.5 px-4 rounded-xl hover:bg-purple-700 transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Hobby
            </button>
          </div>
        ) : (
          /* Hobbies Bento-style Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {activeHobbies.map((hobby) => (
              <motion.div 
                key={hobby.id}
                layoutId={`card-${hobby.id}`}
                onClick={() => setSelectedHobbyForDetails(hobby)}
                className={`rounded-3xl overflow-hidden shadow-xs border hover:shadow-md transition-all flex flex-col h-full group cursor-pointer relative ${
                  isDarkMode ? 'glass-panel-dark border-purple-900/20 hover:border-purple-800' : 'glass-panel border-white/60 hover:border-purple-200'
                }`}
              >
                {/* Hobby Cover Image with overlay */}
                <div className="relative h-40 overflow-hidden shrink-0">
                  <img 
                    src={hobby.coverImage} 
                    alt={hobby.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  
                  {/* Emoji Float */}
                  <div 
                    style={{ borderColor: hobby.themeColor || '#a855f7' }}
                    className="absolute top-3 left-3 w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md flex items-center justify-center text-xl shadow-xs border-2"
                  >
                    {hobby.emoji}
                  </div>

                  {/* Completed Checklist Tag */}
                  {hobby.completedToday && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs border border-emerald-400/20">
                      <Check className="w-3 h-3 stroke-[3]" /> Done Today
                    </div>
                  )}

                  {/* Name on card bottom overlay */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-[9px] font-mono tracking-widest uppercase text-purple-300">
                      {hobby.category}
                    </span>
                    <h4 className="text-lg font-display font-bold leading-tight drop-shadow-md">
                      {hobby.name}
                    </h4>
                  </div>
                </div>

                {/* Card Action content */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-white/5">
                  <p className="text-xs text-gray-400 italic line-clamp-2 mb-4">
                    "{hobby.description || 'Consistency starts with action.'}"
                  </p>

                  <div className="flex justify-between items-center mb-4 pt-1 border-t border-purple-500/5">
                    {/* Streak and details */}
                    <div className="flex items-center gap-1.5 text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-xl border border-orange-500/20">
                      <Flame className="w-3.5 h-3.5 fill-current text-orange-500" />
                      <span className="font-bold text-xs">{hobby.streak} days</span>
                    </div>
                    
                    <div className="text-right text-xs text-gray-400">
                      Daily Goal: <span className="font-semibold text-purple-400">{hobby.dailyGoal}h</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {hobby.completedToday ? (
                      <button 
                        onClick={(e) => handleOpenLog(e, hobby)}
                        className="w-full py-2 px-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-medium text-xs flex items-center justify-center gap-1 hover:bg-emerald-500/15 transition-all cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Logged Today (Add More)
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => handleOpenLog(e, hobby)}
                        className="w-full py-2 px-3 rounded-xl bg-purple-600 text-white font-medium text-xs flex items-center justify-center gap-1 hover:bg-purple-700 transition-all shadow-xs hover:shadow-md cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" /> Check-in & Log Today
                      </button>
                    )}
                    <div className="text-center text-[10px] text-gray-400 group-hover:text-purple-400 transition-colors">
                      Click card to open full interactive history & stats
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Expandable ARCHIVED HOBBIES section */}
      {archivedHobbies.length > 0 && (
        <div className="pt-4 border-t border-purple-50/10">
          <button 
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-purple-400 cursor-pointer"
          >
            <Archive className="w-4 h-4 text-purple-500" />
            {showArchived ? 'Hide Archived Hobbies' : `Show Archived Hobbies (${archivedHobbies.length})`}
          </button>

          <AnimatePresence>
            {showArchived && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 overflow-hidden"
              >
                {archivedHobbies.map((hobby) => (
                  <div 
                    key={hobby.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                      isDarkMode ? 'bg-slate-950/40 border-purple-900/10' : 'bg-purple-50/5 border-purple-100/45'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{hobby.emoji}</span>
                      <div>
                        <h4 className="font-bold text-gray-400 line-through">{hobby.name}</h4>
                        <span className="text-[9px] text-gray-400 uppercase font-mono">{hobby.category}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => onUpdateHobby(hobby.id, { archived: false })}
                        title="Restore Hobby"
                        className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('Permanently delete this archived hobby?')) {
                            onDeleteHobby(hobby.id);
                          }
                        }}
                        title="Delete Hobby"
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Developer Diagnostics & Backend Verification Suite - Restrict access exclusively to the authorized developer account */}
      {currentUser?.email === 'sudharsanrj1971@gmail.com' && (
        <DiagnosticsPanel
          currentUser={currentUser}
          userName={userName}
          isDarkMode={isDarkMode}
          hobbies={hobbies}
          allAchievements={allAchievements}
          onRefreshHobbies={onRefreshHobbies}
          onUpdateHobby={onUpdateHobby}
        />
      )}

      {/* Floating Action Button (FAB) as shown on screenshot */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={onNavigateToCreate}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 hover:shadow-purple-500/30 transition-all cursor-pointer border border-purple-400/20"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Log Progress Quick Modal */}
      <AnimatePresence>
        {selectedHobbyForLog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border ${
                isDarkMode ? 'bg-[#110e20] border-purple-900/60 text-slate-100' : 'bg-white border-purple-100 text-gray-800'
              }`}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-purple-50/10">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedHobbyForLog.emoji}</span>
                  <h3 className="font-display font-bold text-lg">
                    Log {selectedHobbyForLog.name} Practice
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedHobbyForLog(null)}
                  className="text-gray-400 hover:text-purple-400 text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleLogSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">
                    Activity Duration (Minutes)
                  </label>
                  <div className="flex gap-2">
                    {['15', '30', '45', '60', '90'].map((mins) => (
                      <button
                        type="button"
                        key={mins}
                        onClick={() => setLogMinutes(mins)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          logMinutes === mins 
                            ? 'bg-purple-600 text-white border-transparent' 
                            : isDarkMode 
                              ? 'bg-slate-900 text-slate-400 border-purple-900/30 hover:bg-slate-800' 
                              : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                  <input 
                    type="number" 
                    value={logMinutes}
                    onChange={(e) => setLogMinutes(e.target.value)}
                    required
                    min="1"
                    className={`w-full mt-2.5 py-2 px-3 rounded-xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-400 ${
                      isDarkMode ? 'bg-slate-900 border-purple-900 text-white' : 'bg-white border-purple-100 text-gray-700'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">
                    Progress Notes / Reflections
                  </label>
                  <textarea 
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="E.g., Finished chapter 4 of Sapiens. Practiced watercolor landscapes."
                    rows={3}
                    className={`w-full py-2 px-3 rounded-xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-400 resize-none ${
                      isDarkMode ? 'bg-slate-900 border-purple-900 text-white' : 'bg-white border-purple-100 text-gray-700'
                    }`}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium text-sm shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  Save Progress Activity
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expanded Hobby Details Dialog Drawer */}
      <AnimatePresence>
        {selectedHobbyForDetails && (
          <HobbyDetailsView 
            hobby={selectedHobbyForDetails}
            allAchievements={allAchievements}
            isDarkMode={isDarkMode}
            onClose={() => setSelectedHobbyForDetails(null)}
            onUpdateHobby={(id, data) => {
              onUpdateHobby(id, data);
              // Update selected details object to reflect edit in-real-time
              setSelectedHobbyForDetails(prev => prev && prev.id === id ? { ...prev, ...data } : prev);
            }}
            onDeleteHobby={(id) => {
              onDeleteHobby(id);
              setSelectedHobbyForDetails(null);
            }}
            onLogProgress={(id, dur, notes) => {
              onLogProgress(id, dur, notes);
              // Update local state details logs
              setSelectedHobbyForDetails(prev => {
                if (!prev) return null;
                const newLog = { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), duration: dur, notes };
                const updatedLogs = [newLog, ...prev.logs];
                const newXp = prev.totalXp + Math.round(dur * 1.5);
                return { 
                  ...prev, 
                  logs: updatedLogs, 
                  completedToday: true, 
                  totalXp: newXp,
                  streak: prev.completedToday ? prev.streak : prev.streak + 1 
                };
              });
            }}
            onDeleteLog={(hobbyId, logId) => {
              onDeleteLog(hobbyId, logId);
              // Update details drawer logs list
              setSelectedHobbyForDetails(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  logs: prev.logs.filter(l => l.id !== logId)
                };
              });
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
