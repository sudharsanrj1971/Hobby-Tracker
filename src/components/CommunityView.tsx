import React from 'react';
import { Users, Globe } from 'lucide-react';

export default function CommunityView({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold">Community</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Connect with other hobbyists</p>
        </div>
      </div>

      <div className={`rounded-3xl p-8 text-center border ${
        isDarkMode ? 'bg-[#120e24] border-purple-900/40 text-slate-100' : 'bg-white border-purple-100 text-slate-900'
      }`}>
        <Globe className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-bold mb-2">Community Features</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Share your streaks, compete in leaderboards, and find friends. This section is currently in development.
        </p>
      </div>
    </div>
  );
}
