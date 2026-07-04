import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Image, Sliders, PenTool, CheckCircle, Upload, Sparkles, Bell, Clock, Shield, Plus, Trash2 } from 'lucide-react';
import { DEFAULT_HOBBY_IMAGES } from '../data';
import { ReminderSetting } from '../types';

interface HobbyCreationProps {
  onCreateHobby: (hobbyData: {
    name: string;
    category: string;
    emoji: string;
    coverImage: string;
    dailyGoal: number;
    weeklyGoal: number;
    description: string;
    priority: 'low' | 'medium' | 'high';
    themeColor: string;
    reminders: ReminderSetting[];
  }) => void;
  isDarkMode?: boolean;
}

const EMOJIS = ['🌱', '📖', '🎨', '🍳', '🏋️', '📷', '🎻', '✏️', '🪴', '☕', '🗺️', '🧠', '🧗', '🎮', '🧩', '💃', '🚴', '🛹', '🎾', '🎹', '🍿', '📝'];

const THEME_COLORS = [
  { name: 'Amethyst Violet', value: '#a855f7' },
  { name: 'Emerald Green', value: '#10b981' },
  { name: 'Dodger Blue', value: '#3b82f6' },
  { name: 'Sunset Orange', value: '#f97316' },
  { name: 'Crimson Red', value: '#ef4444' },
  { name: 'Amber Gold', value: '#f59e0b' }
];

const PRESETS = [
  'Creative',
  'Nature',
  'Intellectual',
  'Fitness',
  'Cooking',
  'Photography',
  'Music'
];

