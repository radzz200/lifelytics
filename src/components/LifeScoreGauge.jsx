import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function LifeScoreGauge({ biologicalAge, chronologicalAge, yearsPredicted }) {
  const [animatedAge, setAnimatedAge] = useState(0);

  useEffect(() => {
    const duration = 1200; // 1.2s
    const steps = 60;
    const stepTime = duration / steps;
    const increment = biologicalAge / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= biologicalAge) {
        setAnimatedAge(biologicalAge);
        clearInterval(timer);
      } else {
        setAnimatedAge(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [biologicalAge]);

  const radius = 100;
  const stroke = 20;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  // Fill logic: max age scale = 100. If 65, fill 65%. 
  const fillPercentage = Math.min(100, Math.max(0, animatedAge));
  const strokeDashoffset = circumference - (fillPercentage / 100) * circumference;

  // Color logic based on Bio Age vs Chrono Age
  let colorClass = 'text-teal'; // Safe: Bio < Chrono
  if (animatedAge >= chronologicalAge + 2) {
    colorClass = 'text-danger'; // Danger: Bio significantly > Chrono
  } else if (animatedAge >= chronologicalAge) {
    colorClass = 'text-amber'; // Normal/Warning: Bio slightly > Chrono or Equal
  }

  return (
    <div className="flex flex-col items-center justify-center relative w-64 h-64 mx-auto">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle
          className="stroke-border-light dark:stroke-border-dark"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <motion.circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={`transition-all duration-300 ${colorClass}`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold font-display ${colorClass}`}>
          {animatedAge.toFixed(1)}
        </span>
        <span className="text-sm text-text-light/60 dark:text-gray-400">Bio Age</span>
        <span className="text-lg font-semibold mt-2 text-text-light dark:text-text-dark">
          {typeof yearsPredicted === 'number' ? yearsPredicted.toFixed(1) : yearsPredicted}
        </span>
        <span className="text-xs text-text-light/50 dark:text-gray-500">Years Predicted</span>
      </div>
    </div>
  );
}
