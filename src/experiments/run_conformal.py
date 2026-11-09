"""
Module: run_conformal.py
Author: Aditya Mandloi, Dr. Ashok Kumar Gupta
Affiliation: School of Data Science and Forecasting, Devi Ahilya Vishwavidyalaya, Indore, India
Description:
    Implements Facility-Level Conformal Prediction and Conformalized Quantile Regression (CQR)
    for meter-free building GHG emissions estimation.
    
    Experimental Protocol:
    1. Development facilities (OSEBuildingID) split into:
       - Model Fit: 70% (~2,116 facilities)
       - Validation: 15% (~454 facilities)
       - Calibration: 15% (~454 facilities)
       Grouping is strictly facility-disjoint. Held-out test partition (757 facilities, 7,366 rows)
       is NEVER touched for calibration or quantile selection; touched once for final evaluation.
    2. Conformal Methods:
       (a) Observation-level split conformal (baseline non-conformity R_i = |y_i - yhat_i|).
       (b) Facility-level split conformal with S_g = |y_{g, latest} - yhat_{g, latest}| on the latest
           recorded year per calibration facility.
       (c) Facility-level CQR using LightGBM quantile regressors (alpha/2 and 1 - alpha/2) with
           conformity scores E_g = max(q_low(x_g) - y_g, y_g - q_high(x_g)) on latest year.
    3. Quantile Rule:
       k = ceil((G_cal + 1) * (1 - alpha)), for alpha in {0.10, 0.20}.
    4. Subgroup Evaluations:
       - Marginal coverage and full facility-level coverage (100% of years covered).
       - Mean and median interval width on original tonne scale (expm1 inverse-transformed).
       - Stratified by Building Type, Floor-Area Quartile, and Applicability Domain (AD) group.

Outputs:
    - results/conformal_metrics.csv
    - results/conformal_intervals.csv
    - results/conformal_subgroup_metrics.csv
    - reports/conformal_prediction_report.md
    - tables/tab05_conformal_prediction.md
"""
import os
import sys
import math
import logging
from typing import Dict, List, Any, Tuple
import numpy as np
import pandas as pd
import xgboost as xgb
import lightgbm as lgb

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("ConformalPrediction")

PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "results")
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "reports")
TABLES_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "tables")

RANDOM_SEED = 42

