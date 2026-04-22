import { calculateLifespan } from './healthPredictEngine';
import { predictLife, explain } from './gbdtEngine';
import modelData from './model.json';

export const loadModel = async (onProgress) => {
  // Model is loaded via static import for speed
  if (onProgress) onProgress({ model: 'AI Engine (GBDT)', current: 100, total: 100 });
  return true;
};

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

/**
 * Fast, deterministic baseline prediction (Instant)
 */
export const predictLifespanFast = (userData) => {
  const result = calculateLifespan(userData);
  const currentAge = parseFloat(userData.age) || 30;
  
  return {
    prediction: result.prediction,
    biologicalAge: parseFloat((currentAge + 80 - result.prediction).toFixed(1)),
    base: result.base,
    featureImportance: Object.entries(result.modifiers).map(([name, impact]) => ({ name, impact })),
    recommendations: { positive: ["AI Insights Loading..."], negative: ["Calibrating Engine..."] },
    survivalCurve: [],
    confidenceInterval: [result.prediction - 5, result.prediction + 5],
    modelUsed: 'Deterministic Baseline',
    isBaseline: true
  };
};

export const predictLifespan = async (userData) => {
  try {
    // 1. Run GBDT Prediction
    const result = predictLife(modelData, userData);
    const prediction = result.predicted_lifespan;
    
    // 2. Run Explanation Engine
    const explanation = explain(userData, prediction);
    
    // 3. Map to UI format
    const currentAge = parseFloat(userData.age) || 30;
    
    // Survival curve (Deterministic based on prediction)
    const survivalCurve = Array.from({length: 19}, (_, i) => {
      const age = 20 + i * 5;
      const prob = age > prediction ? Math.exp(-(age-prediction)/10) : 1 - 0.1 * Math.exp((age-prediction)/10);
      return { age, probability: clamp(prob * 100, 0, 100) };
    });

    return { 
      prediction,
      biologicalAge: parseFloat((currentAge + 80 - prediction).toFixed(1)),
      base: userData.gender === 'female' ? 81 : 79,
      featureImportance: [
        ...explanation.risk_factors.map(r => ({ name: r.factor, impact: parseFloat(r.impact) })),
        ...explanation.protective_factors.map(p => ({ name: p.factor, impact: parseFloat(p.benefit) }))
      ],
      explanation, 
      recommendations: { 
        positive: explanation.protective_factors.map(f => `${f.factor}: ${f.benefit} - ${f.reason}`),
        negative: explanation.improvements.map(i => `${i.action} (+${i.gain_years} yrs)`)
      },
      survivalCurve,
      confidenceInterval: [result.confidence_low, result.confidence_high],
      modelUsed: 'GBDT Adaptive Engine' 
    };
  } catch (e) {
    console.error("GBDT Inference error:", e);
    // Fallback to fast prediction
    return predictLifespanFast(userData);
  }
};
