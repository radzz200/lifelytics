import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { ArrowLeft, BrainCircuit, Activity, HeartPulse, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { processHealthData } from '../ml/healthPredictEngine';

export default function DoctorPortal() {
  const navigate = useNavigate();
  const [rawData, setRawData] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Filters State
  const [ageFilter, setAgeFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [diseaseFilter, setDiseaseFilter] = useState('All');

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const handleParsedData = (json) => {
      try {
        setRawData(json);
        const result = processHealthData(json);
        setData(result);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to analyze cohort data.");
      } finally {
        setLoading(false);
      }
    };

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => handleParsedData(results.data),
        error: (err) => {
          setError(`CSV parsing error: ${err.message}`);
          setLoading(false);
        }
      });
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = new Uint8Array(e.target.result);
          const workbook = XLSX.read(buffer, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheet];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          handleParsedData(json);
        } catch (err) {
          setError("Excel parsing error.");
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError("Unsupported file format. Please use CSV or Excel.");
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  });

  // Apply Filters when they change
  useEffect(() => {
    if (!rawData) return;
    
    let filtered = rawData;

    // Age Filter
    if (ageFilter !== 'All') {
      filtered = filtered.filter(row => {
        const age = parseInt(row.age) || 50;
        if (ageFilter === '18-30') return age >= 18 && age < 30;
        if (ageFilter === '30-45') return age >= 30 && age < 45;
        if (ageFilter === '45-75') return age >= 45 && age < 75;
        if (ageFilter === '75+') return age >= 75;
        return true;
      });
    }

    // Gender Filter
    if (genderFilter !== 'All') {
      filtered = filtered.filter(row => {
        const gender = (row.gender || '').toLowerCase();
        return gender.startsWith(genderFilter.toLowerCase());
      });
    }

    // Disease Filter
    if (diseaseFilter !== 'All') {
      filtered = filtered.filter(row => {
        if (diseaseFilter === 'Heart Disease') return parseInt(row.heart_disease) === 1;
        if (diseaseFilter === 'Diabetes') return parseInt(row.diabetes) === 1;
        if (diseaseFilter === 'Stroke') return parseInt(row.stroke) === 1;
        if (diseaseFilter === 'None') return parseInt(row.heart_disease) !== 1 && parseInt(row.diabetes) !== 1 && parseInt(row.stroke) !== 1;
        return true;
      });
    }

    try {
      if (filtered.length === 0) {
        setData(null);
        setError("No records match the selected filters.");
      } else {
        setError(null);
        setData(processHealthData(filtered));
      }
    } catch (err) {
      setData(null);
      setError(err.message);
    }
  }, [ageFilter, genderFilter, diseaseFilter, rawData]);

  const clearFilters = () => {
    setAgeFilter('All');
    setGenderFilter('All');
    setDiseaseFilter('All');
  };

  const renderFilterPanel = () => (
    <div className="bg-surface/80 p-4 rounded-xl border border-border/50 flex flex-wrap gap-4 items-end mb-8">
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Age Group</label>
        <select 
          value={ageFilter} 
          onChange={(e) => setAgeFilter(e.target.value)}
          className="bg-navy border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-teal"
        >
          <option value="All">All Ages</option>
          <option value="18-30">18 - 30</option>
          <option value="30-45">30 - 45</option>
          <option value="45-75">45 - 75</option>
          <option value="75+">75+</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gender</label>
        <select 
          value={genderFilter} 
          onChange={(e) => setGenderFilter(e.target.value)}
          className="bg-navy border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-teal"
        >
          <option value="All">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Chronic Conditions</label>
        <select 
          value={diseaseFilter} 
          onChange={(e) => setDiseaseFilter(e.target.value)}
          className="bg-navy border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-teal"
        >
          <option value="All">Any / None</option>
          <option value="Heart Disease">Heart Disease</option>
          <option value="Diabetes">Diabetes</option>
          <option value="Stroke">Stroke</option>
          <option value="None">Healthy (No Chronic)</option>
        </select>
      </div>

      {(ageFilter !== 'All' || genderFilter !== 'All' || diseaseFilter !== 'All') && (
        <button onClick={clearFilters} className="text-sm text-red-400 hover:text-red-300 underline py-2 ml-auto">
          Clear Filters
        </button>
      )}
    </div>
  );

  const renderTab1 = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 bg-gradient-to-br from-surface to-surface/50 border-teal/20 text-center">
          <div className="text-xs font-bold text-teal uppercase tracking-widest mb-2">Total Records</div>
          <div className="text-4xl font-bold font-mono text-white">{data.overview.totalRecords}</div>
        </div>
        <div className="glass-panel p-6 bg-gradient-to-br from-surface to-surface/50 border-blue-500/20 text-center">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Average Age</div>
          <div className="text-4xl font-bold font-mono text-white">{data.overview.avgAge}</div>
        </div>
        <div className="glass-panel p-6 bg-gradient-to-br from-surface to-surface/50 border-amber-500/20 text-center">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Average BMI</div>
          <div className="text-4xl font-bold font-mono text-white">{data.overview.avgBmi}</div>
        </div>
        <div className="glass-panel p-6 bg-gradient-to-br from-surface to-surface/50 border-rose-500/20 text-center">
          <div className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-2">Heart Disease</div>
          <div className="text-4xl font-bold font-mono text-white">{data.overview.heartDiseasePct}%</div>
        </div>
      </div>
      
      <div className="glass-panel p-6">
        <h3 className="text-xl font-bold mb-6 text-gray-200">Age Group Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.overview.ageDistribution} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <RechartsTooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} cursor={{fill: '#1f2937'}} />
              <Bar dataKey="value" fill="#00F5D4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderTab2 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {data.ageGroups.map((group, idx) => (
        <div key={idx} className="glass-panel p-6 flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <h3 className="text-2xl font-bold text-teal mb-1">{group.group} Years</h3>
            <p className="text-sm text-gray-400 mb-4">{group.count} people ({group.percent}% of dataset)</p>
            
            <div className="space-y-3">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-gray-300">Avg Lifespan</span>
                <span className="font-bold text-white">{group.avgLifespan} yrs</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-gray-300">Smokers</span>
                <span className="font-bold text-white">{group.smokersCount} ({group.smokersPct}%)</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-gray-300">Drinkers</span>
                <span className="font-bold text-white">{group.drinkersCount} ({group.drinkersPct}%)</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-gray-300">Regular Exercisers</span>
                <span className="font-bold text-white">{group.exercisersCount} ({group.exercisersPct}%)</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-gray-300">Heart Disease</span>
                <span className="font-bold text-white">{group.hdCount} ({group.hdPct}%)</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-gray-300">Diabetes</span>
                <span className="font-bold text-white">{group.diaCount} ({group.diaPct}%)</span>
              </div>
            </div>
          </div>
          <div className="md:w-2/3 bg-surface/50 rounded-xl p-6 border border-border/30">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Health Summary</h4>
            <div className="text-gray-200 leading-relaxed whitespace-pre-wrap mb-4">
              {group.narrative}
            </div>
            {group.recommendation && (
              <div className="mt-4 inline-flex items-center gap-2 bg-blue-500/10 text-blue-300 px-4 py-2 rounded-lg text-sm font-medium">
                <Activity className="w-4 h-4" /> Recommendation: {group.recommendation}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTab3 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {data.combinations.map((combo, idx) => {
        const isHighRisk = combo.risk === "HIGH RISK";
        const isLowRisk = combo.risk === "LOW RISK";
        return (
          <div key={idx} className={`glass-panel p-6 border-l-4 ${isHighRisk ? 'border-l-red-500' : isLowRisk ? 'border-l-teal' : 'border-l-amber-500'}`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-white">{combo.name}</h3>
              <div className="text-right">
                <div className={`text-2xl font-bold font-mono ${isHighRisk ? 'text-red-400' : isLowRisk ? 'text-teal' : 'text-amber-400'}`}>
                  {combo.lifespan} years
                </div>
                <div className={`text-xs font-bold uppercase tracking-wider ${isHighRisk ? 'text-red-500' : isLowRisk ? 'text-teal/70' : 'text-amber-500'}`}>
                  [{combo.risk}]
                </div>
              </div>
            </div>
            <div className="bg-surface/50 p-4 rounded-xl border border-border/30">
              <p className="text-sm text-gray-300 leading-relaxed">
                <span className="text-gray-500 font-semibold mr-2">Factors:</span> 
                {combo.factors}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTab4 = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="glass-panel p-8 text-center bg-gradient-to-b from-surface to-surface/30">
        <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
          This analysis covers <strong className="text-white">{data.summary.totalRecords}</strong> individuals across different age groups, lifestyle habits, and health conditions.
          The overall average life expectancy for this dataset is <strong className="text-teal text-xl">{data.summary.avgLifespan}</strong> years.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-panel p-6 border border-red-500/20">
          <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
            <HeartPulse className="w-5 h-5" /> Top 5 Risk Factors
          </h3>
          <div className="space-y-4">
            {data.summary.topRisks.map((risk, idx) => (
              <div key={idx} className="flex flex-col border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-200">{idx + 1}. {risk.name}</span>
                  <span className="text-red-400 text-sm font-bold">~{risk.impact} years lost</span>
                </div>
                <span className="text-sm text-gray-400">Affects {risk.count} people ({risk.percent}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 border border-emerald-500/20">
          <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5" /> Protective Factors
          </h3>
          <div className="space-y-6">
            <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
              <div className="font-semibold text-emerald-300 mb-1">Regular Exercise</div>
              <p className="text-sm text-gray-300">{data.summary.protective.exercise.count} people ({data.summary.protective.exercise.pct}%) → Adds 3-9 years to lifespan</p>
            </div>
            <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
              <div className="font-semibold text-emerald-300 mb-1">Healthy BMI (18.5 - 25)</div>
              <p className="text-sm text-gray-300">{data.summary.protective.healthyBmi.count} people ({data.summary.protective.healthyBmi.pct}%) → Maintains baseline lifespan</p>
            </div>
            <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
              <div className="font-semibold text-emerald-300 mb-1">No Chronic Diseases</div>
              <p className="text-sm text-gray-300">{data.summary.protective.noChronic.count} people ({data.summary.protective.noChronic.pct}%) → Preserves longevity</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="glass-panel p-6">
        <h3 className="text-xl font-bold text-white mb-4">Age Group Recommendations</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.ageGroups.map((g, i) => (
             <div key={i} className="bg-surface/50 p-4 rounded-xl border border-border/50">
               <div className="text-teal font-bold mb-2">{g.group}</div>
               <div className="text-sm text-gray-300">{g.recommendation}</div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto"
    >
      <button onClick={() => navigate('/')} className="text-teal hover:underline flex items-center gap-2 mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>

      {!rawData ? (
        <div className="max-w-2xl mx-auto mt-12">
          <h2 className="text-4xl font-display font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-teal to-blue-500">
            LifeLytics Intelligence Engine
          </h2>
          <p className="text-gray-400 text-center mb-8 text-lg">
            Upload a health dataset to run our deterministic Lifespan Prediction Algorithm. Processed securely in your browser with zero backend delays.
          </p>
          
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 ${
              isDragActive ? 'border-teal bg-teal/10 scale-[1.02]' : 'border-border hover:border-teal/50 hover:bg-surface/50 hover:shadow-lg hover:shadow-teal/10'
            }`}
          >
            <input {...getInputProps()} />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <BrainCircuit className="w-16 h-16 text-teal mx-auto mb-6" />
            </motion.div>
            {isDragActive ? (
              <p className="text-teal font-medium text-xl">Drop the dataset here ...</p>
            ) : (
              <div>
                <p className="text-gray-200 text-xl font-medium mb-2">Drag & drop your CSV or Excel file here</p>
                <p className="text-gray-500">Must include: age, bmi, smoking, alcohol, exercise_level, heart_disease, etc.</p>
              </div>
            )}
          </div>
          
          {loading && (
             <div className="mt-8 text-center text-teal animate-pulse">
               Analyzing cohort data...
             </div>
          )}

          {error && (
            <div className="mt-8 text-center text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
              {error}
            </div>
          )}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          
          <div className="flex justify-between items-end border-b border-border/50 pb-4">
            <div>
              <h2 className="text-3xl font-display font-bold mb-1">LifeLytics Cohort Report</h2>
              <p className="text-teal flex items-center gap-2 text-sm">
                <CheckCircleIcon /> Successfully tracking dataset
              </p>
            </div>
            <button onClick={() => { setRawData(null); setData(null); clearFilters(); }} className="btn-secondary text-sm">
              Upload New Dataset
            </button>
          </div>

          {/* New Filter Panel */}
          {renderFilterPanel()}

          {error ? (
             <div className="text-center text-amber-400 bg-amber-500/10 p-8 rounded-xl border border-amber-500/20">
               {error}
             </div>
          ) : (
            <>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { id: 'overview', label: 'OVERVIEW' },
                  { id: 'ageGroups', label: 'AGE GROUP ANALYSIS' },
                  { id: 'combinations', label: 'LIFESTYLE COMBINATIONS' },
                  { id: 'summary', label: 'SUMMARY REPORT' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-xl text-sm font-bold tracking-wider transition-all whitespace-nowrap ${
                      activeTab === tab.id 
                        ? 'bg-teal text-navy shadow-lg shadow-teal/20' 
                        : 'bg-surface hover:bg-surface/80 text-gray-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-8">
                {activeTab === 'overview' && renderTab1()}
                {activeTab === 'ageGroups' && renderTab2()}
                {activeTab === 'combinations' && renderTab3()}
                {activeTab === 'summary' && renderTab4()}
              </div>
            </>
          )}

        </motion.div>
      )}
    </motion.div>
  );
}

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
