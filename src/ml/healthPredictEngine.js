export function calculateLifespan(person) {
  const baseLifespan = 80;
  
  // Clean inputs
  const age = parseInt(person.age) || 50;
  const heartDisease = parseInt(person.heart_disease) || 0;
  const diabetes = parseInt(person.diabetes) || 0;
  const stroke = parseInt(person.stroke) || 0;
  const smoking = parseInt(person.smoking) || 0;
  const alcohol = parseInt(person.alcohol) || 0;
  const exerciseLevel = parseInt(person.exercise_level) || 0;
  const bmi = parseFloat(person.bmi) || 25;
  const systolic = parseInt(person.blood_pressure) || 120;
  const cholesterol = parseInt(person.cholesterol) || 200;

  // Adjustments
  let adjustments = 0;
  
  // Age Factor
  adjustments += (35 - age) * 0.3;
  
  // Health Conditions
  let conditionCount = 0;
  let conditionImpact = 0;
  if (heartDisease === 1) { conditionImpact -= 10; conditionCount++; }
  if (diabetes === 1) { conditionImpact -= 8; conditionCount++; }
  if (stroke === 1) { conditionImpact -= 12; conditionCount++; }
  
  if (conditionCount > 1) {
    conditionImpact *= 0.9;
  }
  adjustments += conditionImpact;
  
  // Lifestyle Habits
  if (smoking === 1) adjustments -= 15;
  if (alcohol === 1) adjustments -= 8;
  
  if (exerciseLevel === 1) adjustments += 3;
  else if (exerciseLevel === 2) adjustments += 6;
  else if (exerciseLevel >= 3) adjustments += 9;
  
  // BMI Impact
  if (bmi > 30) {
    adjustments -= (bmi - 30) * 0.5;
  } else if (bmi < 18.5) {
    adjustments -= (18.5 - bmi) * 0.3;
  }
  
  // Blood Pressure
  if (systolic > 140) adjustments -= 5;
  
  // Cholesterol
  if (cholesterol > 240) adjustments -= 3;
  
  let finalLifespan = baseLifespan + adjustments;
  finalLifespan = Math.min(100, Math.max(age + 1, finalLifespan));
  const finalLifespanInt = Math.round(finalLifespan);
  
  return {
    prediction: finalLifespanInt,
    base: baseLifespan,
    modifiers: {
      age: (35 - age) * 0.3,
      chronic: conditionImpact,
      smoking: smoking === 1 ? -15 : 0,
      alcohol: alcohol === 1 ? -8 : 0,
      exercise: exerciseLevel === 1 ? 3 : exerciseLevel === 2 ? 6 : exerciseLevel >= 3 ? 9 : 0,
      bmi: bmi > 30 ? -(bmi - 30) * 0.5 : bmi < 18.5 ? -(18.5 - bmi) * 0.3 : 0,
      blood_pressure: systolic > 140 ? -5 : 0,
      cholesterol: cholesterol > 240 ? -3 : 0
    }
  };
}

