# Predictive Performance Evaluation Report

**Study:** Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation  
**Dataset:** City of Seattle Building Energy Benchmarking Data  
**Held-Out Test Sample:** 7,366 annual observations across 757 unseen facilities  
**Target Variable:** `TotalGHGEmissions` (Metric Tons $\text{CO}_2\text{e} / \text{year}$)  
**Date:** October 2026 (Repaired Pipeline)  

---

## 1. Comparative Results Table

| Model Architecture | MAE (MT $\text{CO}_2\text{e}$) | RMSE (MT $\text{CO}_2\text{e}$) | $R^2$ Score | WAPE (%) | NRMSE | Median AE | Bias |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Conventional Accounting (Activity x EF)** | 0.33 | 3.81 | 1.0000 | 0.2% | 0.025 | 0.05 | +0.11 |
| **Property Median Intensity Benchmark** | 114.20 | 735.27 | 0.1812 | 76.2% | 4.903 | 23.28 | -66.90 |
| **Ridge Regression** | 97.99 | 723.19 | 0.2079 | 65.3% | 4.822 | 20.01 | -65.05 |
| **Generalized Additive Model (SplineGAM)** | 98.89 | 735.28 | 0.1812 | 65.9% | 4.903 | 19.82 | -65.78 |
| **Explainable Boosting Machine (EBM)** | 125.99 | 798.75 | 0.0337 | 84.0% | 5.326 | 23.53 | -29.29 |
| **Random Forest Regressor** | 101.18 | 711.73 | 0.2328 | 67.5% | 4.746 | 20.76 | -72.02 |
| **XGBoost Regressor** | 95.40 | 692.01 | 0.2747 | 63.6% | 4.615 | 19.44 | -68.77 |
| **Multilayer Perceptron (MLP)** | 128.98 | 781.83 | 0.0743 | 86.0% | 5.213 | 24.98 | -18.19 |

---

## 2. Scientific Findings and Architecture Comparison

### 2.1 Conventional Accounting Baseline vs. Machine Learning
* When complete metered activity data (electricity in kWh, natural gas in therms, steam in kBtu) is available, the **Conventional Accounting Baseline** achieves near-perfect agreement ($R^2 \approx 1.0000$) with near-zero error. This confirms that EPA Portfolio Manager emissions reporting is fundamentally an activity accounting equation.
* **Critical Conclusion:** When utility meter consumption is available, machine learning is unnecessary and adds no predictive value over standard stoichiometric accounting.

### 2.2 Unmetered Structural Emissions Prediction
In urban planning, pre-construction zoning, and municipal building performance screening, utility meter readings are unavailable. Models must predict emissions strictly from physical attributes:
* **Non-ML Benchmark (Property Median Intensity):** Serves as the operational heuristic baseline.
* **Linear & Generalized Additive Models (Ridge & SplineGAM):** Provide transparent, monotonic or smooth spline feature effects.
* **Explainable Boosting Machine (EBM):** Learns non-linear 1D shape functions and selected 2D interaction terms with exact mathematical additivity.
* **Ensembles & Deep Learning (Random Forest, XGBoost, MLP):** Capture high-order non-linearities and spatial-architectural interactions.

---

## 3. Subgroup Performance Breakdown

### 3.1 By Building Size Quartile (Gross Floor Area)

