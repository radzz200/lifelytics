import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Plus, Pill, Heart, Activity } from 'lucide-react';

const FloatingParticles = () => {
  const icons = [
    { Icon: Dumbbell, color: 'text-blue-500' },
    { Icon: Plus, color: 'text-danger' },
    { Icon: Pill, color: 'text-amber' },
    { Icon: Heart, color: 'text-teal' },
    { Icon: Activity, color: 'text-purple-500' },
  ];

  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    icon: icons[i % icons.length],
    size: Math.random() * 15 + 8, // Smaller size (8-23px)
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 20 + 20, // Slower float
    delay: Math.random() * 10,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute ${p.icon.color} opacity-40`} // Higher base opacity
          initial={{ 
            left: `${p.left}%`, 
            top: `${p.top}%`,
            opacity: 0,
            scale: 0.5
          }}
          animate={{
            top: [`${p.top}%`, `${(p.top - 15 + 100) % 100}%`], // More vertical drift
            rotate: 360,
            opacity: [0, 0.4, 0], // Peak at 0.4
            scale: [0.5, 1.2, 0.5]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
          style={{ width: p.size, height: p.size }}
        >
          <p.icon.Icon size={p.size} strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingParticles;