export const STANDARD_COMBINATIONS = [
  {
    name: "18-30: No smoking, No alcohol, Regular exercise, Good diet",
    props: { age: 25, smoking: 0, alcohol: 0, exercise_level: 3, bmi: 22, heart_disease: 0, diabetes: 0, stroke: 0, blood_pressure: 120, cholesterol: 180 }
  },
  {
    name: "18-30: Smoking, Alcohol, No exercise, Poor diet",
    props: { age: 25, smoking: 1, alcohol: 1, exercise_level: 0, bmi: 28, heart_disease: 0, diabetes: 0, stroke: 0, blood_pressure: 120, cholesterol: 180 }
  },
  {
    name: "30-45: No smoking, No alcohol, Regular exercise",
    props: { age: 37, smoking: 0, alcohol: 0, exercise_level: 3, bmi: 24, heart_disease: 0, diabetes: 0, stroke: 0, blood_pressure: 120, cholesterol: 180 }
  },
  {
    name: "30-45: Smoking, Drinking, No exercise, Diabetic",
    props: { age: 37, smoking: 1, alcohol: 1, exercise_level: 0, bmi: 27, heart_disease: 0, diabetes: 1, stroke: 0, blood_pressure: 120, cholesterol: 180 }
  },
  {
    name: "45-75: No smoking, No alcohol, Regular exercise, Good health",
    props: { age: 60, smoking: 0, alcohol: 0, exercise_level: 2, bmi: 25, heart_disease: 0, diabetes: 0, stroke: 0, blood_pressure: 120, cholesterol: 180 }
  },
  {
    name: "45-75: Smoking, Sedentary, Obese, Heart disease, Diabetic",
    props: { age: 60, smoking: 1, alcohol: 1, exercise_level: 0, bmi: 32, heart_disease: 1, diabetes: 1, stroke: 0, blood_pressure: 120, cholesterol: 180 }
  },
  {
    name: "75+: Healthy lifestyle, No chronic diseases",
    props: { age: 80, smoking: 0, alcohol: 0, exercise_level: 2, bmi: 24, heart_disease: 0, diabetes: 0, stroke: 0, blood_pressure: 120, cholesterol: 180 }
  },
  {
    name: "75+: Multiple health conditions, Poor lifestyle",
    props: { age: 80, smoking: 1, alcohol: 1, exercise_level: 0, bmi: 29, heart_disease: 1, diabetes: 1, stroke: 1, blood_pressure: 120, cholesterol: 180 }
  }
];

export function getFactorsText(props) {
  let factors = [];
  if (props.smoking) factors.push("Smoking reduces lifespan by 10-15 years");
  else factors.push("No smoking removes major risk factor");
  
  if (props.alcohol) factors.push("Alcohol consumption reduces lifespan by 5-8 years");
  
  if (props.exercise_level === 1) factors.push("Light exercise (level 1) adds ~3 years");
  else if (props.exercise_level === 2) factors.push("Regular exercise (level 2) adds ~6 years");
  else if (props.exercise_level >= 3) factors.push("High exercise (level 3+) adds ~9 years");
  else factors.push("Lack of exercise reduces longevity potential");
  
  if (props.heart_disease) factors.push("Heart disease reduces lifespan by 7-10 years");
  if (props.diabetes) factors.push("Diabetes reduces lifespan by 5-8 years");
  if (props.stroke) factors.push("Stroke history significantly reduces lifespan");
  
  if (props.bmi > 30) factors.push(`Obesity (BMI ${props.bmi}) reduces lifespan by 2-4 years`);
  else if (props.bmi >= 18.5 && props.bmi <= 25) factors.push(`Healthy BMI (${props.bmi}) maintains baseline`);
  
  return factors.join(" • ");
}

function normalizeValue(val) {
  if (val === undefined || val === null) return 0;
  const s = String(val).toLowerCase().trim();
  if (s === '1' || s === 'yes' || s === 'true' || s === 'y' || s === 'active') return 1;
  if (s === '0' || s === 'no' || s === 'false' || s === 'n' || s === 'inactive') return 0;
  return parseFloat(s) || 0;
}

function normalizeRow(row) {
  const normalized = {};
  const keys = Object.keys(row);
  
  const findKey = (variants) => {
    const found = keys.find(k => variants.includes(k.toLowerCase().trim().replace(/ /g, '_')));
    return found ? row[found] : null;
  };

  normalized.age = parseInt(findKey(['age'])) || 50;
  normalized.gender = findKey(['gender', 'sex']) || 'Unknown';
  normalized.bmi = parseFloat(findKey(['bmi', 'body_mass_index'])) || 25;
  normalized.exercise_level = normalizeValue(findKey(['exercise', 'exercise_level', 'activity_level']));
  normalized.smoking = normalizeValue(findKey(['smoking', 'smoker']));
  normalized.alcohol = normalizeValue(findKey(['alcohol', 'drinker']));
  normalized.blood_pressure = parseInt(findKey(['blood_pressure', 'bp', 'systolic'])) || 120;
  normalized.cholesterol = parseInt(findKey(['cholesterol', 'chol'])) || 200;
  normalized.glucose = parseInt(findKey(['glucose', 'sugar'])) || 90;
  normalized.heart_disease = normalizeValue(findKey(['heart_disease', 'heart_condition']));
  normalized.diabetes = normalizeValue(findKey(['diabetes', 'diabetic']));
  normalized.stroke = normalizeValue(findKey(['stroke']));

  return normalized;
}