export default function HobbyCreationView({ onCreateHobby, isDarkMode = false }: HobbyCreationProps) {
  const [hobbyName, setHobbyName] = useState('');
  const [category, setCategory] = useState('Creative');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCatInput, setShowCustomCatInput] = useState(false);
  const [categories, setCategories] = useState(PRESETS);
  
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🎨');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(1);
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [themeColor, setThemeColor] = useState('#a855f7');
  
  // Advanced reminder state
  const [reminders, setReminders] = useState<ReminderSetting[]>([
    { id: 'rem-1', type: 'push', timing: '5m', time: '18:00', enabled: true }
  ]);
  
  // Cover image key selection state
  const [selectedImageKey, setSelectedImageKey] = useState<keyof typeof DEFAULT_HOBBY_IMAGES>('painting');
  const [customImageUrl, setCustomImageUrl] = useState('');
  
  const coverImage = customImageUrl || DEFAULT_HOBBY_IMAGES[selectedImageKey];

  const handleAddReminder = () => {
    const newRem: ReminderSetting = {
      id: `rem-${Date.now()}`,
      type: 'push',
      timing: '5m',
      time: '09:00',
      enabled: true
    };
    setReminders([...reminders, newRem]);
  };

  const handleUpdateReminder = (id: string, updates: Partial<ReminderSetting>) => {
    setReminders(reminders.map(rem => rem.id === id ? { ...rem, ...updates } : rem));
  };

  const handleRemoveReminder = (id: string) => {
    setReminders(reminders.filter(rem => rem.id !== id));
  };

  const handleCreate = () => {
    if (!hobbyName.trim()) return;
    
    const finalCategory = showCustomCatInput && customCategory.trim() 
      ? customCategory.trim() 
      : category;

    onCreateHobby({
      name: hobbyName,
      category: finalCategory,
      emoji: selectedEmoji,
      coverImage,
      dailyGoal,
      weeklyGoal,
      description: description || `Consistently practice ${hobbyName} for personal growth.`,
      priority,
      themeColor,
      reminders
    });

    // Reset fields
    setHobbyName('');
    setDescription('');
    setCustomCategory('');
    setShowCustomCatInput(false);
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim() && !categories.includes(customCategory.trim())) {
      setCategories([...categories, customCategory.trim()]);
      setCategory(customCategory.trim());
      setShowCustomCatInput(false);
    }
  };

  return (
    <div className={`space-y-8 max-w-5xl mx-auto py-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Page Title */}
      <div className="text-center py-4">
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500 bg-clip-text text-transparent">
          Custom Hobby Creation Suite
        </h1>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
          Design your custom habit structure with real notification timings and watch it sync live.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column (Hobby Details & Goals) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Hobby Details Panel */}
          <div className={`${isDarkMode ? 'glass-panel-dark' : 'glass-panel'} rounded-3xl p-6 space-y-5 border`}>
            <h3 className="text-lg font-display font-bold border-b border-purple-50/10 pb-2 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-purple-500" />
              Hobby Details
            </h3>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-purple-400">
                Hobby Name
              </label>
              <input 
                type="text" 
                value={hobbyName}
                onChange={(e) => setHobbyName(e.target.value)}
                placeholder="E.g., Watercolor Painting, Daily Sketchnoting..."
                className={`w-full py-2.5 px-4 rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm transition-all shadow-xs ${
                  isDarkMode 
                    ? 'border-purple-900/40 bg-slate-950/60 text-slate-100 placeholder-slate-500' 
                    : 'border-purple-100 bg-white/50 text-gray-700'
                }`}
              />
            </div>

            {/* Description Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-purple-400">
                Description / Purpose
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why do you love this hobby? What is your motivation?"
                rows={2}
                className={`w-full py-2.5 px-4 rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm transition-all shadow-xs resize-none ${
                  isDarkMode 
                    ? 'border-purple-900/40 bg-slate-950/60 text-slate-100 placeholder-slate-500' 
                    : 'border-purple-100 bg-white/50 text-gray-700'
                }`}
              />
            </div>

            {/* Category row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Category selector */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-purple-400">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCustomCatInput(!showCustomCatInput)}
                    className="text-[10px] text-purple-500 hover:underline font-bold"
                  >
                    {showCustomCatInput ? 'Select Presets' : '+ Create Custom'}
                  </button>
                </div>

                {showCustomCatInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Custom Cat..."
                      className={`w-full py-2 px-3 rounded-xl border text-xs focus:outline-hidden ${
                        isDarkMode 
                          ? 'border-purple-900/40 bg-slate-950/60 text-slate-100' 
                          : 'border-purple-100 bg-white/50 text-gray-700'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCategory}
                      className="px-2 py-1 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full py-2.5 px-3 rounded-xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all shadow-xs ${
                      isDarkMode 
                        ? 'border-purple-900/40 bg-slate-950/60 text-slate-100' 
                        : 'border-purple-100 bg-white/50 text-gray-700'
                    }`}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className={isDarkMode ? 'bg-slate-900' : ''}>{cat}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Emoji Picker */}
              <div className="space-y-1.5 relative">
                <label className="block text-xs font-semibold uppercase tracking-wider text-purple-400">
                  Icon Emoji
                </label>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`w-full py-2 px-4 rounded-xl border flex items-center justify-between font-medium text-sm shadow-xs transition-all cursor-pointer ${
                    isDarkMode 
                      ? 'border-purple-900/40 bg-slate-950/60 text-slate-100 hover:bg-slate-900' 
                      : 'border-purple-100 bg-white/70 text-gray-700 hover:bg-white'
                  }`}
                >
                  <span>Pick Icon</span>
                  <span className="text-xl bg-purple-500/10 px-2.5 py-0.5 rounded-lg border border-purple-500/20">{selectedEmoji}</span>
                </button>

                {showEmojiPicker && (
                  <div className={`absolute top-16 left-0 right-0 rounded-2xl p-3 border shadow-xl z-20 grid grid-cols-6 gap-2 ${
                    isDarkMode ? 'bg-slate-900/95 border-purple-900' : 'bg-white/95 border-purple-100'
                  }`}>
                    {EMOJIS.map((emo) => (
                      <button
                        key={emo}
                        type="button"
                        onClick={() => {
                          setSelectedEmoji(emo);
                          setShowEmojiPicker(false);
                        }}
                        className={`text-xl p-2 rounded-lg hover:bg-purple-500/15 transition-all cursor-pointer ${
                          selectedEmoji === emo ? 'bg-purple-500/30 scale-110' : ''
                        }`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Custom Theme Color Picker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-purple-400">
                Card Theme Accent Color
              </label>
              <div className="flex flex-wrap gap-3">
                {THEME_COLORS.map((col) => (
                  <button
                    key={col.value}
                    type="button"
                    onClick={() => setThemeColor(col.value)}
                    style={{ backgroundColor: col.value }}
                    title={col.name}
                    className={`w-8 h-8 rounded-full cursor-pointer transition-all flex items-center justify-center ${
                      themeColor === col.value 
                        ? 'ring-4 ring-offset-2 ring-purple-500 scale-110 shadow-md' 
                        : 'opacity-85 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    {themeColor === col.value && (
                      <CheckCircle className="w-4 h-4 text-white drop-shadow-xs" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Cover Image Preset Select & Custom URL Input */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-purple-400">
                Cover Image Setup
              </label>
              
              {/* Preset cover grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(Object.keys(DEFAULT_HOBBY_IMAGES) as Array<keyof typeof DEFAULT_HOBBY_IMAGES>).map((imgKey) => (
                  <button
                    key={imgKey}
                    type="button"
                    onClick={() => {
                      setSelectedImageKey(imgKey);
                      setCustomImageUrl('');
                    }}
                    className={`relative h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImageKey === imgKey && !customImageUrl ? 'border-purple-600 scale-102 shadow-xs' : 'border-transparent'
                    }`}
                  >
                    <img src={DEFAULT_HOBBY_IMAGES[imgKey]} alt={imgKey} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/10 hover:bg-transparent" />
                    <span className="absolute bottom-0.5 left-0 right-0 text-[8px] bg-black/40 text-white font-bold text-center capitalize">{imgKey}</span>
                  </button>
                ))}
              </div>

              {/* Custom Image URL Field */}
              <div className="space-y-1">
                <input
                  type="text"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="Paste custom cover image URL (optional)..."
                  className={`w-full py-1.5 px-3 rounded-lg border text-xs focus:outline-hidden ${
                    isDarkMode 
                      ? 'border-purple-900/40 bg-slate-950/60 text-slate-100' 
                      : 'border-purple-100 bg-white/50 text-gray-700'
                  }`}
                />
              </div>

              {/* Upload preset zone */}
              <div className={`border border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDarkMode ? 'border-purple-900/50 bg-slate-900/10 hover:bg-slate-900/30' : 'border-purple-200 bg-purple-50/20 hover:bg-purple-50/40'
              }`}>
                <Upload className="w-6 h-6 text-purple-400 mb-1" />
                <span className="text-xs font-medium">Cover Image Drag & Drop</span>
                <span className="text-[10px] text-gray-400 mt-0.5">Mock files are uploaded directly to Firebase Storage securely</span>
              </div>
            </div>

          </div>

          {/* Goals sliders Panel */}
          <div className={`${isDarkMode ? 'glass-panel-dark' : 'glass-panel'} rounded-3xl p-6 space-y-5 border`}>
            <h3 className="text-lg font-display font-bold border-b border-purple-50/10 pb-2 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-500" />
              Progress Goals
            </h3>

            {/* Daily Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-purple-400">
                <span>Daily Commitment Goal</span>
                <span className="text-purple-500 font-bold font-mono text-sm">{dailyGoal} hrs / day</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="8" 
                step="0.5"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>0.5 hr</span>
                <span>4 hrs</span>
                <span>8 hrs</span>
              </div>
            </div>

            {/* Weekly Goal Calculation */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-purple-400">
                <span>Weekly Commitment Goal</span>
                <span className="text-purple-500 font-bold font-mono text-sm">{weeklyGoal} hrs / week</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="40" 
                step="1"
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>1 hr</span>
                <span>20 hrs</span>
                <span>40 hrs</span>
              </div>
            </div>

            {/* Priority Selector */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-purple-400">
                Habit Priority Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 rounded-xl text-xs font-bold uppercase cursor-pointer tracking-wider transition-all border ${
                      priority === p 
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-500/25' 
                        : isDarkMode 
                          ? 'bg-slate-900 border-purple-900/30 text-slate-400 hover:bg-slate-800' 
                          : 'bg-white border-purple-100 text-gray-600 hover:bg-purple-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Smart Reminder System Selection */}
          <div className={`${isDarkMode ? 'glass-panel-dark' : 'glass-panel'} rounded-3xl p-6 space-y-5 border`}>
            <div className="flex justify-between items-center border-b border-purple-50/10 pb-2">
              <h3 className="text-lg font-display font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-500" />
                Smart Reminder Suite
              </h3>
              <button
                type="button"
                onClick={handleAddReminder}
                className="text-xs text-purple-500 hover:text-purple-400 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Timing
              </button>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Enable push or cellular notifications powered by the Twilio WhatsApp and SMS integrations.
            </p>

            <div className="space-y-3">
              {reminders.map((rem, index) => (
                <div 
                  key={rem.id} 
                  className={`p-3 rounded-2xl flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border ${
                    isDarkMode ? 'bg-slate-950/40 border-purple-900/20' : 'bg-purple-50/30 border-purple-100/50'
                  }`}
                >
                  <div className="flex flex-wrap gap-2 items-center">
                    {/* Reminder channel */}
                    <select
                      value={rem.type}
                      onChange={(e) => handleUpdateReminder(rem.id, { type: e.target.value as any })}
                      className={`py-1 px-2 rounded-lg text-xs font-semibold focus:outline-hidden ${
                        isDarkMode ? 'bg-slate-900 text-slate-100 border-purple-900' : 'bg-white border-purple-200'
                      }`}
                    >
                      <option value="push">🔔 In-App Push</option>
                      <option value="whatsapp">💬 WhatsApp Chat</option>
                      <option value="sms">📱 SMS Cellular</option>
                      <option value="email">✉️ Email Alerts</option>
                    </select>

                    {/* Pre-alarm timings */}
                    <select
                      value={rem.timing}
                      onChange={(e) => handleUpdateReminder(rem.id, { timing: e.target.value as any })}
                      className={`py-1 px-2 rounded-lg text-xs focus:outline-hidden ${
                        isDarkMode ? 'bg-slate-900 text-slate-100 border-purple-900' : 'bg-white border-purple-200'
                      }`}
                    >
                      <option value="5m">5 mins before</option>
                      <option value="10m">10 mins before</option>
                      <option value="15m">15 mins before</option>
                      <option value="30m">30 mins before</option>
                      <option value="1h">1 hour before</option>
                      <option value="custom">custom timings</option>
                    </select>
                  </div>

                  <div className="flex gap-3 items-center w-full sm:w-auto justify-between sm:justify-end">
                    {/* Target clock time */}
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="time"
                        value={rem.time}
                        onChange={(e) => handleUpdateReminder(rem.id, { time: e.target.value })}
                        className={`py-1 px-2 rounded-lg text-xs font-mono focus:outline-hidden ${
                          isDarkMode ? 'bg-slate-900 text-slate-100 border-purple-900' : 'bg-white border-purple-200'
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateReminder(rem.id, { enabled: !rem.enabled })}
                        className={`text-xs px-2 py-1 rounded-md font-semibold cursor-pointer ${
                          rem.enabled 
                            ? 'bg-emerald-500/20 text-emerald-500' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {rem.enabled ? 'Active' : 'Muted'}
                      </button>
                      
                      {reminders.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveReminder(rem.id)}
                          className="p-1 hover:text-red-500 text-gray-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Live Preview Card Column */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <h3 className="text-xs font-mono tracking-widest uppercase font-semibold text-gray-500 mb-2">
            Live Card Simulator
          </h3>

          {/* Glowing Preview Card */}
          <div className={`${isDarkMode ? 'glass-panel-dark' : 'glass-panel'} rounded-3xl overflow-hidden border relative flex flex-col shadow-lg`}>
            
            {/* Visual Header */}
            <div className="relative h-44 overflow-hidden">
              <img src={coverImage} alt="Live Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              
              {/* Floating Emoji with Custom Theme Color ring */}
              <div 
                style={{ borderColor: themeColor }}
                className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-white/95 backdrop-blur-md flex items-center justify-center text-2xl shadow-sm border-2"
              >
                {selectedEmoji}
              </div>

              {/* Status Indicator */}
              <div 
                style={{ backgroundColor: themeColor }}
                className="absolute top-4 right-4 text-white text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase"
              >
                {priority} PRIORITY
              </div>

              {/* Details overlay */}
              <div className="absolute bottom-4 left-5 right-5">
                <span className="text-xs font-mono tracking-widest uppercase text-purple-200">
                  {category}
                </span>
                <h4 className="text-xl font-display font-bold text-white tracking-tight drop-shadow-md">
                  {hobbyName.trim() || 'Your Hobby Name'}
                </h4>
              </div>
            </div>

            {/* Goals metrics and sliders indicators */}
            <div className={`p-5 space-y-4 ${isDarkMode ? 'bg-slate-950/20' : 'bg-white/20'}`}>
              
              {/* Custom Description preview */}
              <p className={`text-xs italic ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                "{description || 'Consistently practice daily for continuous personal growth.'}"
              </p>

              {/* Daily progress mockup */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Daily Goal</span>
                  <span className="font-semibold text-purple-400">{dailyGoal}h / day</span>
                </div>
                <div className="w-full h-2.5 bg-gray-500/10 rounded-full overflow-hidden">
                  <div 
                    style={{ backgroundColor: themeColor, width: '40%' }}
                    className="h-full rounded-full animate-pulse" 
                  />
                </div>
              </div>

              {/* Weekly progress mockup */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Weekly Goal</span>
                  <span className="font-semibold text-purple-400">{weeklyGoal}h / week</span>
                </div>
                <div className="w-full h-2.5 bg-gray-500/10 rounded-full overflow-hidden">
                  <div 
                    style={{ backgroundColor: themeColor, width: '30%', opacity: 0.8 }}
                    className="h-full rounded-full" 
                  />
                </div>
              </div>

              {/* Reminders count preview */}
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Bell className="w-3.5 h-3.5 text-purple-500" />
                <span>{reminders.filter(r => r.enabled).length} active smart reminders scheduled</span>
              </div>

              {/* Create button */}
              <button
                type="button"
                onClick={handleCreate}
                disabled={!hobbyName.trim()}
                className={`w-full py-3 px-4 rounded-xl text-center font-display font-medium text-sm transition-all shadow-xs ${
                  hobbyName.trim() 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer active:scale-[0.99] hover:shadow-md' 
                    : 'bg-gray-500/10 text-gray-400 cursor-not-allowed'
                }`}
              >
                Create and Sync Hobby
              </button>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
