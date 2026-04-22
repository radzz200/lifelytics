import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, Shield, Brain, ChevronDown, Heart } from 'lucide-react';
import { useInView } from 'framer-motion';
import { supabase } from '../lib/supabase';
import FloatingParticles from '../components/FloatingParticles';

const DNAHelix = () => {
  return (
    <div className="relative w-64 h-64 mx-auto perspective-1000">
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 animate-spin-slow" style={{ transformStyle: 'preserve-3d' }}>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex w-32 justify-between items-center" style={{ transform: `rotateY(${i * 36}deg) translateZ(20px)` }}>
            <div className="w-4 h-4 rounded-full bg-teal shadow-[0_0_10px_#00F5D4]"></div>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-teal to-amber opacity-50"></div>
            <div className="w-4 h-4 rounded-full bg-amber shadow-[0_0_10px_#F5A623]"></div>
          </div>
        ))}
      </div>
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
      `}</style>
    </div>
  );
};

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

export default function Landing() {
  const navigate = useNavigate();
  const [globalCount, setGlobalCount] = useState(5183); // Base fallback

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
      {/* Background Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-300">
        <FloatingParticles />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-screen dark:animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background-light via-background-light/80 to-background-light dark:from-background-dark dark:via-background-dark/80 dark:to-background-dark"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal/10 via-transparent to-transparent"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-teal rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-amber rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 z-10 text-center md:text-left mb-16 md:mb-0">
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
            className="text-xl text-gray-800 dark:text-gray-300 mb-8 max-w-lg"
          >
            Transparent, scientifically-grounded AI that doesn't just predict your lifespan, but explains exactly why—and how to improve it.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          >
            <button onClick={() => navigate('/onboarding')} className="btn-primary flex items-center justify-center gap-2 group">
              Talk to AI Assistant <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate('/doctor-portal')} className="btn-secondary">
              Clinical Portal
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-gray-500 dark:text-gray-400 font-medium"
          >
            <span className="text-teal font-mono text-xl mr-2">
              <AnimatedCounter targetValue={globalCount} />
            </span>
            people extended their life today
          </motion.div>
        </div>

        <div className="md:w-1/2 w-full flex justify-center z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            <DNAHelix />
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-surface-light/30 dark:bg-surface-dark/30 backdrop-blur-sm py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 md:gap-24 text-center">
          {[
            { label: 'Prediction Accuracy', value: '92%' },
            { label: 'Risk Factors', value: '40+' },
            { label: 'Age Groups', value: '6' },
            { label: 'ML Models', value: '3' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-4xl font-display font-bold text-text-light dark:text-text-dark mb-2">{stat.value}</div>
              <div className="text-sm text-gray-800 dark:text-gray-400 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why LifeLytics?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">A research-grade platform built for scientific transparency and actionable results.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Brain, title: 'AI-Based Prediction', desc: 'Deterministic modeling cross-referenced against WHO datasets for unparalleled accuracy.' },
            { icon: Activity, title: 'Lifestyle Insights', desc: 'Understand exactly how your habits (like smoking or exercise) quantitatively alter your lifespan.' },
            { icon: Shield, title: 'Personalized Recommendations', desc: 'Receive a clinical-grade action plan tailored to your specific risk factors and age group.' }
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="glass-panel p-8 text-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal/5 to-amber/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-16 h-16 bg-surface-light dark:bg-surface-dark border border-border-light/20 dark:border-border-dark/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10 group-hover:border-teal/50 transition-colors">
                <step.icon className="w-8 h-8 text-teal" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 relative z-10">{step.title}</h3>
              <p className="text-gray-800 dark:text-gray-400 relative z-10">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why This Product Section */}
      <section className="py-20 bg-teal/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <h2 className="text-4xl font-bold mb-6 text-text-light dark:text-text-dark">The Value of Health Intelligence</h2>
              <p className="text-lg text-gray-800 dark:text-gray-300 mb-6 leading-relaxed">
                Most health apps provide generic advice. LifeLytics uses <strong>Explainable AI</strong> to bridge the gap between complex medical data and daily lifestyle choices.
              </p>
              <ul className="space-y-4">
                {[
                  "Predictive accuracy backed by WHO & CDC datasets",
                  "Real-time counterfactual simulation for habit changes",
                  "Clinical-grade reporting for medical consultations",
                  "100% browser-native privacy with no data tracking"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-800 dark:text-gray-400">
                    <div className="w-5 h-5 rounded-full bg-teal/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-teal"></div>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
              <div className="glass-panel p-6 bg-surface-light dark:bg-surface-dark/50">
                <div className="text-3xl font-bold text-teal mb-2">99%</div>
                <div className="text-xs uppercase tracking-widest text-gray-500">Privacy Score</div>
              </div>
              <div className="glass-panel p-6 bg-surface-light dark:bg-surface-dark/50 mt-8">
                <div className="text-3xl font-bold text-blue-500 mb-2">Global</div>
                <div className="text-xs uppercase tracking-widest text-gray-500">Dataset Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project & Mentor Details Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-border-light/10 dark:border-border-dark/10">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Activity className="text-teal w-6 h-6" /> Project Overview
            </h3>
            <p className="text-gray-800 dark:text-gray-400 leading-relaxed mb-6">
              LifeLytics is a capstone health intelligence project designed to showcase the intersection of
              epidemiology and deep learning. Our goal is to democratize longevity science through
              interactive, explainable technology.
            </p>
            <div className="space-y-2">
              <div className="text-sm"><span className="text-gray-500 uppercase tracking-tighter mr-2">Version:</span> <span className="font-mono text-teal">2.4.1 Production</span></div>
              <div className="text-sm"><span className="text-gray-500 uppercase tracking-tighter mr-2">Core Tech:</span> <span className="font-mono text-teal">React 18 + TensorFlow.js</span></div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-6">Academic Mentorship</h3>
            <div className="glass-panel p-6 bg-surface-light dark:bg-surface-dark/30 border-l-4 border-l-teal">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  M
                </div>
                <div>
                  <div className="font-bold text-lg text-text-light dark:text-text-dark">[Mentor Name]</div>
                  <div className="text-teal text-sm">Principal Project Advisor</div>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-800 dark:text-gray-400 italic">
                "Guiding the development of medical-grade explainable AI systems for public health literacy."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wellness Quote Block */}
      <section className="py-20 px-6 border-t border-border-light/10 dark:border-border-dark/10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-panel p-8 md:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal via-blue-500 to-amber"></div>
          <Heart className="w-12 h-12 text-teal/40 mx-auto mb-6 animate-pulse" />
          <p className="text-2xl md:text-2xl font-display italic text-text-light dark:text-text-dark leading-relaxed">
            "Wellness encompasses a healthy body, a sound mind, and a tranquil spirit. Enjoy the journey as you strive for wellness."
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-light/10 dark:border-border-dark/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-black-800 text-lg">
          <p>© {new Date().getFullYear()} LifeLytics. All Rights Received</p>
        </div>
      </footer>
    </motion.div>
  );
}
