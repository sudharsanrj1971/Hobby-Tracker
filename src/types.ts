export interface HobbyLog {
  id: string;
  timestamp: string; // ISO string
  duration: number; // in minutes
  notes: string;
  flowState?: boolean; // Did they achieve deep focus/flow?
  energyDelta?: number; // -2 to +2 (Drained vs Energized)
}

export interface ReminderSetting {
  id: string;
  type: 'push' | 'sms' | 'whatsapp' | 'email';
  timing: '5m' | '10m' | '15m' | '30m' | '1h' | 'custom';
  time: string; // "09:30"
  enabled: boolean;
}

export interface Hobby {
  id: string;
  name: string;
  category: string;
  emoji: string;
  coverImage: string;
  dailyGoal: number; // in hours
  weeklyGoal: number; // in hours
  streak: number;
  createdAt: string;
  completedToday: boolean;
  logs: HobbyLog[];
  totalXp: number;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  themeColor?: string; // hex color or tailwind color name
  reminders?: ReminderSetting[];
  archived?: boolean;
}


export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // icon name from lucide or emoji
  unlocked: boolean;
  unlockedAt?: string;
  progressMax?: number;
  progressCurrent?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

export interface PrivacySettings {
  emailPreferences: boolean;
  passwordSecurity: boolean;
  whatsappNotifications: boolean;
  hobbyAiAssistant: boolean;
  autoCategorization: boolean;
  insightsEngine: boolean;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
}

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  dateOfBirth?: string;
  location?: string;
  occupation?: string;
  country?: string;
  language?: string;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  socialLinks: SocialLinks;
  xp: number;
  level: number;
  achievementsCount: number;
  currentTheme: 'light' | 'dark' | 'system';
  notificationPreferences: {
    push: boolean;
    sms: boolean;
    whatsapp: boolean;
    email: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
