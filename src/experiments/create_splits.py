"""
Module: create_splits.py
Generates reproducible GroupKFold cross-validation splits on the development partition.
Saves split indices and generates experimental protocol documentation.
"""
import os
import sys
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import GroupKFold

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from src.data.load_data import load_raw_dataset
from src.data.build_features import engineer_features
from src.data.preprocess import clean_dataset

PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed")
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "reports")

def generate_cv_splits(n_splits: int = 5, random_seed: int = 42) -> list[dict]:
    """
    Creates 5-fold GroupKFold cross-validation splits on the development dataset,
    grouped by OSEBuildingID to prevent longitudinal facility leakage.
    """
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)
    
    # Load clean data and split metadata
    meta_path = os.path.join(PROCESSED_DIR, "split_metadata.json")
    with open(meta_path, "r") as f:
        meta = json.load(f)
        
    df_raw = load_raw_dataset()
    df_clean, _ = clean_dataset(df_raw)
    df_feat = engineer_features(df_clean)
    
    # Re-obtain train partition using saved metadata
    from sklearn.model_selection import GroupShuffleSplit
    groups = df_feat["OSEBuildingID"].values
    gss = GroupShuffleSplit(n_splits=1, test_size=meta["test_size_fraction"], random_state=meta["random_seed"])
    train_idx, test_idx = next(gss.split(df_feat, groups=groups))
    
    train_df = df_feat.iloc[train_idx].copy().reset_index(drop=True)
    train_groups = train_df["OSEBuildingID"].values
    
    gkf = GroupKFold(n_splits=n_splits)
    cv_splits = []
    
    for fold, (f_tr_idx, f_val_idx) in enumerate(gkf.split(train_df, groups=train_groups)):
        tr_bldgs = set(train_groups[f_tr_idx])
        val_bldgs = set(train_groups[f_val_idx])
        assert len(tr_bldgs.intersection(val_bldgs)) == 0, f"Fold {fold} group contamination!"
        
        cv_splits.append({
            "fold": fold,
            "train_indices": f_tr_idx.tolist(),
            "val_indices": f_val_idx.tolist(),
            "train_samples": len(f_tr_idx),
            "val_samples": len(f_val_idx),
            "train_unique_buildings": len(tr_bldgs),
            "val_unique_buildings": len(val_bldgs)
        })
        
    # Save CV splits metadata
    cv_path = os.path.join(PROCESSED_DIR, "cv_splits.json")
    # For token compactness, save summary without massive raw integer lists
    cv_summary = [{
        "fold": s["fold"],
        "train_samples": s["train_samples"],
        "val_samples": s["val_samples"],
        "train_unique_buildings": s["train_unique_buildings"],
        "val_unique_buildings": s["val_unique_buildings"]
    } for s in cv_splits]
    
    with open(cv_path, "w") as f:
        json.dump(cv_splits, f)
        
    create_experimental_protocol_report(meta, cv_summary, n_splits)
    print(f"Generated {n_splits}-fold GroupKFold splits successfully.")
    return cv_splits

def create_experimental_protocol_report(meta: dict, cv_summary: list[dict], n_splits: int):
    proto_path = os.path.join(REPORTS_DIR, "experimental_protocol.md")
    content = f"""# Experimental Protocol & Validation Strategy

**Study:** Explainable AI for Carbon Emissions Estimation  
**Primary Dataset:** City of Seattle Building Energy Benchmarking Data (2015–Present)  
**Evaluation Protocol:** Group-Holdout + 5-Fold Group Cross-Validation  
**Primary Grouping Entity:** `OSEBuildingID` (Facility tracking key)  
**Date:** October 2026  

---

## 1. Data Partitioning Architecture

To evaluate model generalization under realistic operational conditions, data splitting is governed by a strict two-tier hierarchical partitioning protocol:

1. **Tier 1 — Held-Out Test Set (20% of Facilities):**
   - Partitioned by unique building ID (`OSEBuildingID`) using `GroupShuffleSplit` with fixed seed `{meta['random_seed']}`.
   - **Training Set:** {meta['train_observations']:,} annual filings across {meta['train_unique_buildings']:,} unique physical facilities.
   - **Test Set:** {meta['test_observations']:,} annual filings across {meta['test_unique_buildings']:,} unique physical facilities.
   - **Zero Overlap Guarantee:** Overlap between training facilities and testing facilities is strictly zero ($0$).
   - **Test Set Isolation:** The test partition remains completely untouched during feature engineering, imputer fitting, scaler fitting, and hyperparameter tuning.

2. **Tier 2 — Development Cross-Validation ({n_splits}-Fold GroupKFold):**
   - Within the development partition, internal validation is executed using {n_splits}-fold `GroupKFold`.
   - Each fold partitions facilities such that longitudinal multi-year filings for any given facility appear exclusively in the training fold or validation fold.

| Fold | Training Observations | Validation Observations | Training Facilities | Validation Facilities |
| :--- | :--- | :--- | :--- | :--- |
"""
    for s in cv_summary:
        content += f"| Fold {s['fold']} | {s['train_samples']:,} | {s['val_samples']:,} | {s['train_unique_buildings']:,} | {s['val_unique_buildings']:,} |\n"
        
    content += """
---

## 2. Evaluation Metrics

1. **Mean Absolute Error (MAE):**
   $$\\text{MAE} = \\frac{1}{N} \\sum_{i=1}^N |y_i - \\hat{y}_i|$$
   - Units: Metric Tons $\\text{CO}_2\\text{e} / \\text{year}$.
   - Linear penalty; represents typical absolute error per facility.

2. **Root Mean Squared Error (RMSE):**
   $$\\text{RMSE} = \\sqrt{\\frac{1}{N} \\sum_{i=1}^N (y_i - \\hat{y}_i)^2}$$
   - Units: Metric Tons $\\text{CO}_2\\text{e} / \\text{year}$.
   - Quadratic penalty; sensitive to large errors in high-emission facilities.

3. **Coefficient of Determination ($R^2$):**
   $$R^2 = 1 - \\frac{\\sum_{i=1}^N (y_i - \\hat{y}_i)^2}{\\sum_{i=1}^N (y_i - \\bar{y})^2}$$
   - Measures fraction of total emissions variance explained.

4. **Weighted Absolute Percentage Error (WAPE):**
   $$\\text{WAPE} = \\frac{\\sum_{i=1}^N |y_i - \\hat{y}_i|}{\\sum_{i=1}^N y_i}$$
   - Expressed as a percentage (%). Unlike standard MAPE, WAPE avoids denominator-zero instability for small-footprint buildings.

5. **Normalized RMSE (NRMSE):**
   $$\\text{NRMSE} = \\frac{\\text{RMSE}}{\\bar{y}}$$
"""
    with open(proto_path, "w") as f:
        f.write(content)

if __name__ == "__main__":
    generate_cv_splits()
