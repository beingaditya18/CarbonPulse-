# CarbonPulse AI+ — Split Design Review & Overlap Analysis

**Document Status:** Verified Architectural Review  
**Date:** 2026-11-08  
**Scope:** Building-Level Partitioning, Clustered Leakage Analysis, and Temporal Cohort Decomposition.  

---

## 1. Executive Summary: The Clustered Data Structure

The City of Seattle Building Energy Benchmarking dataset spans compliance reporting years 2015 through 2025. Because individual physical buildings (`OSEBuildingID`) report annually, the dataset is intrinsically hierarchical and longitudinal, containing up to 11 observations per facility.

Standard random observation-level partitioning (e.g. standard `train_test_split`) violates the exchangeability assumption and causes severe optimistic data leakage, as observations from the same physical structure appear in both training and test sets.

CarbonPulse resolves this by employing **cluster-aware partitioning on `OSEBuildingID`**.

---

## 2. Partition Strategy 1: Master Evaluation Split (GroupShuffleSplit 80/20)

### 2.1 Empirical Characteristics
* **Strategy:** `GroupShuffleSplit(test_size=0.20, random_state=42)` grouped strictly on `OSEBuildingID`.
* **Development Partition:** 29,364 annual observations across 3,024 unique physical facilities.
* **Held-Out Test Partition:** 7,366 annual observations across 757 unique physical facilities.
* **Cross-Partition Building Overlap:** **EXACTLY ZERO BUILDINGS** ($0.00\%$).
* **Artifact:** `data/processed/train_features.parquet`, `test_features.parquet`, `data/splits/master_evaluation_holdout_seed42.parquet`.

### 2.2 Scientific Purpose
The Master Evaluation Split measures **unseen-facility spatial generalization**. It evaluates how accurately statistical and machine learning models predict emissions for completely novel structures that have never filed compliance reports in the municipality. This forms the primary empirical benchmark for all publication tables.

---

## 3. Partition Strategy 2: Conformal Risk Calibration Split (75/25 Sub-Partition)

### 3.1 Empirical Characteristics
* **Strategy:** `GroupShuffleSplit(test_size=0.25, random_state=42)` applied strictly inside the 3,024 development facilities.
* **Training-Proper Subset:** 22,036 observations across 2,268 unique physical facilities.
* **Calibration Subset:** 7,328 observations across 756 unique physical facilities.
* **Train / Calibration Building Overlap:** **EXACTLY ZERO BUILDINGS** ($0.00\%$).
* **Artifact:** `data/splits/conformal_calibration_split_seed42.parquet`.

### 3.2 Scientific Purpose
Enables distribution-free conformal prediction and risk control without polluting the held-out test partition. Models are fitted on the training-proper subset; conformal conformity scores and risk quantiles are calculated on the calibration subset; and final risk guarantees are verified once on the held-out test partition.

---

## 4. Partition Strategy 3: Chronological Temporal Split (2015–2022 vs. 2023–2025)

### 4.1 Empirical Building Overlap Calculation
Unlike the Master Split, the Temporal Split partitions along the calendar timeline to evaluate longitudinal forecasting over multi-year horizons:
* **Historical Training Partition (2015–2022):** 25,866 observations across 3,550 unique physical facilities.
* **Future Evaluation Partition (2023–2025):** 10,420 observations across 3,714 unique physical facilities.
* **Chronological Monotonicity:** $\max(\text{Year}_{\text{train}}) = 2022 < \min(\text{Year}_{\text{test}}) = 2023$.

A facility-level intersection audit reveals:
* **Overlapping Facilities:** 3,538 facilities (95.26% of future evaluation facilities).
* **Unseen Facilities:** 176 facilities (4.74% of future evaluation facilities).
* **Overlapping Filings:** 10,061 observations (96.55% of future evaluation observations).
* **Unseen Filings:** 359 observations (3.45% of future evaluation observations).

### 4.2 Cohort Decomposition & Scientific Distinction
The temporal evaluation addresses two distinct questions:
1. **Longitudinal Forecasting for Known Municipal Stock (96.55% of test data):**  
   Evaluates how accurately models trained on historical data (2015–2022) predict future compliance trajectories (2023–2025) for existing municipal facilities under temporal drift, climate trends, and grid decarbonization.
2. **Out-of-Facility Transferability to Newly Regulated Facilities (3.45% of test data):**  
   Evaluates prediction accuracy on newly constructed or newly regulated facilities entering the municipal compliance registry for the first time during the 2023–2025 cycle.

### 4.3 Cohort Annotation in Data Artifacts
The temporal split file (`data/splits/temporal_chronological_split_2015_2022_to_2023_2025.parquet`) explicitly contains the column `cohort_type`:
* `train_historical` ($N = 25,866$)
* `test_longitudinal_observed` ($N = 10,061$)
* `test_unseen_generalization` ($N = 359$)

---

## 5. Summary Matrix of Partitioning Infrastructure

| Partition Scheme | Grouping Unit | Training Cohort | Evaluation Cohort | Building Overlap | Primary Evaluation Question |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Master Evaluation Split** | `OSEBuildingID` | 3,024 bldgs (29,364 rows) | 757 bldgs (7,366 rows) | **0 buildings (0.00%)** | Spatial generalization to unseen municipal buildings |
| **Conformal Calibration** | `OSEBuildingID` | 2,268 bldgs (22,036 rows) | 756 bldgs (7,328 rows) | **0 buildings (0.00%)** | Valid finite-sample conformal calibration |
| **Chronological Temporal** | `DataYear` | 3,550 bldgs (25,866 rows) | 3,714 bldgs (10,420 rows) | **3,538 bldgs (95.26%)** | Longitudinal forecasting & climate/policy drift |
| **Grouped 5-Fold CV** | `OSEBuildingID` | ~2,419 bldgs (~23,491 rows) | ~605 bldgs (~5,873 rows) | **0 buildings (0.00%)** | Fold stability & hyperparameter tuning |

