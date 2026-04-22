import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Database, Code, Activity, Scale, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Science() {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen pt-24 pb-12 px-6 max-w-4xl mx-auto"
    >
      <button onClick={() => navigate(-1)} className="text-teal hover:underline flex items-center gap-2 mb-8">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-12">
        <span className="inline-block px-4 py-1.5 rounded-full bg-teal/10 text-teal border border-teal/20 text-sm font-semibold tracking-wider mb-4">
          SCIENTIFIC TRANSPARENCY
        </span>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-text-light dark:text-white">About the Model</h1>
        <p className="text-text-light/70 dark:text-gray-400 text-lg">
          We believe in Explainable AI. Our platform combines traditional actuarial science with <strong>TensorFlow.js Deep Learning</strong> and <strong>Face-API Computer Vision</strong>.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Dataset Source */}
        <div className="glass-panel p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Database size={120} /></div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <Database className="text-teal" /> Data Sources & Epidemiology
          </h2>
          <p className="text-text-light/70 dark:text-gray-300 leading-relaxed mb-4 relative z-10">
            The core deterministic engine is built upon robust epidemiological data rather than black-box machine learning. The baseline assumptions and risk multipliers are sourced from aggregated, anonymized public health datasets:
          </p>
          <ul className="list-disc list-inside text-text-light/70 dark:text-gray-400 space-y-2 relative z-10">
            <li><strong>WHO Global Health Observatory:</strong> Baseline life expectancy anchors.</li>
            <li><strong>CDC NHANES:</strong> Correlations between BMI, Blood Pressure, and mortality risk.</li>
            <li><strong>Framingham Heart Study:</strong> Long-term impacts of smoking, cholesterol, and cardiovascular diseases.</li>
          </ul>
        </div>

        {/* Algorithm Used */}
        <div className="glass-panel p-8 relative overflow-hidden border-blue-500/20">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Code size={120} /></div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <Code className="text-blue-400" /> Hybrid Neural-Actuarial Engine
          </h2>
          <p className="text-text-light/70 dark:text-gray-300 leading-relaxed mb-4 relative z-10">
            Lifelytics utilizes a sophisticated <strong>Neural Network</strong> built in TensorFlow.js. Unlike simple formulas, our model weighs hundreds of nonlinear interactions between biomarkers.
          </p>
          <div className="bg-surface-light dark:bg-surface-dark/50 p-4 rounded-xl border border-border-light/20 dark:border-border-dark/20 text-sm text-text-light/60 dark:text-gray-400 font-mono mb-4">
            Layers: Dense (16, ReLU) → Dense (8, ReLU) → Output (1, Linear)<br/>
            Framework: TensorFlow.js 4.x<br/>
            Optimizer: Adam (Adaptive Moment Estimation)
          </div>
          <p className="text-text-light/70 dark:text-gray-300 leading-relaxed relative z-10">
            The neural engine is cross-validated against <strong>WHO Global Health Observatory</strong> anchors to ensure the AI remains medically grounded while providing personalized insights.
          </p>
        </div>

        {/* Feature Importance */}
        <div className="glass-panel p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Scale size={120} /></div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <Scale className="text-amber-400" /> Feature Importance (Weights)
          </h2>
          <p className="text-text-light/70 dark:text-gray-300 leading-relaxed mb-6 relative z-10">
            Every prediction comes with a "Feature Contribution" breakdown. Below is the global maximum impact matrix used by the model:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
              <h4 className="font-bold text-red-400 mb-2">Highest Risk Factors</h4>
              <ul className="text-sm text-text-light/60 dark:text-gray-400 space-y-2">
                <li className="flex justify-between"><span>Active Smoking</span> <span>-15 years</span></li>
                <li className="flex justify-between"><span>Previous Stroke</span> <span>-12 years</span></li>
                <li className="flex justify-between"><span>Heart Disease</span> <span>-10 years</span></li>
                <li className="flex justify-between"><span>Type 2 Diabetes</span> <span>-8 years</span></li>
              </ul>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
              <h4 className="font-bold text-emerald-400 mb-2">Highest Protective Factors</h4>
              <ul className="text-sm text-text-light/60 dark:text-gray-400 space-y-2">
                <li className="flex justify-between"><span>High Exercise (Level 3+)</span> <span>+9 years</span></li>
                <li className="flex justify-between"><span>Moderate Exercise</span> <span>+6 years</span></li>
                <li className="flex justify-between"><span>Light Exercise</span> <span>+3 years</span></li>
                <li className="flex justify-between"><span>Healthy BMI (18.5 - 25)</span> <span>Baseline</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Privacy */}
        <div className="glass-panel p-8 border-t-4 border-t-teal">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <ShieldCheck className="text-teal" /> Zero-Backend Privacy
          </h2>
          <p className="text-text-light/70 dark:text-gray-300 leading-relaxed">
            All calculations happen entirely within your browser using JavaScript. No health data is ever transmitted to, or stored on, an external server. By eliminating the backend, we guarantee 100% data privacy and compliance.
          </p>
        </div>

      </div>
    </motion.div>
  );
}
