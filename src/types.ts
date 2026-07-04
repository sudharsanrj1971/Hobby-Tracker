export interface HobbyLog {
  id: string;
  timestamp: string; // ISO string
  duration: number; // in minutes
  notes: string;
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
