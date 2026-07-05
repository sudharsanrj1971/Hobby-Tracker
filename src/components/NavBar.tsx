import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Plus, Calendar, BarChart2, MessageSquare, Award, Settings, Bell, User, LogOut, Sun, Moon, Menu, X, Users, BellRing } from 'lucide-react';
import { Hobby, Achievement, ChatMessage, PrivacySettings, UserProfile } from '../types';
import { AppTab } from '../App';

interface NavBarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  isDarkMode: boolean;
  handleToggleTheme: () => void;
  showProfileMenu: boolean;
  setShowProfileMenu: (show: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (show: boolean) => void;
  userName: string;
  handleLogout: () => void;
  onStartTour?: () => void;
  userProfile?: UserProfile | null;
}

export default function NavBar({
  activeTab, setActiveTab, isDarkMode, handleToggleTheme,
  showProfileMenu, setShowProfileMenu, isMobileMenuOpen, setIsMobileMenuOpen,
  userName, handleLogout, onStartTour, userProfile
}: NavBarProps) {
  return (
    <nav className="sticky top-4 z-40 w-full max-w-5xl mx-auto px-4">
      <div className={`rounded-2xl py-3 px-5 flex items-center justify-between shadow-md border ${
        isDarkMode ? 'border-purple-900/40 bg-[#1a1438]' : 'border-gray-200 bg-white'
      }`}>
        
        {/* Logo element */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <span className={`font-display font-bold text-base tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Hobby Tracker</span>
        </div>

        {/* Desktop Navigation Link Tabs */}
        <div className="hidden lg:flex flex-1 justify-center items-center gap-1 mx-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'hobbies', label: 'My Hobbies', icon: Plus },
            { id: 'analytics', label: 'Analytics', icon: BarChart2 },
            { id: 'coach', label: 'AI Coach', icon: MessageSquare },
            { id: 'achievements', label: 'Achievements', icon: Award },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'reminders', label: 'Reminders', icon: BellRing },
            { id: 'community', label: 'Community', icon: Users },
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AppTab)}
                className={`tour-nav-${tab.id} py-1.5 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-purple-600 text-white shadow-xs' 
                    : isDarkMode 
                      ? 'text-slate-400 hover:text-purple-400 hover:bg-purple-950/40' 
                      : 'text-gray-500 hover:text-purple-600 hover:bg-white/40'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Header Side elements */}
        <div className="flex items-center gap-2.5 relative">
          
          {/* Take Tour */}
          {onStartTour && (
            <button 
              onClick={onStartTour}
              className={`hidden md:block py-1.5 px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'border-purple-500/30 text-purple-400 hover:bg-purple-900/30' 
                  : 'border-purple-200 text-purple-600 hover:bg-purple-50'
              }`}
            >
              Take Tour
            </button>
          )}

          {/* Quick theme toggler */}
          <button 
            onClick={handleToggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              isDarkMode ? 'text-amber-400 hover:bg-purple-950/60' : 'text-gray-500 hover:text-purple-600 hover:bg-white/55'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notification bell trigger */}
          <button className={`p-2 rounded-full transition-all cursor-pointer hidden sm:flex ${
            isDarkMode ? 'text-slate-400 hover:bg-purple-950/60' : 'text-gray-500 hover:text-purple-600 hover:bg-white/55'
          }`}>
            <Bell className="w-4 h-4" />
          </button>

          {/* Profile trigger */}
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-8 h-8 rounded-full border border-purple-200/50 flex items-center justify-center text-purple-700 font-semibold text-xs shadow-xs hover:border-purple-300 transition-all cursor-pointer overflow-hidden"
          >
            {userProfile?.profileImage ? (
              <img src={userProfile.profileImage} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-purple-100 to-indigo-50 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            )}
          </button>

          {/* Mobile Hamburger menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 rounded-full transition-all cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:bg-purple-950/60' : 'text-gray-500 hover:text-purple-600 hover:bg-white/55'
            }`}
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Profile Dropdown menu */}
          <AnimatePresence>
            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className={`absolute right-0 top-11 rounded-2xl p-2.5 w-48 shadow-xl border z-50 space-y-1 ${
                    isDarkMode 
                      ? 'bg-[#120e24] border-purple-900/60 text-slate-100' 
                      : 'bg-white/95 backdrop-blur-md border-purple-100/50'
                  }`}
                >
                  <div className="px-3.5 py-2 border-b border-purple-50/10">
                    <div className="font-semibold text-xs font-display capitalize truncate">{userProfile?.displayName || userName}</div>
                    <div className="text-[9px] text-gray-400 font-mono tracking-wide mt-0.5 truncate">{userProfile?.email || userName}</div>
                  </div>

                  <button 
                    onClick={() => {
                      setActiveTab('profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left py-2 px-3 hover:bg-purple-500/10 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    My Profile
                  </button>
                  
                  <button 
                    onClick={() => {
                      setActiveTab('settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left py-2 px-3 hover:bg-purple-500/10 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-gray-400" />
                    Settings Configuration
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="w-full text-left py-2 px-3 hover:bg-rose-500/10 rounded-xl text-xs font-semibold text-rose-500 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    Logout Session
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Mobile Navigation Drawer Backdrop & Sheet */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
                />
                
                <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className={`fixed right-0 top-0 bottom-0 w-80 max-w-[90vw] h-full shadow-2xl z-50 p-6 flex flex-col justify-between lg:hidden border-l ${
                    isDarkMode 
                      ? 'bg-[#0f0c1c] border-purple-900/60 text-slate-100' 
                      : 'bg-white border-purple-100 text-slate-900'
                  }`}
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-purple-500/10">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-lg tracking-tight">Hobby Pages</span>
                      </div>
                      <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-1.5 rounded-full hover:bg-purple-500/10 text-gray-400 hover:text-purple-400 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="px-3.5 py-3 bg-purple-500/5 rounded-xl border border-purple-500/10 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 text-sm font-semibold capitalize overflow-hidden">
                        {userProfile?.profileImage ? (
                          <img src={userProfile.profileImage} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          userName.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold font-display capitalize">Hello, {userProfile?.displayName || userName}!</div>
                        <div className="text-[9px] text-gray-400 font-mono">Level {userProfile?.level || 1} Account</div>
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-[55vh] overflow-y-auto pr-1">
                      {[
                        { id: 'profile', label: 'My Profile', icon: User, desc: 'Manage your identity and stats' },
                        { id: 'achievements', label: 'Achievements', icon: Award, desc: 'Earn badges and level up' },
                        { id: 'calendar', label: 'Calendar', icon: Calendar, desc: 'High-density activity calendars' },
                        { id: 'reminders', label: 'Reminders', icon: BellRing, desc: 'SMS, WhatsApp, Push settings' },
                        { id: 'community', label: 'Community', icon: Users, desc: 'Shared challenges and leaderboards' },
                        { id: 'settings', label: 'Settings', icon: Settings, desc: 'Configure privacy and alerts' },
                      ].map((tab) => {
                        const TabIcon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id as AppTab);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full text-left p-3 rounded-xl flex items-start gap-3.5 transition-all cursor-pointer ${
                              isActive 
                                ? 'bg-purple-600 text-white shadow-xs' 
                                : isDarkMode 
                                  ? 'text-slate-300 hover:text-purple-400 hover:bg-purple-950/40' 
                                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50/50'
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isActive ? 'bg-white/20' : 'bg-purple-500/10 text-purple-400'}`}>
                              <TabIcon className="w-4 h-4" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="text-xs font-bold">{tab.label}</div>
                              <p className={`text-[10px] leading-snug ${isActive ? 'text-purple-100' : 'text-gray-400'}`}>{tab.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-4 border-t border-purple-500/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-mono">Theme Preferences</span>
                      <button 
                        onClick={handleToggleTheme}
                        className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                          isDarkMode 
                            ? 'border-purple-900/60 bg-purple-950/40 text-amber-400' 
                            : 'border-purple-100 bg-purple-50/30 text-purple-600'
                        }`}
                      >
                        {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                        <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl text-center font-bold text-xs bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out Account
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