| subgroup_dimension   | subgroup_category   | model      |   sample_count |   mae_mt |   rmse_mt |   wape_pct |
|:---------------------|:--------------------|:-----------|---------------:|---------:|----------:|-----------:|
| GFA_Quartile         | Q1_Small            | accounting |           1843 |   0.0952 |    0.6917 |       0.41 |
| GFA_Quartile         | Q1_Small            | median     |           1843 |  18.0903 |   38.2935 |      77.82 |
| GFA_Quartile         | Q1_Small            | ridge      |           1843 |  18.1144 |   37.5031 |      77.92 |
| GFA_Quartile         | Q1_Small            | gam        |           1843 |  17.8633 |   37.2322 |      76.84 |
| GFA_Quartile         | Q1_Small            | ebm        |           1843 |  18.03   |   36.5188 |      77.56 |
| GFA_Quartile         | Q1_Small            | rf         |           1843 |  17.1265 |   37.2065 |      73.67 |
| GFA_Quartile         | Q1_Small            | xgboost    |           1843 |  16.7869 |   35.4024 |      72.21 |
| GFA_Quartile         | Q1_Small            | mlp        |           1843 |  23.7825 |   52.6939 |     102.31 |
| GFA_Quartile         | Q2_Medium           | accounting |           1845 |   0.1267 |    0.8228 |       0.23 |
| GFA_Quartile         | Q2_Medium           | median     |           1845 |  42.6534 |   87.9358 |      78.8  |
| GFA_Quartile         | Q2_Medium           | ridge      |           1845 |  40.1473 |   84.2298 |      74.17 |
| GFA_Quartile         | Q2_Medium           | gam        |           1845 |  40.483  |   85.1669 |      74.79 |
| GFA_Quartile         | Q2_Medium           | ebm        |           1845 |  44.8357 |   91.8197 |      82.84 |
| GFA_Quartile         | Q2_Medium           | rf         |           1845 |  39.4165 |   81.6708 |      72.82 |
| GFA_Quartile         | Q2_Medium           | xgboost    |           1845 |  38.6513 |   81.2516 |      71.41 |
| GFA_Quartile         | Q2_Medium           | mlp        |           1845 |  54.4723 |  156.445  |     100.64 |
| GFA_Quartile         | Q3_Large            | accounting |           1839 |   0.1811 |    0.9183 |       0.27 |
| GFA_Quartile         | Q3_Large            | median     |           1839 |  49.1562 |   97.606  |      73.2  |
| GFA_Quartile         | Q3_Large            | ridge      |           1839 |  44.2549 |   88.1555 |      65.91 |
| GFA_Quartile         | Q3_Large            | gam        |           1839 |  44.7978 |   88.6769 |      66.71 |
| GFA_Quartile         | Q3_Large            | ebm        |           1839 |  57.5399 |  131.873  |      85.69 |
| GFA_Quartile         | Q3_Large            | rf         |           1839 |  48.3339 |   97.8505 |      71.98 |
| GFA_Quartile         | Q3_Large            | xgboost    |           1839 |  45.6226 |   94.4994 |      67.94 |
| GFA_Quartile         | Q3_Large            | mlp        |           1839 |  73.0883 |  353.111  |     108.84 |
| GFA_Quartile         | Q4_ExtraLarge       | accounting |           1839 |   0.9147 |    7.4856 |       0.2  |
| GFA_Quartile         | Q4_ExtraLarge       | median     |           1839 | 347.348  | 1465.14   |      76.19 |
| GFA_Quartile         | Q4_ExtraLarge       | ridge      |           1839 | 289.807  | 1441.71   |      63.57 |
| GFA_Quartile         | Q4_ExtraLarge       | gam        |           1839 | 292.788  | 1465.93   |      64.22 |
| GFA_Quartile         | Q4_ExtraLarge       | ebm        |           1839 | 384.073  | 1590.07   |      84.24 |
| GFA_Quartile         | Q4_ExtraLarge       | rf         |           1839 | 300.218  | 1418.23   |      65.85 |
| GFA_Quartile         | Q4_ExtraLarge       | xgboost    |           1839 | 280.884  | 1378.88   |      61.61 |
| GFA_Quartile         | Q4_ExtraLarge       | mlp        |           1839 | 365.03   | 1515.36   |      80.07 |

### 3.2 By Primary Building Type

