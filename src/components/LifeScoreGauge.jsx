import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function LifeScoreGauge({ biologicalAge, chronologicalAge, yearsPredicted }) {
  const [animatedBio, setAnimatedBio] = useState(0);

  useEffect(() => {
    setAnimatedBio(biologicalAge);
  }, [biologicalAge]);

  const size = 280;
  const center = size / 2;
  const strokeWidth = 14;
  const radius = (size / 2) - strokeWidth;
  const circumference = radius * 2 * Math.PI;
  
  // Scale: 0 to 100 for the ring
  const progress = (animatedBio / 100) * circumference;
  const isHealthy = biologicalAge <= chronologicalAge;
  const delta = Math.abs(biologicalAge - chronologicalAge).toFixed(1);

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      {/* Dynamic Background Glow */}
      <div className={`absolute inset-4 rounded-full blur-3xl opacity-10 transition-colors duration-1000 ${isHealthy ? 'bg-teal' : 'bg-rose-500'}`} />
      
      {/* SVG Rings */}
      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isHealthy ? "#00F5D4" : "#f43f5e"} />
            <stop offset="100%" stopColor={isHealthy ? "#0ea5e9" : "#94a3b8"} />
          </linearGradient>
        </defs>

        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-800/40"
        />

        {/* Progress Ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className="drop-shadow-[0_0_12px_rgba(0,245,212,0.3)]"
        />

        {/* Small Reference Marker for Chrono Age */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth + 4}
          strokeDasharray={`2 ${circumference}`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - ((chronologicalAge / 100) * circumference) }}
          className="text-slate-400 dark:text-slate-500 opacity-50"
        />
      </svg>

      {/* Center Intelligence Hub */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <div className="text-center space-y-0.5">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-950 dark:text-gray-400">
            Biological
          </p>
          
          <div className="flex items-baseline justify-center gap-1">
            <motion.span 
              key={biologicalAge}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-7xl font-black font-display tracking-tighter leading-none ${isHealthy ? 'text-slate-950 dark:text-white' : 'text-rose-600'}`}
            >
              {biologicalAge.toFixed(1)}
            </motion.span>
          </div>

          <div className="pt-2">
             <div className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${isHealthy ? 'bg-teal/10 text-teal-800 dark:text-teal' : 'bg-rose-500/10 text-rose-800 dark:text-rose-500'}`}>
                {isHealthy ? 'Optimal' : 'Elevated'} • {delta}Y {isHealthy ? 'Gain' : 'Loss'}
             </div>
          </div>

          <div className="pt-6 flex flex-col items-center">
            <div className="w-12 h-[1px] bg-slate-200 dark:bg-slate-800 mb-4" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-950 mb-1">Lifespan Prediction</p>
            <div className="text-2xl font-black text-slate-950 dark:text-white flex items-baseline gap-1">
              {yearsPredicted.toFixed(1)}
              <span className="text-[10px] text-slate-950 font-black uppercase">yrs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