export function processHealthData(rawData) {
  if (!rawData || rawData.length < 1) {
    throw new Error("Insufficient data - need at least 1 record");
  }

  // Tracking how many "real" markers we found vs defaults
  let markersFoundCount = 0;
  const essentialKeys = ['age', 'bmi', 'blood_pressure', 'cholesterol', 'heart_disease', 'diabetes', 'smoking'];

  // Parse and calculate lifespan for everyone
  const processed = rawData.map((row, index) => {
    const cleanedRow = normalizeRow(row);
    
    // On the first row, let's check if we actually found any real data columns
    if (index === 0) {
      const keys = Object.keys(row).map(k => k.toLowerCase().trim());
      essentialKeys.forEach(ek => {
        if (keys.some(k => k.includes(ek) || ek.includes(k))) markersFoundCount++;
      });
    }

    const resultObj = calculateLifespan(cleanedRow);
    cleanedRow.lifespan = resultObj.prediction;
    
    if (cleanedRow.age < 30) cleanedRow.ageGroup = "18-30";
    else if (cleanedRow.age < 45) cleanedRow.ageGroup = "30-45";
    else if (cleanedRow.age < 75) cleanedRow.ageGroup = "45-75";
    else cleanedRow.ageGroup = "75+";
    
    return cleanedRow;
  });

  // If we found fewer than 2 essential health columns, the file is likely invalid for this app
  if (markersFoundCount < 2) {
    throw new Error("Unsupported Dataset: We couldn't find enough health markers (like Age, BMI, or Smoking) in this file. Please check your column headers.");
  }

  const totalRecords = processed.length;
  const avgAge = processed.reduce((acc, row) => acc + row.age, 0) / totalRecords;
  const avgBmi = processed.reduce((acc, row) => acc + row.bmi, 0) / totalRecords;
  const totalHeartDisease = processed.filter(r => r.heart_disease === 1).length;
  const avgLifespan = processed.reduce((acc, row) => acc + row.lifespan, 0) / totalRecords;

  // Age Groups
  const ageGroupsData = ["18-30", "30-45", "45-75", "75+"].map(group => {
    const groupUsers = processed.filter(r => r.ageGroup === group);
    const n = groupUsers.length;
    if (n === 0) {
      return { group, count: 0, percent: 0, avgLifespan: 0, smokers: 0, drinkers: 0, exercisers: 0, heartDisease: 0, diabetes: 0, narrative: "No data available." };
    }
    
    const avgLife = groupUsers.reduce((a, b) => a + b.lifespan, 0) / n;
    const smokersCount = groupUsers.filter(r => r.smoking === 1).length;
    const drinkersCount = groupUsers.filter(r => r.alcohol === 1).length;
    const exercisersCount = groupUsers.filter(r => r.exercise_level > 0).length;
    const hdCount = groupUsers.filter(r => r.heart_disease === 1).length;
    const diaCount = groupUsers.filter(r => r.diabetes === 1).length;
    
    let narrative = `People in the ${group} age group have an average life expectancy of ${avgLife.toFixed(1)} years.\n\n`;
    if (smokersCount > 0) narrative += `${smokersCount} people (${(smokersCount/n*100).toFixed(1)}%) in this group smoke. Smokers typically live 10-15 years less than non-smokers.\n\n`;
    if (drinkersCount > 0) narrative += `${drinkersCount} people (${(drinkersCount/n*100).toFixed(1)}%) consume alcohol. Regular drinkers may lose 5-8 years of life expectancy.\n\n`;
    if (exercisersCount > 0) narrative += `${exercisersCount} people (${(exercisersCount/n*100).toFixed(1)}%) exercise regularly, which can add 3-5 years to lifespan.\n\n`;
    if (hdCount > 0) narrative += `${hdCount} people have heart disease, reducing life expectancy by 7-10 years.`;
    
    let recommendation = "";
    if (smokersCount/n > 0.3) recommendation = "Focus on smoking cessation programs";
    else if (exercisersCount/n < 0.4) recommendation = "Encourage more physical activity";
    else if (hdCount/n > 0.2) recommendation = "Increase cardiovascular screening";
    else recommendation = "Maintain healthy lifestyle patterns";

    return {
      group,
      count: n,
      percent: (n / totalRecords * 100).toFixed(1),
      avgLifespan: avgLife.toFixed(1),
      smokersCount, smokersPct: (smokersCount/n*100).toFixed(1),
      drinkersCount, drinkersPct: (drinkersCount/n*100).toFixed(1),
      exercisersCount, exercisersPct: (exercisersCount/n*100).toFixed(1),
      hdCount, hdPct: (hdCount/n*100).toFixed(1),
      diaCount, diaPct: (diaCount/n*100).toFixed(1),
      narrative,
      recommendation
    };
  });

  // Combinations
  const combos = STANDARD_COMBINATIONS.map(c => {
    const lifespanObj = calculateLifespan(c.props);
    const lifespan = lifespanObj.prediction;
    let risk = "LOW RISK";
    if (lifespan < 70) risk = "HIGH RISK";
    else if (lifespan <= 78) risk = "MEDIUM RISK";
    
    return {
      name: c.name,
      lifespan,
      risk,
      factors: getFactorsText(c.props)
    };
  });

  // Risk Factors (Ranked)
  const allSmokers = processed.filter(r => r.smoking === 1).length;
  const allDrinkers = processed.filter(r => r.alcohol === 1).length;
  const allSedentary = processed.filter(r => r.exercise_level === 0).length;
  const allObese = processed.filter(r => r.bmi > 30).length;
  const allDia = processed.filter(r => r.diabetes === 1).length;
  const allHD = processed.filter(r => r.heart_disease === 1).length;

  const factors = [
    { name: "Smoking", count: allSmokers, impact: 15 },
    { name: "Sedentary Lifestyle", count: allSedentary, impact: 10 },
    { name: "Heart Disease", count: allHD, impact: 10 },
    { name: "Diabetes", count: allDia, impact: 8 },
    { name: "Alcohol Consumption", count: allDrinkers, impact: 8 },
    { name: "Obesity (BMI > 30)", count: allObese, impact: 3 }
  ];
  
  // Rank by: (affected_count / total_records) * impact_years
  factors.forEach(f => {
    f.score = (f.count / totalRecords) * f.impact;
    f.percent = (f.count / totalRecords * 100).toFixed(1);
  });
  factors.sort((a, b) => b.score - a.score);
  
  const topRisks = factors.slice(0, 5);

  const protectiveFactors = {
    exercise: processed.filter(r => r.exercise_level > 0).length,
    healthyBmi: processed.filter(r => r.bmi >= 18.5 && r.bmi <= 25).length,
    noChronic: processed.filter(r => r.heart_disease === 0 && r.diabetes === 0 && r.stroke === 0).length
  };

  return {
    overview: {
      totalRecords,
      avgAge: avgAge.toFixed(1),
      avgBmi: avgBmi.toFixed(1),
      avgLifespan: avgLifespan.toFixed(1),
      heartDiseasePct: (totalHeartDisease / totalRecords * 100).toFixed(1),
      ageDistribution: ageGroupsData.map(g => ({ name: g.group, value: g.count }))
    },
    ageGroups: ageGroupsData,
    combinations: combos,
    summary: {
      totalRecords,
      avgLifespan: avgLifespan.toFixed(1),
      topRisks,
      protective: {
        exercise: { count: protectiveFactors.exercise, pct: (protectiveFactors.exercise/totalRecords*100).toFixed(1) },
        healthyBmi: { count: protectiveFactors.healthyBmi, pct: (protectiveFactors.healthyBmi/totalRecords*100).toFixed(1) },
        noChronic: { count: protectiveFactors.noChronic, pct: (protectiveFactors.noChronic/totalRecords*100).toFixed(1) }
      }
    }
  };
}
