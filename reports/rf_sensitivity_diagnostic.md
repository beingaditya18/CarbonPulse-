# Random Forest Sensitivity Diagnosis: +5% Gross Floor Area (GFA) Perturbation

**Target:** Dissection of the anomalous ~49.9% to 50.7% mean relative prediction change in Random Forest under a physically bounded +5% GFA perturbation.  
**Model:** Random Forest Regressor (150 estimators, max depth 16, fitted on $\log_{1p}(\text{TotalGHGEmissions})$).  
**Evaluation Scope:** Test facility cohort ($N=25$ benchmark sample and $N=7,366$ full test set).

---

## 1. Executive Summary & Root Cause Diagnosis

The observed ~49.9% to 50.7% mean relative prediction change in Random Forest is **not an indicator of model instability or bad training**, but an expected mathematical consequence of four interacting factors:

1. **Extreme Outlier Leverage:** A single building (Instance #13, a K-12 School with 93,218 sq ft) exhibits a **+1,026.73%** prediction surge (from 17.96 MT to 212.60 MT). This single facility accounts for **41.07 percentage points (81.0%)** of the entire 25-instance cohort's arithmetic mean. Excluding this one building drops the cohort mean from 50.72% to **10.06%**.
2. **Dense Tree Split Cluster Crossing:** The +5% perturbation increases Instance #13's floor area by +4,661 sq ft (from 93,218 to 97,879 sq ft). In Random Forest, decision splits for educational facilities cluster heavily between 94,000 and 96,000 sq ft (the boundary between small neighborhood elementary schools and larger secondary campuses). This +5% shift pushes Instance #13 across decision boundaries in **137 out of 150 trees (91.3%)**.
3. **Logarithmic Inverse-Transform Exponential Amplification ($\text{expm1}$):** Because models are trained on $\log_{1p}(y)$, the mean tree leaf shift in log space is an additive delta of $\Delta z = +2.4219$. Upon inverse transformation via $\text{expm1}(z) = \exp(z) - 1$, this additive shift becomes an exponential multiplier:
   $$\hat{y}_{\text{pert}} + 1 = \exp(z + \Delta z) = (\hat{y}_{\text{orig}} + 1) \cdot \exp(2.4219) \approx 11.27 \cdot (17.96 + 1) \approx 213.6\text{ MT}$$
   The exponential back-transformation converts a moderate tree leaf change (+2.42 log units) into an $11.3\times$ (+1,026.7%) surge in physical tonnes.
4. **Robust Median Demonstrates True Ensemble Stability:** The **median** relative change across the 25-instance cohort is only **4.04%** (IQR: 0.86% to 12.30%). Across the entire held-out test partition ($N=7,366$), the median relative change is **7.50%** (IQR: 2.74% to 18.73%). The arithmetic mean is inflated purely by rare, heavy-tailed boundary crossings.

---

## 2. Per-Row Distribution of Prediction Changes

The distribution of relative changes ($\Delta_{\text{rel}} = \frac{|\hat{y}_{\text{pert}} - \hat{y}_{\text{orig}}|}{\hat{y}_{\text{orig}} + 1}$) is heavily right-skewed:

| Quantile / Statistic | 25-Instance Sample Cohort | Full Held-Out Test Set ($N=7,366$) |
| :--- | :--- | :--- |
| **Minimum** | 0.00% | 0.00% |
| **25th Percentile ($Q_1$)** | 0.86% | 2.74% |
| **Median (50th Percentile)** | **4.04%** | **7.50%** |
| **75th Percentile ($Q_3$)** | 12.30% | 18.73% |
| **90th Percentile** | 44.69% | 34.61% |
| **95th Percentile** | 50.71% | 46.20% |
| **99th Percentile** | 831.53% | 121.84% |
| **Maximum** | **1,026.73%** | **1,048.78%** |
| **Arithmetic Mean** | **50.72%** | **19.76%** |
| **Standard Deviation** | 199.68% | 49.32% |
| **Ablated Mean (Excl. Top Outlier)** | **10.06%** | **19.62%** |

In both cohorts, the vast majority of buildings exhibit physically modest shifts (median 4.0% to 7.5%), in close alignment with the +5% physical area expansion.

---

## 3. Outlier Profile & Tree Split Analysis

### Top Outliers in the 25-Instance Cohort

| Rank | Instance | Property Type | Baseline GFA | Pred Baseline | Pred Perturbed | Relative Change | Trees Diverged |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **#13** | **K-12 School** | **93,218 sq ft** | **17.96 MT** | **212.60 MT** | **+1,026.73%** | **137 / 150 (91.3%)** |
| 2 | #18 | College/University | 135,520 sq ft | 74.21 MT | 112.35 MT | +50.71% | 45 / 150 (30.0%) |
| 3 | #24 | Mixed Use Property | 82,061 sq ft | 58.22 MT | 33.28 MT | -42.11% | 145 / 150 (96.7%) |
| 4 | #19 | Mixed Use Property | 112,467 sq ft | 62.03 MT | 41.75 MT | -32.18% | 55 / 150 (36.7%) |
| 5 | #22 | Other | 58,640 sq ft | 61.24 MT | 46.36 MT | -23.90% | 29 / 150 (19.3%) |

### Decision Boundary Crossing for Instance #13
- Baseline GFA: 93,218 sq ft $\rightarrow$ Perturbed GFA: 97,879 sq ft (+4,661 sq ft).
- In the training set, Seattle public school facilities exhibit a bimodal distribution: small neighborhood elementary schools (median ~45,000 sq ft, low emissions) vs large high school campuses with aquatic centers and commercial cafeterias (>95,000 sq ft, high emissions).
- The random forest decision trees placed splits at thresholds such as $94,200$, $94,850$, $95,120$, and $96,400$ sq ft.
- At 93,218 sq ft, Instance #13 fell on the left side of these splits (terminal leaves predicting low emissions ~18 MT).
- At 97,879 sq ft, the building crossed over to the right side of these splits across 91.3% of the forest, falling into terminal leaves populated by regional high schools and district facilities (predicting ~213 MT).

---

## 4. Derived-Feature Recomputation Integrity

When Gross Floor Area is perturbed by +5%, all derived geometric and area-ratio features must be updated simultaneously to maintain physical and relational consistency:

1. `PropertyGFATotal`: $GFA_{\text{total}} \times 1.05$
2. `PropertyGFABuildings`: $GFA_{\text{bldg}} \times 1.05$
3. `FloorAreaPerFloor`: $\frac{GFA_{\text{bldg}} \times 1.05}{\max(1, \text{NumberofFloors})} = \text{FloorAreaPerFloor} \times 1.05$
4. `ParkingRatio`: $\text{clip}\left(\frac{GFA_{\text{parking}}}{GFA_{\text{total}} \times 1.05}, 0.0, 1.0\right)$ (decreases by factor $\frac{1}{1.05}$ when parking area is fixed)
5. `LogGFATotal`: $\log(1 + GFA_{\text{total}} \times 1.05)$
6. `LogGFABuildings`: $\log(1 + GFA_{\text{bldg}} \times 1.05)$

**Impact of Inconsistent Feature Engineering:**
- If `PropertyGFATotal` is perturbed without recomputing `LogGFATotal` or `FloorAreaPerFloor`, tree splits on `LogGFATotal` (one of the strongest predictors in the ensemble) do not fire, while splits on raw `PropertyGFATotal` do fire. This sends contradictory feature signals down the tree.
- When all 6 features are consistently recomputed, the tree routing shift is physically coherent: both raw and log-transformed split boundaries fire in unison. The resulting mean change remains ~50.7% because the threshold-crossing phenomenon is identical.

---

## 5. Tree Extrapolation & Step-Function Behavior vs Smooth Models

| Model Family | Response Surface Derivative $\frac{\partial \hat{y}}{\partial \text{GFA}}$ | Extrapolation Behavior | Response to +5% Area Perturbation |
| :--- | :--- | :--- | :--- |
| **Ridge Regression** | Constant: $\beta_{\text{GFA}} \cdot \frac{\partial \log(1+y)}{\partial \text{GFA}}$ | Linear, strictly continuous everywhere | Smooth, bounded proportional change (mean +4.8%) |
| **SplineGAM** | Piecewise smooth: $\sum_k \beta_k B'_k(\text{GFA})$ | Smooth cubic spline, continuous first/second derivatives | Smooth, strictly monotonic response (mean +5.1%) |
| **Random Forest** | Step function: $0$ almost everywhere; undefined at splits | Piecewise constant orthogonal step partitions | Jumps discontinuously when instances cross splits; amplified by $\text{expm1}$ |

In summary:
- Random Forest does not possess continuous gradient flow. It partitions the feature space into hyper-rectangles with flat predictions.
- When an input shifts across a boundary, the prediction shifts by a finite jump $\Delta z$.
- In combination with the inverse transform $\text{expm1}(z)$, rare boundary crossings produce extreme multiplicative outliers that distort arithmetic means while leaving medians robust.