def run_conformal_prediction_experiments() -> Dict[str, Any]:
    """
    Executes observation-level conformal, facility-level split conformal, and facility-level CQR.
    """
    os.makedirs(RESULTS_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)
    os.makedirs(TABLES_DIR, exist_ok=True)

    # 1. Load Data
    logger.info("Loading preprocessed features and tracking datasets...")
    X_train_df = pd.read_parquet(os.path.join(PROCESSED_DIR, "train_features.parquet"))
    y_train_df = pd.read_parquet(os.path.join(PROCESSED_DIR, "train_target.parquet"))
    track_train = pd.read_parquet(os.path.join(PROCESSED_DIR, "train_tracking.parquet"))
    raw_train = pd.read_parquet(os.path.join(PROCESSED_DIR, "train_features_raw.parquet"))

    X_test_df = pd.read_parquet(os.path.join(PROCESSED_DIR, "test_features.parquet"))
    y_test_df = pd.read_parquet(os.path.join(PROCESSED_DIR, "test_target.parquet"))
    track_test = pd.read_parquet(os.path.join(PROCESSED_DIR, "test_tracking.parquet"))
    raw_test = pd.read_parquet(os.path.join(PROCESSED_DIR, "test_features_raw.parquet"))

    y_train = y_train_df["TotalGHGEmissions"].values
    y_test = y_test_df["TotalGHGEmissions"].values

    # Target in log1p space
    z_train = np.log1p(np.maximum(0.0, y_train))
    z_test = np.log1p(np.maximum(0.0, y_test))

    dev_facilities = track_train["OSEBuildingID"].values
    unique_dev_facs = np.unique(dev_facilities)
    n_dev_facs = len(unique_dev_facs)

    logger.info("Total dev facilities: %d | Total test facilities: %d", n_dev_facs, track_test["OSEBuildingID"].nunique())

    # 2. Strict Facility-Disjoint Partitioning on Development Data (70% Fit, 15% Val, 15% Cal)
    rng = np.random.RandomState(RANDOM_SEED)
    shuffled_facs = rng.permutation(unique_dev_facs)

    n_fit = int(n_dev_facs * 0.70)
    n_val = int(n_dev_facs * 0.15)
    
    fit_facs = set(shuffled_facs[:n_fit])
    val_facs = set(shuffled_facs[n_fit:n_fit + n_val])
    cal_facs = set(shuffled_facs[n_fit + n_val:])

    fit_idx = np.where(np.isin(dev_facilities, list(fit_facs)))[0]
    val_idx = np.where(np.isin(dev_facilities, list(val_facs)))[0]
    cal_idx = np.where(np.isin(dev_facilities, list(cal_facs)))[0]

    logger.info("Partitioning: Fit=%d facs (%d rows), Val=%d facs (%d rows), Cal=%d facs (%d rows)",
                len(fit_facs), len(fit_idx), len(val_facs), len(val_idx), len(cal_facs), len(cal_idx))

    # 3. Fit Primary Point Predictor (XGBoost on log1p space) on Fit Partition
    logger.info("Training primary XGBoost regressor on fit partition...")
    point_regressor = xgb.XGBRegressor(
        n_estimators=150,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=RANDOM_SEED,
        n_jobs=-1
    )
    point_regressor.fit(X_train_df.iloc[fit_idx].values, z_train[fit_idx])

    # Point predictions in log space and inverse-transformed tonnes
    z_hat_cal = point_regressor.predict(X_train_df.iloc[cal_idx].values)
    y_hat_cal = np.maximum(0.0, np.expm1(z_hat_cal))

    z_hat_test = point_regressor.predict(X_test_df.values)
    y_hat_test = np.maximum(0.0, np.expm1(z_hat_test))

    # Calibration dataset metadata
    cal_df = track_train.iloc[cal_idx].copy().reset_index(drop=True)
    cal_df["y_true"] = y_train[cal_idx]
    cal_df["y_hat"] = y_hat_cal
    cal_df["z_true"] = z_train[cal_idx]
    cal_df["z_hat"] = z_hat_cal
    cal_df["res_tonne"] = np.abs(cal_df["y_true"] - cal_df["y_hat"])
    cal_df["res_log"] = np.abs(cal_df["z_true"] - cal_df["z_hat"])

    # Facility-level calibration: extract latest recorded year per calibration facility
    cal_fac_latest = cal_df.sort_values("DataYear").groupby("OSEBuildingID").last().reset_index()
    G_cal = len(cal_fac_latest)
    N_cal = len(cal_df)
    logger.info("Calibration facilities G_cal=%d | Total calibration observations N_cal=%d", G_cal, N_cal)

    # 4. Load Applicability Domain Status (from T8) if available
    ad_eval_path = os.path.join(RESULTS_DIR, "applicability_domain_eval.csv")
    if os.path.exists(ad_eval_path):
        ad_eval_df = pd.read_csv(ad_eval_path)
        test_ad_status = ad_eval_df["ad_status"].values
    else:
        test_ad_status = np.repeat("Unknown", len(X_test_df))

    # Determine Floor-Area Quartiles strictly on Dev partition
    gfa_dev = raw_train["PropertyGFATotal"].fillna(raw_train["PropertyGFATotal"].median()).values
    q25 = float(np.percentile(gfa_dev, 25.0))
    q50 = float(np.percentile(gfa_dev, 50.0))
    q75 = float(np.percentile(gfa_dev, 75.0))

    gfa_test = raw_test["PropertyGFATotal"].fillna(q50).values
    test_gfa_quartiles = np.empty(len(gfa_test), dtype=object)
    test_gfa_quartiles[gfa_test <= q25] = "Q1 (<=25k)"
    test_gfa_quartiles[(gfa_test > q25) & (gfa_test <= q50)] = "Q2 (25k-50k)"
    test_gfa_quartiles[(gfa_test > q50) & (gfa_test <= q75)] = "Q3 (50k-100k)"
    test_gfa_quartiles[gfa_test > q75] = "Q4 (>100k)"

    test_bldg_types = raw_test["PrimaryUseCategory"].fillna("Other").astype(str).values

    # Containers for results
    summary_metrics_rows = []
    subgroup_metrics_rows = []
    intervals_export_df = pd.DataFrame({
        "row_id": np.arange(len(y_test)),
        "facility": track_test["OSEBuildingID"].values,
        "year": track_test["DataYear"].values,
        "y_true": y_test,
        "y_hat": y_hat_test,
        "bldg_type": test_bldg_types,
        "gfa_quartile": test_gfa_quartiles,
        "ad_status": test_ad_status
    })

    test_fac_ids = track_test["OSEBuildingID"].values
    unique_test_facs = np.unique(test_fac_ids)
    G_test = len(unique_test_facs)

    # 5. Execute Conformal Protocols for alpha in {0.10, 0.20}
    for alpha in [0.10, 0.20]:
        target_cov = 1.0 - alpha
        nominal_pct = int(target_cov * 100.0)

        # Finite sample quantile ranks
        # k_fac = ceil((G_cal + 1) * (1 - alpha))
        k_fac = min(G_cal, int(math.ceil((G_cal + 1) * target_cov)))
        # k_obs = ceil((N_cal + 1) * (1 - alpha))
        k_obs = min(N_cal, int(math.ceil((N_cal + 1) * target_cov)))

        logger.info("[alpha=%.2f (Nominal %d%%)] Calibration ranks: k_fac=%d / %d | k_obs=%d / %d",
                    alpha, nominal_pct, k_fac, G_cal, k_obs, N_cal)

        # -------------------------------------------------------------
        # Method (a): Observation-Level Split Conformal (Tonne Scale Baseline)
        # -------------------------------------------------------------
        R_obs_tonne = float(np.sort(cal_df["res_tonne"].values)[k_obs - 1])
        low_obs_tonne = np.maximum(0.0, y_hat_test - R_obs_tonne)
        high_obs_tonne = y_hat_test + R_obs_tonne

        # -------------------------------------------------------------
        # Method (b): Facility-Level Split Conformal (Latest Year, Tonne Scale)
        # -------------------------------------------------------------
        S_fac_tonne = float(np.sort(cal_fac_latest["res_tonne"].values)[k_fac - 1])
        low_fac_tonne = np.maximum(0.0, y_hat_test - S_fac_tonne)
        high_fac_tonne = y_hat_test + S_fac_tonne

        # -------------------------------------------------------------
        # Method (b2): Facility-Level Split Conformal (Latest Year, Log Scale)
        # -------------------------------------------------------------
        S_fac_log = float(np.sort(cal_fac_latest["res_log"].values)[k_fac - 1])
        low_fac_log = np.maximum(0.0, np.expm1(z_hat_test - S_fac_log))
        high_fac_log = np.expm1(z_hat_test + S_fac_log)

        # -------------------------------------------------------------
        # Method (c): Facility-Level CQR (LightGBM Quantile Regressors)
        # -------------------------------------------------------------
        logger.info("Training LightGBM quantile regressors for CQR (alpha=%.2f)...", alpha)
        q_low_model = lgb.LGBMRegressor(
            objective="quantile",
            alpha=alpha / 2.0,
            n_estimators=100,
            max_depth=6,
            random_state=RANDOM_SEED,
            verbose=-1,
            n_jobs=-1
        )
        q_high_model = lgb.LGBMRegressor(
            objective="quantile",
            alpha=1.0 - alpha / 2.0,
            n_estimators=100,
            max_depth=6,
            random_state=RANDOM_SEED,
            verbose=-1,
            n_jobs=-1
        )
        q_low_model.fit(X_train_df.iloc[fit_idx].values, z_train[fit_idx])
        q_high_model.fit(X_train_df.iloc[fit_idx].values, z_train[fit_idx])

        # Conformity score on calibration facilities (latest year)
        cal_q_low = q_low_model.predict(X_train_df.iloc[cal_idx].values)
        cal_q_high = q_high_model.predict(X_train_df.iloc[cal_idx].values)

        cal_cqr_df = cal_df.copy()
        cal_cqr_df["q_low"] = cal_q_low
        cal_cqr_df["q_high"] = cal_q_high
        cal_cqr_df["cqr_score"] = np.maximum(
            cal_cqr_df["q_low"] - cal_cqr_df["z_true"],
            cal_cqr_df["z_true"] - cal_cqr_df["q_high"]
        )

        cal_fac_latest_cqr = cal_cqr_df.sort_values("DataYear").groupby("OSEBuildingID").last().reset_index()
        E_scores = np.sort(cal_fac_latest_cqr["cqr_score"].values)
        E_hat = float(E_scores[k_fac - 1])

        # Test CQR intervals (in log space, then inverted via expm1)
        test_q_low = q_low_model.predict(X_test_df.values)
        test_q_high = q_high_model.predict(X_test_df.values)
        low_cqr = np.maximum(0.0, np.expm1(test_q_low - E_hat))
        high_cqr = np.expm1(test_q_high + E_hat)

        # Store intervals in export dataframe
        prefix = f"alpha_{int(alpha*100)}"
        intervals_export_df[f"{prefix}_obs_tonne_lower"] = np.round(low_obs_tonne, 2)
        intervals_export_df[f"{prefix}_obs_tonne_upper"] = np.round(high_obs_tonne, 2)
        intervals_export_df[f"{prefix}_fac_tonne_lower"] = np.round(low_fac_tonne, 2)
        intervals_export_df[f"{prefix}_fac_tonne_upper"] = np.round(high_fac_tonne, 2)
        intervals_export_df[f"{prefix}_fac_log_lower"] = np.round(low_fac_log, 2)
        intervals_export_df[f"{prefix}_fac_log_upper"] = np.round(high_fac_log, 2)
        intervals_export_df[f"{prefix}_cqr_lower"] = np.round(low_cqr, 2)
        intervals_export_df[f"{prefix}_cqr_upper"] = np.round(high_cqr, 2)

        # Evaluate each method
        eval_methods = [
            ("Observation Split (Tonne)", low_obs_tonne, high_obs_tonne, R_obs_tonne),
            ("Facility Split (Tonne)", low_fac_tonne, high_fac_tonne, S_fac_tonne),
            ("Facility Split (Log)", low_fac_log, high_fac_log, S_fac_log),
            ("Facility CQR (LightGBM)", low_cqr, high_cqr, E_hat)
        ]

        for method_name, low_arr, high_arr, cutoff_val in eval_methods:
            # 1. Marginal coverage
            is_covered = (y_test >= low_arr) & (y_test <= high_arr)
            marginal_cov = float(np.mean(is_covered) * 100.0)

            # 2. Facility-level coverage (100% of years within facility covered)
            fac_cov_list = []
            for fac in unique_test_facs:
                mask = (test_fac_ids == fac)
                fac_all_cov = np.all(is_covered[mask])
                fac_cov_list.append(fac_all_cov)
            facility_cov = float(np.mean(fac_cov_list) * 100.0)

            # 3. Interval width statistics (original tonnes)
            widths = high_arr - low_arr
            mean_width = float(np.mean(widths))
            median_width = float(np.median(widths))
            q25_width = float(np.percentile(widths, 25.0))
            q75_width = float(np.percentile(widths, 75.0))

            summary_metrics_rows.append({
                "alpha": alpha,
                "nominal_coverage_pct": nominal_pct,
                "method": method_name,
                "cutoff_threshold": round(cutoff_val, 4),
                "marginal_coverage_pct": round(marginal_cov, 2),
                "facility_coverage_pct": round(facility_cov, 2),
                "mean_width_tonnes": round(mean_width, 2),
                "median_width_tonnes": round(median_width, 2),
                "q25_width_tonnes": round(q25_width, 2),
                "q75_width_tonnes": round(q75_width, 2)
            })

            # Subgroup breakdowns
            # (i) Building Type Breakdown (top categories)
            top_types = pd.Series(test_bldg_types).value_counts().head(8).index.tolist()
            for btype in top_types:
                b_mask = (test_bldg_types == btype)
                subgroup_metrics_rows.append({
                    "alpha": alpha,
                    "method": method_name,
                    "stratification": "BuildingType",
                    "group": btype,
                    "sample_size": int(np.sum(b_mask)),
                    "marginal_coverage_pct": round(float(np.mean(is_covered[b_mask]) * 100.0), 2),
                    "mean_width_tonnes": round(float(np.mean(widths[b_mask])), 2),
                    "median_width_tonnes": round(float(np.median(widths[b_mask])), 2)
                })

            # (ii) Floor-Area Quartile Breakdown
            for q_label in ["Q1 (<=25k)", "Q2 (25k-50k)", "Q3 (50k-100k)", "Q4 (>100k)"]:
                q_mask = (test_gfa_quartiles == q_label)
                if np.sum(q_mask) > 0:
                    subgroup_metrics_rows.append({
                        "alpha": alpha,
                        "method": method_name,
                        "stratification": "FloorAreaQuartile",
                        "group": q_label,
                        "sample_size": int(np.sum(q_mask)),
                        "marginal_coverage_pct": round(float(np.mean(is_covered[q_mask]) * 100.0), 2),
                        "mean_width_tonnes": round(float(np.mean(widths[q_mask])), 2),
                        "median_width_tonnes": round(float(np.median(widths[q_mask])), 2)
                    })

            # (iii) Applicability Domain (AD) Group Breakdown
            for ad_lbl in ["In-Domain", "Out-of-Domain"]:
                ad_mask = (test_ad_status == ad_lbl)
                if np.sum(ad_mask) > 0:
                    subgroup_metrics_rows.append({
                        "alpha": alpha,
                        "method": method_name,
                        "stratification": "ApplicabilityDomain",
                        "group": ad_lbl,
                        "sample_size": int(np.sum(ad_mask)),
                        "marginal_coverage_pct": round(float(np.mean(is_covered[ad_mask]) * 100.0), 2),
                        "mean_width_tonnes": round(float(np.mean(widths[ad_mask])), 2),
                        "median_width_tonnes": round(float(np.median(widths[ad_mask])), 2)
                    })

    # Save summary metrics
    summary_df = pd.DataFrame(summary_metrics_rows)
    summary_path = os.path.join(RESULTS_DIR, "conformal_metrics.csv")
    summary_df.to_csv(summary_path, index=False)

    # Save subgroup metrics
    subgroup_df = pd.DataFrame(subgroup_metrics_rows)
    subgroup_path = os.path.join(RESULTS_DIR, "conformal_subgroup_metrics.csv")
    subgroup_df.to_csv(subgroup_path, index=False)

    # Save test intervals
    intervals_path = os.path.join(RESULTS_DIR, "conformal_intervals.csv")
    intervals_export_df.to_csv(intervals_path, index=False)

    # 6. Generate Markdown Reports & Table 5
    tab05_path = os.path.join(TABLES_DIR, "tab05_conformal_prediction.md")
    tab05_content = """# Table 5: Conformal Prediction Evaluation on Held-Out Test Facilities

| Nominal Target | Conformal Methodology | Non-Conformity Threshold | Marginal Coverage (%) | Facility Coverage (%) | Mean Width (MT) | Median Width (MT) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
"""
    for _, r in summary_df.iterrows():
        tab05_content += (
            f"| **{r['nominal_coverage_pct']}%** ($\\alpha={r['alpha']}$) "
            f"| `{r['method']}` "
            f"| {r['cutoff_threshold']} "
            f"| **{r['marginal_coverage_pct']:.2f}%** "
            f"| {r['facility_coverage_pct']:.2f}% "
            f"| {r['mean_width_tonnes']:.2f} MT "
            f"| {r['median_width_tonnes']:.2f} MT |\n"
        )
    with open(tab05_path, "w", encoding="utf-8") as f:
        f.write(tab05_content)

    # Full report
    report_path = os.path.join(REPORTS_DIR, "conformal_prediction_report.md")
    report_content = f"""# Longitudinal Conformal Prediction & CQR Report

**Primary Task:** Facility-Level Uncertainty Quantification for Seattle Building Carbon Benchmarking  
**Development Fit/Val/Cal Partition:** Grouped strictly by `OSEBuildingID` ($70\\% / 15\\% / 15\\%$)  
**Held-Out Evaluation:** $757$ facilities, $7,366$ rows (untouched prior to scoring)  
**Target Variable:** $\\log_{{1p}}(\\text{{TotalGHGEmissions}})$, inverted via $\\text{{expm1}}$ to MT $\\text{{CO}}_2\\text{{e}}$  

---

## 1. Conformal Methodology Performance Summary

{tab05_content}

---

## 2. Applicability Domain Stratification ($\\\\alpha = 0.10$, Nominal $90\\\\%$)

| Conformal Method | AD Group | Sample Count | Marginal Coverage (%) | Mean Width (MT) | Median Width (MT) |
| :--- | :--- | :--- | :--- | :--- | :--- |
"""
    ad_alpha10 = subgroup_df[(subgroup_df["alpha"] == 0.10) & (subgroup_df["stratification"] == "ApplicabilityDomain")]
    for _, r in ad_alpha10.iterrows():
        report_content += f"| `{r['method']}` | **{r['group']}** | {r['sample_size']:,} | **{r['marginal_coverage_pct']:.2f}%** | {r['mean_width_tonnes']:.2f} MT | {r['median_width_tonnes']:.2f} MT |\n"

    report_content += """
---

## 3. Floor-Area Quartile Stratification (\\\\alpha = 0.10, Nominal 90\\\\%)

| Conformal Method | GFA Quartile | Sample Count | Marginal Coverage (%) | Mean Width (MT) | Median Width (MT) |
| :--- | :--- | :--- | :--- | :--- | :--- |
"""
    gfa_alpha10 = subgroup_df[(subgroup_df["alpha"] == 0.10) & (subgroup_df["stratification"] == "FloorAreaQuartile")]
    for _, r in gfa_alpha10.iterrows():
        report_content += f"| `{r['method']}` | **{r['group']}** | {r['sample_size']:,} | **{r['marginal_coverage_pct']:.2f}%** | {r['mean_width_tonnes']:.2f} MT | {r['median_width_tonnes']:.2f} MT |\n"

    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_content)

    logger.info("Saved Conformal Prediction artifacts:")
    logger.info("  CSV:   %s", summary_path)
    logger.info("  CSV:   %s", subgroup_path)
    logger.info("  CSV:   %s", intervals_path)
    logger.info("  Table: %s", tab05_path)
    logger.info("  MD:    %s", report_path)

    return {
        "summary": summary_metrics_rows,
        "n_test_facilities": G_test,
        "n_test_observations": len(y_test)
    }

if __name__ == "__main__":
    run_conformal_prediction_experiments()

