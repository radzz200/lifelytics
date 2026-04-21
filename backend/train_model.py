import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
import joblib
import os

def generate_synthetic_data(n_samples=5000):
    np.random.seed(42)
    
    age = np.random.randint(18, 90, n_samples)
    gender = np.random.choice([0, 1], n_samples) # 0: Female, 1: Male
    bmi = np.random.uniform(15.0, 40.0, n_samples)
    exercise_level = np.random.randint(0, 3, n_samples) # 0, 1, 2
    smoking = np.random.choice([0, 1], n_samples)
    alcohol = np.random.choice([0, 1], n_samples)
    blood_pressure = np.random.randint(90, 180, n_samples)
    cholesterol = np.random.randint(150, 300, n_samples)
    glucose = np.random.randint(70, 200, n_samples)
    
    # Calculate synthetic lifespan based on health factors
    # Base lifespan 85
    base_lifespan = 85.0
    
    # Penalties
    bmi_penalty = np.where(bmi > 25, (bmi - 25) * 0.5, 0) + np.where(bmi < 18.5, (18.5 - bmi) * 0.5, 0)
    exercise_bonus = exercise_level * 2.0
    smoking_penalty = smoking * 8.0
    alcohol_penalty = alcohol * 3.0
    bp_penalty = np.where(blood_pressure > 130, (blood_pressure - 130) * 0.1, 0)
    chol_penalty = np.where(cholesterol > 200, (cholesterol - 200) * 0.05, 0)
    glucose_penalty = np.where(glucose > 100, (glucose - 100) * 0.05, 0)
    
    lifespan = base_lifespan - bmi_penalty + exercise_bonus - smoking_penalty - alcohol_penalty - bp_penalty - chol_penalty - glucose_penalty
    
    # Add some noise
    lifespan += np.random.normal(0, 3, n_samples)
    
    # Ensure lifespan isn't lower than age (if they are alive)
    lifespan = np.maximum(lifespan, age + np.random.uniform(1, 10, n_samples))
    
    X = pd.DataFrame({
        'age': age,
        'gender_numeric': gender,
        'bmi': bmi,
        'exercise_level': exercise_level,
        'smoking': smoking,
        'alcohol': alcohol,
        'blood_pressure': blood_pressure,
        'cholesterol': cholesterol,
        'glucose': glucose
    })
    
    y = lifespan
    
    return X, y

def train_and_save():
    print("Generating synthetic data for model training...")
    X, y = generate_synthetic_data(5000)
    
    print("Training Random Forest Regressor...")
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('model', RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42))
    ])
    
    pipeline.fit(X, y)
    
    model_path = os.path.join(os.path.dirname(__file__), 'lifespan_model.joblib')
    joblib.dump(pipeline, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_and_save()
