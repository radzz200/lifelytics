import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Wine, ShieldAlert } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function QuickPredictor() {
  const { engineEnabled } = useUser();
  const [age, setAge] = useState(30);
  const [exercise, setExercise] = useState(3);
  const [smoking, setSmoking] = useState(0);
  const [drinking, setDrinking] = useState(0);
  const [lifespan, setLifespan] = useState(80);

  useEffect(() => {
    // Baseline life expectancy: 80
    let estimate = 80;
    if (age > 30) estimate += (age - 30) * 0.1;
    estimate += (exercise - 3); // Baseline assumes 3 days a week
    estimate -= smoking * 10;
    estimate -= (drinking * 0.3); // Each unit roughly -0.3 years

    setLifespan(Math.max(40, Math.min(100, estimate)));
  }, [age, exercise, smoking, drinking]);

  return (
    <div className="glass-panel p-6 bg-surface-light dark:bg-surface-dark/50 relative overflow-hidden rounded-3xl w-full max-w-[380px] mx-auto shadow-2xl border-border-light/40 dark:border-border-dark/20">
      <AnimatePresence>
        {!engineEnabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-background-light/60 dark:bg-background-dark/60 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 border border-rose-500/20">
              <ShieldAlert className="w-8 h-8 text-rose-500" />
            </div>
            <h4 className="text-lg font-black text-slate-950 dark:text-white mb-2 leading-tight uppercase">Neural Engine Offline</h4>
            <p className="text-xs text-slate-600 dark:text-gray-400 font-bold leading-relaxed">
              Please turn on the Neural Engine from the navigation bar to enable real-time health simulations.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex justify-between items-center mb-5 ${!engineEnabled ? 'opacity-20 grayscale' : ''}`}>
        <h3 className="font-extrabold text-[20px] flex items-center gap-2 text-slate-950 dark:text-white leading-tight">
          <Activity className="text-teal w-5 h-5" /> How long do you think you’ll live?
        </h3>
        <div className="px-3 py-1 bg-teal text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-teal/30">Live</div>
      </div>

      <div className={`flex items-center justify-center mb-6 ${!engineEnabled ? 'opacity-20 grayscale' : ''}`}>
        <div className="text-center">
          <div className="text-5xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal to-blue-500 transition-all duration-300 leading-none">
            {lifespan.toFixed(1)}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-widest mt-1">Estimated Years</div>
        </div>
      </div>

      <div className={`space-y-4 relative z-10 ${!engineEnabled ? 'pointer-events-none opacity-20 grayscale' : ''}`}>
        <div>
          <div className="flex justify-between text-[13px] mb-1.5">
            <span className="font-black text-slate-900 dark:text-gray-200">Current Age</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-black text-[15px]">{age} yrs</span>
          </div>
          <input
            type="range" min="18" max="80" value={age}
            disabled={!engineEnabled}
            onChange={(e) => setAge(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer transition-all"
            style={{
              accentColor: '#6366f1',
              background: `linear-gradient(to right, #6366f1 ${((age - 18) / (80 - 18)) * 100}%, ${engineEnabled ? (document.documentElement.classList.contains('dark') ? '#374151' : '#e2e8f0') : '#94a3b8'} 0%)`
            }}
          />
        </div>

        <div>
          <div className="flex justify-between text-[13px] mb-1.5">
            <span className="font-black text-slate-900 dark:text-gray-200">Exercise (Days/Week)</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-[15px]">{exercise} days</span>
          </div>
          <input
            type="range" min="0" max="7" value={exercise}
            disabled={!engineEnabled}
            onChange={(e) => setExercise(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer transition-all"
            style={{
              accentColor: '#10b981',
              background: `linear-gradient(to right, #10b981 ${(exercise / 7) * 100}%, ${engineEnabled ? (document.documentElement.classList.contains('dark') ? '#374151' : '#e2e8f0') : '#94a3b8'} 0%)`
            }}
          />
        </div>

        <div>
          <div className="flex justify-between text-[13px] mb-1.5">
            <span className="font-black text-slate-900 dark:text-gray-200">Drinking (Units/Week)</span>
            <span className="font-mono text-amber-600 dark:text-amber-400 font-black text-[15px]">{drinking} units</span>
          </div>
          <input
            type="range" min="0" max="40" value={drinking}
            disabled={!engineEnabled}
            onChange={(e) => setDrinking(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer transition-all"
            style={{
              accentColor: '#f59e0b',
              background: `linear-gradient(to right, #f59e0b ${(drinking / 40) * 100}%, ${engineEnabled ? (document.documentElement.classList.contains('dark') ? '#374151' : '#e2e8f0') : '#94a3b8'} 0%)`
            }}
          />
        </div>

        <div>
          <div className="flex justify-between text-[13px] mb-1.5">
            <span className="font-black text-slate-900 dark:text-gray-200">Smoker</span>
            <span className="font-mono text-rose-500 font-black text-[15px]">{smoking === 1 ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex bg-slate-200 dark:bg-gray-700/50 rounded-xl overflow-hidden p-1 border border-slate-300 dark:border-slate-600/30">
            <button
              disabled={!engineEnabled}
              className={`flex-1 py-2 text-[13px] font-black rounded-lg transition-all ${smoking === 0 ? 'bg-white dark:bg-gray-500 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'}`}
              onClick={() => setSmoking(0)}
            >
              No
            </button>
            <button
              disabled={!engineEnabled}
              className={`flex-1 py-2 text-[13px] font-black rounded-lg transition-all ${smoking === 1 ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'}`}
              onClick={() => setSmoking(1)}
            >
              Yes
            </button>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-center text-slate-800 dark:text-gray-300 mt-6 leading-tight font-black uppercase tracking-[0.1em] border-t border-slate-200 dark:border-slate-800 pt-4 px-2">
        This tool is for educational purposes only and not medical advice.
      </p>
    </div>
  );
}
