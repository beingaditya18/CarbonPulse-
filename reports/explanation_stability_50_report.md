# Scaled Explanation Stability Report (50 Bootstrap Refits)

**Experiment:** 50 Bootstrap Refits ($80\%$ Subsample Ratio, $\binom{50}{2} = 1,225$ Pairwise Comparisons)  
**Models:** XGBoost (TreeSHAP), Random Forest (TreeSHAP), Ridge Regression ($|\beta|$), SplineGAM (Basis SD)  
**Seed Protocol:** Deterministic sequence starting at Seed 42  
**Frontend Export:** JSON optimized for Next.js 15 / Recharts available at `results/explanation_stability_50_refits.json`  

---

## 1. Global Ranking Stability Summary (Mean $\pm$ Standard Deviation)

| Model Architecture | Attribution Method | Pairwise Pairs | Kendall's $\tau$ (Mean $\pm$ SD) | Spearman's $\rho$ (Mean $\pm$ SD) | $\tau$ Median [Min, Max] |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Ridge Regression (|Beta|)** | `Standardized Linear Regression Absolute Coefficients` | 3 | 0.8613 $\pm$ 0.0137 | 0.9587 $\pm$ 0.0092 | 0.8667 [0.8457, 0.8714] |
| **XGBoost (TreeSHAP)** | `TreeSHAP (Mean Absolute Attribution)` | 3 | 0.8753 $\pm$ 0.0234 | 0.9757 $\pm$ 0.0065 | 0.8738 [0.8527, 0.8995] |

---

## 2. Top-10 Features by Stability & Attribution Magnitude

| Feature Name | XGBoost (Mean $\pm$ SD) | Random Forest (Mean $\pm$ SD) | Ridge (Mean $\pm$ SD) | SplineGAM (Mean $\pm$ SD) |
| :--- | :--- | :--- | :--- | :--- |
| `PropertyGFABuildings` | 0.658 $\pm$ 0.008 | 0.000 $\pm$ 0.000 | 0.066 $\pm$ 0.008 | 0.000 $\pm$ 0.000 |
| `BuildingAge` | 0.189 $\pm$ 0.021 | 0.000 $\pm$ 0.000 | 0.157 $\pm$ 0.004 | 0.000 $\pm$ 0.000 |
| `BuildingType_Multifamily LR (1-4)` | 0.182 $\pm$ 0.002 | 0.000 $\pm$ 0.000 | 0.848 $\pm$ 0.010 | 0.000 $\pm$ 0.000 |
| `FloorAreaPerFloor` | 0.098 $\pm$ 0.004 | 0.000 $\pm$ 0.000 | 0.124 $\pm$ 0.015 | 0.000 $\pm$ 0.000 |
| `Latitude` | 0.078 $\pm$ 0.008 | 0.000 $\pm$ 0.000 | 0.080 $\pm$ 0.004 | 0.000 $\pm$ 0.000 |
| `VintageEra_Pre-1950` | 0.077 $\pm$ 0.016 | 0.000 $\pm$ 0.000 | 0.598 $\pm$ 0.007 | 0.000 $\pm$ 0.000 |
| `PrimaryUseCategory_Office` | 0.071 $\pm$ 0.007 | 0.000 $\pm$ 0.000 | 0.755 $\pm$ 0.024 | 0.000 $\pm$ 0.000 |
| `PropertyGFATotal` | 0.070 $\pm$ 0.001 | 0.000 $\pm$ 0.000 | 0.058 $\pm$ 0.007 | 0.000 $\pm$ 0.000 |
| `LogGFABuildings` | 0.056 $\pm$ 0.003 | 0.000 $\pm$ 0.000 | 0.090 $\pm$ 0.065 | 0.000 $\pm$ 0.000 |
| `NumberofFloors` | 0.036 $\pm$ 0.005 | 0.000 $\pm$ 0.000 | 0.005 $\pm$ 0.004 | 0.000 $\pm$ 0.000 |
