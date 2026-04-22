import * as tf from '@tensorflow/tfjs';
import { generateSyntheticData } from './trainingData';

/**
 * LifeLytics Neural Prediction Engine
 * A TFJS model trained on synthetic tabular data
 */
class HealthModel {
  constructor() {
    this.model = null;
    this.isLoaded = false;
    this.trainingPromise = null;
  }

  async init(onProgress) {
    if (this.isLoaded) return;
    if (this.trainingPromise) return this.trainingPromise;

    this.trainingPromise = (async () => {
      let model;
      try {
        // Try loading cached model for instant startup
        // Force a v3 engine with better training
        model = await tf.loadLayersModel('indexeddb://lifelytics-model-v3');
        model.compile({ optimizer: tf.train.adam(0.005), loss: 'meanSquaredError' });
        if (onProgress) onProgress({ model: 'AI Engine V3 (Cached)', current: 100, total: 100 });
      } catch (e) {
        // Define a more robust neural network
        model = tf.sequential();
        
        model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [12] }));
        model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 1, activation: 'linear' }));

        model.compile({ optimizer: tf.train.adam(0.005), loss: 'meanSquaredError' });
        
        if (onProgress) onProgress({ model: 'Synthesizing Biological Data', current: 10, total: 100 });
        
        const { X, y } = generateSyntheticData(2000);
        
        const xs = tf.tensor2d(X);
        const ys = tf.tensor2d(y, [y.length, 1]);
        
        await model.fit(xs, ys, {
          epochs: 25,
          batchSize: 32,
          shuffle: true,
          callbacks: {
            onEpochEnd: (epoch, logs) => {
              if (onProgress) {
                const pct = 10 + Math.round((epoch / 25) * 90);
                onProgress({ model: 'Deep Learning Calibration', current: pct, total: 100 });
              }
            }
          }
        });
        
        xs.dispose();
        ys.dispose();

        try { await model.save('indexeddb://lifelytics-model-v3'); } catch(e) {}
      }
      
      this.model = model;
      this.isLoaded = true;
    })();

    return this.trainingPromise;
  }

  /**
   * Maps complex user data object to a normalized 12-element feature array.
   * @param {Object} userData 
   */
  mapUserDataToFeatures(userData) {
    const age = (parseFloat(userData.age) || 30) / 100;
    
    const height = parseFloat(userData.height) || 170;
    const weight = parseFloat(userData.weight) || 70;
    const bmi = (weight / Math.pow(height / 100, 2)) / 40;

    const smokingMap = { 'never': 0, 'ex': 0.2, '1-10': 0.5, '11-20': 0.8, '20+': 1 };
    const smoking = smokingMap[userData.smoking] !== undefined ? smokingMap[userData.smoking] : (parseFloat(userData.smoking) || 0);

    const alcoholMap = { '0': 0, '1-7': 0.2, '8-14': 0.4, '15-21': 0.7, '21+': 1 };
    const alcohol = alcoholMap[userData.alcohol] !== undefined ? alcoholMap[userData.alcohol] : (parseFloat(userData.alcohol) || 0);

    const exercise = (parseFloat(userData.exercise_freq) || parseFloat(userData.exercise_level) || 0) / 7;
    const stress = (parseFloat(userData.stress) || 5) / 10;
    const sleep = (parseFloat(userData.sleep_hours) || parseFloat(userData.sleep) || 7.5) / 10;
    
    const bp = (parseFloat(userData.blood_pressure) || 120) / 200;
    const chol = (parseFloat(userData.cholesterol) || 180) / 400;
    const glucose = (parseFloat(userData.glucose) || 90) / 300;

    const hd = (userData.conditions || []).includes('heart_disease') || userData.heart_disease === '1' ? 1 : 0;
    const diabetes = (userData.conditions || []).includes('diabetes') || userData.diabetes === '1' ? 1 : 0;

    return [age, bmi, smoking, alcohol, exercise, stress, sleep, bp, chol, glucose, hd, diabetes];
  }

  /**
   * Predicts the lifespan based on input features
   * @param {Object} userData - Full user data object
   * @returns {number} - Predicted total lifespan
   */
  async predict(userData) {
    if (!this.isLoaded) await this.init();
    
    return tf.tidy(() => {
      const features = this.mapUserDataToFeatures(userData);
      const inputTensor = tf.tensor2d([features], [1, 12]);
      const prediction = this.model.predict(inputTensor);
      return prediction.dataSync()[0];
    });
  }

  async calculateFeatureImportance(userData, basePrediction) {
    const features = this.mapUserDataToFeatures(userData);
    const featureNames = ['Age', 'BMI', 'Smoking', 'Alcohol', 'Exercise', 'Stress', 'Sleep', 'Blood Pressure', 'Cholesterol', 'Glucose', 'Heart Disease', 'Diabetes'];
    const baselines = [0.3, 22/40, 0, 0, 0.7, 0.2, 0.75, 120/200, 180/400, 90/300, 0, 0];

    const importances = [];
    
    for (let i = 1; i < features.length; i++) { // Skip age
      const perturbed = [...features];
      perturbed[i] = baselines[i];
      
      const pred = await tf.tidy(() => {
        const tensor = tf.tensor2d([perturbed], [1, 12]);
        return this.model.predict(tensor).dataSync()[0];
      });
      
      const impact = pred - basePrediction;
      importances.push({ name: featureNames[i], impact });
    }
    
    return importances.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }
}

export const healthModel = new HealthModel();
