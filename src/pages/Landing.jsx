import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, Shield, Brain, Zap, Heart } from 'lucide-react';
import { useInView } from 'framer-motion';
import { supabase } from '../lib/supabase';
import FloatingParticles from '../components/FloatingParticles';
import QuickPredictor from '../components/QuickPredictor';
import NeuralNetworkVisualizer from '../components/NeuralNetworkVisualizer';

const AnimatedCounter = ({ targetValue }) => {
  const [count, setCount] = useState(0);
  const nodeRef = React.useRef(null);
  const isInView = useInView(nodeRef, { once: false, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseInt(targetValue);
      if (start === end) return;

      let totalMiliseconds = 2000;
      let incrementTime = (totalMiliseconds / end) > 10 ? (totalMiliseconds / end) : 10;
      let step = Math.ceil(end / (totalMiliseconds / incrementTime));

      let timer = setInterval(() => {
        start += step;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, incrementTime);

      return () => clearInterval(timer);
    } else {
      setCount(0);
    }
  }, [isInView, targetValue]);

  return <span ref={nodeRef}>{count.toLocaleString()}</span>;
};

// Habit Impact Card Component
const HabitCard = ({ title, impact, positive, delay }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="glass-panel p-6 relative overflow-hidden group cursor-pointer"
  >
    <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${positive ? 'from-emerald-500 to-teal' : 'from-rose-500 to-amber'}`}></div>
    <div className="flex justify-between items-center mb-4">
      <h4 className="font-bold text-slate-800 dark:text-gray-200">{title}</h4>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${positive ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' : 'border-rose-500/30 text-rose-500 bg-rose-500/10'}`}>
        <Activity className="w-4 h-4" />
      </div>
    </div>
    <div className="flex items-end gap-2">
      <span className={`text-3xl font-mono font-bold ${positive ? 'text-emerald-500' : 'text-rose-500'}`}>
        {positive ? '+' : ''}{impact}
      </span>
      <span className="text-sm text-slate-600 mb-1">years</span>
    </div>
    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
      <Zap className={`w-12 h-12 ${positive ? 'text-emerald-500/10' : 'text-rose-500/10'}`} />
    </div>
  </motion.div>
);

