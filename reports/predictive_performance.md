# Predictive Performance Evaluation Report

**Study:** Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation  
**Dataset:** City of Seattle Building Energy Benchmarking Data  
**Held-Out Test Sample:** 7,366 annual observations across 757 unseen facilities  
**Target Variable:** `TotalGHGEmissions` (Metric Tons $\text{CO}_2\text{e} / \text{year}$)  
**Date:** October 2026  

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

Machine-readable metrics are saved to [results/predictive_metrics.csv](file:///c:/Users/adity/Downloads/CarbonPulse--main/results/predictive_metrics.csv).
Per-observation predictions and residuals are recorded in [results/test_predictions.csv](file:///c:/Users/adity/Downloads/CarbonPulse--main/results/test_predictions.csv) and [results/residuals.csv](file:///c:/Users/adity/Downloads/CarbonPulse--main/results/residuals.csv).
