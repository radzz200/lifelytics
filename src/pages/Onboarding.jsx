import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  User, 
  Brain, 
  History, 
  PlusCircle, 
  Trash2, 
  ChevronRight, 
  Activity,
  Download,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';

/**
 * Onboarding Component - Final High-Fidelity Build
 * Optimized with Clinical History Portal and Reduced Top Spacing.
 */
export default function Onboarding() {
  const [activeTab, setActiveTab] = useState('assessment'); // 'assessment' or 'history'
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Welcome to LifeLytics AI. To begin your high-fidelity assessment, what is your current age?' }
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const { updateUserData, engineEnabled } = useUser();

  // History Fetching
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('patient_records')
        .select('*')
        .order('id', { ascending: false });
      
      if (data) {
        setHistory(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const deleteRecord = async (id) => {
    if (window.confirm("Confirm deletion of clinical record?")) {
      const { error } = await supabase.from('patient_records').delete().eq('id', id);
      if (!error) setHistory(prev => prev.filter(r => r.id !== id));
    }
  };

  const loadRecord = (record) => {
    updateUserData(record.userdata || {});
    navigate('/dashboard');
  };

  // AI Chat Logic with Clinical Validations
  const questions = [
    { 
      field: 'age', 
      next: 'gender', 
      text: 'To begin your high-fidelity assessment, what is your current age?',
      type: 'number',
      validate: (v) => {
        const n = parseInt(v);
        if (isNaN(n)) return "Please enter a numeric value for your age.";
        if (n < 18) return "Clinical assessment is only available for adults (18+).";
        if (n > 120) return "Please enter a biologically plausible age (under 120).";
        return null;
      }
    },
    { 
      field: 'gender', 
      next: 'height', 
      text: 'Excellent. Please select your biological gender for baseline physiological calibration.',
      type: 'select',
      options: ['Male', 'Female', 'Other'],
      validate: (v) => {
        const val = v.toLowerCase();
        if (val === 'male' || val === 'female' || val === 'other') return null;
        return "Please select or type Male, Female, or Other.";
      }
    },
    { 
      field: 'height', 
      next: 'weight', 
      text: 'What is your current height in centimeters?',
      type: 'number',
      validate: (v) => {
        const n = parseInt(v);
        if (isNaN(n)) return "Please enter your height in centimeters (e.g., 175).";
        if (n < 50 || n > 250) return "Please enter a valid height between 50cm and 250cm.";
        return null;
      }
    },
    { 
      field: 'weight', 
      next: 'complete', 
      text: 'And your current weight in kilograms?',
      type: 'number',
      validate: (v) => {
        const n = parseInt(v);
        if (isNaN(n)) return "Please enter your weight in kilograms (e.g., 75).";
        if (n < 20 || n > 400) return "Please enter a valid weight between 20kg and 400kg.";
        return null;
      }
    }
  ];

  const handleSend = (overrideValue = null) => {
    const val = overrideValue || input;
    if (!val.trim() || !engineEnabled) return;
    
    const currentQuestion = questions[step];
    const error = currentQuestion.validate(val);

    if (error) {
      setMessages(prev => [
        ...prev, 
        { role: 'user', text: val },
        { role: 'bot', text: `⚠️ ${error}` }
      ]);
      setInput('');
      return;
    }

    const newMessages = [...messages, { role: 'user', text: val }];
    setMessages(newMessages);
    updateUserData({ [currentQuestion.field]: val });

    if (currentQuestion.next === 'complete') {
      setMessages(prev => [...prev, { role: 'bot', text: 'Neural engine initialized. Analyzing your biomarker trajectory...' }]);
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      setTimeout(() => {
        const nextQ = questions[step + 1];
        setMessages(prev => [...prev, { role: 'bot', text: nextQ.text }]);
        setStep(step + 1);
      }, 600);
    }
    
    setInput('');
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen pt-8 pb-12 px-8 max-w-6xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-12">
        <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('assessment')}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'assessment' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <PlusCircle className="w-4 h-4" /> New Assessment
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <History className="w-4 h-4" /> Clinical History
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'assessment' ? (
          <motion.div 
            key="assessment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-10">
              <h1 className="text-5xl font-black tracking-tighter text-slate-950 dark:text-white mb-3">AI Health Assessment</h1>
              <div className="flex justify-center items-center gap-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4" /> Neural Engine {engineEnabled ? 'Active' : 'Standby'}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[600px] relative">
              {!engineEnabled && (
                <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-12 text-center">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-rose-500/20 shadow-2xl">
                    <Activity className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-pulse" />
                    <h3 className="text-xl font-black text-slate-950 dark:text-white mb-2">Neural Link Interrupted</h3>
                    <p className="text-sm text-slate-500 font-bold mb-6">Please activate the Neural Engine in the navigation bar to proceed with high-fidelity assessment.</p>
                  </div>
                </div>
              )}

              <div className="flex-1 p-8 overflow-y-auto space-y-6">
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: msg.role === 'bot' ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[80%] p-5 rounded-3xl text-sm font-bold leading-relaxed ${
                      msg.role === 'bot' 
                        ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-950 dark:text-gray-200 rounded-bl-none border border-slate-100 dark:border-slate-800/50' 
                        : 'bg-teal text-slate-950 rounded-br-none shadow-lg shadow-teal/10'
                    }`}>
                      {msg.text}
                      
                      {/* Selection Options */}
                      {msg.role === 'bot' && i === messages.length - 1 && questions[step]?.type === 'select' && (
                        <div className="flex gap-2 mt-4 flex-wrap">
                          {questions[step].options.map(opt => (
                            <button
                              key={opt}
                              onClick={() => handleSend(opt)}
                              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal hover:text-slate-950 transition-all shadow-sm"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                <div ref={scrollRef} />
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <input 
                  type="text" 
                  value={input}
                  disabled={!engineEnabled}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={engineEnabled ? "Type your response..." : "Engine offline..."}
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal/20 transition-all dark:text-white"
                />
                <button 
                  onClick={handleSend}
                  disabled={!engineEnabled}
                  className="bg-teal text-slate-950 p-4 rounded-2xl hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-teal/10 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex justify-between items-end mb-10">
              <div>
                <h1 className="text-5xl font-black tracking-tighter text-slate-950 dark:text-white mb-3">Clinical History</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Global Patient Synchronization Layer</p>
              </div>
            </div>

            <div className="grid gap-6">
              {loadingHistory ? (
                <div className="p-20 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Syncing Database...</div>
              ) : history.length === 0 ? (
                <div className="p-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-500 font-bold">
                  No historical records found in the neural cloud.
                </div>
              ) : (
                history.map((record) => (
                  <motion.div 
                    key={record.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-8">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                        <User className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xl font-black text-slate-950 dark:text-white capitalize">{record.userdata?.gender || 'N/A'}, {record.userdata?.age}Y</span>
                          <span className="text-[10px] font-black bg-teal/10 text-teal px-2 py-0.5 rounded-full uppercase tracking-tighter">Clinical Log</span>
                        </div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          ID: {record.id.slice(0, 8)} • {new Date(record.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-12">
                      <div className="text-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Predicted</div>
                        <div className="text-2xl font-black text-teal font-mono">{record.prediction} <span className="text-xs">yrs</span></div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => loadRecord(record)}
                          className="px-6 py-3 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg"
                        >
                          Analyze <ChevronRight className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteRecord(record.id)}
                          className="p-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
