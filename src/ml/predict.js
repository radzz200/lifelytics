import { healthModel } from './model';
import { calculateLifespan } from './healthPredictEngine';

export const loadModel = async (onProgress) => {
  await healthModel.init(onProgress);
};

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

/**
 * Fast, deterministic baseline prediction (Instant)
 */
export const predictLifespanFast = (userData) => {
  const result = calculateLifespan(userData);
  const currentAge = parseFloat(userData.age) || 30;
  
  // Minimal set for instant display
  return {
    prediction: result.prediction,
    biologicalAge: parseFloat((currentAge + 80 - result.prediction).toFixed(1)),
    base: result.base,
    featureImportance: Object.entries(result.modifiers).map(([name, impact]) => ({ name, impact })),
    recommendations: { positive: ["Calculating AI Insights..."], negative: ["Optimizing Engine..."] },
    survivalCurve: [],
    confidenceInterval: [result.prediction - 5, result.prediction + 5],
    modelUsed: 'Fast Actuarial Baseline',
    isBaseline: true
  };
};

export const predictLifespan = async (userData) => {
  if (!healthModel.isLoaded) {
    await healthModel.init();
  }

  try {
    // Run the Neural Model prediction
    const prediction = await healthModel.predict(userData);
    
    // Feature Importance
    const featureImportance = await healthModel.calculateFeatureImportance(userData, prediction);
    
    // Recommendations
    const recommendations = { positive: [], negative: [] };
    featureImportance.forEach(imp => {
      if (imp.impact < -1) {
        if (imp.name === "Smoking") recommendations.negative.push("Quitting smoking is the #1 way to gain years.");
        if (imp.name === "Blood Pressure") recommendations.negative.push("Lowering BP is critical for heart longevity.");
        if (imp.name === "Stress") recommendations.negative.push("High stress is accelerating cellular aging. Try meditation.");
        if (imp.name === "BMI") recommendations.negative.push("Bringing BMI to 22-25 will significantly reduce metabolic strain.");
        if (imp.name === "Alcohol") recommendations.negative.push("Reducing alcohol intake will lower systemic inflammation.");
      } else if (imp.impact > 0.5) {
        if (imp.name === "Exercise") recommendations.positive.push("Your activity level is providing a strong protective bonus.");
        if (imp.name === "Sleep") recommendations.positive.push("Excellent sleep habits are supporting your recovery.");
      }
    });
    if (recommendations.negative.length === 0) recommendations.negative.push("Maintain current healthy trajectory.");
    if (recommendations.positive.length === 0) recommendations.positive.push("Keep up the good work.");

    // Survival curve
    const survivalCurve = Array.from({length: 19}, (_, i) => {
      const age = 20 + i * 5;
      const prob = age > prediction ? Math.exp(-(age-prediction)/10) : 1 - 0.1 * Math.exp((age-prediction)/10);
      return { age, probability: clamp(prob * 100, 0, 100) };
    });

    const isFemale = userData.gender === 'female';
    const currentAge = parseFloat(userData.age) || 30;

    return { 
      prediction: parseFloat(prediction.toFixed(1)),
      biologicalAge: parseFloat((currentAge + 80 - prediction).toFixed(1)), // Simple bio age heuristic
      base: isFemale ? 82 : 78,
      featureImportance,
      recommendations,
      survivalCurve,
      confidenceInterval: [Math.round(prediction - 3), Math.round(prediction + 3)],
      modelUsed: 'Deep Neural Network (TFJS)' 
    };
  } catch (e) {
    console.error("Neural Inference error:", e);
    throw new Error("Failed to run prediction: " + e.message);
  }
};
