import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { predictLifespan, predictLifespanFast, loadModel } from '../ml/predict';
import { supabase } from '../lib/supabase';
import LifeScoreGauge from '../components/LifeScoreGauge';
import RiskRadar from '../components/RiskRadar';
import { AreaChart, Area, CartesianGrid, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, TrendingUp, Settings, Activity, Download, Heart, ClipboardList, Shield, Brain, Zap, CheckCircle, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { generateLongevityAudit } from '../utils/pdfGenerator';
import { incrementGlobalCounter } from '../utils/stats';

export default function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { userData, updateUserData, predictions, setPredictions } = useUser();
  const [loading, setLoading] = useState(true);
  const [trainingProgress, setTrainingProgress] = useState({ model: '', current: 0, total: 100 });
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState(null);
  const hasSaved = useRef(false);
  const runningRef = useRef(false);

  useEffect(() => {
    // Safety check: if no data, go back
    if (!userData || Object.keys(userData).length === 0) {
      navigate('/onboarding');
      return;
    }

    const runPrediction = async () => {
      if (runningRef.current) return;
      runningRef.current = true;
      
      try {
        // Step 1: Set Initial Baseline (Instant)
        if (!predictions || predictions.isBaseline) {
          const baseline = predictLifespanFast(userData);
          setPredictions(baseline);
          setLoading(false);
        }

        // Step 2: Background AI Calibration
        setIsTraining(true);
        await loadModel((progress) => {
          setTrainingProgress(progress);
        });
        
        // Step 3: Run Full AI Prediction
        const result = await predictLifespan(userData);
        
        // Upgrade to AI results
        setPredictions(result);
        setIsTraining(false);

        // Step 4: Background Save (Non-blocking)
        if (userData.isNewEntry && !hasSaved.current) {
          hasSaved.current = true;
          const dataToSave = { ...userData };
          delete dataToSave.isNewEntry;

          const newEntry = {
              id: Date.now().toString(),
              date: new Date().toISOString(),
              userdata: dataToSave,
              prediction: result.prediction,
              base: result.base,
              score: Math.min(100, Math.max(0, (result.prediction / 100) * 100))
          };
          
          supabase.from('patient_records').insert([newEntry]).then(() => {
            incrementGlobalCounter(1);
          }).catch(err => console.error('Supabase error:', err));
          
          updateUserData({ isNewEntry: false });
        }
      } catch (err) {
        console.error('Prediction error:', err);
        setError("Engine Calibration Error: " + err.message);
        setLoading(false);
        setIsTraining(false);
        runningRef.current = false;
      }
    };

    // Only run if we don't have predictions or if they are incomplete
    if (!predictions || !predictions.prediction) {
      runPrediction();
    } else {
      setLoading(false);
    }
  }, [userData, predictions, navigate, setPredictions]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-6">
        <div className="glass-panel p-8 text-center max-w-md border-red-500/30">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Activity className="text-red-500 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-text-light dark:text-white">Assessment Interrupted</h2>
          <p className="text-slate-600 dark:text-gray-400 mb-8">{error}</p>
          <button onClick={() => navigate('/onboarding')} className="btn-primary w-full bg-red-500 hover:bg-red-600 border-none">
            Restart Assessment
          </button>
        </div>
      </div>
    );
  }

  // Loading / Training State
  const hasPrediction = predictions && typeof predictions.prediction === 'number';

  // Loading State (Only if absolutely no data)
  if (loading && !predictions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <Activity className="w-12 h-12 text-teal animate-pulse" />
      </div>
    );
  }

  // Safe destructuring with defaults to prevent crashes
  const { 
    prediction = 75, 
    biologicalAge = 30, 
    base = 80, 
    featureImportance = [], 
    recommendations = { positive: [], negative: [] }, 
    survivalCurve = [], 
    confidenceInterval = [70, 80],
    modelUsed = 'Deep Neural Network'
  } = predictions || {};

  const currentAge = parseFloat(userData?.age) || 30;
  const score = Math.min(100, Math.max(0, (prediction / 100) * 100));
  const yearsRemaining = Math.max(0, prediction - currentAge).toFixed(1);
  
  const riskLevel = score < 50 ? 'HIGH' : score < 75 ? 'MODERATE' : 'LOW';
  const riskColor = riskLevel === 'HIGH' ? 'text-danger border-danger' : riskLevel === 'MODERATE' ? 'text-amber border-amber' : 'text-teal border-teal';

  // Null safe radar formulation
  const getVal = (val, dflt) => parseFloat(val) || dflt;
  const adjustedRadarData = [
    { subject: 'Diet', score: 50 + getVal(userData?.diet, 0) * 15, ideal: 90 },
    { subject: 'Exercise', score: 50 + getVal(userData?.exercise_level, 0) * 15, ideal: 90 },
    { subject: 'Sleep', score: 100 - Math.abs(7.5 - getVal(userData?.sleep, 7.5)) * 15, ideal: 95 },
    { subject: 'Stress', score: 100 - getVal(userData?.stress, 0) * 25, ideal: 90 }, 
    { subject: 'Clean Living', score: 100 - getVal(userData?.smoking, 0) * 30 - (getVal(userData?.alcohol, 0) / 30) * 40, ideal: 95 },
    { subject: 'Health Base', score: 100 - getVal(userData?.chronic_disease, 0) * 15, ideal: 90 }
  ];

  const topRisks = (featureImportance || []).filter(f => f?.impact > 0.5).slice(0, 3);
  const topProtective = (featureImportance || []).filter(f => f?.impact < -0.5).slice(0, 3);

  const handleDownload = () => {
    generateLongevityAudit(userData, predictions, 'dashboard-content');
  };

  return (
    <motion.div 
      id="dashboard-content"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto print:pt-8 print:px-0 print:bg-white print:text-black"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2 text-text-light dark:text-white">LifeScope Insights</h1>
          <div className="flex items-center gap-2 text-teal text-sm font-mono">
            <Zap className="w-4 h-4" /> Powered by {modelUsed}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-6 md:mt-0 print:hidden">
          {isTraining && (
            <div className="flex items-center gap-2 text-xs text-teal animate-pulse mr-4 bg-teal/5 px-3 py-2 rounded-full border border-teal/20">
              <RefreshCcw className="w-3 h-3 animate-spin" />
              AI Calibrating...
            </div>
          )}
          <button onClick={() => navigate('/history')} className="btn-secondary flex items-center gap-2 py-2 text-sm">
            <ClipboardList className="w-4 h-4" /> History
          </button>
          <button onClick={() => navigate('/action-plan')} className="btn-primary flex items-center gap-2 py-2 text-sm">
            <Activity className="w-4 h-4" /> Action Plan
          </button>
          <button onClick={handleDownload} className="btn-secondary flex items-center gap-2 py-2 text-sm">
            <Download className="w-4 h-4" /> PDF Report
          </button>
          <button onClick={() => navigate('/simulate')} className="btn-secondary flex items-center gap-2 py-2 text-sm">
            <Settings className="w-4 h-4" /> Simulator
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Main Score & Vital Stats */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-panel p-8 flex flex-col items-center">
            <LifeScoreGauge biologicalAge={biologicalAge} chronologicalAge={currentAge} yearsPredicted={prediction} />
            <div className={`mt-6 px-6 py-2 rounded-full border ${riskColor} bg-surface-light dark:bg-surface-dark font-bold text-xs tracking-[0.2em]`}>
              {riskLevel} RISK PROFILE
            </div>
            
            <div className="mt-8 w-full space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400 text-sm">Biological Age</span>
                <span className="text-2xl font-bold text-text-light dark:text-white">{biologicalAge} yrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-gray-400 text-sm">Chrono Age</span>
                <span className="text-xl font-medium text-slate-900 dark:text-white">{currentAge} yrs</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-text-light dark:text-gray-200">
              <Activity className="w-5 h-5 text-teal" /> Clinical Markers
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-end border-b border-border-light/20 dark:border-border-dark/20 pb-3">
                <span className="text-slate-600 dark:text-gray-400 text-sm">Prediction Range</span>
                <span className="font-mono text-teal font-bold">{confidenceInterval[0] || base} - {confidenceInterval[1] || base} yrs</span>
              </div>
              <div className="flex justify-between items-end border-b border-border-light/20 dark:border-border-dark/20 pb-3">
                <span className="text-slate-600 dark:text-gray-400 text-sm">Expected Remaining</span>
                <span className="font-mono text-text-light dark:text-white font-bold">{yearsRemaining} yrs</span>
              </div>
              <div className="flex justify-between items-end border-b border-border-light/20 dark:border-border-dark/20 pb-3">
                <span className="text-slate-600 dark:text-gray-400 text-sm">Model Accuracy (R²)</span>
                <span className="font-mono text-emerald-500 dark:text-emerald-400 font-bold">0.89</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Charts & Explainability */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Survival Probability Curve */}
            <div className="glass-panel p-8">
              <h3 className="font-bold text-lg mb-6 text-text-light dark:text-gray-200">Survival Probability</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={survivalCurve || []}>
                    <defs>
                      <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00F5D4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00F5D4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1F2937" : "#E2E8F0"} />
                    <XAxis dataKey="age" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: isDark ? '#111827' : '#FFF', borderColor: '#00F5D4' }}
                      itemStyle={{ color: '#00F5D4' }}
                    />
                    <Area type="monotone" dataKey="probability" stroke="#00F5D4" fillOpacity={1} fill="url(#colorProb)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-gray-500 mt-4 uppercase tracking-widest text-center">Age (Years)</p>
            </div>

            {/* Radar Lifestyle Chart */}
            <div className="glass-panel p-8">
              <h3 className="font-bold text-lg mb-6 text-text-light dark:text-gray-200">Biomarker Balance</h3>
              <RiskRadar data={adjustedRadarData} />
            </div>
          </div>

          {/* Explainable AI: Feature Importance */}
          <div className="glass-panel p-8">
            <h3 className="font-bold text-lg mb-6 text-text-light dark:text-gray-200 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" /> Explainable AI: Feature Importance
            </h3>
            
            <div className="space-y-6">
              <div className="bg-surface-light dark:bg-surface-dark/50 p-6 rounded-2xl border border-border-light/40 dark:border-border-dark/20">
                <p className="text-sm leading-relaxed text-slate-800 dark:text-gray-300">
                  <strong className="text-teal">AI Insight:</strong> Your longevity trajectory is primarily driven by 
                  <span className="mx-1 font-bold text-slate-950 dark:text-white">
                    {topProtective.length > 0 ? topProtective[0]?.name : 'baseline health metrics'}
                  </span> 
                  acting as a protective factor, while 
                  <span className="mx-1 font-bold text-danger">
                    {topRisks.length > 0 ? topRisks[0]?.name : 'lifestyle stressors'}
                  </span> 
                  present the largest opportunity for improvement.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {topRisks.map((risk, i) => (
                  <div key={i} className="bg-danger/5 border border-danger/20 rounded-2xl p-5">
                    <div className="text-[10px] uppercase tracking-widest text-danger mb-2 font-bold">Years Impact</div>
                    <div className="text-2xl font-bold text-danger font-mono mb-1">-{Math.abs(risk?.impact || 0).toFixed(1)}</div>
                    <div className="text-sm font-semibold text-text-light dark:text-gray-200">{risk?.name}</div>
                  </div>
                ))}
                {topProtective.map((prot, i) => (
                  <div key={i} className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
                    <div className="text-[10px] uppercase tracking-widest text-emerald-400 mb-2 font-bold">Protective Bonus</div>
                    <div className="text-2xl font-bold text-emerald-400 font-mono mb-1">+{Math.abs(prot?.impact || 0).toFixed(1)}</div>
                    <div className="text-sm font-semibold text-text-light dark:text-gray-200">{prot?.name}</div>
                  </div>
                ))}
                {topRisks.length === 0 && topProtective.length === 0 && (
                  <div className="col-span-3 text-center text-gray-500 py-4">No significant variations detected from baseline.</div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-panel p-8 border-l-4 border-l-danger/50">
              <h3 className="font-bold text-lg mb-4 text-danger flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Critical Improvements
              </h3>
              <ul className="space-y-4">
                {(recommendations?.negative || []).map((rec, i) => (
                  <li key={i} className="text-sm text-gray-800 dark:text-gray-300 flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-panel p-8 border-l-4 border-l-teal">
              <h3 className="font-bold text-lg mb-4 text-teal flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Protective Strengths
              </h3>
              <ul className="space-y-4">
                {(recommendations?.positive || []).map((rec, i) => (
                  <li key={i} className="text-sm text-gray-800 dark:text-gray-300 flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal mt-1.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
        </div>
      </div>
    </motion.div>
  );
}
