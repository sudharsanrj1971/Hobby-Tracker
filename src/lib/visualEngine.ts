
export type HobbyTheme = 'cyber' | 'zen' | 'energy' | 'creative' | 'logic' | 'nature' | 'social' | 'default';

export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  bgGradient: string;
  particles: 'code' | 'nodes' | 'sparkles' | 'notes' | 'pixels' | 'dots';
  animation: 'pulse' | 'float' | 'slide' | 'none';
}

export const THEMES: Record<HobbyTheme, ThemeConfig> = {
  cyber: {
    primary: '#a855f7',
    secondary: '#ec4899',
    accent: '#3b82f6',
    bgGradient: 'from-purple-900/40 via-blue-900/20 to-black',
    particles: 'code',
    animation: 'pulse'
  },
  zen: {
    primary: '#10b981',
    secondary: '#34d399',
    accent: '#6ee7b7',
    bgGradient: 'from-emerald-900/40 via-teal-900/20 to-black',
    particles: 'sparkles',
    animation: 'float'
  },
  energy: {
    primary: '#ef4444',
    secondary: '#f97316',
    accent: '#facc15',
    bgGradient: 'from-orange-900/40 via-red-900/20 to-black',
    particles: 'pixels',
    animation: 'pulse'
  },
  creative: {
    primary: '#ec4899',
    secondary: '#f472b6',
    accent: '#fb7185',
    bgGradient: 'from-pink-900/40 via-rose-900/20 to-black',
    particles: 'notes',
    animation: 'float'
  },
  logic: {
    primary: '#3b82f6',
    secondary: '#60a5fa',
    accent: '#93c5fd',
    bgGradient: 'from-blue-900/40 via-indigo-900/20 to-black',
    particles: 'nodes',
    animation: 'slide'
  },
  nature: {
    primary: '#84cc16',
    secondary: '#4ade80',
    accent: '#2dd4bf',
    bgGradient: 'from-green-900/40 via-lime-900/20 to-black',
    particles: 'sparkles',
    animation: 'float'
  },
  social: {
    primary: '#f59e0b',
    secondary: '#fbbf24',
    accent: '#fde68a',
    bgGradient: 'from-amber-900/40 via-yellow-900/20 to-black',
    particles: 'nodes',
    animation: 'pulse'
  },
  default: {
    primary: '#6366f1',
    secondary: '#818cf8',
    accent: '#a5b4fc',
    bgGradient: 'from-indigo-900/40 via-slate-900/20 to-black',
    particles: 'dots',
    animation: 'none'
  }
};

export const getHobbyTheme = (name: string, category: string): HobbyTheme => {
  const combined = (name + ' ' + category).toLowerCase();
  
  if (combined.match(/code|program|tech|robot|dev|soft|hack|cyber/)) return 'cyber';
  if (combined.match(/read|book|meditat|zen|yoga|calm|quiet|librar/)) return 'zen';
  if (combined.match(/gym|fitness|run|sport|energy|workout|train|lift/)) return 'energy';
  if (combined.match(/art|paint|draw|music|photo|cook|design|creative|craft/)) return 'creative';
  if (combined.match(/chess|logic|math|science|puzzle|think|strateg/)) return 'logic';
  if (combined.match(/travel|map|nature|hike|garden|outdoor|plant/)) return 'nature';
  if (combined.match(/social|communit|talk|language|learn|meet|club/)) return 'social';
  
  return 'default';
};
