import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Plus, Pill, Heart, Activity, Stethoscope, Bandage, Syringe, Thermometer } from 'lucide-react';

const FloatingParticles = () => {
  const icons = [
    { Icon: Dumbbell, color: 'text-blue-500' },
    { Icon: Plus, color: 'text-rose-500' },
    { Icon: Pill, color: 'text-amber-500' },
    { Icon: Heart, color: 'text-teal' },
    { Icon: Activity, color: 'text-emerald-500' },
    { Icon: Stethoscope, color: 'text-indigo-500' },
    { Icon: Bandage, color: 'text-orange-400' },
    { Icon: Syringe, color: 'text-sky-500' },
    { Icon: Thermometer, color: 'text-red-400' },
  ];

  const particles = Array.from({ length: 45 }).map((_, i) => ({
    id: i,
    icon: icons[i % icons.length],
    size: Math.random() * 15 + 10,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 40 + 40,
    delay: Math.random() * 20,
  }));

  return (
    <div className="w-full h-full relative overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute ${p.icon.color}`} 
          initial={{ 
            left: `${p.left}%`, 
            top: `${p.top}%`,
            opacity: 0,
            scale: 0.5
          }}
          animate={{
            top: [`${p.top}%`, `${(p.top - 15 + 100) % 100}%`], // Gentler drift
            rotate: 360,
            opacity: [0, 0.35, 0], // Increased to 0.35 for better visibility
            scale: [0.8, 1.1, 0.8]
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
