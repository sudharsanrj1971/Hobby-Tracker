import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Award, Shield, Camera, Edit2, Check, X, Github, Linkedin, 
  Twitter, Instagram, Globe, Mail, Phone, Calendar, MapPin, 
  Languages, Loader2, Trash2, RotateCcw, Image as ImageIcon,
  Save, AlertCircle, Sparkles, ChevronRight, Share2, Facebook, Settings, Bell,
  Briefcase, Target
} from 'lucide-react';
import { UserProfile, SocialLinks } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface ProfileViewProps {
  userProfile: UserProfile | null;
  isDarkMode: boolean;
}

export default function ProfileView({ userProfile, isDarkMode }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'personal' | 'social' | 'preferences'>('personal');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<UserProfile>>(userProfile || {});
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(userProfile?.socialLinks || {});

  // Sync form data when profile arrives
  useEffect(() => {
    if (userProfile) {
      setFormData(userProfile);
      setSocialLinks(userProfile.socialLinks || {});
    }
  }, [userProfile]);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!userProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        <p className="text-sm font-mono text-purple-400 animate-pulse uppercase tracking-widest">Loading Profile Data...</p>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocialLinks(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      notificationPreferences: {
        ...(prev.notificationPreferences || { push: true, sms: true, whatsapp: true, email: true }),
        [name]: value
      }
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.displayName || formData.displayName.length < 3) {
      newErrors.displayName = 'Display Name must be at least 3 characters';
    }
    if (formData.bio && formData.bio.length > 250) {
      newErrors.bio = 'Bio must be less than 250 characters';
    }
    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', userProfile.uid);
      const updateData = {
        ...formData,
        socialLinks,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(userRef, updateData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (type: 'profile' | 'cover', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate upload and conversion to base64 for demo
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'profile') {
        setFormData(prev => ({ ...prev, profileImage: base64 }));
      } else {
        setFormData(prev => ({ ...prev, coverImage: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetAvatar = () => {
    setFormData(prev => ({ ...prev, profileImage: '' }));
  };

  const calculateCompleteness = () => {
    const fields = [
      'displayName', 'username', 'bio', 'profileImage', 'coverImage', 
      'dateOfBirth', 'location', 'occupation', 'country', 'language', 'gender'
    ];
    let filledCount = fields.filter(field => !!(formData[field as keyof UserProfile])).length;
    
    // Social links check
    if (Object.values(socialLinks).some(link => !!link)) {
      filledCount++;
    }
    
    return Math.round((filledCount / (fields.length + 1)) * 100);
  };

  const completeness = calculateCompleteness();

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      {/* 1. Profile Header Section */}
      <div className={`relative rounded-3xl overflow-hidden border shadow-2xl ${
        isDarkMode ? 'bg-[#120e24] border-purple-900/40' : 'bg-white border-purple-100'
      }`}>
        {/* Cover Image */}
        <div className="h-48 md:h-64 relative group overflow-hidden bg-gradient-to-br from-purple-900 to-indigo-900">
          {formData.coverImage || userProfile.coverImage ? (
            <img 
              src={formData.coverImage || userProfile.coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          )}
          
          {isEditing && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => coverInputRef.current?.click()}
                className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-white text-sm font-bold flex items-center gap-2 hover:bg-white/30 transition-all border border-white/20"
              >
                <Camera className="w-4 h-4" /> Change Cover
              </button>
              <input 
                type="file" 
                ref={coverInputRef} 
                onChange={(e) => handleImageUpload('cover', e)} 
                className="hidden" 
                accept="image/*"
              />
            </div>
          )}
        </div>

        {/* Profile Info Bar */}
        <div className="relative px-6 pb-6 pt-16 md:pt-20">
          {/* Profile Picture */}
          <div className="absolute -top-16 md:-top-20 left-8">
            <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 ${
              isDarkMode ? 'border-[#06040d]' : 'border-white'
            } shadow-2xl overflow-hidden group`}>
              {formData.profileImage || userProfile.profileImage ? (
                <img 
                  src={formData.profileImage || userProfile.profileImage} 
                  alt={userProfile.displayName} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-5xl font-bold font-display">
                  {userProfile.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              
              {isEditing && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-all"
                    title="Upload Photo"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleResetAvatar}
                    className="p-2 bg-white/20 rounded-full text-white hover:bg-rose-500/40 transition-all"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => handleImageUpload('profile', e)} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>
              )}
            </div>
            {/* Animated XP Ring (Subtle) */}
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 scale-105 animate-pulse" />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 ml-0 md:ml-48">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-display font-bold tracking-tight">
                  {isEditing ? formData.displayName : userProfile.displayName}
                </h1>
                <div className="px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest">
                  Level {userProfile.level}
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-mono text-sm mt-1">
                @{isEditing ? formData.username : userProfile.username}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 rounded-xl border border-gray-500/30 text-gray-400 hover:bg-gray-500/5 transition-all text-sm font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all text-sm shadow-lg shadow-purple-500/20 flex items-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    setFormData(userProfile);
                    setSocialLinks(userProfile.socialLinks);
                    setIsEditing(true);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-purple-600/10 border border-purple-600/20 text-purple-400 hover:bg-purple-600/20 transition-all text-sm font-bold flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* User Stats Snapshot */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-purple-500/10 max-w-md">
            <div className="text-center">
              <div className="text-xl font-display font-bold text-purple-400">{userProfile.xp.toLocaleString()}</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Total XP</div>
            </div>
            <div className="text-center border-x border-purple-500/10 px-4">
              <div className="text-xl font-display font-bold text-purple-400">{userProfile.achievementsCount}</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Trophies</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-display font-bold text-purple-400">#42</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Rank</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-purple-500/5 border border-purple-500/10 w-fit">
          {[
            { id: 'personal', label: 'Personal Information', icon: User },
            { id: 'social', label: 'Social Networks', icon: Share2 },
            { id: 'preferences', label: 'App Preferences', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeSection === tab.id 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' 
                  : 'text-gray-500 hover:text-purple-400 hover:bg-purple-500/10'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Completeness Meter */}
        <div className="flex-1 max-w-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold">Profile Completeness</span>
            <span className="text-[10px] font-mono font-bold text-purple-400">{completeness}%</span>
          </div>
          <div className="h-1.5 w-full bg-purple-500/10 rounded-full overflow-hidden border border-purple-500/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completeness}%` }}
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 shadow-[0_0_10px_rgba(147,51,234,0.3)]"
            />
          </div>
        </div>
      </div>

      {/* 3. Dynamic Content Sections */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`rounded-3xl p-8 border ${
            isDarkMode ? 'bg-[#120e24] border-purple-900/40' : 'bg-white border-purple-100'
          }`}
        >
          {activeSection === 'personal' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Display Name */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-bold">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      name="displayName"
                      disabled={!isEditing}
                      value={(isEditing ? formData.displayName : userProfile.displayName) || ''}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      className={`w-full py-3 pl-11 pr-4 rounded-xl border bg-transparent text-sm transition-all focus:ring-2 focus:ring-purple-500 outline-none ${
                        isDarkMode ? 'border-gray-800 text-white' : 'border-gray-200 text-gray-900'
                      } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''} ${errors.displayName ? 'border-rose-500' : ''}`}
                    />
                  </div>
                  {errors.displayName && <p className="text-[10px] text-rose-500 font-bold">{errors.displayName}</p>}
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-bold">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">@</span>
                    <input 
                      type="text" 
                      name="username"
                      disabled={!isEditing}
                      value={(isEditing ? formData.username : userProfile.username) || ''}
                      onChange={handleInputChange}
                      placeholder="unique_id"
                      className={`w-full py-3 pl-11 pr-4 rounded-xl border bg-transparent text-sm transition-all focus:ring-2 focus:ring-purple-500 outline-none ${
                        isDarkMode ? 'border-gray-800 text-white' : 'border-gray-200 text-gray-900'
                      } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''} ${errors.username ? 'border-rose-500' : ''}`}
                    />
                  </div>
                  {errors.username && <p className="text-[10px] text-rose-500 font-bold">{errors.username}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-bold">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="email" 
                      name="email"
                      disabled={!isEditing}
                      value={(isEditing ? formData.email : userProfile.email) || ''}
                      onChange={handleInputChange}
                      className={`w-full py-3 pl-11 pr-4 rounded-xl border bg-transparent text-sm transition-all outline-none ${
                        isDarkMode ? 'border-gray-800 text-white' : 'border-gray-200 text-gray-900'
                      } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-bold">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="tel" 
                      name="phone"
                      disabled={!isEditing}
                      value={isEditing ? formData.phone : userProfile.phone || ''}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className={`w-full py-3 pl-11 pr-4 rounded-xl border bg-transparent text-sm transition-all outline-none ${
                        isDarkMode ? 'border-gray-800 text-white' : 'border-gray-200 text-gray-900'
                      } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-bold">Short Bio</label>
                <textarea 
                  name="bio"
                  disabled={!isEditing}
                  value={(isEditing ? formData.bio : userProfile.bio) || ''}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Tell us about your hobbies and goals..."
                  className={`w-full p-4 rounded-xl border bg-transparent text-sm transition-all focus:ring-2 focus:ring-purple-500 outline-none resize-none ${
                    isDarkMode ? 'border-gray-800 text-white' : 'border-gray-200 text-gray-900'
                  } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''} ${errors.bio ? 'border-rose-500' : ''}`}
                />
                <div className="flex justify-end">
                  <span className={`text-[10px] font-mono ${formData.bio?.length && formData.bio.length > 250 ? 'text-rose-500' : 'text-gray-500'}`}>
                    {(isEditing ? formData.bio?.length : userProfile.bio?.length) || 0}/250
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Birthday */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-bold">Birthday</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="date" 
                      name="dateOfBirth"
                      disabled={!isEditing}
                      value={(isEditing ? formData.dateOfBirth : userProfile.dateOfBirth) || ''}
                      onChange={handleInputChange}
                      className={`w-full py-3 pl-11 pr-4 rounded-xl border bg-transparent text-sm outline-none ${
                        isDarkMode ? 'border-gray-800 text-white' : 'border-gray-200 text-gray-900'
                      } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-bold">City / Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      name="location"
                      disabled={!isEditing}
                      value={(isEditing ? formData.location : userProfile.location) || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. San Francisco, CA"
                      className={`w-full py-3 pl-11 pr-4 rounded-xl border bg-transparent text-sm outline-none ${
                        isDarkMode ? 'border-gray-800 text-white' : 'border-gray-200 text-gray-900'
                      } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>

                {/* Occupation */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-bold">Occupation / Role</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      name="occupation"
                      disabled={!isEditing}
                      value={(isEditing ? formData.occupation : userProfile.occupation) || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. Creative Designer"
                      className={`w-full py-3 pl-11 pr-4 rounded-xl border bg-transparent text-sm outline-none ${
                        isDarkMode ? 'border-gray-800 text-white' : 'border-gray-200 text-gray-900'
                      } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-bold">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select 
                      name="country"
                      disabled={!isEditing}
                      value={(isEditing ? formData.country : userProfile.country) || ''}
                      onChange={handleInputChange as any}
                      className={`w-full py-3 pl-11 pr-4 rounded-xl border bg-transparent text-sm outline-none appearance-none ${
                        isDarkMode ? 'border-gray-800 text-white' : 'border-gray-200 text-gray-900'
                      } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Select Country</option>
                      <option value="IN">India</option>
                      <option value="US">USA</option>
                      <option value="UK">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="JP">Japan</option>
                      <option value="BR">Brazil</option>
                    </select>
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-bold">Preferred Language</label>
                  <div className="relative">
                    <Languages className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select 
                      name="language"
                      disabled={!isEditing}
                      value={(isEditing ? formData.language : userProfile.language) || ''}
                      onChange={handleInputChange as any}
                      className={`w-full py-3 pl-11 pr-4 rounded-xl border bg-transparent text-sm outline-none appearance-none ${
                        isDarkMode ? 'border-gray-800 text-white' : 'border-gray-200 text-gray-900'
                      } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-bold">Gender</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['male', 'female', 'non-binary', 'prefer-not-to-say'].map(g => (
                      <button
                        key={g}
                        disabled={!isEditing}
                        onClick={() => setFormData(prev => ({ ...prev, gender: g as any }))}
                        className={`py-2 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                          (isEditing ? formData.gender : userProfile.gender) === g
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-transparent border-gray-700/30 text-gray-400'
                        } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {g.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'social' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold">Social Connections</h4>
                  <p className="text-xs text-gray-500">Link your accounts to showcase your hobby journey</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: 'github', icon: Github, color: 'text-gray-400', label: 'GitHub' },
                  { name: 'linkedin', icon: Linkedin, color: 'text-blue-400', label: 'LinkedIn' },
                  { name: 'twitter', icon: Twitter, color: 'text-sky-400', label: 'Twitter/X' },
                  { name: 'instagram', icon: Instagram, color: 'text-pink-400', label: 'Instagram' },
                  { name: 'website', icon: Globe, color: 'text-emerald-400', label: 'Portfolio Website' }
                ].map(social => (
                  <div key={social.name} className="space-y-2">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold">{social.label}</label>
                    <div className="relative">
                      <social.icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${social.color}`} />
                      <input 
                        type="url" 
                        name={social.name}
                        disabled={!isEditing}
                        value={isEditing ? (socialLinks as any)[social.name] || '' : (userProfile.socialLinks as any)[social.name] || ''}
                        onChange={handleSocialChange}
                        placeholder={`https://${social.name}.com/yourprofile`}
                        className={`w-full py-3 pl-11 pr-4 rounded-xl border bg-transparent text-sm transition-all focus:ring-2 focus:ring-purple-500 outline-none ${
                          isDarkMode ? 'border-gray-800 text-white' : 'border-gray-200 text-gray-900'
                        } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'preferences' && (
            <div className="space-y-8">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-widest text-purple-400 mb-6 flex items-center gap-2">
                  <Bell className="w-4 h-4" /> Notification Channels
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'push', label: 'Push Notifications', desc: 'Real-time alerts in browser' },
                    { id: 'sms', label: 'SMS Reminders', desc: 'Direct text alerts to phone' },
                    { id: 'whatsapp', label: 'WhatsApp Nudges', desc: 'Coach advice on WhatsApp' },
                    { id: 'email', label: 'Weekly Digests', desc: 'Performance reports in inbox' }
                  ].map(item => (
                    <div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'
                    }`}>
                      <div>
                        <p className="text-sm font-bold">{item.label}</p>
                        <p className="text-[10px] text-gray-500">{item.desc}</p>
                      </div>
                      <button
                        disabled={!isEditing}
                        onClick={() => handlePreferenceChange(item.id, !((isEditing ? formData.notificationPreferences : userProfile.notificationPreferences) as any)[item.id])}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${
                          ((isEditing ? formData.notificationPreferences : userProfile.notificationPreferences) as any)[item.id] ? 'bg-purple-600' : 'bg-gray-700'
                        } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-200 ${
                          ((isEditing ? formData.notificationPreferences : userProfile.notificationPreferences) as any)[item.id] ? 'left-6' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-purple-500/10">
                <h4 className="text-xs font-mono uppercase tracking-widest text-purple-400 mb-6 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Visual & Experience
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold mb-3">Theme</label>
                    <select 
                      name="currentTheme"
                      disabled={!isEditing}
                      value={(isEditing ? formData.currentTheme : userProfile.currentTheme) || 'system'}
                      onChange={handleInputChange as any}
                      className={`w-full p-3 rounded-xl border bg-transparent text-sm outline-none ${
                        isDarkMode ? 'border-gray-800 text-white' : 'border-gray-200 text-gray-900'
                      } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 4. Footer Help Section */}
      <div className={`rounded-3xl p-6 border flex flex-col md:flex-row items-center gap-6 justify-between ${
        isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h5 className="font-bold text-sm">Privacy & Security</h5>
            <p className="text-xs text-gray-500">Your information is protected by industry standard encryption.</p>
          </div>
        </div>
        <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all">
          Download Data Export
        </button>
      </div>
    </div>
  );
}
