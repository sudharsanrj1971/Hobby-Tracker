import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, List, Search, Plus, Trash2, Edit2, Dices, X } from 'lucide-react';
import { Hobby } from '../types';
import HobbyCreationView from './HobbyCreationView';

interface MyHobbiesViewProps {
  hobbies: Hobby[];
  isDarkMode: boolean;
  onCreateHobby: (hobbyData: any) => void;
  onDeleteHobby: (id: string) => void;
}

export default function MyHobbiesView({ hobbies, isDarkMode, onCreateHobby, onDeleteHobby }: MyHobbiesViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [rouletteResult, setRouletteResult] = useState<Hobby | null>(null);

  if (isCreating) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setIsCreating(false)}
          className="text-sm text-purple-500 hover:text-purple-600 font-semibold"
        >
          ← Back to My Hobbies
        </button>
        <HobbyCreationView onCreateHobby={(h) => { onCreateHobby(h); setIsCreating(false); }} isDarkMode={isDarkMode} />
      </div>
    );
  }

  const filteredHobbies = hobbies.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleRoulette = () => {
    const uncompletedHobbies = hobbies.filter(h => !h.completedToday && !h.archived);
    if (uncompletedHobbies.length === 0) {
      alert("You've completed all your active hobbies for today! 🎉");
      return;
    }
    const randomIndex = Math.floor(Math.random() * uncompletedHobbies.length);
    setRouletteResult(uncompletedHobbies[randomIndex]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold">My Hobbies</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage and organize your activities</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRoulette}
            className="py-2 px-4 rounded-xl font-bold text-sm bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-colors flex items-center gap-2"
          >
            <Dices className="w-4 h-4" />
            Roulette
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="py-2 px-4 rounded-xl font-bold text-sm bg-purple-600 text-white shadow-lg shadow-purple-500/30 hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Hobby
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search hobbies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
              isDarkMode 
                ? 'bg-[#120e24] border-purple-900/60 text-white placeholder-gray-500' 
                : 'bg-white border-purple-100 text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>
        <div className={`flex items-center p-1 rounded-lg border ${
          isDarkMode ? 'bg-[#120e24] border-purple-900/60' : 'bg-white border-purple-100'
        }`}>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-purple-500/20 text-purple-500' : 'text-gray-400 hover:text-purple-400'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-purple-500/20 text-purple-500' : 'text-gray-400 hover:text-purple-400'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
        {filteredHobbies.map(hobby => (
          <motion.div
            key={hobby.id}
            layout
            className={`p-5 rounded-2xl border ${
              isDarkMode ? 'bg-[#120e24] border-purple-900/40 text-slate-100' : 'bg-white border-purple-100 text-slate-900'
            } flex ${viewMode === 'list' ? 'items-center justify-between' : 'flex-col justify-between h-40'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-xl shadow-inner">
                {hobby.emoji}
              </div>
              <div>
                <h3 className="font-bold">{hobby.name}</h3>
                <p className="text-xs text-gray-500 capitalize">{hobby.category}</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 ${viewMode === 'list' ? '' : 'mt-4 pt-4 border-t border-purple-500/10 justify-end'}`}>
              <button 
                onClick={() => onDeleteHobby(hobby.id)}
                className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                title="Delete Hobby"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
        {filteredHobbies.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No hobbies found. Try adding one!
          </div>
        )}
      </div>

      {/* Roulette Result Modal */}
      <AnimatePresence>
        {rouletteResult && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
              className={`w-full max-w-sm rounded-3xl p-8 shadow-2xl border text-center ${
                isDarkMode ? 'bg-[#110e20] border-purple-900/60 text-slate-100' : 'bg-white border-purple-100 text-gray-800'
              }`}
            >
              <div className="flex justify-end">
                <button 
                  onClick={() => setRouletteResult(null)}
                  className="p-1 rounded-full bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="w-24 h-24 mx-auto bg-purple-500/10 rounded-full flex items-center justify-center text-5xl mb-4 border-4 border-purple-500/20">
                {rouletteResult.emoji}
              </div>
              <h3 className="text-sm font-mono tracking-widest uppercase text-purple-400 mb-1">
                You should do:
              </h3>
              <h2 className="text-3xl font-display font-bold mb-2">
                {rouletteResult.name}
              </h2>
              <p className="text-sm text-gray-400 mb-6 italic">
                "{rouletteResult.description || 'Time to get to work!'}"
              </p>
              <button
                onClick={() => setRouletteResult(null)}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/30"
              >
                Let's Go!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
