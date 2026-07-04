import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface SplashProps {
  onComplete: () => void;
}

export default function SplashView({ onComplete }: SplashProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500); // Small buffer before fading out
          return 100;
        }
        return prev + 4;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#fafafa] flex flex-col items-center justify-center overflow-hidden z-50">
      {/* Background Soft Purple Radial Aura */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-purple-300/35 blur-[120px] -z-10 animate-pulse duration-4000" />
      
      <div className="text-center px-4 max-w-md">
        {/* Animated Brand Name */}
        <motion.h1 
          className="text-6xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 bg-clip-text text-transparent font-display mb-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          Hobby Tracker
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p 
          className="text-gray-600 text-lg md:text-xl font-light mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Turn Your Passions Into Lifelong Habits
        </motion.p>

        {/* Loading progress bar wrapper */}
        <div className="w-64 h-4 bg-white/65 border border-purple-100 rounded-full p-0.5 shadow-sm mx-auto overflow-hidden">
          {/* Active progress fills inside */}
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Understated current status text */}
        <div className="mt-3 font-mono text-[10px] text-purple-400 tracking-widest uppercase">
          Initializing Engine... {progress}%
        </div>
      </div>
    </div>
  );
}
