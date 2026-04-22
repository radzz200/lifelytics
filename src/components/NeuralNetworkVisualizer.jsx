import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const NeuralNetworkVisualizer = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // 3 layers: input, hidden, output
  const layers = [
    [20, 40, 60, 80], // Input layer (y positions)
    [30, 50, 70],     // Hidden layer
    [50]              // Output layer
  ];
  
  const xPositions = [20, 50, 80]; // x positions for layers (in percentage)
  
  return (
    <div className="relative w-72 h-72 mx-auto perspective-1000">
      {/* Background orb removed */}
      
      <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F5D4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Draw connections */}
        {layers.map((layer, lIndex) => {
          if (lIndex === layers.length - 1) return null;
          const nextLayer = layers[lIndex + 1];
          return layer.map((y1, i) => (
            nextLayer.map((y2, j) => (
              <motion.line
                key={`line-${lIndex}-${i}-${j}`}
                x1={`${xPositions[lIndex]}%`}
                y1={`${y1}%`}
                x2={`${xPositions[lIndex + 1]}%`}
                y2={`${y2}%`}
                stroke="url(#edgeGradient)"
                strokeWidth="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: isDark ? [0.1, 0.4, 0.1] : [0.3, 0.8, 0.3] }}
                transition={{
                  pathLength: { duration: 1.5, ease: "easeInOut" },
                  opacity: { duration: 2 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }
                }}
              />
            ))
          ));
        })}

        {/* Draw nodes */}
        {layers.map((layer, lIndex) => (
          layer.map((y, i) => (
            <motion.circle
              key={`node-${lIndex}-${i}`}
              cx={`${xPositions[lIndex]}%`}
              cy={`${y}%`}
              r={lIndex === 2 ? "4" : "2"}
              fill={lIndex === 2 ? "#3B82F6" : "#00F5D4"}
              filter="url(#glow)"
              animate={{
                r: lIndex === 2 ? [4, 5, 4] : [2, 3, 2],
                opacity: isDark ? [0.6, 1, 0.6] : [0.8, 1, 0.8]
              }}
              transition={{
                duration: 1.5 + Math.random(),
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))
        ))}
      </svg>
      
      {/* Central glow removed */}
    </div>
  );
};

export default NeuralNetworkVisualizer;
