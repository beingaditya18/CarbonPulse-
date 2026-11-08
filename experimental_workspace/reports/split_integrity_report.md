# CarbonPulse AI+ — Building-Level Split Integrity Audit Report

**Audit Generation Date:** 2026-11-08T12:10:33.713182  
**Overall Integrity Status:** **PASSED (Zero Leakage Verified)**  
**Group Clustering Feature:** `OSEBuildingID`  

---

## 1. Master Evaluation Split (GroupHoldout 80/20)
* **Split Identifier:** `master_evaluation_holdout_seed42` (UUID: `df719ae6-40c8-5bec-ac43-3ad553024f82`)
* **Random Seed:** 42
* **Development Partition:** 29,364 observations across 3,024 physical buildings
* **Held-Out Test Partition:** 7,366 observations across 757 physical buildings
* **Cross-Partition Facility Overlap:** **0** facilities (Strict 100% Facility Isolation)
* **Saved Artifact:** `experimental_workspace/data/splits\master_evaluation_holdout_seed42.parquet`

---

## 2. Conformal Risk-Control Calibration Split (75/25 Sub-Partition)
* **Split Identifier:** `conformal_calibration_split_seed42` (UUID: `375b2787-c823-5742-9ce6-0531efa38e00`)
* **Source Partition:** Development partition (`train_features.parquet`)
* **Training-Proper Subset:** 21,967 observations across 2,268 buildings
* **Calibration Subset:** 7,397 observations across 756 buildings
* **Train / Calibration Facility Overlap:** **0** facilities
* **Saved Artifact:** `experimental_workspace/data/splits\conformal_calibration_split_seed42.parquet`

---

## 3. Chronological Temporal Validation Partition (2015–2022 vs. 2023–2025)
* **Split Identifier:** `temporal_chronological_split_2015_2022_to_2023_2025` (UUID: `a9e7d7e6-6687-5cbe-a22f-b21326fab6db`)
* **Historical Training Years:** 2015-2022 (25,866 observations across 3,550 buildings)
* **Future Test Years:** 2023-2025 (10,420 observations across 3,714 buildings)
* **Longitudinal Observed Cohort:** 10,061 observations (3,538 buildings previously seen in historical training)
* **Unseen Generalization Cohort:** 359 observations (176 newly regulated or constructed buildings)
* **Chronological Monotonicity Preserved:** **YES**
* **Saved Artifact:** `experimental_workspace/data/splits\temporal_chronological_split_2015_2022_to_2023_2025.parquet`

---

## 4. Grouped 5-Fold Cross-Validation Integrity
* **Split Identifier:** `grouped_5fold_cross_validation`
* **Fold Integrity Summary:**
| Fold Index | Training Observations | Validation Observations | Unique Facilities | Intra-Fold Overlap |
| :---: | :---: | :---: | :---: | :---: |
| Fold 0 | 23,491 | 5,873 | 605 | 0 |
| Fold 1 | 23,491 | 5,873 | 605 | 0 |
| Fold 2 | 23,491 | 5,873 | 605 | 0 |
| Fold 3 | 23,491 | 5,873 | 605 | 0 |
| Fold 4 | 23,492 | 5,872 | 604 | 0 |

* **All Folds Strict Zero Overlap:** **YES**
* **Saved Artifact:** `experimental_workspace/data/splits\grouped_5fold_cross_validation.parquet`

---

## 5. Compliance with Methodological Safeguards
1. **Zero Final Test Contamination:** No test evaluation data is used in hyperparameter tuning or calibration.
2. **Complete Reproducibility:** Every split is deterministic, reproducible via seed `42`, and cryptographically tracked.
3. **External Jurisdiction Isolation:** New York City (LL84) and Boston (BERDO) data are strictly isolated in `data/external/`.
