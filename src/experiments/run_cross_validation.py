"""
Module: run_cross_validation.py
Executes genuine 5-fold GroupKFold cross-validation on the development partition.
Fits preprocessing strictly inside each fold to prevent cross-validation leakage.
Records fold-level predictions, computes mean and standard deviation of predictive metrics.
"""
import os
import sys
import json
import time
import numpy as np
import pandas as pd
from sklearn.model_selection import GroupKFold
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from src.models.model_registry import get_model
from src.data.preprocess import NUMERIC_FEATURES, CATEGORICAL_FEATURES, ACTIVITY_METER_COLUMNS

PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "results")
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "reports")

def build_fold_preprocessor():
    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])
    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])
    return ColumnTransformer(
        transformers=[
            ("num", num_pipeline, NUMERIC_FEATURES),
            ("cat", cat_pipeline, CATEGORICAL_FEATURES)
        ],
        remainder="drop"
    )

def run_group_cross_validation(n_splits: int = 5, fast_mode: bool = False):
    os.makedirs(RESULTS_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)
    
    print(f"Loading development partition for {n_splits}-fold GroupKFold cross-validation...")
    X_train_raw = pd.read_parquet(os.path.join(PROCESSED_DIR, "train_features_raw.parquet"))
    y_train = pd.read_parquet(os.path.join(PROCESSED_DIR, "train_target.parquet"))["TotalGHGEmissions"].values
    act_train = pd.read_parquet(os.path.join(PROCESSED_DIR, "train_activity.parquet"))
    train_groups = pd.read_parquet(os.path.join(PROCESSED_DIR, "train_groups.parquet"))["OSEBuildingID"].values
    
    gkf = GroupKFold(n_splits=n_splits)
    
    # Evaluate primary models
    models_to_cv = ["accounting", "median", "ridge", "gam", "rf", "xgboost"]
    if not fast_mode:
        models_to_cv.append("mlp")
        
    fold_records = []
    
    for fold, (f_tr_idx, f_val_idx) in enumerate(gkf.split(X_train_raw, y_train, groups=train_groups)):
        print(f"\n--- Fold {fold + 1}/{n_splits} ---")
        tr_bldgs = set(train_groups[f_tr_idx])
        val_bldgs = set(train_groups[f_val_idx])
        assert len(tr_bldgs.intersection(val_bldgs)) == 0, f"Contamination in fold {fold + 1}!"
        
        # Partition raw folds
        X_f_tr_raw = X_train_raw.iloc[f_tr_idx].reset_index(drop=True)
        y_f_tr = y_train[f_tr_idx]
        act_f_tr = act_train.iloc[f_tr_idx].reset_index(drop=True)
        
        X_f_val_raw = X_train_raw.iloc[f_val_idx].reset_index(drop=True)
        y_f_val = y_train[f_val_idx]
        act_f_val = act_train.iloc[f_val_idx].reset_index(drop=True)
        
        # Fit preprocessor strictly on fold training data
        fold_prep = build_fold_preprocessor()
        fold_prep.fit(X_f_tr_raw)
        
        X_f_tr_trans = fold_prep.transform(X_f_tr_raw)
        X_f_val_trans = fold_prep.transform(X_f_val_raw)
        
        # Fit and evaluate each model on this fold
        for name in models_to_cv:
            t0 = time.perf_counter()
            model = get_model(name, use_log_target=True)
            
            if name == "accounting":
                model.fit(act_f_tr, y_f_tr)
                preds = model.predict(act_f_val)
            elif name == "median":
                model.fit(X_f_tr_raw, y_f_tr)
                preds = model.predict(X_f_val_raw)
            else:
                model.fit(X_f_tr_trans, y_f_tr)
                preds = model.predict(X_f_val_trans)
                
            elapsed = time.perf_counter() - t0
            
            # Metrics
            mae = float(np.mean(np.abs(y_f_val - preds)))
            rmse = float(np.sqrt(np.mean((y_f_val - preds) ** 2)))
            ss_tot = float(np.sum((y_f_val - np.mean(y_f_val)) ** 2))
            ss_res = float(np.sum((y_f_val - preds) ** 2))
            r2 = float(1.0 - (ss_res / ss_tot)) if ss_tot > 0 else 0.0
            wape = float(np.sum(np.abs(y_f_val - preds)) / np.sum(y_f_val)) * 100.0 if np.sum(y_f_val) > 0 else 0.0
            
            fold_records.append({
                "fold": fold + 1,
                "model": name,
                "train_samples": len(f_tr_idx),
                "val_samples": len(f_val_idx),
                "val_unique_buildings": len(val_bldgs),
                "mae_mt": round(mae, 4),
                "rmse_mt": round(rmse, 4),
                "r2": round(r2, 4),
                "wape_pct": round(wape, 2),
                "train_time_sec": round(elapsed, 3)
            })
            
    cv_df = pd.DataFrame(fold_records)
    cv_df.to_csv(os.path.join(RESULTS_DIR, "cross_validation_metrics.csv"), index=False)
    
    # Compute summary across folds
    summary_records = []
    for m in models_to_cv:
        sub = cv_df[cv_df["model"] == m]
        summary_records.append({
            "model": m,
            "cv_mae_mean": round(float(sub["mae_mt"].mean()), 4),
            "cv_mae_std": round(float(sub["mae_mt"].std()), 4),
            "cv_rmse_mean": round(float(sub["rmse_mt"].mean()), 4),
            "cv_rmse_std": round(float(sub["rmse_mt"].std()), 4),
            "cv_r2_mean": round(float(sub["r2"].mean()), 4),
            "cv_r2_std": round(float(sub["r2"].std()), 4),
            "cv_wape_mean": round(float(sub["wape_pct"].mean()), 2),
            "cv_wape_std": round(float(sub["wape_pct"].std()), 2)
        })
    sum_df = pd.DataFrame(summary_records)
    sum_df.to_csv(os.path.join(RESULTS_DIR, "cross_validation_summary.csv"), index=False)
    
    create_cv_report(cv_df, sum_df)
    print("\nGroupKFold cross-validation complete. Outputs saved to results/cross_validation_metrics.csv.")
    return cv_df, sum_df

