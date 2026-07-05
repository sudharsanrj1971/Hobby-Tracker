import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface TourStep {
  target?: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface ProductTourProps {
  onComplete: () => void;
}

export default function ProductTour({ onComplete }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const steps: TourStep[] = [
    {
      title: "Welcome to HobbySync! 🌟",
      content: "Let's take a quick look at how you can transform your hobbies into lifelong habits.",
      position: 'center'
    },
    {
      title: "Your Hobby Deck",
      content: "This is where all your active hobbies live. Tap a card to log progress or view deep analytics.",
      position: 'bottom'
    },
    {
      title: "AI Habit Coach",
      content: "Need motivation? Your personalized coach is powered by Gemini to provide tailored advice and streaks support.",
      position: 'top'
    },
    {
      title: "Achievements & XP",
      content: "Earn experience points for every log. Unlock rare achievements as you build consistency!",
      position: 'top'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setIsVisible(false)}
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm glass-panel rounded-3xl p-6 shadow-2xl border border-white/40 overflow-hidden"
          >
            {/* Decorative Background */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />

            {/* Step Counter */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === currentStep ? 'w-6 bg-purple-600' : 'w-2 bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <button 
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-display font-bold text-xl text-gray-800">{steps[currentStep].title}</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {steps[currentStep].content}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                  currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-purple-600'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.98] transition-all flex items-center gap-1"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                {currentStep !== steps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
