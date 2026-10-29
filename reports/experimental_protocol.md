# Experimental Protocol & Validation Strategy

**Study:** Explainable AI for Carbon Emissions Estimation  
**Primary Dataset:** City of Seattle Building Energy Benchmarking Data (2015–Present)  
**Evaluation Protocol:** Group-Holdout + 5-Fold Group Cross-Validation  
**Primary Grouping Entity:** `OSEBuildingID` (Facility tracking key)  
**Date:** October 2026  

---

## 1. Data Partitioning Architecture

To evaluate model generalization under realistic operational conditions, data splitting is governed by a strict two-tier hierarchical partitioning protocol:

1. **Tier 1 — Held-Out Test Set (20% of Facilities):**
   - Partitioned by unique building ID (`OSEBuildingID`) using `GroupShuffleSplit` with fixed seed `42`.
   - **Training Set:** 29,364 annual filings across 3,024 unique physical facilities.
   - **Test Set:** 7,366 annual filings across 757 unique physical facilities.
   - **Zero Overlap Guarantee:** Overlap between training facilities and testing facilities is strictly zero ($0$).
   - **Test Set Isolation:** The test partition remains completely untouched during feature engineering, imputer fitting, scaler fitting, and hyperparameter tuning.

2. **Tier 2 — Development Cross-Validation (5-Fold GroupKFold):**
   - Within the development partition, internal validation is executed using 5-fold `GroupKFold`.
   - Each fold partitions facilities such that longitudinal multi-year filings for any given facility appear exclusively in the training fold or validation fold.

| Fold | Training Observations | Validation Observations | Training Facilities | Validation Facilities |
| :--- | :--- | :--- | :--- | :--- |
| Fold 0 | 23,491 | 5,873 | 2,419 | 605 |
| Fold 1 | 23,491 | 5,873 | 2,419 | 605 |
| Fold 2 | 23,491 | 5,873 | 2,419 | 605 |
| Fold 3 | 23,491 | 5,873 | 2,419 | 605 |
| Fold 4 | 23,492 | 5,872 | 2,420 | 604 |

---

## 2. Evaluation Metrics

1. **Mean Absolute Error (MAE):**
   $$\text{MAE} = \frac{1}{N} \sum_{i=1}^N |y_i - \hat{y}_i|$$
   - Units: Metric Tons $\text{CO}_2\text{e} / \text{year}$.
   - Linear penalty; represents typical absolute error per facility.

2. **Root Mean Squared Error (RMSE):**
   $$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^N (y_i - \hat{y}_i)^2}$$
   - Units: Metric Tons $\text{CO}_2\text{e} / \text{year}$.
   - Quadratic penalty; sensitive to large errors in high-emission facilities.

3. **Coefficient of Determination ($R^2$):**
   $$R^2 = 1 - \frac{\sum_{i=1}^N (y_i - \hat{y}_i)^2}{\sum_{i=1}^N (y_i - \bar{y})^2}$$
   - Measures fraction of total emissions variance explained.

4. **Weighted Absolute Percentage Error (WAPE):**
   $$\text{WAPE} = \frac{\sum_{i=1}^N |y_i - \hat{y}_i|}{\sum_{i=1}^N y_i}$$
   - Expressed as a percentage (%). Unlike standard MAPE, WAPE avoids denominator-zero instability for small-footprint buildings.

5. **Normalized RMSE (NRMSE):**
   $$\text{NRMSE} = \frac{\text{RMSE}}{\bar{y}}$$