def create_cv_report(cv_df: pd.DataFrame, sum_df: pd.DataFrame):
    report_path = os.path.join(REPORTS_DIR, "cross_validation_report.md")
    content = f"""# 5-Fold GroupKFold Cross-Validation Performance Report

**Manuscript:** Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation  
**Dataset:** City of Seattle Building Energy Benchmarking Data (Development Partition)  
**Partitioning Protocol:** 5-Fold GroupKFold grouped strictly by `OSEBuildingID` (zero facility contamination across folds).  
**Preprocessing:** Preprocessing pipelines fitted strictly inside each fold training partition.  

---

## 1. Cross-Validation Summary (Mean $\\pm$ Standard Deviation)

| Model Architecture | 5-Fold Mean MAE (MT) | 5-Fold Mean RMSE (MT) | 5-Fold Mean $R^2$ | 5-Fold Mean WAPE (%) |
| :--- | :--- | :--- | :--- | :--- |
"""
    for _, r in sum_df.iterrows():
        mae_s = f"{r['cv_mae_mean']:.2f} $\\pm$ {r['cv_mae_std']:.2f}"
        rmse_s = f"{r['cv_rmse_mean']:.2f} $\\pm$ {r['cv_rmse_std']:.2f}"
        r2_s = f"{r['cv_r2_mean']:.4f} $\\pm$ {r['cv_r2_std']:.4f}"
        wape_s = f"{r['cv_wape_mean']:.2f}% $\\pm$ {r['cv_wape_std']:.2f}%"
        content += f"| **{r['model'].upper()}** | {mae_s} | {rmse_s} | {r2_s} | {wape_s} |\n"
        
    content += "\n---\n\n## 2. Fold-Level Execution Details\n\n"
    # Convert cv_df to markdown table without external dependencies
    headers = list(cv_df.columns)
    header_line = "| " + " | ".join(headers) + " |\n"
    separator_line = "| " + " | ".join(["---"] * len(headers)) + " |\n"
    rows_lines = "".join(
        "| " + " | ".join(str(val) for val in row) + " |\n"
        for row in cv_df.values
    )
    content += header_line + separator_line + rows_lines
    
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    run_group_cross_validation(fast_mode=False)
