import { calculateActuarialLifespan } from './actuarial';
import { healthModel } from './model';

export const loadModel = async () => {
  await healthModel.init();
};

export const predictLifespan = async (userData) => {
  // Always get the actuarial baseline for modifiers and structure
  const actuarialResult = calculateActuarialLifespan(userData);
  
  try {
    // Run the Neural Model prediction
    const neuralModifier = await healthModel.predict(userData);
    
    // Combine Actuarial baseline with Neural intelligence
    // We'll use the Neural Model to "fine-tune" the result
    // In this implementation, the neuralModifier is a direct addition to the baseline
    const finalPrediction = Math.min(100, Math.max(userData.age + 1, actuarialResult.prediction + (neuralModifier / 10)));
    
    return { 
      ...actuarialResult, 
      prediction: parseFloat(finalPrediction.toFixed(1)),
      modelUsed: 'Hybrid Neural-Actuarial Engine' 
    };
  } catch (e) {
    console.error("Neural Inference error, falling back to Actuarial:", e);
    return { ...actuarialResult, modelUsed: 'Actuarial Formula' };
  }
};