| subgroup_dimension   | subgroup_category    | model      |   sample_count |   mae_mt |   rmse_mt |   wape_pct |
|:---------------------|:---------------------|:-----------|---------------:|---------:|----------:|-----------:|
| BuildingType         | Hospital             | accounting |            139 |   3.0662 |   23.7996 |       0.24 |
| BuildingType         | Hospital             | median     |            139 | 903.651  | 1472.12   |      71.76 |
| BuildingType         | Hospital             | ridge      |            139 | 553.059  | 1098.61   |      43.92 |
| BuildingType         | Hospital             | gam        |            139 | 612.936  | 1189.93   |      48.68 |
| BuildingType         | Hospital             | ebm        |            139 | 967.233  | 1777.53   |      76.81 |
| BuildingType         | Hospital             | rf         |            139 | 735.517  | 1194.08   |      58.41 |
| BuildingType         | Hospital             | xgboost    |            139 | 574.577  |  966.561  |      45.63 |
| BuildingType         | Hospital             | mlp        |            139 | 497.19   |  939.147  |      39.48 |
| BuildingType         | Multifamily HR (10+) | accounting |            314 |   0.6143 |    4.1399 |       0.17 |
| BuildingType         | Multifamily HR (10+) | median     |            314 | 204.828  |  452.991  |      57.09 |
| BuildingType         | Multifamily HR (10+) | ridge      |            314 | 178.928  |  402.899  |      49.87 |
| BuildingType         | Multifamily HR (10+) | gam        |            314 | 170.08   |  389.31   |      47.4  |
| BuildingType         | Multifamily HR (10+) | ebm        |            314 | 245.244  |  446.933  |      68.35 |
| BuildingType         | Multifamily HR (10+) | rf         |            314 | 206.299  |  450.594  |      57.5  |
| BuildingType         | Multifamily HR (10+) | xgboost    |            314 | 188.417  |  415.058  |      52.51 |
| BuildingType         | Multifamily HR (10+) | mlp        |            314 | 229.415  |  480.2    |      63.94 |
| BuildingType         | Multifamily LR (1-4) | accounting |           2167 |   0.0771 |    0.5014 |       0.35 |
| BuildingType         | Multifamily LR (1-4) | median     |           2167 |  16.5529 |   33.7184 |      74.16 |
| BuildingType         | Multifamily LR (1-4) | ridge      |           2167 |  15.1998 |   28.9983 |      68.1  |
| BuildingType         | Multifamily LR (1-4) | gam        |           2167 |  14.9712 |   28.6335 |      67.07 |
| BuildingType         | Multifamily LR (1-4) | ebm        |           2167 |  16.4477 |   30.6887 |      73.69 |
| BuildingType         | Multifamily LR (1-4) | rf         |           2167 |  15.2878 |   29.8781 |      68.49 |
| BuildingType         | Multifamily LR (1-4) | xgboost    |           2167 |  13.8704 |   26.8045 |      62.14 |
| BuildingType         | Multifamily LR (1-4) | mlp        |           2167 |  18.3782 |   33.4073 |      82.34 |
| BuildingType         | Multifamily MR (5-9) | accounting |           1255 |   0.2012 |    1.21   |       0.31 |
| BuildingType         | Multifamily MR (5-9) | median     |           1255 |  36.2403 |   60.504  |      55.59 |
| BuildingType         | Multifamily MR (5-9) | ridge      |           1255 |  35.7455 |   59.6343 |      54.83 |
| BuildingType         | Multifamily MR (5-9) | gam        |           1255 |  34.551  |   58.0781 |      53    |
| BuildingType         | Multifamily MR (5-9) | ebm        |           1255 |  44.6958 |   73.8551 |      68.56 |
| BuildingType         | Multifamily MR (5-9) | rf         |           1255 |  33.2434 |   55.211  |      51    |
| BuildingType         | Multifamily MR (5-9) | xgboost    |           1255 |  32.905  |   55.2352 |      50.48 |
| BuildingType         | Multifamily MR (5-9) | mlp        |           1255 |  38.1757 |   65.3529 |      58.56 |
| BuildingType         | NonResidential       | accounting |           3070 |   0.386  |    2.4562 |       0.2  |
| BuildingType         | NonResidential       | median     |           3070 | 167.488  | 1074.51   |      85    |
| BuildingType         | NonResidential       | ridge      |           3070 | 148.928  | 1078.03   |      75.58 |
| BuildingType         | NonResidential       | gam        |           3070 | 149.437  | 1093.38   |      75.84 |
| BuildingType         | NonResidential       | ebm        |           3070 | 182.193  | 1158.26   |      92.46 |
| BuildingType         | NonResidential       | rf         |           3070 | 145.846  | 1050.31   |      74.01 |
| BuildingType         | NonResidential       | xgboost    |           3070 | 143.903  | 1033.95   |      73.03 |
| BuildingType         | NonResidential       | mlp        |           3070 | 197.703  | 1134.25   |     100.33 |
| BuildingType         | School               | accounting |            306 |   0.4518 |    1.9977 |       0.46 |
| BuildingType         | School               | median     |            306 |  53.692  |   70.82   |      54.07 |
| BuildingType         | School               | ridge      |            306 |  47.582  |   66.614  |      47.92 |
| BuildingType         | School               | gam        |            306 |  47.2383 |   64.9671 |      47.57 |
| BuildingType         | School               | ebm        |            306 |  71.3193 |  108.792  |      71.83 |
| BuildingType         | School               | rf         |            306 |  59.2774 |   85.6893 |      59.7  |
| BuildingType         | School               | xgboost    |            306 |  52.9143 |   73.7622 |      53.29 |
| BuildingType         | School               | mlp        |            306 |  76.6602 |  112.356  |      77.21 |
| BuildingType         | University           | accounting |            115 |   0.5443 |    2.0662 |       0.12 |
| BuildingType         | University           | median     |            115 | 341.849  |  742.413  |      76.48 |
| BuildingType         | University           | ridge      |            115 | 340.613  |  711.705  |      76.2  |
| BuildingType         | University           | gam        |            115 | 354.766  |  725.317  |      79.37 |
| BuildingType         | University           | ebm        |            115 | 380.284  |  760.801  |      85.08 |
| BuildingType         | University           | rf         |            115 | 326.294  |  806.074  |      73    |
| BuildingType         | University           | xgboost    |            115 | 298.609  |  688.034  |      66.81 |
| BuildingType         | University           | mlp        |            115 | 789.078  | 1735.1    |     176.54 |

Machine-readable metrics are saved to [results/predictive_metrics.csv](file:///c:/Users/adity/Downloads/CarbonPulse--main/results/predictive_metrics.csv).
Per-observation predictions and residuals are recorded in [results/test_predictions.csv](file:///c:/Users/adity/Downloads/CarbonPulse--main/results/test_predictions.csv) and [results/residuals.csv](file:///c:/Users/adity/Downloads/CarbonPulse--main/results/residuals.csv).
Subgroup performance metrics are saved to [results/subgroup_performance.csv](file:///c:/Users/adity/Downloads/CarbonPulse--main/results/subgroup_performance.csv).
