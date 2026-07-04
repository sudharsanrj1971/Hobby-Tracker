import React from 'react';
import { motion } from 'motion/react';
import { Award, Lock, Sparkles, Trophy, Star, CheckCircle } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementsProps {
  achievements: Achievement[];
  isDarkMode?: boolean;
}

export default function AchievementsView({ achievements, isDarkMode = false }: AchievementsProps) {
  return (
    <div className={`space-y-8 max-w-5xl mx-auto py-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Visual Title */}
      <div className="text-center py-4">
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent">
          Commitment Achievements
        </h1>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
          Form durable streaks, complete active hobby goals, and claim your consistency badges!
        </p>
      </div>

      {/* Grid of Achievements Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map((badge) => {
          return (
            <motion.div
              key={badge.id}
              whileHover={{ y: -2 }}
              className={`rounded-3xl p-6 border flex gap-5 items-center relative overflow-hidden transition-all ${
                badge.unlocked
                  ? isDarkMode
                    ? 'border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-indigo-950/10 to-transparent'
                    : 'border-purple-200/65 bg-gradient-to-r from-purple-50/20 via-indigo-50/10 to-transparent'
                  : isDarkMode
                    ? 'opacity-40 bg-slate-950/20 border-purple-950/20'
                    : 'opacity-65 bg-gray-50/20 border-gray-100'
              }`}
            >
              {/* Confetti particles graphics */}
              {badge.unlocked && (
                <div className="absolute top-1 right-2 pointer-events-none opacity-40 animate-bounce">
                  <span className="text-sm">🎉</span>
                </div>
              )}

              {/* Badge Icon circle */}
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm border ${
                  badge.unlocked
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 font-bold'
                    : isDarkMode 
                      ? 'bg-slate-900 border-purple-950/40 text-slate-500'
                      : 'bg-gray-100 border-gray-200 text-gray-400'
                }`}
              >
                {badge.unlocked ? (
                  <span className="animate-pulse">{badge.icon}</span>
                ) : (
                  <Lock className="w-5 h-5 text-gray-500 stroke-[2.5]" />
                )}
              </div>

              {/* Text metadata */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-base">
                    {badge.title}
                  </h4>
                  {badge.unlocked && (
                    <span className="text-[9px] bg-emerald-500 text-white font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <CheckCircle className="w-2.5 h-2.5" /> Unlocked
                    </span>
                  )}
                </div>
                <p className={`text-xs font-light leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-gray-500'}`}>
                  {badge.description}
                </p>
                {badge.unlocked ? (
                  <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest block font-bold">
                    Momentum Multiplier Active
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block font-semibold">
                    Locked: Sustain progress
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
