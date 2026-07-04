import { Hobby, Achievement, HobbyLog } from './types';

// Default Unsplash URLs representing premium hobby stock images
export const DEFAULT_HOBBY_IMAGES = {
  gardening: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=500&q=80',
  reading: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=500&q=80',
  painting: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=500&q=80',
  cooking: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=500&q=80',
  fitness: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=500&q=80',
  photography: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80'
};

export const INITIAL_HOBBIES: Hobby[] = [
  {
    id: 'gardening',
    name: 'Gardening',
    category: 'Nature',
    emoji: '🌱',
    coverImage: DEFAULT_HOBBY_IMAGES.gardening,
    dailyGoal: 1,
    weeklyGoal: 5,
    streak: 5,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    completedToday: true,
    totalXp: 450,
    description: 'Grow organic tomatoes, spinach, and beautiful red roses in the backyard sanctuary.',
    priority: 'medium',
    themeColor: '#10b981', // green
    reminders: [
      { id: 'rem-g-1', type: 'whatsapp', timing: '5m', time: '08:00', enabled: true },
      { id: 'rem-g-2', type: 'push', timing: '30m', time: '17:30', enabled: true }
    ],
    logs: [
      { id: 'g1', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), duration: 60, notes: 'Watered the vegetable patches and weeded the tomato bed.' }
    ]
  },
  {
    id: 'reading',
    name: 'Reading',
    category: 'Intellectual',
    emoji: '📖',
    coverImage: DEFAULT_HOBBY_IMAGES.reading,
    dailyGoal: 0.5,
    weeklyGoal: 4,
    streak: 12,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    completedToday: true,
    totalXp: 680,
    description: 'Read informative science, history, and productivity books to expand my horizon.',
    priority: 'high',
    themeColor: '#3b82f6', // blue
    reminders: [
      { id: 'rem-r-1', type: 'sms', timing: '10m', time: '21:00', enabled: true }
    ],
    logs: [
      { id: 'r1', timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(), duration: 30, notes: 'Read chapter 4 of Sapiens.' }
    ]
  },
  {
    id: 'painting',
    name: 'Watercolor Painting',
    category: 'Creative',
    emoji: '🎨',
    coverImage: DEFAULT_HOBBY_IMAGES.painting,
    dailyGoal: 1.5,
    weeklyGoal: 8,
    streak: 2,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    completedToday: false,
    totalXp: 120,
    description: 'Master landscape watercolor washes, depth perspective, and dynamic color blending.',
    priority: 'low',
    themeColor: '#a855f7', // purple
    reminders: [
      { id: 'rem-p-1', type: 'push', timing: '15m', time: '14:00', enabled: false }
    ],
    logs: [
      { id: 'p1', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), duration: 90, notes: 'Sketched the mountain landscape layout.' }
    ]
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: '7day',
    title: '7-Day Warrior',
    description: 'Completed 7 consecutive days of tracking!',
    icon: '⚔️',
    unlocked: true,
    unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'master',
    title: 'Hobby Master',
    description: 'Mastered 3 different hobbies!',
    icon: '⚙️',
    unlocked: true,
    unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'king',
    title: 'Consistency King',
    description: 'Maintained streaks for 4 weeks!',
    icon: '👑',
    unlocked: true,
    unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'pillar',
    title: 'Community Pillar',
    description: 'Contribute to the community!',
    icon: '🤝',
    unlocked: false
  },
  {
    id: '100day',
    title: '100-Day Streak',
    description: 'Keep going and sustain momentum!',
    icon: '🏆',
    unlocked: false
  },
  {
    id: 'guru',
    title: 'Insights Guru',
    description: 'Utilized advanced analytics!',
    icon: '📊',
    unlocked: true,
    unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Recharts analytical data
export const WEEKLY_ANALYTICS_DATA = [
  { day: 'Mon', hours: 1.5, target: 1.0 },
  { day: 'Tue', hours: 2.2, target: 1.5 },
  { day: 'Wed', hours: 0.8, target: 1.0 },
  { day: 'Thu', hours: 3.0, target: 2.0 },
  { day: 'Fri', hours: 1.2, target: 1.5 },
  { day: 'Sat', hours: 4.5, target: 3.0 },
  { day: 'Sun', hours: 2.8, target: 2.5 }
];

export const CATEGORY_DISTRIBUTION = [
  { name: 'Nature', value: 450, color: '#a855f7' },
  { name: 'Intellectual', value: 680, color: '#3b82f6' },
  { name: 'Creative', value: 120, color: '#10b981' }
];

export const YEARLY_PROGRESS_DATA = [
  { month: 'Jan', currentYear: 12, lastYear: 10 },
  { month: 'Feb', currentYear: 18, lastYear: 15 },
  { month: 'Mar', currentYear: 26, lastYear: 20 },
  { month: 'Apr', currentYear: 40, lastYear: 32 },
  { month: 'May', currentYear: 58, lastYear: 42 },
  { month: 'Jun', currentYear: 78, lastYear: 50 },
  { month: 'Jul', currentYear: 85, lastYear: 55 },
  { month: 'Aug', currentYear: null, lastYear: 62 },
  { month: 'Sep', currentYear: null, lastYear: 70 },
  { month: 'Oct', currentYear: null, lastYear: 75 },
  { month: 'Nov', currentYear: null, lastYear: 82 },
  { month: 'Dec', currentYear: null, lastYear: 90 }
];

// Helper to generate contributions grid (30 weeks of squares with levels 0-4)
export function generateHeatmapData() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const data = [];
  
  // Create a 7 x 30 grid of daily activity values
  for (let row = 0; row < 7; row++) {
    const rowCells = [];
    for (let col = 0; col < 30; col++) {
      // Simulate higher activity on weekends and some streaks
      let val = 0;
      if (Math.random() > 0.3) {
        val = Math.floor(Math.random() * 4) + 1; // 1 to 4
      }
      rowCells.push({
        id: `cell-${row}-${col}`,
        level: val, // 0 = empty, 1-4 = light to dark purple
      });
    }
    data.push({
      day: days[row],
      cells: rowCells
    });
  }
  return data;
}
