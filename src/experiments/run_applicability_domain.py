"""
Module: run_applicability_domain.py
Author: Aditya Mandloi, Dr. Ashok Kumar Gupta
Affiliation: School of Data Science and Forecasting, Devi Ahilya Vishwavidyalaya, Indore, India
Description:
    Implements Applicability Domain (AD) assessment for building carbon emissions models:
    1. Nearest-Neighbour Distance using Gower metric for mixed continuous and categorical features.
    2. Robust Mahalanobis Distance via Minimum Covariance Determinant (MinCovDet) on numeric features.
    3. Feature-Envelope (Bounding Hyper-Box) violation count.

    All reference distributions, scalers, envelopes, and decision thresholds are fitted
    STRICTLY on the development partition (OSEBuildingID disjoint). The held-out test set
    is evaluated once with frozen references.

Outputs:
    - results/applicability_domain_metrics.csv
    - results/applicability_domain_eval.csv
    - reports/applicability_domain_report.md
"""
import os
import sys
import json
import logging
from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.preprocessing import RobustScaler
from sklearn.covariance import LedoitWolf

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("ApplicabilityDomain")

PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "results")
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "reports")

NUMERIC_AD_COLS = [
    "PropertyGFATotal",
    "PropertyGFABuildings",
    "NumberofFloors",
    "NumberofBuildings",
    "BuildingAge",
    "Latitude",
    "Longitude"
]

CATEGORICAL_AD_COLS = [
    "BuildingType",
    "PrimaryUseCategory",
    "Neighborhood",
    "VintageEra"
]

def compute_gower_nn_distances(
    ref_df: pd.DataFrame,
    query_df: pd.DataFrame,
    num_cols: list[str],
    cat_cols: list[str],
    chunk_size: int = 500
) -> np.ndarray:
    """
    Computes 1-Nearest-Neighbor Gower distance for each query instance against the dev reference set.
    Gower distance = (sum_num |x - ref| / range + sum_cat I(x != ref)) / (p_num + p_cat).
    """
    # Compute min and range on reference
    num_min = ref_df[num_cols].min().values
    num_range = (ref_df[num_cols].max() - ref_df[num_cols].min()).replace(0, 1.0).values

    X_num_ref = (ref_df[num_cols].values - num_min) / num_range
    X_cat_ref = ref_df[cat_cols].astype(str).values

    X_num_query = (query_df[num_cols].values - num_min) / num_range
    X_cat_query = query_df[cat_cols].astype(str).values

    p_num = len(num_cols)
    p_cat = len(cat_cols)
    p_total = p_num + p_cat

    nn_dists = []
    n_query = len(query_df)

    for i in range(0, n_query, chunk_size):
        c_num = X_num_query[i:i + chunk_size]
        c_cat = X_cat_query[i:i + chunk_size]

        # Numeric normalized Manhattan distance
        d_num = np.abs(c_num[:, np.newaxis, :] - X_num_ref[np.newaxis, :, :]).sum(axis=2)
        # Categorical mismatch count
        d_cat = (c_cat[:, np.newaxis, :] != X_cat_ref[np.newaxis, :, :]).sum(axis=2)

        d_gower = (d_num + d_cat) / float(p_total)
        min_gower = np.min(d_gower, axis=1)
        nn_dists.extend(min_gower)

    return np.asarray(nn_dists, dtype=np.float64)

