"""
Module: run_temporal_validation.py
Author: CarbonPulse Research Engineering Team
Description:
    Dedicated temporal validation and cohort stratification experiment.
    Evaluates out-of-time model generalization by partitioning the Seattle Building
    Energy Benchmarking repository chronologically:
    - Training Partition: Reporting Years 2015 - 2022
    - Testing Partition:  Reporting Years 2023 - 2025
    
    Stratification Filter:
    - Observed Cohort: Buildings present in 2015-2022 training data (evaluates longitudinal drift).
    - Unseen Generalization Cohort: Entirely novel facilities first appearing in 2023-2025
      (evaluates true spatial/structural generalization to newly constructed or newly reporting assets).
      
    Outputs:
    - Clean tabular console reports with LaTeX copy-paste formatting.
    - Persistent metrics CSV at results/temporal_validation_metrics.csv.
    - Markdown report at reports/temporal_validation_report.md.
"""
import os
import sys
import time
import logging
from typing import Dict, List, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from src.data.load_data import load_raw_dataset
from src.data.preprocess import clean_dataset, NUMERIC_FEATURES, CATEGORICAL_FEATURES, ACTIVITY_METER_COLUMNS
from src.data.build_features import engineer_features
from src.models.model_registry import get_model

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("TemporalValidation")

RESULTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "results")
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "reports")

RANDOM_SEED = 42

def build_temporal_preprocessor() -> ColumnTransformer:
    """Constructs preprocessing transformer fitted strictly on historical training partition."""
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
    """Executes prediction with bounding safeguards to prevent NaN/overflow."""
    try:
        raw_preds = model.predict(X)
    except Exception as exc:
        logger.warning("Prediction exception in %s: %s. Using training median.", model_name, exc)
        raw_preds = np.full(shape=(len(X),), fill_value=float(np.median(y_train_ref)))

    preds = np.asarray(raw_preds, dtype=np.float64)
    invalid_mask = np.isnan(preds) | np.isinf(preds)
    if np.any(invalid_mask):
        preds[invalid_mask] = float(np.median(y_train_ref))

    return np.clip(preds, a_min=0.0, a_max=100000.0)

def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """Computes MAE, RMSE, R2, and WAPE."""
    y_true = np.asarray(y_true, dtype=np.float64)
    y_pred = np.asarray(y_pred, dtype=np.float64)

    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))

    ss_tot = float(np.sum((y_true - np.mean(y_true)) ** 2))
    ss_res = float(np.sum((y_true - y_pred) ** 2))
    r2 = float(1.0 - (ss_res / ss_tot)) if ss_tot > 1e-9 else 0.0

    y_sum = float(np.sum(y_true))
    wape = float(np.sum(np.abs(y_true - y_pred)) / y_sum * 100.0) if y_sum > 1e-9 else 0.0

    return {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "r2": round(r2, 4),
        "wape": round(wape, 2)
    }

