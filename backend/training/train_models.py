import os
import pickle
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier

# Set correct paths
BASE_DIR = os.path.dirname(__file__)  # training folder
DATA_DIR = BASE_DIR  # datasets in training/
MODEL_DIR = BASE_DIR  # models and scalers in training/

def save_pickle(obj, file_name):
    with open(os.path.join(MODEL_DIR, file_name), 'wb') as f:
        pickle.dump(obj, f)

# --------- DIABETES ---------
def train_diabetes():
    df = pd.read_csv(os.path.join(DATA_DIR, 'diabetes.csv'))
    X = df.drop('Outcome', axis=1)
    y = df['Outcome']

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = RandomForestClassifier()
    model.fit(X_scaled, y)

    save_pickle(model, 'diabetes_model.pkl')
    save_pickle(scaler, 'diabetes_scaler.pkl')
    print("Diabetes model and scaler saved.")

# --------- HEART ---------
def train_heart():
    df = pd.read_csv(os.path.join(DATA_DIR, 'heart.csv'))
    X = df.drop('target', axis=1)
    y = df['target']

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = RandomForestClassifier()
    model.fit(X_scaled, y)

    save_pickle(model, 'heart_model.pkl')
    save_pickle(scaler, 'heart_scaler.pkl')
    print("Heart model and scaler saved.")

# --------- LUNG ---------
def train_lung():
    df = pd.read_csv(os.path.join(DATA_DIR, 'lung.csv'))
    #print("Lung Columns:", df.columns)  # Debug

    target_col = 'LUNG_CANCER'
    if target_col not in df.columns:
        raise KeyError(f"Lung dataset must have '{target_col}' as target column.")

    X = df.drop(target_col, axis=1)
    y = df[target_col]

    # Encode categorical columns
    cat_cols = X.select_dtypes(include='object').columns
    le_dict = {}
    for col in cat_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        le_dict[col] = le
    save_pickle(le_dict, 'lung_encoders.pkl')

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = RandomForestClassifier()
    model.fit(X_scaled, y)

    save_pickle(model, 'lung_model.pkl')
    save_pickle(scaler, 'lung_scaler.pkl')
    print("Lung model, scaler, and encoders saved.")

# --------- PARKINSON ---------
def train_parkinson():
    df = pd.read_csv(os.path.join(DATA_DIR, 'parkinsons.csv'))
    #print("Parkinson Columns:", df.columns)  # Debug

    # Drop ID/Name column if it exists
    if 'name' in df.columns:
        df = df.drop('name', axis=1)
    elif 'id' in df.columns:
        df = df.drop('id', axis=1)
    elif 'phon_R01_S01_1' in df.columns:
        df = df.drop('phon_R01_S01_1', axis=1)
    else:
        # Try dropping the first column as ID
        df = df.drop(df.columns[0], axis=1)
    
    X = df.drop('status', axis=1)
    y = df['status']

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = RandomForestClassifier()
    model.fit(X_scaled, y)

    save_pickle(model, 'parkinsons_model.pkl')
    save_pickle(scaler, 'parkinsons_scaler.pkl')
    print("Parkinson model and scaler saved.")


# --------- LIVER ---------
def train_liver():
    df = pd.read_csv(os.path.join(DATA_DIR, 'Liver.csv'))
    #print("Liver Columns:", df.columns)  # Debug

    target_col = 'Diagnosis'
    if target_col not in df.columns:
        raise KeyError(f"Liver dataset must have '{target_col}' as target column.")

    X = df.drop(target_col, axis=1)
    y = df[target_col]

    # Encode categorical columns (e.g., Gender)
    cat_cols = X.select_dtypes(include='object').columns
    le_dict = {}
    for col in cat_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        le_dict[col] = le
    save_pickle(le_dict, 'liver_encoders.pkl')

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = RandomForestClassifier()
    model.fit(X_scaled, y)

    save_pickle(model, 'liver_model.pkl')
    save_pickle(scaler, 'liver_scaler.pkl')
    print("Liver model, scaler, and encoders saved.")

# -------------------- MAIN --------------------
if __name__ == '__main__':
    train_diabetes()
    train_heart()
    train_lung()
    train_parkinson()
    train_liver()