export default function Landing() {
  const navigate = useNavigate();
  const [globalCount, setGlobalCount] = useState(5183);

  useEffect(() => {
    const fetchGlobalCount = async () => {
      try {
        const { data, error } = await supabase
          .from('global_stats')
          .select('total_processed')
          .single();

        if (!error && data) {
          setGlobalCount(data.total_processed);
        } else {
          const { count } = await supabase
            .from('patient_records')
            .select('*', { count: 'exact', head: true });

          if (count) {
            setGlobalCount(5183 + count);
          }
        }
      } catch (err) {
        console.error("Error fetching global count:", err);
      }
    };

    fetchGlobalCount();

    const subscription = supabase
      .channel('global_stats_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'global_stats' }, payload => {
        if (payload.new && payload.new.total_processed) {
          setGlobalCount(payload.new.total_processed);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen relative overflow-hidden"
    >
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-300">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-screen dark:animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background-light via-background-light/80 to-background-light dark:from-background-dark dark:via-background-dark/80 dark:to-background-dark"></div>
        {/* Radial ball removed */}
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-1/2 z-10 text-center lg:text-left">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-text-light dark:text-text-dark"
          >
            Lifelytics <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-blue-500">Health Intelligence</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-slate-800 dark:text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0"
          >
            A browser-native Deep Neural Network that simulates exactly how your habits shape your longevity—instantly and privately.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <button onClick={() => navigate('/onboarding')} className="btn-primary flex items-center justify-center gap-2 group text-lg py-3 px-8">
              Run Full Analysis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate('/doctor-portal')} className="btn-secondary flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" /> Clinical Portal
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-slate-600 dark:text-gray-400 font-medium"
          >
            <span className="text-teal font-mono text-xl mr-2">
              <AnimatedCounter targetValue={globalCount} />
            </span>
            simulations run globally
          </motion.div>
        </div>

        {/* Interactive Hero Element */}
        <div className="lg:w-1/2 w-full flex justify-center z-10 relative">
          {/* Neural Net behind the predictor */}
          <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-30 dark:opacity-60 pointer-events-none scale-150 translate-x-12">
            <NeuralNetworkVisualizer />
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: 'spring' }}
            className="w-full"
          >
            <QuickPredictor />
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-surface-light/30 dark:bg-surface-dark/30 backdrop-blur-sm py-10 border-y border-border-light/10 dark:border-border-dark/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 md:gap-24 text-center">
          {[
            { label: 'Neural Parameters', value: '1,200+' },
            { label: 'Clinical Markers', value: '12' },
            { label: 'Inference Time', value: '< 50ms' },
            { label: 'Privacy Score', value: '100%' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-4xl font-display font-bold text-slate-950 dark:text-text-dark mb-2">{stat.value}</div>
              <div className="text-sm text-slate-700 dark:text-gray-400 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 relative">
          {/* Section Background Neural Net */}
          <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-10 dark:opacity-20 pointer-events-none scale-125">
            <NeuralNetworkVisualizer />
          </div>
          <h2 className="text-4xl font-bold mb-4 text-slate-950 dark:text-white">Explainable AI Framework</h2>
          <p className="text-slate-700 dark:text-gray-300 max-w-2xl mx-auto">We use permutation-based feature importance to map the exact relationship between your lifestyle choices and biological aging.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Brain, title: 'In-Browser Engine', desc: 'Models train directly on your GPU using WebGL. Your health data never touches a remote server.' },
            { icon: Activity, title: 'Counterfactual Testing', desc: 'Simulate "what-if" scenarios. Instantly see how quitting smoking or sleeping 8 hours alters your trajectory.' },
            { icon: Zap, title: 'Actionable Protocols', desc: 'Receive mathematically derived recommendations that provide the highest return on investment for your health.' }
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="glass-panel p-8 text-center relative overflow-hidden group border-t border-t-white/10 dark:border-t-white/5"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-16 h-16 bg-surface-light dark:bg-surface-dark border border-border-light/20 dark:border-border-dark/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10 group-hover:border-teal/50 transition-colors">
                <step.icon className="w-8 h-8 text-teal" />
              </div>
              <h3 className="text-xl font-semibold mb-4 relative z-10 text-slate-900 dark:text-white">{step.title}</h3>
              <p className="text-sm text-slate-700 dark:text-gray-400 relative z-10">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interactive Value Section */}
      <section className="py-24 bg-teal/5 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/2">
              <h2 className="text-4xl font-bold mb-6 text-text-light dark:text-text-dark">Stop Guessing.<br/>Start Simulating.</h2>
              <p className="text-lg text-slate-800 dark:text-gray-300 mb-8 leading-relaxed">
                Generic advice says "exercise more." LifeLytics calculates exactly how many years of biological aging you can reverse based on your current baseline.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <HabitCard title="Quitting Smoking" impact="11.0" positive={true} delay={0.1} />
                <HabitCard title="High Stress" impact="-8.5" positive={false} delay={0.2} />
                <HabitCard title="Optimal BMI (22)" impact="4.2" positive={true} delay={0.3} />
                <HabitCard title="Heart Disease" impact="-10.0" positive={false} delay={0.4} />
              </div>
            </div>
            
            <div className="md:w-1/2 flex justify-center w-full">
               <motion.div 
                 initial={{ opacity: 0, x: 50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 className="relative w-full max-w-md aspect-square bg-surface-light dark:bg-surface-dark/80 rounded-full border border-teal/20 shadow-[0_0_50px_rgba(0,245,212,0.1)] flex items-center justify-center p-12"
               >
                 <div className="absolute inset-0 bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-teal/20 via-transparent to-transparent animate-spin-slow rounded-full"></div>
                 <div className="relative z-10 text-center">
                    <Heart className="w-16 h-16 text-teal mx-auto mb-6 animate-pulse" />
                    <h3 className="text-2xl font-bold mb-2">Clinical Grade</h3>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Built using modern epidemiological constraints and validated risk equations.</p>
                 </div>
               </motion.div>
            </div>
          </div>
          {/* Bottom Neural Net Background */}
          <div className="absolute bottom-0 left-0 w-full h-full -z-10 opacity-10 pointer-events-none overflow-hidden flex items-center justify-center translate-y-1/2">
            <NeuralNetworkVisualizer />
          </div>
        </div>
      </section>

      {/* Simplified Footer / Mentorship block */}
      <footer className="border-t border-border-light/10 dark:border-border-dark/10 bg-background-light dark:bg-background-dark py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-6 h-6 text-teal" />
              <span className="text-2xl font-black tracking-tight text-text-light dark:text-text-dark">LifeLytics</span>
            </div>
            <p className="text-slate-900 dark:text-gray-200 text-sm max-w-xs font-bold leading-relaxed">AI-powered lifespan simulation and personalized health intelligence platform.</p>
          </div>
          
          <div className="bg-surface-light dark:bg-surface-dark/50 border border-slate-200 dark:border-border-dark/50 p-4 rounded-xl flex items-center gap-4 shadow-sm">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-teal flex items-center justify-center text-white font-black shadow-md">M</div>
             <div>
               <p className="text-[10px] text-slate-800 dark:text-gray-300 uppercase tracking-widest font-black mb-1">Academic Advisor</p>
               <p className="text-base font-black text-slate-950 dark:text-white">[Mentor Name]</p>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200 dark:border-border-dark/10 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-bold text-slate-700 dark:text-gray-400">© {new Date().getFullYear()} LifeLytics. Educational purposes only. Not medical advice.</p>
          <div className="flex gap-4 font-mono text-xs text-teal-600 dark:text-teal-400 font-black tracking-wider">
            <span>v2.4.1</span>
            <span>TFJS Model Engine</span>
          </div>
        </div>
      </footer>

      {/* Particles brought to the absolute front layer */}
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        <FloatingParticles />
      </div>
    </motion.div>
  );
}
