
import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { THEMES, HobbyTheme } from '../lib/visualEngine';

interface HobbyEnvironmentProps {
  themeType: HobbyTheme;
  isDarkMode: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

const HobbyEnvironment: React.FC<HobbyEnvironmentProps> = ({ 
  themeType, 
  isDarkMode, 
  intensity = 'medium' 
}) => {
  const theme = THEMES[themeType] || THEMES.default;
  
  const particleCount = useMemo(() => {
    switch(intensity) {
      case 'low': return 8;
      case 'medium': return 16;
      case 'high': return 30;
      default: return 12;
    }
  }, [intensity]);

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 5 + 3,
      delay: Math.random() * 5,
    }));
  }, [particleCount]);

  const renderParticle = (p: any) => {
    switch(theme.particles) {
      case 'code':
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: '100%' }}
            animate={{ 
              opacity: [0, 0.4, 0],
              y: '-10%',
              x: `${p.x + (Math.random() * 10 - 5)}%`
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear"
            }}
            className="absolute text-[8px] font-mono select-none"
            style={{ color: theme.primary, left: `${p.x}%` }}
          >
            {Math.random() > 0.5 ? '01' : '10'}
          </motion.div>
        );
      case 'notes':
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.3, 0],
              scale: [0.5, 1.2, 0.5],
              y: '-20%'
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
            }}
            className="absolute text-lg select-none"
            style={{ color: theme.secondary, left: `${p.x}%`, top: `${p.y}%` }}
          >
            {['♪', '♫', '♬', '♩'][Math.floor(Math.random() * 4)]}
          </motion.div>
        );
      default:
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.5, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
            }}
            className="absolute rounded-full"
            style={{ 
              width: p.size, 
              height: p.size, 
              backgroundColor: theme.primary,
              left: `${p.x}%`, 
              top: `${p.y}%`,
              boxShadow: `0 0 10px ${theme.primary}`
            }}
          />
        );
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit] transition-all duration-700 bg-gradient-to-br ${isDarkMode ? theme.bgGradient : 'from-white/10 to-transparent'}`}>
      <div className="absolute inset-0 opacity-40">
        {particles.map(renderParticle)}
      </div>
      
      {/* Decorative Grid for Cyber Theme */}
      {themeType === 'cyber' && isDarkMode && (
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: `linear-gradient(${theme.primary} 1px, transparent 1px), linear-gradient(90deg, ${theme.primary} 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      )}
      
      {/* Soft Glows */}
      <div 
        className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full blur-[100px] opacity-20"
        style={{ backgroundColor: theme.primary }}
      />
      <div 
        className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 rounded-full blur-[100px] opacity-10"
        style={{ backgroundColor: theme.secondary }}
      />
    </div>
  );
};

export default HobbyEnvironment;