def run_temporal_validation(
    train_years: Tuple[int, int] = (2015, 2022),
    test_years: Tuple[int, int] = (2023, 2025),
    models: List[str] = None
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Executes chronological train/test split and cohort-stratified evaluation.
    """
    os.makedirs(RESULTS_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)

    if models is None:
        models = ["accounting", "median", "ridge", "gam", "rf", "xgboost", "mlp"]

    logger.info("=" * 70)
    logger.info("TEMPORAL VALIDATION: Train Years %d-%d | Test Years %d-%d",
                train_years[0], train_years[1], test_years[0], test_years[1])
    logger.info("=" * 70)

    # 1. Load, Clean, and Engineer Features
    df_raw = load_raw_dataset()
    df_clean, _ = clean_dataset(df_raw)
    df_feat = engineer_features(df_clean)

    # Ensure DataYear is integer
    df_feat["DataYear"] = pd.to_numeric(df_feat["DataYear"], errors="coerce").fillna(2020).astype(int)

    # 2. Temporal Partitioning
    train_mask = (df_feat["DataYear"] >= train_years[0]) & (df_feat["DataYear"] <= train_years[1])
    test_mask = (df_feat["DataYear"] >= test_years[0]) & (df_feat["DataYear"] <= test_years[1])

    train_df = df_feat[train_mask].copy().reset_index(drop=True)
    test_df = df_feat[test_mask].copy().reset_index(drop=True)

    train_bldgs = set(train_df["OSEBuildingID"].dropna().unique())
    test_bldgs = set(test_df["OSEBuildingID"].dropna().unique())

    # 3. Stratification: Observed vs Unseen Cohorts
    observed_mask = test_df["OSEBuildingID"].isin(train_bldgs)
    unseen_mask = ~observed_mask

    obs_test_df = test_df[observed_mask].copy().reset_index(drop=True)
    uns_test_df = test_df[unseen_mask].copy().reset_index(drop=True)

    obs_bldgs = set(obs_test_df["OSEBuildingID"].dropna().unique())
    uns_bldgs = set(uns_test_df["OSEBuildingID"].dropna().unique())

    logger.info("Historical Train Partition (%d-%d): %d filings across %d unique facilities",
                train_years[0], train_years[1], len(train_df), len(train_bldgs))
    logger.info("Future Test Partition (%d-%d):      %d filings across %d unique facilities",
                test_years[0], test_years[1], len(test_df), len(test_bldgs))
    logger.info("  ├─ Observed Cohort (Seen in Train): %d filings across %d facilities (%.1f%%)",
                len(obs_test_df), len(obs_bldgs), (len(obs_test_df) / len(test_df)) * 100)
    logger.info("  └─ Unseen Cohort (Novel Facilities): %d filings across %d facilities (%.1f%%)",
                len(uns_test_df), len(uns_bldgs), (len(uns_test_df) / len(test_df)) * 100)

    # 4. Feature Extraction & Preprocessing
    X_train_raw = train_df[NUMERIC_FEATURES + CATEGORICAL_FEATURES].reset_index(drop=True)
    y_train = np.asarray(train_df["TotalGHGEmissions"].values, dtype=np.float64)
    act_train = train_df[ACTIVITY_METER_COLUMNS].reset_index(drop=True)

    X_test_raw = test_df[NUMERIC_FEATURES + CATEGORICAL_FEATURES].reset_index(drop=True)
    y_test = np.asarray(test_df["TotalGHGEmissions"].values, dtype=np.float64)
    act_test = test_df[ACTIVITY_METER_COLUMNS].reset_index(drop=True)

    X_obs_raw = obs_test_df[NUMERIC_FEATURES + CATEGORICAL_FEATURES].reset_index(drop=True)
    y_obs = np.asarray(obs_test_df["TotalGHGEmissions"].values, dtype=np.float64)
    act_obs = obs_test_df[ACTIVITY_METER_COLUMNS].reset_index(drop=True)

    X_uns_raw = uns_test_df[NUMERIC_FEATURES + CATEGORICAL_FEATURES].reset_index(drop=True)
    y_uns = np.asarray(uns_test_df["TotalGHGEmissions"].values, dtype=np.float64)
    act_uns = uns_test_df[ACTIVITY_METER_COLUMNS].reset_index(drop=True)

    # Fit preprocessor strictly on training data
    preprocessor = build_temporal_preprocessor()
    preprocessor.fit(X_train_raw)

    X_train_trans = preprocessor.transform(X_train_raw)
    X_test_trans = preprocessor.transform(X_test_raw)
    X_obs_trans = preprocessor.transform(X_obs_raw)
    X_uns_trans = preprocessor.transform(X_uns_raw)

    # 5. Fit & Evaluate Models Across Cohorts
    records = []

    for name in models:
        logger.info("Training and evaluating %s...", name.upper())
        t0 = time.perf_counter()
        model = get_model(name, use_log_target=True)

        if name == "accounting":
            model.fit(act_train, y_train)
            p_all = safe_predict(model, act_test, y_train, name)
            p_obs = safe_predict(model, act_obs, y_train, name)
            p_uns = safe_predict(model, act_uns, y_train, name)
        elif name == "median":
            model.fit(X_train_raw, y_train)
            p_all = safe_predict(model, X_test_raw, y_train, name)
            p_obs = safe_predict(model, X_obs_raw, y_train, name)
            p_uns = safe_predict(model, X_uns_raw, y_train, name)
        else:
            model.fit(X_train_trans, y_train)
            p_all = safe_predict(model, X_test_trans, y_train, name)
            p_obs = safe_predict(model, X_obs_trans, y_train, name)
            p_uns = safe_predict(model, X_uns_trans, y_train, name)

        train_time = time.perf_counter() - t0

        m_all = compute_metrics(y_test, p_all)
        m_obs = compute_metrics(y_obs, p_obs)
        m_uns = compute_metrics(y_uns, p_uns)

        for cohort_name, m, count, n_bldgs in [
            ("Overall_2023_2025", m_all, len(y_test), len(test_bldgs)),
            ("Observed_Cohort", m_obs, len(y_obs), len(obs_bldgs)),
            ("Unseen_Cohort", m_uns, len(y_uns), len(uns_bldgs))
        ]:
            records.append({
                "model": name,
                "cohort": cohort_name,
                "sample_count": count,
                "facility_count": n_bldgs,
                "mae": m["mae"],
                "rmse": m["rmse"],
                "r2": m["r2"],
                "wape": m["wape"],
                "train_time_sec": round(train_time, 3)
            })

    metrics_df = pd.DataFrame(records)

    # 6. Format Terminal Comparison Tables
    print("\n" + "=" * 88)
    print("TEMPORAL HOLDOUT VALIDATION (2015-2022 TRAIN -> 2023-2025 TEST)")
    print("=" * 88)

    for c_id, c_label in [
        ("Observed_Cohort", "OBSERVED COHORT (Facilities Seen in 2015-2022 Training Data)"),
        ("Unseen_Cohort", "UNSEEN GENERALIZATION COHORT (Entirely Novel Facilities in 2023-2025)"),
        ("Overall_2023_2025", "OVERALL TEST PARTITION (All 2023-2025 Filings)")
    ]:
        sub = metrics_df[metrics_df["cohort"] == c_id]
        print(f"\n--- {c_label} ---")
        print(f"{'MODEL':<14} | {'MAE (MT)':<14} | {'RMSE (MT)':<14} | {'R2':<12} | {'WAPE (%)':<12}")
        print("-" * 72)
        for _, r in sub.iterrows():
            print(f"{str(r['model']).upper():<14} | {r['mae']:<14.2f} | {r['rmse']:<14.2f} | {r['r2']:<12.4f} | {r['wape']:<12.2f}%")

    print("\n" + "=" * 88)

    # 7. LaTeX Table
    latex_lines = [
        r"\begin{table}[htbp]",
        r"\centering",
        r"\caption{Temporal Holdout Validation Performance: Observed vs. Unseen Generalization Cohorts (2015--2022 Train $\to$ 2023--2025 Test)}",
        r"\label{tab:temporal_validation}",
        r"\begin{tabular}{lcccc|cccc}",
        r"\toprule",
        r" & \multicolumn{4}{c|}{\textbf{Observed Facilities ($N=" + str(len(y_obs)) + r"$)}} & \multicolumn{4}{c}{\textbf{Unseen Facilities ($N=" + str(len(y_uns)) + r"$)}} \\",
        r"\textbf{Model} & \textbf{MAE} & \textbf{RMSE} & \textbf{$R^2$} & \textbf{WAPE} & \textbf{MAE} & \textbf{RMSE} & \textbf{$R^2$} & \textbf{WAPE} \\",
        r"\midrule"
    ]
    for m in models:
        r_obs = metrics_df[(metrics_df["model"] == m) & (metrics_df["cohort"] == "Observed_Cohort")].iloc[0]
        r_uns = metrics_df[(metrics_df["model"] == m) & (metrics_df["cohort"] == "Unseen_Cohort")].iloc[0]
        latex_lines.append(
            f"{m.upper()} & {r_obs['mae']:.2f} & {r_obs['rmse']:.2f} & {r_obs['r2']:.4f} & {r_obs['wape']:.2f}\\% & "
            f"{r_uns['mae']:.2f} & {r_uns['rmse']:.2f} & {r_uns['r2']:.4f} & {r_uns['wape']:.2f}\\% \\\\"
        )
    latex_lines.extend([
        r"\bottomrule",
        r"\end{tabular}",
        r"\end{table}"
    ])
    latex_str = "\n".join(latex_lines)

    # 8. Save CSV and Markdown Report
    csv_path = os.path.join(RESULTS_DIR, "temporal_validation_metrics.csv")
    metrics_df.to_csv(csv_path, index=False)

    report_path = os.path.join(REPORTS_DIR, "temporal_validation_report.md")
    report_content = f"""# Temporal Validation & Cohort Stratification Report

**Temporal Partitioning:**  
- **Training Set:** Reporting Years {train_years[0]}--{train_years[1]} ($N={len(train_df):,}$ filings, ${len(train_bldgs):,}$ facilities)  
- **Test Set:** Reporting Years {test_years[0]}--{test_years[1]} ($N={len(test_df):,}$ filings, ${len(test_bldgs):,}$ facilities)  

**Stratification Protocol:**  
1. **Observed Cohort:** ${len(obs_test_df):,}$ filings across ${len(obs_bldgs):,}$ facilities that were already present in the training historical data. Evaluates longitudinal temporal drift and reporting consistency.  
2. **Unseen Generalization Cohort:** ${len(uns_test_df):,}$ filings across ${len(uns_bldgs):,}$ entirely new facilities first filing in {test_years[0]}--{test_years[1]}. Evaluates out-of-facility transferability and generalization to new construction.  

---

## 1. Comparative Performance Across Cohorts

| Model Architecture | Cohort Partition | Sample Size | Unique Buildings | MAE (MT) | RMSE (MT) | $R^2$ | WAPE (%) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
"""
    for _, r in metrics_df.iterrows():
        report_content += f"| **{str(r['model']).upper()}** | `{r['cohort']}` | {r['sample_count']:,} | {r['facility_count']:,} | {r['mae']:.2f} | {r['rmse']:.2f} | {r['r2']:.4f} | {r['wape']:.2f}% |\n"

    report_content += "\n---\n\n## 2. LaTeX Table Code\n\n```latex\n" + latex_str + "\n```\n"

    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_content)

    logger.info("Saved temporal validation metrics to %s and %s", csv_path, report_path)
    return metrics_df, {"latex_table": latex_str}

if __name__ == "__main__":
    run_temporal_validation()

