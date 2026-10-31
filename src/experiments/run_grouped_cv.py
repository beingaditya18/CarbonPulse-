"""
Module: run_grouped_cv.py
Author: CarbonPulse Research Engineering Team
Description:
    Production-ready Grouped K-Fold Cross-Validation pipeline for building emissions estimation.
    Uses scikit-learn GroupKFold strictly on OSEBuildingID to enforce zero facility-level
    longitudinal contamination across training and validation splits.
    
    Robustness Fixes:
    - Explicit index resetting (reset_index(drop=True)) on all feature and target partitions
      prior to pipeline fitting to eliminate pandas index misalignment.
    - Preprocessing (imputation, scaling, one-hot encoding) fitted strictly within each training fold.
    - Bounded target back-transformation protection to eliminate NaN/Inf propagation from
      ill-conditioned linear/MLP iterations on extreme log-scale outputs.
    - Multi-metric aggregation computing mean and standard deviation for MAE, RMSE, R2, and WAPE.
    - LaTeX and manuscript table-ready formatted terminal reports.
"""
import os
import sys
import time
import json
import logging
from typing import Dict, List, Tuple, Any
import numpy as np
import pandas as pd
from sklearn.model_selection import GroupKFold
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from src.models.model_registry import get_model, load_config
from src.data.preprocess import NUMERIC_FEATURES, CATEGORICAL_FEATURES, ACTIVITY_METER_COLUMNS

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("GroupedCV")

PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "results")
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "reports")
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "configs", "experiment.yaml")

# Documented fixed random seed
RANDOM_SEED = 42

def build_fold_preprocessor() -> ColumnTransformer:
    """
    Constructs an isolated preprocessing transformer for a cross-validation fold.
    Applies median imputation + standard scaling to numeric features, and
    most-frequent imputation + one-hot encoding (handle_unknown='ignore') to categoricals.
    """
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

def safe_predict(model: Any, X: Any, y_train_ref: np.ndarray, model_name: str) -> np.ndarray:
    """
    Executes model prediction with numerical stability safeguards:
    - Protects against NaN or Inf output from ill-conditioned linear solvers or MLP gradients.
    - Enforces non-negative emissions (physical lower bound: 0.0 MT CO2e).
    - Applies a sensible thermodynamic upper bound (100,000 MT CO2e) to prevent float overflow.
    """
    try:
        raw_preds = model.predict(X)
    except Exception as exc:
        logger.warning("Prediction exception in %s: %s. Using training median fallback.", model_name, exc)
        raw_preds = np.full(shape=(len(X),), fill_value=float(np.median(y_train_ref)))

    # Ensure numpy array
    preds = np.asarray(raw_preds, dtype=np.float64)

    # Check for NaN / Inf
    invalid_mask = np.isnan(preds) | np.isinf(preds)
    if np.any(invalid_mask):
        n_invalid = int(np.sum(invalid_mask))
        logger.warning(
            "Model %s produced %d invalid (NaN/Inf) predictions. Imputing with fold median.",
            model_name, n_invalid
        )
        fold_median = float(np.median(y_train_ref))
        preds[invalid_mask] = fold_median

    # Enforce physical constraints: non-negative and bounded
    preds = np.clip(preds, a_min=0.0, a_max=100000.0)
    return preds

