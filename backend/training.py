import pandas as pd
import os
from joblib import dump
from sklearn.model_selection import RepeatedStratifiedKFold, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from imblearn.pipeline import Pipeline
from imblearn.over_sampling import SMOTE

# 1️⃣ Load and prepare data
def load_data():
    df = pd.read_csv(r"C:\Users\Pragati\OneDrive\Desktop\Desktop\flask-react-app\backend\healthcare-dataset-stroke-data.csv")
    df.columns = [col.lower() for col in df.columns]  # make all lowercase
    df = df.drop('id', axis=1)  # drop ID column

    categorical = ['hypertension', 'heart_disease', 'ever_married', 'work_type', 'residence_type', 'smoking_status']
    numerical = ['age', 'avg_glucose_level', 'bmi']

    y = df['stroke']
    X = df.drop('stroke', axis=1)

    return X, y, categorical, numerical

# 2️⃣ Load data
X, y, categorical, numerical = load_data()
print("Dataset shape:", X.shape, y.shape)

# 3️⃣ Preprocessing for numeric and categorical separately
numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer(transformers=[
    ('num', numeric_transformer, numerical),
    ('cat', categorical_transformer, categorical)
])

# 4️⃣ Build pipeline with SMOTE correctly
pipeline = Pipeline(steps=[
    ('preprocess', preprocessor),
    ('smote', SMOTE(random_state=42)),
    ('model', LogisticRegression(max_iter=1000))
])

# 5️⃣ Evaluate model with cross-validation
cv = RepeatedStratifiedKFold(n_splits=10, n_repeats=3, random_state=42)
scores = cross_val_score(pipeline, X, y, scoring='roc_auc', cv=cv, n_jobs=-1, error_score='raise')
print(f"Logistic Regression AUC: {scores.mean():.3f} ± {scores.std():.3f}")

# 6️⃣ Fit pipeline on entire dataset
pipeline.fit(X, y)
print("Pipeline fitted on entire dataset.")

# 7️⃣ Save pipeline
current_folder = os.path.dirname(os.path.abspath(__file__))
dump(pipeline, os.path.join(current_folder, 'stroke_prediction_model.joblib'))
print("Pipeline saved successfully as 'stroke_prediction_model.joblib'.")