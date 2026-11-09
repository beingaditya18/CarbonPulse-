# Scaled Explanation Stability Report (50 Bootstrap Refits)

**Experiment:** 50 Bootstrap Refits ($80\%$ Subsample Ratio, $\binom{50}{2} = 1,225$ Pairwise Comparisons)  
**Models:** XGBoost (TreeSHAP), Random Forest (TreeSHAP), Ridge Regression ($|\beta|$), SplineGAM (Basis SD)  
**Seed Protocol:** Deterministic sequence starting at Seed 42  
**Frontend Export:** JSON optimized for Next.js 15 / Recharts available at `results/explanation_stability_50_refits.json`  

---

## 1. Global Ranking Stability Summary (Mean $\pm$ Standard Deviation)

| Model Architecture | Attribution Method | Pairwise Pairs | Kendall's $\tau$ (Mean $\pm$ SD) | Spearman's $\rho$ (Mean $\pm$ SD) | $\tau$ Median [Min, Max] |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **XGBoost** | `TreeSHAP (Mean Absolute Attribution)` | 1,225 | 0.7594 $\pm$ 0.0364 | 0.8895 $\pm$ 0.0368 | 0.7592 [0.6517, 0.8761] |
| **Random Forest** | `TreeSHAP (Mean Absolute Attribution)` | 1,225 | 0.9405 $\pm$ 0.0107 | 0.9924 $\pm$ 0.0026 | 0.9416 [0.9030, 0.9755] |
| **Ridge Regression** | `Standardized Linear Regression Absolute Coefficients` | 1,225 | 0.8805 $\pm$ 0.0222 | 0.9691 $\pm$ 0.0119 | 0.8808 [0.7931, 0.9416] |
| **SplineGAM** | `SplineGAM Basis Function Standard Deviation` | 1,225 | 0.8907 $\pm$ 0.0185 | 0.9760 $\pm$ 0.0070 | 0.8901 [0.8328, 0.9591] |

---

## 2. Top-10 Features by Stability & Attribution Magnitude

| Feature Name | XGBoost (Mean $\pm$ SD) | Random Forest (Mean $\pm$ SD) | Ridge (Mean $\pm$ SD) | SplineGAM (Mean $\pm$ SD) |
| :--- | :--- | :--- | :--- | :--- |
| `PropertyGFABuildings` | 0.148 $\pm$ 0.006 | 0.252 $\pm$ 0.009 | 0.064 $\pm$ 0.007 | 0.017 $\pm$ 0.001 |
| `BuildingType_Multifamily LR (1-4)` | 0.087 $\pm$ 0.008 | 0.051 $\pm$ 0.003 | 0.843 $\pm$ 0.012 | 0.374 $\pm$ 0.006 |
| `VintageEra_Pre-1950` | 0.073 $\pm$ 0.014 | 0.015 $\pm$ 0.006 | 0.616 $\pm$ 0.017 | 0.112 $\pm$ 0.009 |
| `LogGFABuildings` | 0.060 $\pm$ 0.008 | 0.234 $\pm$ 0.010 | 0.057 $\pm$ 0.037 | 0.418 $\pm$ 0.007 |
| `PrimaryUseCategory_Supermarket/Grocery Store` | 0.059 $\pm$ 0.004 | 0.017 $\pm$ 0.001 | 1.468 $\pm$ 0.023 | 0.163 $\pm$ 0.003 |
| `BuildingType_Hospital` | 0.029 $\pm$ 0.004 | 0.011 $\pm$ 0.001 | 0.797 $\pm$ 0.027 | 0.121 $\pm$ 0.004 |
| `PrimaryUseCategory_Hotel` | 0.025 $\pm$ 0.002 | 0.008 $\pm$ 0.001 | 0.414 $\pm$ 0.020 | 0.051 $\pm$ 0.002 |
| `PrimaryUseCategory_K-12 School` | 0.020 $\pm$ 0.006 | 0.001 $\pm$ 0.000 | 0.256 $\pm$ 0.042 | 0.056 $\pm$ 0.007 |
| `BuildingType_School` | 0.020 $\pm$ 0.004 | 0.001 $\pm$ 0.000 | 0.239 $\pm$ 0.038 | 0.043 $\pm$ 0.006 |
| `BuildingType_NonResidential` | 0.020 $\pm$ 0.003 | 0.004 $\pm$ 0.000 | 0.035 $\pm$ 0.013 | 0.012 $\pm$ 0.006 |