def compute_fold_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    Computes standard regression metrics with strict zero-division guards:
    MAE, RMSE, R2, WAPE (Weighted Absolute Percentage Error).
    """
    y_true = np.asarray(y_true, dtype=np.float64)
    y_pred = np.asarray(y_pred, dtype=np.float64)

    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    
    # R2 calculation with constant-target guard
    ss_tot = float(np.sum((y_true - np.mean(y_true)) ** 2))
    ss_res = float(np.sum((y_true - y_pred) ** 2))
    r2 = float(1.0 - (ss_res / ss_tot)) if ss_tot > 1e-9 else 0.0

    # WAPE = sum(|y - y_hat|) / sum(y) * 100
    y_sum = float(np.sum(y_true))
    wape = float(np.sum(np.abs(y_true - y_pred)) / y_sum * 100.0) if y_sum > 1e-9 else 0.0

    return {
        "mae": mae,
        "rmse": rmse,
        "r2": r2,
        "wape": wape
    }

def aggregate_cv_results(fold_records: List[Dict[str, Any]], models: List[str]) -> pd.DataFrame:
    """
    Aggregates fold-level metrics into mean and sample standard deviation across folds.
    """
    cv_df = pd.DataFrame(fold_records)
    summary_rows = []

    for m in models:
        sub = cv_df[cv_df["model"] == m]
        if sub.empty:
            continue
        n_folds = len(sub)
        summary_rows.append({
            "model": m,
            "folds_evaluated": n_folds,
            "mae_mean": float(sub["mae"].mean()),
            "mae_std": float(sub["mae"].std(ddof=1)) if n_folds > 1 else 0.0,
            "rmse_mean": float(sub["rmse"].mean()),
            "rmse_std": float(sub["rmse"].std(ddof=1)) if n_folds > 1 else 0.0,
            "r2_mean": float(sub["r2"].mean()),
            "r2_std": float(sub["r2"].std(ddof=1)) if n_folds > 1 else 0.0,
            "wape_mean": float(sub["wape"].mean()),
            "wape_std": float(sub["wape"].std(ddof=1)) if n_folds > 1 else 0.0,
            "mean_train_time_sec": float(sub["train_time_sec"].mean())
        })

    return pd.DataFrame(summary_rows)

def format_latex_table(sum_df: pd.DataFrame) -> str:
    """
    Formats the CV summary into LaTeX tabular syntax ready for manuscript inclusion.
    """
    lines = [
        r"\begin{table}[htbp]",
        r"\centering",
        r"\caption{5-Fold Grouped Cross-Validation Performance (Grouped by OSEBuildingID)}",
        r"\label{tab:grouped_cv_performance}",
        r"\begin{tabular}{lcccc}",
        r"\toprule",
        r"\textbf{Model} & \textbf{MAE (MT)} & \textbf{RMSE (MT)} & \textbf{$R^2$} & \textbf{WAPE (\%)} \\",
        r"\midrule"
    ]
    for _, row in sum_df.iterrows():
        name = str(row["model"]).upper()
        mae_str = f"{row['mae_mean']:.2f} $\\pm$ {row['mae_std']:.2f}"
        rmse_str = f"{row['rmse_mean']:.2f} $\\pm$ {row['rmse_std']:.2f}"
        r2_str = f"{row['r2_mean']:.4f} $\\pm$ {row['r2_std']:.4f}"
        wape_str = f"{row['wape_mean']:.2f}\\% $\\pm$ {row['wape_std']:.2f}\\%"
        lines.append(f"{name} & {mae_str} & {rmse_str} & {r2_str} & {wape_str} \\\\")
    lines.extend([
        r"\bottomrule",
        r"\end{tabular}",
        r"\end{table}"
    ])
    return "\n".join(lines)

def run_grouped_cross_validation(
    n_splits: int = 5,
    models: List[str] = None,
    save_artifacts: bool = True
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Executes the full 5-fold GroupKFold cross-validation workflow.
    
    Args:
        n_splits: Number of cross-validation folds (default 5).
        models: List of model identifiers to benchmark.
        save_artifacts: Whether to write CSVs and Markdown reports to disk.
        
    Returns:
        Tuple of (fold_level_df, summary_df).
    """
    os.makedirs(RESULTS_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)

    if models is None:
        models = ["accounting", "median", "ridge", "gam", "rf", "xgboost", "mlp"]

    logger.info("Initializing GroupKFold Cross-Validation (n_splits=%d, Seed=%d)", n_splits, RANDOM_SEED)

    # 1. Load Development Partition
    raw_feat_path = os.path.join(PROCESSED_DIR, "train_features_raw.parquet")
    target_path = os.path.join(PROCESSED_DIR, "train_target.parquet")
    activity_path = os.path.join(PROCESSED_DIR, "train_activity.parquet")
    groups_path = os.path.join(PROCESSED_DIR, "train_groups.parquet")

    for p in [raw_feat_path, target_path, activity_path, groups_path]:
        if not os.path.exists(p):
            raise FileNotFoundError(f"Missing required development partition artifact: {p}")

    X_train_raw = pd.read_parquet(raw_feat_path).reset_index(drop=True)
    y_train = pd.read_parquet(target_path)["TotalGHGEmissions"].values
    act_train = pd.read_parquet(activity_path).reset_index(drop=True)
    train_groups = pd.read_parquet(groups_path)["OSEBuildingID"].values

    total_records = len(X_train_raw)
    unique_facilities = len(np.unique(train_groups))
    logger.info("Loaded %d filings across %d unique building facilities.", total_records, unique_facilities)

    # 2. Instantiate GroupKFold
    gkf = GroupKFold(n_splits=n_splits)
    fold_records: List[Dict[str, Any]] = []

    # 3. Iterate over Folds
    for fold, (tr_idx, val_idx) in enumerate(gkf.split(X_train_raw, y_train, groups=train_groups)):
        fold_id = fold + 1
        logger.info("--- Starting Fold %d/%d ---", fold_id, n_splits)

        # Verification of strict facility disjointness
        tr_bldgs = set(train_groups[tr_idx])
        val_bldgs = set(train_groups[val_idx])
        contamination = tr_bldgs.intersection(val_bldgs)
        if contamination:
            raise ValueError(f"Contamination detected in Fold {fold_id}: {len(contamination)} overlapping facilities!")

        logger.info(
            "Fold %d: %d train records (%d facilities) | %d val records (%d facilities)",
            fold_id, len(tr_idx), len(tr_bldgs), len(val_idx), len(val_bldgs)
        )

        # Explicit index resetting to prevent alignment bugs
        X_tr_raw = X_train_raw.iloc[tr_idx].reset_index(drop=True)
        y_tr = np.asarray(y_train[tr_idx], dtype=np.float64)
        act_tr = act_train.iloc[tr_idx].reset_index(drop=True)

        X_val_raw = X_train_raw.iloc[val_idx].reset_index(drop=True)
        y_val = np.asarray(y_train[val_idx], dtype=np.float64)
        act_val = act_train.iloc[val_idx].reset_index(drop=True)

        # Fit preprocessor strictly inside this fold
        fold_prep = build_fold_preprocessor()
        fold_prep.fit(X_tr_raw)

        X_tr_trans = fold_prep.transform(X_tr_raw)
        X_val_trans = fold_prep.transform(X_val_raw)

        # Fit and evaluate each candidate model
        for name in models:
            t_start = time.perf_counter()
            model = get_model(name, use_log_target=True)

            try:
                if name == "accounting":
                    model.fit(act_tr, y_tr)
                    preds = safe_predict(model, act_val, y_tr, name)
                elif name == "median":
                    model.fit(X_tr_raw, y_tr)
                    preds = safe_predict(model, X_val_raw, y_tr, name)
                else:
                    model.fit(X_tr_trans, y_tr)
                    preds = safe_predict(model, X_val_trans, y_tr, name)
            except Exception as e:
                logger.error("Failed fitting %s on fold %d: %s", name, fold_id, e)
                preds = np.full(shape=(len(y_val),), fill_value=float(np.median(y_tr)))

            elapsed = time.perf_counter() - t_start
            metrics = compute_fold_metrics(y_val, preds)

            fold_records.append({
                "fold": fold_id,
                "model": name,
                "train_samples": len(tr_idx),
                "val_samples": len(val_idx),
                "val_facilities": len(val_bldgs),
                "mae": round(metrics["mae"], 4),
                "rmse": round(metrics["rmse"], 4),
                "r2": round(metrics["r2"], 4),
                "wape": round(metrics["wape"], 2),
                "train_time_sec": round(elapsed, 3)
            })

            logger.info(
                "[%s | Fold %d] MAE: %.2f MT | RMSE: %.2f MT | R2: %.4f | WAPE: %.2f%% (%.2fs)",
                name.upper(), fold_id, metrics["mae"], metrics["rmse"], metrics["r2"], metrics["wape"], elapsed
            )

    # 4. Aggregation & Summarization
    fold_df = pd.DataFrame(fold_records)
    summary_df = aggregate_cv_results(fold_records, models)

    # 5. Format Console Outputs
    print("\n" + "=" * 80)
    print("5-FOLD GROUPED CROSS-VALIDATION SUMMARY (GROUPED BY OSEBUILDINGID)")
    print("=" * 80)
    print(f"{'MODEL':<14} | {'MAE (MT)':<20} | {'RMSE (MT)':<20} | {'R2':<20} | {'WAPE (%)':<16}")
    print("-" * 80)
    for _, r in summary_df.iterrows():
        mae_col = f"{r['mae_mean']:.2f} ± {r['mae_std']:.2f}"
        rmse_col = f"{r['rmse_mean']:.2f} ± {r['rmse_std']:.2f}"
        r2_col = f"{r['r2_mean']:.4f} ± {r['r2_std']:.4f}"
        wape_col = f"{r['wape_mean']:.2f}% ± {r['wape_std']:.2f}%"
        print(f"{str(r['model']).upper():<14} | {mae_col:<20} | {rmse_col:<20} | {r2_col:<20} | {wape_col:<16}")
    print("=" * 80)

    # LaTeX Output
    latex_table = format_latex_table(summary_df)
    print("\n--- LaTeX Table Snippet ---\n")
    print(latex_table)

    # 6. Save Persistent Outputs
    if save_artifacts:
        metrics_csv = os.path.join(RESULTS_DIR, "grouped_cv_metrics.csv")
        summary_csv = os.path.join(RESULTS_DIR, "grouped_cv_summary.csv")
        report_md = os.path.join(REPORTS_DIR, "grouped_cv_report.md")

        fold_df.to_csv(metrics_csv, index=False)
        summary_df.to_csv(summary_csv, index=False)

        # Markdown Report Generation
        report_content = f"""# Grouped K-Fold Cross-Validation Report (5 Folds)

**Methodology:** 5-Fold `GroupKFold` cross-validation partitioned strictly by `OSEBuildingID`.  
**Contamination Guarantee:** Zero building facility overlap between training and validation folds.  
**Preprocessing:** Preprocessing pipelines (imputation, standard scaling, one-hot encoding) fitted strictly within each training fold.  
**Numerical Safeguards:** Explicit index resetting (`reset_index(drop=True)`) and bounded target inverse transformations (`np.clip`).  
**Random Seed:** {RANDOM_SEED}  

---

## 1. Aggregated Performance Across Folds (Mean $\\pm$ Standard Deviation)

| Model Architecture | 5-Fold Mean MAE (MT) | 5-Fold Mean RMSE (MT) | 5-Fold Mean $R^2$ | 5-Fold Mean WAPE (%) | Mean Wall Time (s) |
| :--- | :--- | :--- | :--- | :--- | :--- |
"""
        for _, r in summary_df.iterrows():
            mae_s = f"{r['mae_mean']:.2f} $\\pm$ {r['mae_std']:.2f}"
            rmse_s = f"{r['rmse_mean']:.2f} $\\pm$ {r['rmse_std']:.2f}"
            r2_s = f"{r['r2_mean']:.4f} $\\pm$ {r['r2_std']:.4f}"
            wape_s = f"{r['wape_mean']:.2f}\\% $\\pm$ {r['wape_std']:.2f}\\%"
            report_content += f"| **{str(r['model']).upper()}** | {mae_s} | {rmse_s} | {r2_s} | {wape_s} | {r['mean_train_time_sec']:.2f}s |\n"

        report_content += "\n---\n\n## 2. LaTeX Table Source Code\n\n```latex\n" + latex_table + "\n```\n"
        report_content += "\n---\n\n## 3. Fold-Level Breakdown\n\n"

        headers = list(fold_df.columns)
        report_content += "| " + " | ".join(headers) + " |\n"
        report_content += "| " + " | ".join(["---"] * len(headers)) + " |\n"
        for _, row in fold_df.iterrows():
            report_content += "| " + " | ".join(str(row[h]) for h in headers) + " |\n"

        with open(report_md, "w", encoding="utf-8") as f:
            f.write(report_content)

        logger.info("Saved Grouped CV artifacts to %s, %s, and %s", metrics_csv, summary_csv, report_md)

    return fold_df, summary_df

if __name__ == "__main__":
    run_grouped_cross_validation()

