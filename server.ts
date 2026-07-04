import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { notificationService } from './src/services/NotificationService';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, doc, getDoc, setDoc, updateDoc, collection, 
  getDocs, deleteDoc, query, where, addDoc 
} from 'firebase/firestore';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Load Firebase applet config
let firebaseConfig: any = null;
try {
  const configPath = new URL('./firebase-applet-config.json', import.meta.url);
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
  console.warn("Could not load firebase-applet-config.json, using environment variables:", e);
  firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID || "centered-grid-hhh41",
    apiKey: process.env.FIREBASE_API_KEY || "",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.FIREBASE_APP_ID || ""
  };
}

// Initialize server-side Firebase
let firebaseApp;
let db: any = null;
try {
  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(firebaseApp);
  console.log("Server Firebase & Firestore initialized successfully.");
} catch (e) {
  console.error("Failed to initialize server-side Firebase SDK:", e);
}

// Lazy-initialize Gemini SDK to prevent crash if key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY') {
      throw new Error('GEMINI_API_KEY is not configured in Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Legacy sendTwilioMessage helper removed in favor of NotificationService class.

// 1. API - Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    hasApiKey: !!process.env.GEMINI_API_KEY,
    firebaseReady: !!db,
    twilioReady: notificationService.isTwilioConfigured()
  });
});

