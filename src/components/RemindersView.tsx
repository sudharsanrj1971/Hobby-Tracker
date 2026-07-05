import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings2, Bell, AlertCircle, Send, Phone, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';

export default function RemindersView({ isDarkMode }: { isDarkMode: boolean }) {
  const [phoneNumber, setPhoneNumber] = useState('+91 ');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [notifType, setNotifType] = useState<'sms' | 'whatsapp'>('sms');

  const handleSendTest = async () => {
    if (!phoneNumber) {
      setStatus({ type: 'error', message: 'Please enter a phone number' });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phoneNumber, 
          type: notifType,
          hobbyName: 'Morning Yoga'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ 
          type: 'success', 
          message: data.demoMode 
            ? 'Demo: Notification simulated in console!' 
            : 'Test message sent successfully!' 
        });
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send test message' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-500/20">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold">Reminders & Alerts</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Keep your streaks alive with smart notifications</p>
        </div>
      </div>

      <div className={`rounded-3xl p-6 border shadow-sm ${
        isDarkMode ? 'bg-[#120e24] border-purple-900/40' : 'bg-white border-purple-100'
      }`}>
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
            <Send className="w-4 h-4" />
          </div>
          <h3 className="font-bold">Test Your Connection</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">Delivery Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setNotifType('sms')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  notifType === 'sms' 
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' 
                    : 'bg-transparent border-gray-700/30 text-gray-400 hover:border-purple-500/50'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">SMS</span>
              </button>
              <button
                onClick={() => setNotifType('whatsapp')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  notifType === 'whatsapp' 
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'bg-transparent border-gray-700/30 text-gray-400 hover:border-emerald-500/50'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">WhatsApp</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Phone Number</label>
            <div className="relative">
              <input 
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const val = e.target.value;
                  // Allow more flexible editing but maintain + as a hint
                  if (val === '' || val === '+') {
                    setPhoneNumber('+');
                  } else {
                    setPhoneNumber(val);
                  }
                }}
                placeholder="+919876543210"
                className={`w-full py-3 px-4 rounded-xl border bg-transparent focus:ring-2 focus:ring-purple-500 transition-all ${
                  isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'
                }`}
              />
            </div>
            <div className="mt-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
              <p className="text-[10px] text-blue-400 leading-relaxed">
                <span className="font-bold">WhatsApp Tip:</span> If using a Twilio Sandbox, you MUST first send 
                <code className="mx-1 px-1 py-0.5 bg-blue-500/20 rounded">join [your-sandbox-word]</code> 
                to your Twilio WhatsApp number to authorize delivery.
              </p>
            </div>
          </div>

          {status && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl flex items-center gap-3 text-sm border ${
                status.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
            >
              {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {status.message}
            </motion.div>
          )}

          <button
            onClick={handleSendTest}
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-500/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
            {isLoading ? 'Sending...' : 'Send Sample Reminder'}
          </button>
        </div>
      </div>

      <div className={`rounded-3xl p-6 border ${
        isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'
      }`}>
        <h4 className="text-xs font-mono uppercase tracking-widest text-purple-400 mb-4">Upcoming Features</h4>
        <div className="space-y-3">
          {[
            { title: 'Smart Intervals', desc: 'Get reminded 5, 15, or 30 mins before your goal window.' },
            { title: 'AI-Powered Nudges', desc: 'Dynamic, motivational messages generated by your AI Coach.' },
            { title: 'Quiet Hours', desc: 'Silence all notifications during your sleep or work periods.' }
          ].map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-gray-300">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
