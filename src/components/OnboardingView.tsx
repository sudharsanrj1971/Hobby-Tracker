import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, Sparkles, BookOpen, PenTool, Flame, Calendar } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

interface Slide {
  title: string;
  description: string;
  accentText: string;
  graphic: React.ReactNode;
}

export default function OnboardingView({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      title: 'Track Your Hobbies',
      description: 'Monitor your progress, set goals, and discover new passions with ease.',
      accentText: 'Aesthetic consistency tracking',
      graphic: (
        <div className="relative w-full h-44 bg-purple-50/50 rounded-xl flex items-center justify-center p-4 overflow-hidden border border-purple-100/40">
          <div className="absolute inset-0 bg-radial-gradient from-purple-100/30 via-transparent to-transparent opacity-60" />
          {/* Custom simulated cute vectors */}
          <div className="flex gap-4 items-end justify-center relative">
            <motion.div 
              className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm flex flex-col items-center"
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              <div className="text-3xl mb-1">🎨</div>
              <span className="text-[10px] text-gray-500 font-medium">Painting</span>
            </motion.div>
            
            <motion.div 
              className="bg-white p-4 rounded-xl border border-purple-200 shadow-md flex flex-col items-center z-10 scale-110"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut', delay: 0.2 }}
            >
              <div className="text-4xl mb-1">🌱</div>
              <span className="text-xs text-purple-600 font-bold">Gardening</span>
            </motion.div>
            
            <motion.div 
              className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm flex flex-col items-center"
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', delay: 0.5 }}
            >
              <div className="text-3xl mb-1">📖</div>
              <span className="text-[10px] text-gray-500 font-medium">Reading</span>
            </motion.div>
          </div>
        </div>
      )
    },
    {
      title: 'Form Lifelong Habits',
      description: 'Build robust daily streaks, complete goals, and track your metrics over time.',
      accentText: 'Track streaks and build momentum',
      graphic: (
        <div className="relative w-full h-44 bg-indigo-50/50 rounded-xl flex items-center justify-center p-4 overflow-hidden border border-indigo-100/40">
          <div className="flex flex-col items-center justify-center">
            <motion.div 
              className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-2xl shadow-md font-bold mb-3"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Flame className="w-5 h-5 fill-current" />
              <span>12 Day Streak!</span>
            </motion.div>
            <div className="flex gap-1.5 mt-2">
              {[1, 2, 3, 4, 5, 6, 7].map((day, i) => (
                <div 
                  key={day} 
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold ${
                    i < 5 ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-400'
                  }`}
                >
                  {day === 6 ? 'S' : day === 7 ? 'S' : 'M'}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Habit Coach Chatbot',
      description: 'Your intelligent personalized guide to help you stay motivated.',
      accentText: 'Tailored AI Productivity Insights',
      graphic: (
        <div className="relative w-full h-44 bg-purple-50/50 rounded-xl flex items-center justify-center p-4 overflow-hidden border border-purple-100/40">
          <div className="w-full max-w-xs flex flex-col gap-2 font-sans">
            <div className="bg-purple-100/80 p-2.5 rounded-xl rounded-tl-none border border-purple-200/50 text-[11px] text-purple-900 leading-relaxed max-w-[85%]">
              ✨ Great job! You have maintained your reading habit for 5 days. Keep going!
            </div>
            <div className="bg-white p-2.5 rounded-xl rounded-tr-none border border-purple-100 text-[11px] text-gray-700 max-w-[80%] self-end shadow-xs">
              Thanks Coach! Feeling highly consistent today.
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen ambient-bg flex flex-col relative py-6 px-4">
      {/* Background Soft Purple Aura */}
      <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-purple-200/45 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-20 left-10 w-[350px] h-[350px] bg-indigo-200/40 rounded-full blur-[90px] -z-10" />

      {/* Top Header Bar (Glassmorphic) */}
      <header className="w-full max-w-5xl mx-auto glass-panel rounded-full py-3.5 px-6 flex items-center justify-between shadow-xs mb-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-xs">
            H
          </div>
          <span className="font-display font-semibold text-lg text-gray-800 tracking-tight">Hobby Tracker</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-500 hover:text-purple-600 transition-colors rounded-full hover:bg-white/55">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-purple-600 transition-colors rounded-full hover:bg-white/55">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Carousel Main Workspace Card */}
      <main className="flex-1 flex items-center justify-center max-w-md mx-auto w-full">
        <div className="glass-panel w-full rounded-3xl p-6 shadow-md border border-white/60 flex flex-col justify-between min-h-[460px] relative">
          
          {/* Active slide content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              {/* Graphic Viewport */}
              <div className="mb-6">
                {slides[currentSlide].graphic}
              </div>

              {/* Subtitle Accent */}
              <span className="text-purple-600 font-mono text-[10px] tracking-widest uppercase font-semibold mb-2 block text-center">
                {slides[currentSlide].accentText}
              </span>

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-800 text-center mb-3">
                {slides[currentSlide].title}
              </h2>

              {/* Description */}
              <p className="text-gray-500 text-sm text-center leading-relaxed px-2 mb-8">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Bottom interactive row */}
          <div className="space-y-6">
            {/* Get Started / Next CTA button */}
            <button
              onClick={() => {
                if (currentSlide < slides.length - 1) {
                  setCurrentSlide(currentSlide + 1);
                } else {
                  onComplete();
                }
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-indigo-600 text-white font-medium text-center shadow-md shadow-purple-500/10 hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.98] transition-all cursor-pointer font-display"
            >
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next Screen'}
            </button>

            {/* Slider Dots */}
            <div className="flex items-center justify-center gap-1.5 pb-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`transition-all duration-300 cursor-pointer ${
                    currentSlide === index 
                      ? 'w-7 h-2 rounded-full bg-purple-600' 
                      : 'w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Understated footer text */}
      <footer className="text-center text-[10px] text-gray-400 tracking-wide mt-10">
        © 2026 Hobby Tracker. All rights reserved.
      </footer>
    </div>
  );
}
