import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Red Heart */}
        <svg viewBox="0 0 24 24" className="w-12 h-12 fill-danger text-danger">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        
        {/* ECG Line (White) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-white stroke-[2]" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h3l2-5 3 10 2-5h3" className="animate-pulse" />
          </svg>
        </div>
      </div>
      
      {/* Text */}
      <span className="text-3xl font-black tracking-tighter text-text-light dark:text-text-dark">
        LifeLytics
      </span>
    </div>
  );
};

export default Logo;
