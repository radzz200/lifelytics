export const generateSyntheticData = (numSamples = 2000) => {
  const X = [];
  const y = [];

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  for (let i = 0; i < numSamples; i++) {
    // Generate normalized features
    const age = Math.random(); // 0-1 (approx 18-100)
    const bmi = 15 + Math.random() * 25; // 15 - 40
    const smoking = Math.random(); // 0-1
    const alcohol = Math.random(); // 0-1
    const exercise = Math.random(); // 0-1
    const stress = Math.random(); // 0-1
    const sleep = Math.random(); // 0-1
    const bp = Math.random(); // 0-1
    const chol = Math.random(); // 0-1
    const glucose = Math.random(); // 0-1
    
    // Binary features
    const hd = Math.random() > 0.85 ? 1 : 0;
    const diabetes = Math.random() > 0.85 ? 1 : 0;

    // Build the 12-feature array
    const features = [age, bmi/40, smoking, alcohol, exercise, stress, sleep, bp, chol, glucose, hd, diabetes];

    // Simulate biological logic for lifespan
    // Base lifespan
    let lifespan = 80;
    
    // Penalties
    if (bmi > 25) lifespan -= ((bmi - 25) * 0.8);
    if (bmi < 18.5) lifespan -= ((18.5 - bmi) * 0.5);
    
    lifespan -= (smoking * 12);
    lifespan -= (alcohol * 8);
    lifespan -= (stress * 5);
    
    // U-shaped sleep curve (optimal is around 0.7 which maps to ~7.5 hours)
    const sleepOptimalDist = Math.abs(sleep - 0.7);
    lifespan -= (sleepOptimalDist * 8);
    
    // Clinical penalties
    lifespan -= (bp * 6);
    lifespan -= (chol * 5);
    lifespan -= (glucose * 7);
    
    if (hd === 1) lifespan -= 8;
    if (diabetes === 1) lifespan -= 6;
    
    // Compounding non-linear risk
    if (hd === 1 && diabetes === 1 && smoking > 0.5) lifespan -= 5;
    
    // Protective factors
    lifespan += (exercise * 7);
    
    // Add some noise for realism
    const noise = (Math.random() * 4) - 2;
    lifespan += noise;

    X.push(features);
    y.push(clamp(lifespan, 40, 110));
  }

  return { X, y };
};
