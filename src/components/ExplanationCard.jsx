import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function ExplanationCard({ type, text }) {
  const isWarning = type === 'warning';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl border backdrop-blur-md flex gap-4 items-start shadow-lg transition-all hover:-translate-y-1 ${
        isWarning 
          ? 'bg-red-500/10 border-red-500/30 text-red-100' 
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100'
      }`}
    >
      <div className={`p-2 rounded-xl shrink-0 ${isWarning ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
        {isWarning ? <AlertCircle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
      </div>
      <div>
        <h4 className={`font-semibold mb-2 ${isWarning ? 'text-red-300' : 'text-emerald-300'}`}>
          {isWarning ? 'High Risk Pattern Detected' : 'Positive Pattern Detected'}
        </h4>
        <p className="text-sm leading-relaxed opacity-90">{text}</p>
      </div>
    </motion.div>
  );
}
