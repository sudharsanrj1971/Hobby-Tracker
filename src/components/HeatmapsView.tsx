import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Sparkles, Calendar, Plus, Clock, MessageSquare, Flame, TrendingUp } from 'lucide-react';
import { Hobby } from '../types';
import { generateHeatmapData } from '../data';

interface HeatmapsViewProps {
  hobbies: Hobby[];
  isDarkMode?: boolean;
}

export default function HeatmapsView({ hobbies, isDarkMode = false }: HeatmapsViewProps) {
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState('Analyzing consistency patterns...');
  const [aiRecs, setAiRecs] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    setHeatmap(generateHeatmapData());
    fetchAiInsights();
  }, [hobbies]);

  const fetchAiInsights = async () => {
    try {
      setLoadingInsights(true);
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hobbies })
      });
      const data = await res.json();
      if (data.insights) {
        setAiInsight(data.insights);
        setAiRecs(data.recommendations || []);
      }
    } catch (e) {
      console.error(e);
      setAiInsight("Your commitment consistency index has improved by 15% this month! You are doing an outstanding job maintaining your Reading habit for a solid 12-day streak. Keep it up!");
      setAiRecs([
        "Increase focus time in mornings to maximize peak mental energy.",
        "Optimize evening routine by keeping books near your bed.",
        "Allocate a 10-minute creative slot for Painting to maintain weekly balance."
      ]);
    } finally {
      setLoadingInsights(false);
    }
  };

  // Compile logs across all hobbies for the timeline list
  const allLogs = hobbies.flatMap((hobby) => 
    hobby.logs.map((log) => ({
      ...log,
      hobbyName: hobby.name,
      hobbyEmoji: hobby.emoji
    }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Static chart data matching mockup curve
  const monthlyData = [
    { month: 'Jan', rate: 32 },
    { month: 'Feb', rate: 45 },
    { month: 'Mar', rate: 72 },
    { month: 'Apr', rate: 60 },
    { month: 'May', rate: 85 },
    { month: 'Jun', rate: 110 },
  ];

  const handleCellClick = (rowIndex: number, cellIndex: number) => {
    setHeatmap((prev) => {
      const updated = [...prev];
      const level = updated[rowIndex].cells[cellIndex].level;
      // Cycle through levels 0 -> 4
      updated[rowIndex].cells[cellIndex].level = (level + 1) % 5;
      return updated;
    });
  };

  return (
    <div className={`space-y-8 max-w-5xl mx-auto py-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* Visual Header Banner */}
      <div className="relative rounded-3xl overflow-hidden p-8 flex flex-col justify-center min-h-48 border border-white/10 bg-slate-900 text-white shadow-md">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950 via-slate-950 to-indigo-950" />
        
        <div className="relative space-y-2 max-w-xl z-10 text-center md:text-left">
          <motion.h1 
            className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Hobby Mastery & Heatmaps
          </motion.h1>
          <p className="text-purple-200 text-sm md:text-base font-light">
            Track your progress and see your dedication grow through consistent logs.
          </p>
        </div>
      </div>

      {/* Contribution Heatmap Card & analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Contribution Heatmap (Glass Card) - takes 8 columns */}
        <div className={`lg:col-span-8 rounded-3xl p-6 border space-y-4 ${
          isDarkMode ? 'glass-panel-dark border-purple-900/40' : 'glass-panel border-white/60'
        }`}>
          <div className="flex items-center justify-between border-b border-purple-50/10 pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-display font-bold">
                Contribution Heatmap
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-xs bg-purple-950/40" />
              <div className="w-2.5 h-2.5 rounded-xs bg-purple-500/40" />
              <div className="w-2.5 h-2.5 rounded-xs bg-purple-500" />
              <div className="w-2.5 h-2.5 rounded-xs bg-purple-700" />
              <span>More</span>
            </div>
          </div>

          {/* Heatmap Grid Wrapper */}
          <div className="overflow-x-auto pb-2 scrollbar-thin">
            <div className="min-w-[620px] flex flex-col gap-1 select-none">
              {/* Months Labels row */}
              <div className="flex pl-10 text-[9px] font-mono text-gray-400 tracking-wider">
                <div className="w-20">Feb</div>
                <div className="w-20">Mar</div>
                <div className="w-20">Apr</div>
                <div className="w-20">May</div>
                <div className="w-20">Jun</div>
                <div className="w-20">Jul</div>
              </div>

              {/* Day rows */}
              {heatmap.map((rowItem, rIdx) => (
                <div key={rowItem.day} className="flex items-center gap-2">
                  <div className="w-8 text-[9px] font-mono text-gray-400 font-semibold text-right pr-1.5">
                    {rowItem.day}
                  </div>
                  <div className="flex gap-1 flex-1">
                    {rowItem.cells.map((cell: any, cIdx: number) => {
                      // Level styles
                      const levelColors = [
                        isDarkMode ? 'bg-purple-950/10 hover:bg-purple-950/40 border border-purple-900/10' : 'bg-purple-100/35 hover:bg-purple-100 border border-purple-50/10', // level 0
                        'bg-purple-400/20 border border-purple-500/20',                       // level 1
                        'bg-purple-400/50 border border-purple-500/30',                       // level 2
                        'bg-purple-500 border border-purple-500',                       // level 3
                        'bg-purple-700 border border-purple-700',                       // level 4
                      ];
                      return (
                        <div
                          key={cell.id}
                          onClick={() => handleCellClick(rIdx, cIdx)}
                          title={`Level ${cell.level} on ${rowItem.day}`}
                          className={`w-3.5 h-3.5 rounded-xs cursor-pointer transition-transform hover:scale-125 duration-100 ${levelColors[cell.level]}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-gray-400 italic text-center">
            💡 Tap any cell above to simulate/log daily activities directly!
          </p>
        </div>

        {/* Weekly Analytics Widget (takes 4 cols) */}
        <div className={`lg:col-span-4 rounded-3xl p-6 border flex flex-col justify-between ${
          isDarkMode ? 'glass-panel-dark border-purple-900/40' : 'glass-panel border-white/60'
        }`}>
          <div>
            <h3 className="text-base font-display font-bold border-b border-purple-50/10 pb-2 mb-4">
              Weekly Overview
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Weekly Commitment Progress</span>
                  <span className="font-semibold">70%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
                  <div className="h-full bg-purple-500 rounded-full w-[70%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Category Synergy Rate</span>
                  <span className="font-semibold">45%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
                  <div className="h-full bg-indigo-500 rounded-full w-[45%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-6 mt-4 border-t border-purple-50/10">
            <div>
              <div className="text-lg font-bold text-purple-400">12</div>
              <div className="text-[9px] font-mono text-gray-400 uppercase">Streak</div>
            </div>
            <div>
              <div className="text-lg font-bold text-indigo-400">120 XP</div>
              <div className="text-[9px] font-mono text-gray-400 uppercase">Today</div>
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-400">3</div>
              <div className="text-[9px] font-mono text-gray-400 uppercase">Hobbies</div>
            </div>
          </div>
        </div>

      </div>

      {/* Recharts area chart and dynamic timelines */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* History Timeline */}
        <div className={`md:col-span-5 rounded-3xl p-6 border space-y-4 ${
          isDarkMode ? 'glass-panel-dark border-purple-900/40' : 'glass-panel border-white/60'
        }`}>
          <h3 className="text-base font-display font-bold border-b border-purple-50/10 pb-2">
            History Timeline Logs
          </h3>
          
          <div className="space-y-5 max-h-64 overflow-y-auto pr-1">
            {allLogs.length > 0 ? (
              allLogs.map((log) => (
                <div key={log.id} className="flex gap-3 relative items-start">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg shadow-xs shrink-0">
                    {log.hobbyEmoji}
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-semibold">
                      {log.hobbyName} logged: <span className="text-purple-400 font-bold">{log.duration}m</span>
                    </h5>
                    <p className="text-[11px] text-gray-400 italic">"{log.notes || 'No notes added.'}"</p>
                    <span className="text-[9px] font-mono text-gray-400 block pt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-xs text-gray-400 py-8">
                No recent activity logs found.
              </div>
            )}
          </div>
        </div>

        {/* Spline Area Chart widget (6 columns) */}
        <div className={`md:col-span-7 rounded-3xl p-6 border flex flex-col justify-between ${
          isDarkMode ? 'glass-panel-dark border-purple-900/40' : 'glass-panel border-white/60'
        }`}>
          <h3 className="text-base font-display font-bold border-b border-purple-50/10 pb-2 mb-4">
            Monthly Overview
          </h3>
          
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} />
                <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ 
                  background: isDarkMode ? '#130f24' : 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '12px', 
                  border: isDarkMode ? '1px solid #c084fc' : '1px solid #f3e8ff',
                  color: isDarkMode ? '#f8fafc' : '#0f172a'
                }} />
                <Area type="monotone" dataKey="rate" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#areaColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* AI Insights Panel (glowing borders) */}
      <div className={`rounded-3xl p-6 border-2 bg-gradient-to-r shadow-md relative overflow-hidden ${
        isDarkMode 
          ? 'border-purple-500/30 from-purple-950/20 via-indigo-950/10 to-transparent' 
          : 'border-purple-200/55 from-purple-50/20 via-indigo-50/10 to-transparent'
      }`}>
        <div className="absolute top-0 right-0 p-3">
          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-display font-bold">AI Insights & Productivity Coach</h4>
          </div>

          <div className="text-xs text-gray-400 leading-relaxed space-y-3">
            {loadingInsights ? (
              <div className="flex items-center gap-2 text-purple-400 font-mono py-2">
                <span className="animate-spin text-sm">⌛</span> Generating personalized routine analysis...
              </div>
            ) : (
              <>
                <p className="font-medium text-purple-300 italic">"{aiInsight}"</p>
                {aiRecs.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-mono tracking-wider uppercase text-purple-400 font-bold block mb-2">Custom Productivity Recommendations:</span>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {aiRecs.map((rec, i) => (
                        <li key={i} className={`p-3 rounded-2xl border flex gap-2 items-start text-[11px] ${
                          isDarkMode ? 'bg-slate-950/65 border-purple-900/30' : 'bg-white/60 border-purple-100/50'
                        }`}>
                          <span className="text-purple-400 font-bold font-mono">0{i+1}.</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
