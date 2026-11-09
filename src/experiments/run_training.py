"""
Module: run_training.py
Trains all candidate model architectures on the development dataset.
Measures wall-clock training duration and serializes fitted models.
"""
import os
import sys
import time
import json
import joblib
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from src.models.model_registry import get_model

PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "results")

def train_all_models():
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(RESULTS_DIR, exist_ok=True)
    
    print("Loading preprocessed training dataset...")
    X_train = pd.read_parquet(os.path.join(PROCESSED_DIR, "train_features.parquet"))
    y_train = pd.read_parquet(os.path.join(PROCESSED_DIR, "train_target.parquet"))["TotalGHGEmissions"].values
    X_train_raw = pd.read_parquet(os.path.join(PROCESSED_DIR, "train_features_raw.parquet"))
    act_train = pd.read_parquet(os.path.join(PROCESSED_DIR, "train_activity.parquet"))
    
    print(f"Training partition shape: {X_train.shape[0]:,} observations, {X_train.shape[1]} features.")
    
    model_names = [
        "accounting",
        "median",
        "ridge",
        "gam",
        "ebm",
        "rf",
        "xgboost",
        "mlp"
    ]
    
    training_log = []
    
    for name in model_names:
        print(f"\n--- Training Model: {name.upper()} ---")
        model = get_model(name, use_log_target=True)
        
        start_time = time.perf_counter()
        
        try:
            if name == "accounting":
                model.fit(act_train, y_train)
            elif name == "median":
                model.fit(X_train_raw, y_train)
            else:
                model.fit(X_train, y_train)
                
            elapsed_sec = time.perf_counter() - start_time
            print(f"  Training completed in {elapsed_sec:.2f} seconds.")
            
            # Serialize model
            model_path = os.path.join(MODELS_DIR, f"{name}.joblib")
            joblib.dump(model, model_path)
            
            training_log.append({
                "model": name,
                "status": "SUCCESS",
                "training_time_sec": round(elapsed_sec, 4),
                "model_path": model_path,
                "error": None
            })
            
        except Exception as e:
            elapsed_sec = time.perf_counter() - start_time
            print(f"  FAILED: {e}")
            training_log.append({
                "model": name,
                "status": "FAILED",
                "training_time_sec": round(elapsed_sec, 4),
                "model_path": None,
                "error": str(e)
            })
            
    # Save training log
    log_df = pd.DataFrame(training_log)
    log_df.to_csv(os.path.join(RESULTS_DIR, "training_summary.csv"), index=False)
    print(f"\nAll model training runs finished. Summary written to results/training_summary.csv.")
    return training_log

if __name__ == "__main__":
    train_all_models()
