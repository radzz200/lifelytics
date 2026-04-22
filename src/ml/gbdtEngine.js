/**
 * GBDT Inference & Explanation Engine
 * Zero-dependency, ultra-fast life expectancy prediction
 */

export function predictLife(model, record) {
  // Map record to feature array in correct order
  const x = model.features.map(f => {
    const val = record[f];
    if (f === 'gender') return val === 'female' || val === 1 ? 1 : 0;
    if (f === 'smoking' || f === 'alcohol' || f === 'heart_disease' || f === 'diabetes' || f === 'stroke') {
      return (val === '1' || val === 1 || val === true || val === 'yes') ? 1 : 0;
    }
    return parseFloat(val ?? 0);
  });

  let pred = model.base_prediction;

  function walkTree(node) {
    if (node.v !== undefined) return node.v;
    return x[node.f] <= node.t ? walkTree(node.l) : walkTree(node.r);
  }

  for (const tree of model.trees) {
    pred += model.learning_rate * walkTree(tree);
  }
  
  pred = Math.max(38, Math.min(100, pred));
  const mae = model.metrics.mae || 2.0;

  return {
    predicted_lifespan: Math.round(pred * 10) / 10,
    confidence_low: Math.round((pred - mae) * 10) / 10,
    confidence_high: Math.round((pred + mae) * 10) / 10,
    risk_level: pred < 70 ? 'HIGH' : (pred < 78 ? 'MEDIUM' : 'LOW'),
    model_r2: model.metrics.r2
  };
}

export function explain(record, predictedLife) {
  const risks = [];
  const protections = [];
  const improvements = [];

  const getVal = (key) => {
    const val = record[key];
    return (val === '1' || val === 1 || val === true || val === 'yes') ? 1 : 0;
  };

  // --- SMOKING ---
  if (getVal('smoking')) {
    risks.push({
      factor: 'Smoking',
      impact: '-13 years',
      severity: 'CRITICAL',
      reason: 'Active smoking is the #1 modifiable cause of premature death.'
    });
    improvements.push({
      action: 'Quit smoking',
      gain_years: 13,
      gain_pct: Math.round((13 / predictedLife) * 100 * 10) / 10,
      timeline: 'Full benefit within 10–15 years of quitting'
    });
  }

  // --- HEART DISEASE ---
  if (getVal('heart_disease')) {
    risks.push({
      factor: 'Heart Disease',
      impact: '-12 years',
      severity: 'CRITICAL',
      reason: 'Cardiovascular disease significantly reduces life expectancy.'
    });
    improvements.push({
      action: 'Cardiac rehabilitation + medication adherence',
      gain_years: 5,
      gain_pct: Math.round((5 / predictedLife) * 100 * 10) / 10,
      timeline: 'Incremental gains over 2–5 years'
    });
  }

  // --- ALCOHOL ---
  if (getVal('alcohol')) {
    risks.push({
        factor: 'Alcohol Consumption',
        impact: '-7 years',
        severity: 'HIGH',
        reason: 'Regular alcohol use increases risk of liver disease and cancer.'
    });
    improvements.push({
        action: 'Reduce or eliminate alcohol',
        gain_years: 7,
        gain_pct: Math.round((7 / predictedLife) * 100 * 10) / 10,
        timeline: 'Liver and cardiovascular benefits begin within 1 year'
    });
  }

  // --- EXERCISE ---
  const ex = parseInt(record.exercise_level || 0);
  if (ex === 0) {
    risks.push({
      factor: 'Sedentary Lifestyle',
      impact: '-10 years vs active person',
      severity: 'HIGH',
      reason: 'No physical activity accelerates cardiovascular decline.'
    });
    improvements.push({
      action: 'Start moderate exercise (150 min/week)',
      gain_years: 7,
      gain_pct: Math.round((7 / predictedLife) * 100 * 10) / 10,
      timeline: 'Measurable cardio benefit within 3–6 months'
    });
  } else if (ex >= 2) {
    protections.push({
      factor: 'Regular Exercise',
      benefit: `+${(ex * 3.5).toFixed(0)} years`,
      reason: 'Exercise is the single most evidence-backed longevity intervention.'
    });
  }

  // --- BMI ---
  const bmi = parseFloat(record.bmi || 25);
  if (bmi > 30) {
    const yrsLost = ((bmi - 30) * 0.8).toFixed(1);
    risks.push({
      factor: `Obesity (BMI ${bmi.toFixed(1)})`,
      impact: `-${yrsLost} years`,
      severity: 'HIGH',
      reason: 'Obesity raises risk of diabetes, heart disease, and cancer.'
    });
    const gain = Math.min((bmi - 25) * 0.8, 10).toFixed(1);
    improvements.push({
      action: 'Achieve healthy BMI (18.5–25)',
      gain_years: parseFloat(gain),
      gain_pct: Math.round((gain / predictedLife) * 100 * 10) / 10,
      timeline: 'Benefits within 6 months of sustained weight loss'
    });
  } else if (bmi >= 18.5 && bmi <= 25) {
    protections.push({
      factor: `Healthy BMI (${bmi.toFixed(1)})`,
      benefit: 'Baseline preserved',
      reason: 'Normal weight reduces risk across all major chronic diseases.'
    });
  }

  // Sort improvements by gain_years descending
  improvements.sort((a, b) => b.gain_years - a.gain_years);

  return {
    risk_factors: risks,
    protective_factors: protections,
    improvements: improvements,
    total_recoverable_years: improvements.reduce((a, b) => a + b.gain_years, 0),
    top_action: improvements.length > 0 ? improvements[0].action : 'Maintain current habits'
  };
}