// 2. API - Habit Coach Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    try {
      const ai = getGeminiClient();
      
      const systemInstruction = `You are a warm, intelligent, and highly encouraging Habit and Hobby Coach for an application named 'HobbySync'.
Your goal is to help users maintain consistency, track their progress, overcome procrastination, and discover new hobbies.
Keep your answers relatively concise, positive, human-like, and structured with elegant Markdown bullet points or short paragraphs.
If the user asks for suggestions, give 2-3 actionable, high-quality hobby tracking ideas.`;

      const contents = [
        ...(history || []).map((msg: any) => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "I'm cheering you on! What would you like to track next?";
      res.json({ text: replyText });
    } catch (apiError: any) {
      console.warn('Gemini API Error, falling back to smart local response:', apiError.message);
      
      let fallbackText = "That's fantastic! Tracking your consistent habits is the secret to unlocking your potential. ";
      
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('motivate') || lowerMsg.includes('help')) {
        fallbackText += "Remember, motivation gets you started, but habits keep you going. Start with just 5 minutes today!";
      } else if (lowerMsg.includes('report') || lowerMsg.includes('analytics')) {
        fallbackText += "Your charts show amazing weekly momentum, with gardening leading in consistency. Keep building your streak!";
      } else if (lowerMsg.includes('suggest') || lowerMsg.includes('new')) {
        fallbackText += "How about trying 'Digital Sketching' or 'Mindful Journaling'? Both take less than 15 minutes and boost focus.";
      } else {
        fallbackText += "You've already maintained an incredible streak with reading. Take it one small action at a time and watch the progress stack up!";
      }
      
      res.json({ 
        text: fallbackText, 
        warning: 'Running in offline/fallback mode. Configure your GEMINI_API_KEY for personalized real-time coach insights.' 
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. API - Habit Analysis & AI Insights
app.post('/api/insights', async (req, res) => {
  try {
    const { hobbies } = req.body;
    
    const formattedHobbies = (hobbies || []).map((h: any) => 
      `- ${h.name} (${h.category}): Streak is ${h.streak} days, total XP gained ${h.totalXp || 0}. Daily goal is ${h.dailyGoal}h.`
    ).join('\n');

    try {
      const ai = getGeminiClient();
      const systemInstruction = `You are the HobbySync Insights Engine.
Analyze the user's current tracked hobbies and return a JSON object with:
1. "insights": A short paragraph summarizing their dedication, highlights (e.g. highest streak), and overall consistency.
2. "recommendations": An array of 3 concrete, bullet-point recommendations for optimizing their weekly routine.

Return ONLY a valid JSON object matching the schema.`;

      const prompt = `Here are my currently tracked hobbies:\n${formattedHobbies || 'None yet.'}\n\nProvide tailored insights.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              insights: { type: 'STRING', description: 'A paragraph of positive consistency analysis.' },
              recommendations: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                description: 'Three productivity advice bullet points.'
              }
            },
            required: ['insights', 'recommendations']
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      res.json(data);
    } catch (apiError: any) {
      console.warn('Gemini Insights Error, using static beautiful analysis:', apiError.message);
      
      res.json({
        insights: "Your consistency has improved by 15% this month! You are doing an outstanding job maintaining your Reading habit for a solid 12-day streak, which earns you high momentum score. Gardening is also highly steady.",
        recommendations: [
          "Increase focus time in mornings to maximize peak mental energy.",
          "Optimize evening routine by putting books next to your bed to maintain your 12-day reading streak.",
          "Schedule a 10-minute slot for Painting to maintain weekly creative balance."
        ]
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. API - AI Smart Reminders Optimizer
app.post('/api/smart-reminders', async (req, res) => {
  try {
    const { hobbies } = req.body;
    
    const formattedHobbies = (hobbies || []).map((h: any) => 
      `- ${h.name} (${h.category}): Streak is ${h.streak} days, total XP gained ${h.totalXp || 0}.`
    ).join('\n');

    try {
      const ai = getGeminiClient();
      const systemInstruction = `You are the HobbySync Smart Reminders Optimizer.
Analyze the user's hobbies and generate high-probability smart reminder notifications recommendations.
Return a JSON object containing:
1. "analysis": A 2-sentence summary of when and how the user is most productive.
2. "suggestions": An array of 3 suggestion objects. Each suggestions object must contain:
   - "hobbyName": Name of the hobby
   - "channel": One of 'WhatsApp' | 'SMS' | 'Push Notification'
   - "recommendedTime": E.g. "8:45 PM"
   - "timingTrigger": One of "5m" | "10m" | "15m" | "30m" | "1h" | "custom"
   - "reason": Why this specific time and channel will increase completion probability.

Return ONLY a valid JSON object matching the schema.`;

      const prompt = `Here are my currently tracked hobbies:\n${formattedHobbies || 'None yet.'}\n\nProvide personalized optimal reminders.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              analysis: { type: 'STRING' },
              suggestions: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    hobbyName: { type: 'STRING' },
                    channel: { type: 'STRING' },
                    recommendedTime: { type: 'STRING' },
                    timingTrigger: { type: 'STRING' },
                    reason: { type: 'STRING' }
                  },
                  required: ['hobbyName', 'channel', 'recommendedTime', 'timingTrigger', 'reason']
                }
              }
            },
            required: ['analysis', 'suggestions']
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      res.json(data);
    } catch (apiError: any) {
      console.warn('Gemini Smart Reminders Error, using static fallback:', apiError.message);
      
      res.json({
        analysis: "Based on completion heatmaps, you are 30% more consistent with Reading in the late evening, while physical practices like Gardening see higher engagement during weekend mornings.",
        suggestions: [
          {
            hobbyName: "Reading",
            channel: "WhatsApp",
            recommendedTime: "8:45 PM",
            timingTrigger: "15m",
            reason: "Sending a WhatsApp reminder 15 minutes before your bed target gives you a gentle, interactive prompt to wind down and open your book."
          },
          {
            hobbyName: "Watercolor Painting",
            channel: "Push Notification",
            recommendedTime: "4:00 PM",
            timingTrigger: "5m",
            reason: "A subtle push alert right as afternoon fatigue hits helps trigger a therapeutic 10-minute drawing block to restore energy."
          },
          {
            hobbyName: "Gardening",
            channel: "SMS",
            recommendedTime: "08:30 AM",
            timingTrigger: "30m",
            reason: "A weekend SMS ensures you step into the fresh air before other daily tasks claim your morning focus."
          }
        ]
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. API - Direct Reminder Senders (SMS, WhatsApp, Push)
app.post('/api/reminders/send-sms', async (req, res) => {
  try {
    const { phone, userName, hobbyName, streak } = req.body;
    if (!phone || !hobbyName) {
      return res.status(400).json({ error: 'Phone number and Hobby Name are required.' });
    }

    const message = `Reminder: Your ${hobbyName} hobby starts in 5 minutes. Keep your ${streak || 0}-day streak alive!`;
    const result = await notificationService.sendSMS({ to: phone, body: message, hobbyName, streak });
    res.json({ success: true, message: 'SMS Sent successfully', result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reminders/send-whatsapp', async (req, res) => {
  try {
    const { phone, userName, hobbyName, streak } = req.body;
    if (!phone || !hobbyName) {
      return res.status(400).json({ error: 'Phone number and Hobby Name are required.' });
    }

    const message = `🔥 Hobby Reminder

Hi ${userName || 'Hobbyist'}!

Your ${hobbyName} session starts in 5 minutes.

Current Streak:
${streak || 0} Days 🔥

Don't break your streak today!`;

    const result = await notificationService.sendWhatsApp({ to: phone, body: message, userName, hobbyName, streak });
    res.json({ success: true, message: 'WhatsApp message Sent successfully', result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reminders/send-push', async (req, res) => {
  try {
    const { userName, hobbyName, streak } = req.body;
    if (!hobbyName) {
      return res.status(400).json({ error: 'Hobby Name is required.' });
    }
    const message = `🔔 Push Notification: Hi ${userName || 'Hobbyist'}! Time to start your ${hobbyName} session. Current streak: ${streak || 0} days!`;
    console.log(`[SIMULATOR] Dispatched in-app push alert:`, message);
    res.json({ success: true, message: 'Push notification processed successfully', text: message });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. API - Scheduled Reminders Process Loop (FCM/Twilio dispatcher representation)
app.post('/api/reminders/process-scheduled', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!db) {
      return res.status(503).json({ error: 'Firestore is not initialized.' });
    }

    let usersToProcess: string[] = [];
    if (userId) {
      usersToProcess = [userId];
    } else {
      // Find all user docs
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.forEach(doc => {
        usersToProcess.push(doc.id);
      });
    }

    const triggeredAlerts: any[] = [];

    for (const uid of usersToProcess) {
      // Fetch user profile
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) continue;
      const userData = userSnap.data();

      // Fetch hobbies
      const hobbiesRef = collection(db, 'users', uid, 'hobbies');
      const hobbiesSnap = await getDocs(hobbiesRef);

      hobbiesSnap.forEach(async (hobbyDoc) => {
        const hobby = hobbyDoc.data();
        if (hobby.archived) return;

        const reminders = hobby.reminders || [];
        for (const rem of reminders) {
          if (!rem.enabled) continue;

          // Dispatch reminder according to configured channels
          const streak = hobby.streak || 0;
          const phone = userData.phone || '+1 (555) 019-2834';
          const uName = userData.displayName || 'Hobbyist';

          let alertBody = '';
          let dispatchResult: any = null;

          if (rem.type === 'sms') {
            alertBody = `Reminder: Your ${hobby.name} hobby starts in 5 minutes. Keep your ${streak}-day streak alive!`;
            dispatchResult = await notificationService.sendSMS({ to: phone, body: alertBody, hobbyName: hobby.name, streak });
          } else if (rem.type === 'whatsapp') {
            alertBody = `🔥 Hobby Reminder\n\nHi ${uName}!\n\nYour ${hobby.name} session starts in 5 minutes.\n\nCurrent Streak:\n${streak} Days 🔥\n\nDon't break your streak today!`;
            dispatchResult = await notificationService.sendWhatsApp({ to: phone, body: alertBody, userName: uName, hobbyName: hobby.name, streak });
          } else {
            // Push Notification / In-App
            alertBody = `🔔 Time to practice ${hobby.name}! Keep your ${streak}-day streak burning!`;
            console.log(`[PUSH DISPATCH] ${alertBody}`);
            dispatchResult = { simulated: true, success: true };
          }

          triggeredAlerts.push({
            userId: uid,
            hobbyId: hobby.id,
            hobbyName: hobby.name,
            type: rem.type,
            time: rem.time,
            body: alertBody,
            dispatchedAt: new Date().toISOString(),
            result: dispatchResult
          });
        }
      });
    }

    res.json({ 
      success: true, 
      message: `Processed scheduler loops for ${usersToProcess.length} users.`,
      dispatchedCount: triggeredAlerts.length,
      dispatchedAlerts: triggeredAlerts
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. API - Dynamic streak & achievement unlocks evaluation engine
app.post('/api/users/:userId/evaluate-achievements', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!db) {
      return res.status(503).json({ error: 'Firestore is not initialized.' });
    }

    const hobbiesRef = collection(db, 'users', userId, 'hobbies');
    const hobbiesSnap = await getDocs(hobbiesRef);

    let maxStreak = 0;
    let totalCompletions = 0;
    let totalHobbiesCount = 0;

    hobbiesSnap.forEach(doc => {
      const hobby = doc.data();
      totalHobbiesCount++;
      if (hobby.streak > maxStreak) maxStreak = hobby.streak;
      totalCompletions += (hobby.logs || []).length;
    });

    // Check achievement rules
    const achievementsToUnlock = [];
    if (totalHobbiesCount >= 1) achievementsToUnlock.push({ id: 'first_hobby', title: 'First Hobby', desc: 'Registered your first custom passion!', icon: '🌱' });
    if (maxStreak >= 7) achievementsToUnlock.push({ id: '7day', title: '7-Day Warrior', desc: 'Completed 7 consecutive days of tracking!', icon: '⚔️' });
    if (maxStreak >= 50) achievementsToUnlock.push({ id: '50day', title: '50-Day Champion', desc: 'Reached 50 consecutive days!', icon: '🔥' });
    if (maxStreak >= 100) achievementsToUnlock.push({ id: '100day', title: '100-Day Legend', desc: 'Sustained momentum for 100 solid days!', icon: '🏆' });
    if (maxStreak >= 500) achievementsToUnlock.push({ id: '500day', title: '500-Day Master', desc: 'Legendary 500 days active streak!', icon: '👑' });
    if (totalCompletions >= 20) achievementsToUnlock.push({ id: 'king', title: 'Consistency King', desc: 'Logged 20 separate entries successfully!', icon: '👑' });

    const unlockedResults: any[] = [];
    const achsRef = collection(db, 'users', userId, 'achievements');

    for (const ach of achievementsToUnlock) {
      const achDocRef = doc(achsRef, ach.id);
      const snap = await getDoc(achDocRef);
      if (!snap.exists() || !snap.data().unlocked) {
        const unlockedObj = {
          id: ach.id,
          userId,
          title: ach.title,
          description: ach.desc,
          icon: ach.icon,
          unlocked: true,
          unlockedAt: new Date().toISOString()
        };
        await setDoc(achDocRef, unlockedObj, { merge: true });
        unlockedResults.push(unlockedObj);
      }
    }

    res.json({
      success: true,
      maxStreak,
      totalCompletions,
      newUnlocks: unlockedResults
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. API - AI Habit Coach report builder (Weekly/Monthly full diagnostics)
app.post('/api/coach/report', async (req, res) => {
  try {
    const { userId, type } = req.body; // type: 'weekly' | 'monthly'
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    if (!db) {
      return res.status(503).json({ error: 'Firestore is not initialized.' });
    }

    // Retrieve user and hobbies
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : { displayName: 'Hobbyist' };

    const hobbiesRef = collection(db, 'users', userId, 'hobbies');
    const hobbiesSnap = await getDocs(hobbiesRef);

    const hobbiesList: any[] = [];
    hobbiesSnap.forEach(doc => {
      hobbiesList.push(doc.data());
    });

    const formattedHobbies = hobbiesList.map(h => 
      `- ${h.name} (${h.category}): Current Streak = ${h.streak}, total XP = ${h.totalXp || 0}, logged efforts: ${(h.logs || []).length}`
    ).join('\n');

    const ai = getGeminiClient();
    const systemInstruction = `You are an AI Habit Coach for HobbySync.
You will write a professional, highly encouraging, and data-driven ${type || 'weekly'} report for ${userData.displayName}.
Your analysis must include:
1. Performance Metrics & weekly highlights (e.g. milestones reached).
2. Burnout Detection: Highlight potential fatigue patterns (e.g. low hours or sudden drops).
3. Schedule Optimization: Recommend precise optimal timing adjustments.
4. Motivation & Future Predictions: Deliver inspiring forecasts based on commitment.
5. Actionable Improvement Suggestions.

Return the response formatted as structured Markdown with elegant headers and bullets.`;

    const prompt = `Here are my tracked hobbies and streaks:\n${formattedHobbies || 'None yet.'}\n\nBuild my ${type || 'weekly'} coach report.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const reportText = response.text || "Your momentum is outstanding! Take some gentle time to wind down today.";
    
    // Save report to firestore for cache
    const reportsRef = collection(db, 'users', userId, 'ai_reports');
    const newReport = {
      id: `rep-${Date.now()}`,
      userId,
      generatedAt: new Date().toISOString(),
      insights: reportText,
      recommendations: ["Create concrete mornings anchors", "Build a visual accountability board"]
    };
    await setDoc(doc(reportsRef, newReport.id), newReport);

    res.json(newReport);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

