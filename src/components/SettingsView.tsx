import React from 'react';
import { motion } from 'motion/react';
import { Mail, Shield, MessageSquare, Brain, Search, Cpu, Sun, Moon } from 'lucide-react';
import { PrivacySettings } from '../types';

interface SettingsProps {
  settings: PrivacySettings;
  isDarkMode?: boolean;
  onToggleSetting: (key: keyof PrivacySettings) => void;
  onToggleTheme: () => void;
}

export default function SettingsView({ settings, isDarkMode = false, onToggleSetting, onToggleTheme }: SettingsProps) {
  return (
    <div className={`space-y-8 max-w-5xl mx-auto py-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Visual Header */}
      <div className="text-center py-4">
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent leading-none pb-1">
          System & Privacy Settings
        </h1>
        <p className="text-xs text-gray-400 mt-2">Adjust notification parameters, toggle dark/light theme options, and activate Gemini assistants.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Column 1: Account & Theme */}
        <div className="space-y-4">
          <h3 className="text-lg font-display font-bold px-1 text-purple-400">
            Account & Theme
          </h3>
          
          <div className={`rounded-3xl p-6 space-y-6 border ${
            isDarkMode ? 'glass-panel-dark border-purple-900/30' : 'glass-panel border-white/60'
          }`}>
            
            {/* Visual Theme toggle */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  {isDarkMode ? <Moon className="w-5 h-5 animate-pulse" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Application Appearance</h4>
                  <p className="text-xs text-gray-400 leading-snug">
                    Currently set to <span className="font-bold text-purple-400">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={onToggleTheme}
                className="py-2 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                Toggle Mode
              </button>
            </div>

            {/* Email Prefs */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Email Reports</h4>
                  <p className="text-xs text-gray-400 leading-snug">Weekly progress summaries delivered straight to inbox</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggleSetting('emailPreferences')}
                className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                  settings.emailPreferences ? 'bg-purple-600' : 'bg-gray-500/30'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.emailPreferences ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Password Security */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Log Reminders SMS</h4>
                  <p className="text-xs text-gray-400 leading-snug">Trigger urgent SMS alerts on inactive streaks</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggleSetting('passwordSecurity')}
                className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                  settings.passwordSecurity ? 'bg-purple-600' : 'bg-gray-500/30'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.passwordSecurity ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

          </div>
        </div>

        {/* Column 2: Integrations */}
        <div className="space-y-4">
          <h3 className="text-lg font-display font-bold px-1 text-purple-400">
            AI Integrations & Data
          </h3>
          
          <div className={`rounded-3xl p-6 space-y-6 border ${
            isDarkMode ? 'glass-panel-dark border-purple-900/30' : 'glass-panel border-white/60'
          }`}>
            
            {/* AI Assistant */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Hobby AI Coach</h4>
                  <p className="text-xs text-gray-400 leading-snug">Personalized chatbot feedback and progress support</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggleSetting('hobbyAiAssistant')}
                className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                  settings.hobbyAiAssistant ? 'bg-purple-600' : 'bg-gray-500/30'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.hobbyAiAssistant ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Auto-categorization */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Auto-Categorization</h4>
                  <p className="text-xs text-gray-400 leading-snug">Intelligent classification of custom entries</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggleSetting('autoCategorization')}
                className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                  settings.autoCategorization ? 'bg-purple-600' : 'bg-gray-500/30'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.autoCategorization ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Insights Engine */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Insights Engine</h4>
                  <p className="text-xs text-gray-400 leading-snug">Advanced vector metrics and heatmaps analyzer</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggleSetting('insightsEngine')}
                className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                  settings.insightsEngine ? 'bg-purple-600' : 'bg-gray-500/30'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.insightsEngine ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Export Data */}
            <div className="flex items-center justify-between gap-4 border-t border-purple-500/10 pt-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Export Data (JSON)</h4>
                  <p className="text-xs text-gray-400 leading-snug">Download all your logs and habits</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage));
                  const downloadAnchorNode = document.createElement('a');
                  downloadAnchorNode.setAttribute("href", dataStr);
                  downloadAnchorNode.setAttribute("download", "hobbysync_data.json");
                  document.body.appendChild(downloadAnchorNode);
                  downloadAnchorNode.click();
                  downloadAnchorNode.remove();
                }}
                className="py-1.5 px-3 rounded-lg text-xs font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-300 transition-colors cursor-pointer"
              >
                Export
              </button>
            </div>

            {/* Clear Data */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-red-500 dark:text-red-400">Danger Zone</h4>
                  <p className="text-xs text-gray-400 leading-snug">Erase all local app data</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="py-1.5 px-3 rounded-lg text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
