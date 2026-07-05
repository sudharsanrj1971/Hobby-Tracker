import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Clock, Calendar, Award, Trash2, Archive, RotateCcw, Edit2, Check, X, Bell, Plus, Settings, Play, Sparkles, BookOpen } from 'lucide-react';
import { Hobby, ReminderSetting, Achievement } from '../types';
import { generateHeatmapData } from '../data';
import HobbyEnvironment from './HobbyEnvironment';
import { getHobbyTheme, THEMES } from '../lib/visualEngine';

interface HobbyDetailsProps {
  hobby: Hobby;
  allAchievements: Achievement[];
  isDarkMode?: boolean;
  onClose: () => void;
  onUpdateHobby: (hobbyId: string, updatedData: Partial<Hobby>) => void;
  onDeleteHobby: (hobbyId: string) => void;
  onLogProgress: (hobbyId: string, duration: number, notes: string) => void;
  onDeleteLog: (hobbyId: string, logId: string) => void;
}

export default function HobbyDetailsView({
  hobby,
  allAchievements,
  isDarkMode = false,
  onClose,
  onUpdateHobby,
  onDeleteHobby,
  onLogProgress,
  onDeleteLog,
}: HobbyDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(hobby.name);
  const [editDesc, setEditDesc] = useState(hobby.description || '');
  const [editDailyGoal, setEditDailyGoal] = useState(hobby.dailyGoal);
  const [editWeeklyGoal, setEditWeeklyGoal] = useState(hobby.weeklyGoal);
  const [editPriority, setEditPriority] = useState(hobby.priority || 'medium');
  const [editColor, setEditColor] = useState(hobby.themeColor || '#a855f7');
  
  const themeType = getHobbyTheme(hobby.name, hobby.category);
  const theme = THEMES[themeType];

  // Log state
  const [showLogForm, setShowLogForm] = useState(false);
  const [logMins, setLogMins] = useState('30');
  const [logNotes, setLogNotes] = useState('');

  // Generated mini-heatmap for this hobby
  const [miniHeatmap] = useState(() => generateHeatmapData().slice(1, 5)); // Smaller 4-day row view for details

  // Filter linked achievements
  const linkedAchievements = allAchievements.slice(0, 3); // Simulating 3 achievements relevant to this category

  const handleSaveEdit = () => {
    onUpdateHobby(hobby.id, {
      name: editName,
      description: editDesc,
      dailyGoal: editDailyGoal,
      weeklyGoal: editWeeklyGoal,
      priority: editPriority as any,
      themeColor: editColor,
    });
    setIsEditing(false);
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogProgress(hobby.id, Number(logMins), logNotes);
    setLogNotes('');
    setShowLogForm(false);
  };

  const totalMinutes = hobby.logs.reduce((acc, l) => acc + l.duration, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-end p-0 sm:p-4 bg-black/70 backdrop-blur-md transition-opacity overflow-y-auto`}>
      <motion.div 
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className={`w-full max-w-2xl h-full sm:h-[95vh] sm:rounded-3xl shadow-2xl flex flex-col relative overflow-hidden border ${
          isDarkMode ? 'bg-[#0e0c18] border-white/5 text-slate-100' : 'bg-white border-purple-100 text-gray-800'
        }`}
      >
        {/* Immersive Header Environment */}
        <div className="relative h-64 sm:h-72 shrink-0 overflow-hidden">
          <HobbyEnvironment themeType={themeType} isDarkMode={isDarkMode} intensity="high" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0c18] via-[#0e0c18]/20 to-transparent" />
          
          {/* Close & Edit Button controls */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </motion.button>
            
            <div className="flex gap-3">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(!isEditing)}
                className="py-2 px-4 rounded-2xl bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-white/10 shadow-lg"
              >
                <Edit2 className="w-4 h-4" /> {isEditing ? 'Cancel' : 'Edit Configuration'}
              </motion.button>
            </div>
          </div>

          {/* Floating Emoji with animation */}
          <motion.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2 }}
            style={{ 
              borderColor: theme.primary,
              boxShadow: `0 0 30px ${theme.primary}50`
            }}
            className="absolute bottom-8 left-8 w-20 h-20 rounded-[2rem] bg-white/10 backdrop-blur-2xl flex items-center justify-center text-4xl shadow-2xl border-2 z-20"
          >
            {hobby.emoji}
          </motion.div>

          <div className="absolute bottom-8 left-32 right-8 text-white z-20">
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs font-mono tracking-[0.3em] uppercase text-purple-400 font-bold block mb-2"
            >
              {hobby.category} {hobby.archived && '• ARCHIVED'}
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-display font-bold leading-tight drop-shadow-2xl"
            >
              {hobby.name}
            </motion.h2>
          </div>
        </div>

        {/* Scrollable Content Workspace */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div 
                key="edit-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-5 rounded-2xl border space-y-4 ${
                  isDarkMode ? 'bg-slate-950/40 border-purple-900/30' : 'bg-purple-50/20 border-purple-100'
                }`}
              >
                <h3 className="font-display font-bold text-sm text-purple-400 uppercase tracking-wider">
                  Update Hobby Configuration
                </h3>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Hobby Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full py-2 px-3 rounded-xl border text-sm ${
                      isDarkMode ? 'bg-slate-900 border-purple-900 text-white' : 'bg-white border-purple-100 text-gray-700'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Description</label>
                  <textarea 
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className={`w-full py-2 px-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                      isDarkMode ? 'bg-slate-900 border-purple-900 text-white' : 'bg-white border-purple-100 text-gray-700'
                    }`}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Daily Goal (hours)</label>
                    <input 
                      type="number" 
                      step="0.5"
                      value={editDailyGoal}
                      onChange={(e) => setEditDailyGoal(Number(e.target.value))}
                      className={`w-full py-2 px-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                        isDarkMode ? 'bg-slate-900 border-purple-900 text-white' : 'bg-white border-purple-100 text-gray-700'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Weekly Goal (hours)</label>
                    <input 
                      type="number" 
                      value={editWeeklyGoal}
                      onChange={(e) => setEditWeeklyGoal(Number(e.target.value))}
                      className={`w-full py-2 px-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                        isDarkMode ? 'bg-slate-900 border-purple-900 text-white' : 'bg-white border-purple-100 text-gray-700'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="py-2 px-4 rounded-xl text-xs font-bold bg-gray-500/10 text-gray-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    className="py-2 px-5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="static-details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Description Quote */}
                {hobby.description && (
                  <p className={`text-sm italic leading-relaxed border-l-4 pl-4 py-1 ${
                    isDarkMode ? 'text-slate-300 border-purple-500' : 'text-gray-600 border-purple-500'
                  }`}>
                    "{hobby.description}"
                  </p>
                )}

                {/* Grid Analytics Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
                    isDarkMode ? 'bg-slate-950/40 border-purple-900/10' : 'bg-purple-50/10 border-purple-100/50'
                  }`}>
                    <span className="text-[10px] uppercase font-mono text-gray-400">Current Streak</span>
                    <div className="flex items-center gap-1.5 text-orange-500 font-display font-bold text-xl mt-1">
                      <Flame className="w-5 h-5 fill-current" />
                      {hobby.streak} Days
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
                    isDarkMode ? 'bg-slate-950/40 border-purple-900/10' : 'bg-purple-50/10 border-purple-100/50'
                  }`}>
                    <span className="text-[10px] uppercase font-mono text-gray-400">Total Logged</span>
                    <div className="text-xl font-display font-bold text-purple-500 mt-1">
                      {totalHours} hrs
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
                    isDarkMode ? 'bg-slate-950/40 border-purple-900/10' : 'bg-purple-50/10 border-purple-100/50'
                  }`}>
                    <span className="text-[10px] uppercase font-mono text-gray-400">Priority Level</span>
                    <div className="text-sm font-semibold capitalize tracking-wider mt-1 text-blue-500">
                      ● {hobby.priority || 'medium'}
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
                    isDarkMode ? 'bg-slate-950/40 border-purple-900/10' : 'bg-purple-50/10 border-purple-100/50'
                  }`}>
                    <span className="text-[10px] uppercase font-mono text-gray-400">Daily Goal</span>
                    <div className="text-sm font-semibold mt-1">
                      {hobby.dailyGoal} hrs / day
                    </div>
                  </div>
                </div>

                {/* Progressive Habit Log Action */}
                {!showLogForm ? (
                  <button
                    onClick={() => setShowLogForm(true)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs hover:shadow-md cursor-pointer active:scale-[0.99] transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Practical Progress Session
                  </button>
                ) : (
                  <form onSubmit={handleLogSubmit} className={`p-4 rounded-2xl border space-y-3 ${
                    isDarkMode ? 'bg-slate-900/50 border-purple-900' : 'bg-purple-50/20 border-purple-100'
                  }`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-purple-400 uppercase">Log Daily Routine</span>
                      <button type="button" onClick={() => setShowLogForm(false)} className="text-xs text-gray-400 hover:underline">Close</button>
                    </div>

                    <div className="flex gap-2">
                      {['15', '30', '45', '60', '120'].map(m => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setLogMins(m)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                            logMins === m ? 'bg-purple-600 text-white border-transparent' : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'
                          }`}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center">
                      <label className="text-xs text-gray-400 col-span-1">Duration (mins):</label>
                      <input 
                        type="number" 
                        value={logMins}
                        onChange={(e) => setLogMins(e.target.value)}
                        className={`col-span-2 py-1 px-2 border rounded-lg text-xs focus:outline-none ${
                          isDarkMode 
                            ? 'bg-slate-900 border-purple-900/40 text-white' 
                            : 'bg-white border-purple-100 text-gray-700'
                        }`}
                      />
                    </div>

                    <input 
                      type="text" 
                      value={logNotes}
                      onChange={(e) => setLogNotes(e.target.value)}
                      placeholder="Add custom notes (e.g., read chapter 4, weeded the garden)"
                      className={`w-full py-1.5 px-3 border rounded-lg text-xs focus:outline-none ${
                        isDarkMode 
                          ? 'bg-slate-900 border-purple-900/40 text-white placeholder-slate-500' 
                          : 'bg-white border-purple-100 text-gray-700'
                      }`}
                    />

                    <button 
                      type="submit"
                      className="w-full py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 cursor-pointer"
                    >
                      Save Progress Entry
                    </button>
                  </form>
                )}

                {/* Mini Heatmap Visualization */}
                <div className="space-y-2">
                  <h3 className="text-xs font-mono font-semibold tracking-wider text-gray-400 uppercase">
                    Personal Contribution Heatmap
                  </h3>
                  <div className={`p-4 rounded-2xl border ${
                    isDarkMode ? 'bg-slate-950/30 border-purple-900/10' : 'bg-purple-50/5 border-purple-100/50'
                  }`}>
                    {/* Compact heat grid rows */}
                    <div className="grid grid-cols-4 gap-3">
                      {miniHeatmap.map((row) => (
                        <div key={row.day} className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-gray-400 w-8">{row.day}</span>
                          <div className="flex gap-1.5 flex-1">
                            {row.cells.slice(0, 14).map((cell) => (
                              <div
                                key={cell.id}
                                className={`w-3.5 h-3.5 rounded-xs transition-transform hover:scale-125 cursor-pointer ${
                                  cell.level === 0 ? isDarkMode ? 'bg-purple-950/20' : 'bg-gray-100' :
                                  cell.level === 1 ? 'bg-purple-400/30' :
                                  cell.level === 2 ? 'bg-purple-400/60' :
                                  cell.level === 3 ? 'bg-purple-500' :
                                  'bg-purple-700'
                                }`}
                                title={`Activity score level: ${cell.level}`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reminders list for this Hobby */}
                <div className="space-y-2">
                  <h3 className="text-xs font-mono font-semibold tracking-wider text-gray-400 uppercase flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-purple-400" /> Reminders Scheduled
                  </h3>
                  {hobby.reminders && hobby.reminders.length > 0 ? (
                    <div className="space-y-2">
                      {hobby.reminders.map((rem) => (
                        <div key={rem.id} className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="capitalize font-semibold text-purple-400">{rem.type} Alert</span>
                            <span className="text-gray-400">({rem.timing} before)</span>
                          </div>
                          <span className="font-mono font-bold text-purple-400">{rem.time}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic">No custom notification timings set for this card. Edit to configure.</div>
                  )}
                </div>

                {/* AI recommendations block */}
                <div className={`p-4 rounded-2xl border bg-gradient-to-tr ${
                  isDarkMode 
                    ? 'from-purple-950/30 to-indigo-950/20 border-purple-900/30' 
                    : 'from-purple-50/20 to-indigo-50/10 border-purple-100'
                }`}>
                  <h4 className="text-xs font-bold text-purple-400 uppercase flex items-center gap-1 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Coach Gemini Recommendation
                  </h4>
                  <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    We noticed you are most active in the afternoon. Consider scheduling a short 20-minute session at 15:30 to maximize completion scores and maintain your current streak!
                  </p>
                </div>

                {/* History Timeline */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-semibold tracking-wider text-gray-400 uppercase">
                    Commitment Logs & History
                  </h3>
                  
                  {hobby.logs.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No entry logs reported yet. Log your first session today!</p>
                  ) : (
                    <div className="space-y-3 relative border-l border-purple-100/30 pl-4 ml-2">
                      {hobby.logs.map((log) => (
                        <div key={log.id} className="relative group">
                          {/* Dot indicator */}
                          <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500" />
                          
                          <div className={`p-3 rounded-xl border flex justify-between items-start ${
                            isDarkMode ? 'bg-slate-950/40 border-purple-900/20' : 'bg-purple-50/10 border-purple-100/50'
                          }`}>
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-display font-bold text-xs">Logged {log.duration} mins</span>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {log.flowState && (
                                  <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full font-mono font-semibold tracking-wide">FLOW STATE</span>
                                )}
                                {log.energyDelta !== undefined && (
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-semibold tracking-wide ${
                                    log.energyDelta > 0 ? 'bg-emerald-500/20 text-emerald-400' :
                                    log.energyDelta < 0 ? 'bg-orange-500/20 text-orange-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  }`}>
                                    {log.energyDelta > 0 ? '+' : ''}{log.energyDelta} ENERGY
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                                {log.notes || 'Routine practice completed.'}
                              </p>
                            </div>

                            <button 
                              onClick={() => onDeleteLog(hobby.id, log.id)}
                              title="Delete log"
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-gray-400 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Destructive / Status Control Actions */}
                <div className="flex gap-3 justify-between pt-4 border-t border-purple-50/10">
                  <button
                    onClick={() => {
                      onUpdateHobby(hobby.id, { archived: !hobby.archived });
                      onClose();
                    }}
                    className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      hobby.archived 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}
                  >
                    {hobby.archived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                    {hobby.archived ? 'Restore Hobby' : 'Archive Hobby'}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Are you absolutely sure you want to permanently delete this hobby and all its progress logs?')) {
                        onDeleteHobby(hobby.id);
                        onClose();
                      }
                    }}
                    className="py-2 px-3.5 rounded-xl text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1.5 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Hobby
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
}
