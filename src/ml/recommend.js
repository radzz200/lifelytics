// Rule-based engine for personalized action plan

export const generatePlan = (modifiers, userData) => {
  const age = parseFloat(userData.age) || 30;
  const country = userData.country || 'Other';
  
  // Identify top modifiable risks
  const sorted = Object.entries(modifiers || {}).sort((a, b) => a[1] - b[1]);
  const topRisks = sorted.filter(m => m[1] < 0 && m[0] !== 'genetics' && m[0] !== 'income').map(m => m[0]);
  
  let diet = {
    breakfast: [],
    lunch: [],
    dinner: []
  };

  if (country === 'India') {
    diet.breakfast = ["Oats idli or moong dal chilla", "Handful of soaked almonds and walnuts"];
    diet.lunch = ["1 bowl dal, 1 portion vegetables (sabzi), 2 rotis (multigrain)", "Small bowl of curd"];
    diet.dinner = ["Light paneer tikka or grilled chicken with mixed salad", "Clear vegetable soup"];
  } else if (country === 'USA' || country === 'Canada') {
    diet.breakfast = ["Avocado toast on whole grain with a poached egg", "Black coffee or green tea"];
    diet.lunch = ["Mixed greens salad with grilled chicken/tofu and olive oil dressing", "Handful of berries"];
    diet.dinner = ["Baked salmon or lean turkey", "Roasted sweet potato and asparagus"];
  } else if (country === 'UK' || country === 'Australia') {
    diet.breakfast = ["Porridge with mixed berries and chia seeds", "English Breakfast tea (no sugar)"];
    diet.lunch = ["Lentil soup with a slice of sourdough bread", "Apple or pear"];
    diet.dinner = ["Grilled white fish or lean roast beef with steamed veg", "Quinoa or brown rice"];
  } else {
    diet.breakfast = ["High protein smoothie (spinach, banana, whey/plant protein)", "Handful of mixed nuts"];
    diet.lunch = ["Large leafy green salad with olive oil and lean protein", "1 piece of whole fruit"];
    diet.dinner = ["Grilled fish or plant-based protein with roasted vegetables", "Small portion of complex carbs (quinoa/sweet potato)"];
  }

  // Adjust diet based on risks
  if (topRisks.includes('blood_pressure')) {
    diet.dinner.push("Reduce salt intake; use herbs for flavoring instead of salt");
  }
  if (topRisks.includes('glucose') || topRisks.includes('diabetes')) {
    diet.breakfast.push("Strictly avoid fruit juices; eat whole fruits only");
  }
  if (topRisks.includes('cholesterol')) {
    diet.lunch.push("Ensure foods are cooked in healthy fats like olive oil or avocado oil");
  }

  let workout = [];
  if (age >= 60) {
    workout = [
      "15 mins: Joint mobility and light stretching",
      "20 mins: Brisk walking or water aerobics",
      "10 mins: Resistance band exercises (focus on core and legs)",
      "5 mins: Balance training (e.g., single-leg stands)"
    ];
  } else if (age >= 40) {
    workout = [
      "10 mins: Dynamic warm-up",
      "20 mins: Zone 2 Cardio (jogging, cycling, or rowing)",
      "20 mins: Strength training (dumbbells or bodyweight)",
      "10 mins: Yoga or flexibility cool-down"
    ];
  } else {
    workout = [
      "10 mins: Dynamic warm-up",
      "25 mins: High-Intensity Interval Training (HIIT) or Heavy Lifting",
      "15 mins: Core stabilization",
      "10 mins: Static stretching"
    ];
  }

  const plan = {
    "Breakfast": {
      title: "Morning Fuel",
      tasks: diet.breakfast.map((t, i) => ({ id: `bf_${i}`, text: t, done: false }))
    },
    "Lunch": {
      title: "Mid-day Nutrition",
      tasks: diet.lunch.map((t, i) => ({ id: `lu_${i}`, text: t, done: false }))
    },
    "Dinner": {
      title: "Evening Recovery",
      tasks: diet.dinner.map((t, i) => ({ id: `di_${i}`, text: t, done: false }))
    },
    "Workout": {
      title: "Age-Optimized Training",
      tasks: workout.map((t, i) => ({ id: `wo_${i}`, text: t, done: false }))
    },
    "Habits": {
      title: "Longevity Interventions",
      tasks: [
        { id: 'h_1', text: "7.5 to 8 hours of uninterrupted sleep", done: false },
        { id: 'h_2', text: "Drink 2.5L to 3L of water daily", done: false }
      ]
    }
  };

  // Inject specific habits based on risks
  if (topRisks.includes('smoking')) {
    plan["Habits"].tasks.push({ id: 'h_s1', text: "Nicotine Replacement Therapy / Avoid triggers", done: false });
  }
  if (topRisks.includes('alcohol')) {
    plan["Habits"].tasks.push({ id: 'h_a1', text: "Limit alcohol to max 2 units/week", done: false });
  }
  if (topRisks.includes('stress')) {
    plan["Habits"].tasks.push({ id: 'h_st1', text: "10-minute mindfulness meditation before bed", done: false });
  }

  return plan;
};
