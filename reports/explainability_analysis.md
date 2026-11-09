# Explainability & Interpretability Analysis Report

**Manuscript:** Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation  
**Dataset:** City of Seattle Building Energy Benchmarking Data  
**Date:** October 2026  

---

## 1. Global Feature Importance Comparison (Top 10 Features)

| Feature Name | Role | Ridge Standardized Weight | TreeSHAP (Random Forest) | TreeSHAP (XGBoost) |
| :--- | :--- | :--- | :--- | :--- |
| `PropertyGFABuildings` | Structural / Spatial | 0.0662 | 0.3761 | 0.5720 |
| `BuildingType_Multifamily LR (1-4)` | Structural / Spatial | 0.8470 | 0.1733 | 0.1535 |
| `BuildingAge` | Structural / Spatial | 0.1668 | 0.1709 | 0.1314 |
| `LogGFABuildings` | Structural / Spatial | 0.0941 | 0.3925 | 0.1038 |
| `FloorAreaPerFloor` | Structural / Spatial | 0.1219 | 0.0897 | 0.1004 |
| `Latitude` | Structural / Spatial | 0.0881 | 0.0518 | 0.0879 |
| `PrimaryUseCategory_Office` | Structural / Spatial | 0.7546 | 0.0471 | 0.0805 |
| `VintageEra_Pre-1950` | Structural / Spatial | 0.6183 | 0.0411 | 0.0713 |
| `PropertyGFATotal` | Structural / Spatial | 0.0583 | 0.0309 | 0.0677 |
| `BuildingType_Multifamily MR (5-9)` | Structural / Spatial | 0.5625 | 0.0129 | 0.0435 |

---

## 2. Computational Latency for Explanation Generation

| Explainer Method | Model | Runtime (Seconds) | Attribution Mechanism |
| :--- | :--- | :--- | :--- |
| `Ridge` | Multi-Architecture | 0.00s | Game-Theoretic Shapley / Gradient |
| `SplineGAM` | Multi-Architecture | 0.46s | Game-Theoretic Shapley / Gradient |
| `EBM` | Multi-Architecture | 0.05s | Game-Theoretic Shapley / Gradient |
| `RandomForest_TreeSHAP` | Multi-Architecture | 85.80s | Game-Theoretic Shapley / Gradient |
| `XGBoost_TreeSHAP` | Multi-Architecture | 1.76s | Game-Theoretic Shapley / Gradient |
| `MLP_SamplingSHAP` | Multi-Architecture | 75.46s | Game-Theoretic Shapley / Gradient |

---

## 3. Methodological Caveats & Non-Causal Nature of Explanations

> **CRITICAL SCIENTIFIC DISTINCTION:** Feature attributions produced by SHAP or EBM shape functions represent **statistical associations** within the observational training distribution. They **do not constitute causal proof** that retrofitting or altering a specific architectural attribute will automatically reduce physical emissions by that magnitude. Confounding variables, unobserved occupant behaviors, and mechanical equipment efficiencies remain unmeasured in statutory benchmarking data.