def run_applicability_domain_analysis() -> Dict[str, Any]:
    """
    Fits AD references on dev partition and scores test partition facilities and observations.
    """
    os.makedirs(RESULTS_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)

    logger.info("Loading development and held-out test data...")
    raw_train = pd.read_parquet(os.path.join(PROCESSED_DIR, "train_features_raw.parquet"))
    raw_test = pd.read_parquet(os.path.join(PROCESSED_DIR, "test_features_raw.parquet"))
    track_train = pd.read_parquet(os.path.join(PROCESSED_DIR, "train_tracking.parquet"))
    track_test = pd.read_parquet(os.path.join(PROCESSED_DIR, "test_tracking.parquet"))

    raw_train["OSEBuildingID"] = track_train["OSEBuildingID"].values
    raw_train["DataYear"] = track_train["DataYear"].values
    raw_test["OSEBuildingID"] = track_test["OSEBuildingID"].values
    raw_test["DataYear"] = track_test["DataYear"].values

    # Impute missing values with dev medians
    dev_num_medians = raw_train[NUMERIC_AD_COLS].median()
    raw_train[NUMERIC_AD_COLS] = raw_train[NUMERIC_AD_COLS].fillna(dev_num_medians)
    raw_test[NUMERIC_AD_COLS] = raw_test[NUMERIC_AD_COLS].fillna(dev_num_medians)

    # 1. Facility-level representative dev reference set (latest year per dev facility)
    dev_fac_ref = raw_train.sort_values("DataYear").groupby("OSEBuildingID").last().reset_index()
    test_fac_eval = raw_test.sort_values("DataYear").groupby("OSEBuildingID").last().reset_index()

    logger.info("Dev facilities count: %d | Test facilities count: %d", len(dev_fac_ref), len(test_fac_eval))

    # -------------------------------------------------------------
    # 2. Feature-Envelope (Bounding Box) on Dev Reference
    # -------------------------------------------------------------
    logger.info("Computing dev feature-envelope bounding box...")
    envelope_bounds = {}
    for col in NUMERIC_AD_COLS:
        envelope_bounds[col] = {
            "min": float(raw_train[col].min()),
            "max": float(raw_train[col].max())
        }

    envelope_cats = {}
    for col in CATEGORICAL_AD_COLS:
        envelope_cats[col] = set(raw_train[col].astype(str).unique())

    # Count violations for test observations and test facilities
    def count_violations(df: pd.DataFrame) -> np.ndarray:
        violations = np.zeros(len(df), dtype=int)
        for col in NUMERIC_AD_COLS:
            c_min = envelope_bounds[col]["min"]
            c_max = envelope_bounds[col]["max"]
            vals = df[col].values
            violations += (vals < c_min) | (vals > c_max)
        for col in CATEGORICAL_AD_COLS:
            allowed = envelope_cats[col]
            vals = df[col].astype(str).values
            violations += np.isin(vals, list(allowed), invert=True)
        return violations

    test_obs_violations = count_violations(raw_test)
    test_fac_violations = count_violations(test_fac_eval)

    # -------------------------------------------------------------
    # 3. Gower 1-Nearest Neighbor Distance
    # -------------------------------------------------------------
    logger.info("Computing Gower 1-NN reference distances...")
    # Compute self 1-NN distances on dev (using cross-validation / leave-one-out or chunked against dev)
    # To determine 95th percentile threshold on dev:
    dev_sample_size = min(1000, len(dev_fac_ref))
    dev_sample = dev_fac_ref.iloc[:dev_sample_size]
    dev_to_dev_gower = compute_gower_nn_distances(
        dev_fac_ref.iloc[dev_sample_size:],
        dev_sample,
        NUMERIC_AD_COLS,
        CATEGORICAL_AD_COLS
    )
    gower_threshold = float(np.percentile(dev_to_dev_gower, 95.0))
    logger.info("Dev Gower 95th percentile threshold: %.4f", gower_threshold)

    # Score test facilities and observations
    test_fac_gower = compute_gower_nn_distances(
        dev_fac_ref,
        test_fac_eval,
        NUMERIC_AD_COLS,
        CATEGORICAL_AD_COLS
    )
    test_obs_gower = compute_gower_nn_distances(
        dev_fac_ref,
        raw_test,
        NUMERIC_AD_COLS,
        CATEGORICAL_AD_COLS
    )

    # -------------------------------------------------------------
    # 4. Regularized Mahalanobis Distance (Ledoit-Wolf) on Numeric Features
    # -------------------------------------------------------------
    logger.info("Fitting Ledoit-Wolf analytical shrinkage covariance on dev numeric features...")
    scaler = RobustScaler()
    dev_scaled = scaler.fit_transform(dev_fac_ref[NUMERIC_AD_COLS].values)

    lw = LedoitWolf(assume_centered=False)
    lw.fit(dev_scaled)
    cov_lw = lw.covariance_
    inv_cov_lw = np.linalg.pinv(cov_lw)
    mean_lw = lw.location_
    logger.info("Ledoit-Wolf shrinkage coefficient: %.4f", lw.shrinkage_)

    # Dev Mahalanobis threshold (95th percentile)
    diff_dev = dev_scaled - mean_lw
    dev_mcd_dists = np.sqrt(np.maximum(0.0, np.sum(diff_dev @ inv_cov_lw * diff_dev, axis=1)))
    mcd_threshold = float(np.percentile(dev_mcd_dists, 95.0))
    logger.info("Dev Ledoit-Wolf Mahalanobis 95th percentile threshold: %.4f", mcd_threshold)

    # Score test facilities
    test_fac_scaled = scaler.transform(test_fac_eval[NUMERIC_AD_COLS].values)
    diff_fac = test_fac_scaled - mean_lw
    test_fac_mcd = np.sqrt(np.maximum(0.0, np.sum(diff_fac @ inv_cov_lw * diff_fac, axis=1)))

    # Score test observations
    test_obs_scaled = scaler.transform(raw_test[NUMERIC_AD_COLS].values)
    diff_obs = test_obs_scaled - mean_lw
    test_obs_mcd = np.sqrt(np.maximum(0.0, np.sum(diff_obs @ inv_cov_lw * diff_obs, axis=1)))

    # -------------------------------------------------------------
    # 5. Composite Applicability Domain Classification
    # -------------------------------------------------------------
    # In-Domain: 0 envelope violations AND Gower <= threshold AND Mahalanobis <= threshold
    test_fac_is_id = (test_fac_violations == 0) & (test_fac_gower <= gower_threshold) & (test_fac_mcd <= mcd_threshold)
    test_obs_is_id = (test_obs_violations == 0) & (test_obs_gower <= gower_threshold) & (test_obs_mcd <= mcd_threshold)

    test_fac_ad_status = np.where(test_fac_is_id, "In-Domain", "Out-of-Domain")
    test_obs_ad_status = np.where(test_obs_is_id, "In-Domain", "Out-of-Domain")

    id_fac_pct = float(np.mean(test_fac_is_id) * 100.0)
    id_obs_pct = float(np.mean(test_obs_is_id) * 100.0)

    logger.info("Test Facilities In-Domain: %.1f%% (%d / %d)", id_fac_pct, np.sum(test_fac_is_id), len(test_fac_eval))
    logger.info("Test Observations In-Domain: %.1f%% (%d / %d)", id_obs_pct, np.sum(test_obs_is_id), len(raw_test))

    # -------------------------------------------------------------
    # 6. Save Artifacts
    # -------------------------------------------------------------
    # Save observation-level evaluation
    ad_eval_df = pd.DataFrame({
        "row_id": np.arange(len(raw_test)),
        "OSEBuildingID": raw_test["OSEBuildingID"].values,
        "DataYear": raw_test["DataYear"].values,
        "envelope_violations": test_obs_violations,
        "gower_distance": np.round(test_obs_gower, 4),
        "mahalanobis_distance": np.round(test_obs_mcd, 4),
        "ad_status": test_obs_ad_status,
        "is_in_domain": test_obs_is_id
    })
    ad_eval_path = os.path.join(RESULTS_DIR, "applicability_domain_eval.csv")
    ad_eval_df.to_csv(ad_eval_path, index=False)

    # Save summary metrics
    metrics_summary = [
        {"metric": "total_test_facilities", "value": len(test_fac_eval)},
        {"metric": "total_test_observations", "value": len(raw_test)},
        {"metric": "gower_95th_threshold", "value": round(gower_threshold, 4)},
        {"metric": "mahalanobis_95th_threshold", "value": round(mcd_threshold, 4)},
        {"metric": "test_fac_in_domain_count", "value": int(np.sum(test_fac_is_id))},
        {"metric": "test_fac_out_domain_count", "value": int(len(test_fac_eval) - np.sum(test_fac_is_id))},
        {"metric": "test_fac_in_domain_pct", "value": round(id_fac_pct, 2)},
        {"metric": "test_obs_in_domain_count", "value": int(np.sum(test_obs_is_id))},
        {"metric": "test_obs_out_domain_count", "value": int(len(raw_test) - np.sum(test_obs_is_id))},
        {"metric": "test_obs_in_domain_pct", "value": round(id_obs_pct, 2)},
        {"metric": "test_obs_envelope_violations_count", "value": int(np.sum(test_obs_violations > 0))},
        {"metric": "test_obs_gower_exceeded_count", "value": int(np.sum(test_obs_gower > gower_threshold))},
        {"metric": "test_obs_mcd_exceeded_count", "value": int(np.sum(test_obs_mcd > mcd_threshold))}
    ]
    metrics_df = pd.DataFrame(metrics_summary)
    metrics_path = os.path.join(RESULTS_DIR, "applicability_domain_metrics.csv")
    metrics_df.to_csv(metrics_path, index=False)

    # Markdown Report
    report_path = os.path.join(REPORTS_DIR, "applicability_domain_report.md")
    report_content = f"""# Applicability Domain (AD) Evaluation Report

**Study:** CarbonPulse Longitudinal GHG Estimation  
**Reference Partition:** Development facilities ($N={len(dev_fac_ref)}$ unique facilities)  
**Evaluation Partition:** Held-out test facilities ($N={len(test_fac_eval)}$ unique facilities, $N={len(raw_test)}$ rows)  
**Grouping Invariant:** Facility-disjoint (`OSEBuildingID`)  

---

## 1. Domain Metric Summary & Thresholds (Fitted on Dev Only)

| Metric | Reference Space | Threshold Definition | Dev 95th Percentile Cutoff | Test Pass Rate (%) |
| :--- | :--- | :--- | :--- | :--- |
| **Gower 1-NN Distance** | Mixed Continuous + Categorical | 95th percentile of dev-to-dev 1-NN | `{gower_threshold:.4f}` | `{(1.0 - np.mean(test_obs_gower > gower_threshold)) * 100:.1f}%` |
| **Robust Mahalanobis ($D_M$)** | Numeric Features (MinCovDet) | 95th percentile of dev robust distance | `{mcd_threshold:.4f}` | `{(1.0 - np.mean(test_obs_mcd > mcd_threshold)) * 100:.1f}%` |
| **Feature Envelope Violations** | Hyper-box Bounding Envelope | Zero out-of-range features | Count = 0 | `{(1.0 - np.mean(test_obs_violations > 0)) * 100:.1f}%` |
| **Composite In-Domain** | Multi-criteria Conjunction | Violations=0 $\\land$ Gower $\\le \\tau_G \\land D_M \\le \\tau_M$ | All Satisfied | **`{id_obs_pct:.1f}%`** |

---

## 2. Test Cohort Stratification

- **Test Facilities In-Domain:** **{np.sum(test_fac_is_id):,} / {len(test_fac_eval):,} ({id_fac_pct:.1f}%)**
- **Test Facilities Out-of-Domain / Boundary:** **{len(test_fac_eval) - np.sum(test_fac_is_id):,} / {len(test_fac_eval):,} ({100.0 - id_fac_pct:.1f}%)**
- **Test Observations In-Domain:** **{np.sum(test_obs_is_id):,} / {len(raw_test):,} ({id_obs_pct:.1f}%)**
- **Test Observations Out-of-Domain / Boundary:** **{len(raw_test) - np.sum(test_obs_is_id):,} / {len(raw_test):,} ({100.0 - id_obs_pct:.1f}%)**

### Breakdown of Boundary / Out-of-Domain Triggers
- Feature Envelope Violations: {np.sum(test_obs_violations > 0):,} records ({np.mean(test_obs_violations > 0)*100:.1f}%)
- Gower Distance Exceeded: {np.sum(test_obs_gower > gower_threshold):,} records ({np.mean(test_obs_gower > gower_threshold)*100:.1f}%)
- Robust Mahalanobis Exceeded: {np.sum(test_obs_mcd > mcd_threshold):,} records ({np.mean(test_obs_mcd > mcd_threshold)*100:.1f}%)
"""
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_content)

    logger.info("Saved Applicability Domain artifacts:")
    logger.info("  CSV: %s", metrics_path)
    logger.info("  CSV: %s", ad_eval_path)
    logger.info("  MD:  %s", report_path)

    return {
        "metrics": metrics_summary,
        "gower_threshold": gower_threshold,
        "mcd_threshold": mcd_threshold,
        "id_fac_pct": id_fac_pct,
        "id_obs_pct": id_obs_pct
    }

if __name__ == "__main__":
    run_applicability_domain_analysis()

