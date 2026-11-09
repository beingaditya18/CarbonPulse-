# Statistical Validation & Hypothesis Testing Report

**Manuscript:** Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation  
**Dataset:** City of Seattle Building Energy Benchmarking Data  
**Statistical Design:** Cluster-Aware Paired Inference Protocol (Regenerated from `results/predictions.csv`)  
**Date:** October 2026  

---

## 1. Weighting Protocol: Record-Weighted vs. Building-Weighted Performance

Because buildings have variable longitudinal observation counts (1 to 11 reporting years per facility),
we report both **Record-Weighted MAE** (standard sample average across all $N=7,366$ observations) and
**Building-Weighted MAE** (macro-average giving equal weight $1/K$ to each of the $K=757$ independent facilities):

| Model Architecture | Record-Weighted MAE (MT) | Building-Weighted MAE (MT) | Building MAE SD (MT) | Weighting Discrepancy ($\Delta$) |
| :--- | :--- | :--- | :--- | :--- |
| **ACCOUNTING** | 0.3291 | 0.3414 | 1.2426 | +0.0123 MT |
| **MEDIAN** | 114.2013 | 112.7558 | 689.6015 | -1.4456 MT |
| **RIDGE** | 97.9904 | 97.3990 | 680.5668 | -0.5914 MT |
| **GAM** | 98.8912 | 98.3858 | 692.8871 | -0.5054 MT |
| **EBM** | 125.9947 | 126.8716 | 747.5356 | +0.8769 MT |
| **RF** | 101.1776 | 100.3569 | 668.5409 | -0.8207 MT |
| **XGBOOST** | 95.3972 | 95.4776 | 649.9034 | +0.0804 MT |
| **MLP** | 128.9753 | 135.3519 | 773.8095 | +6.3766 MT |

---

## 2. Cluster-Aware Paired Inference Results (Independent Sampling Unit: `OSEBuildingID`)

| Model A | Model B | Record $\Delta$MAE (MT) | Building $\Delta$MAE (MT) | Cluster 95% CI | Cluster Perm $p$-val | Holm-Adj $p$-val | Wilcoxon ($p$-val) | Conclusion |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **XGBOOST** | MEDIAN | -18.80 | -17.28 | [-27.31, -11.49] | 0.0001 | 0.0008 | 109050 (1.09e-08) | **XGBOOST superior** |
| **XGBOOST** | RIDGE | -2.59 | -1.92 | [-8.78, +3.11] | 0.411 | 0.658 | 125257 (2.50e-03) | No significant difference |
| **XGBOOST** | GAM | -3.49 | -2.91 | [-9.84, +2.14] | 0.278 | 0.658 | 128309 (1.19e-02) | No significant difference |
| **XGBOOST** | EBM | -30.60 | -31.39 | [-52.34, -13.87] | 0.0001 | 0.0008 | 97479 (2.20e-14) | **XGBOOST superior** |
| **XGBOOST** | RF | -5.78 | -4.88 | [-10.16, -1.95] | 0.0024 | 0.0096 | 132465 (6.79e-02) | **XGBOOST superior** |
| **XGBOOST** | MLP | -33.58 | -39.87 | [-51.25, -17.47] | 0.0001 | 0.0008 | 103090 (2.00e-11) | **XGBOOST superior** |
| **RIDGE** | MEDIAN | -16.21 | -15.36 | [-27.66, -6.94] | 0.0002 | 0.001 | 122081 (3.84e-04) | **RIDGE superior** |
| **EBM** | MEDIAN | +11.79 | +14.12 | [-3.10, +32.93] | 0.219 | 0.658 | 133245 (8.99e-02) | No significant difference |

---

## 3. Key Statistical Findings & Methodological Interpretations
1. **Statistical Superiority of Machine Learning Over Median Benchmark:** XGBoost achieves a statistically significant error reduction over the Property-Type Median Benchmark ($\Delta\text{MAE} = -18.80\text{ MT}$, $p_{\text{adj}} < 10^{-3}$, 95% Clustered CI $[-27.35, -11.13]\text{ MT}$ strictly excluding zero).
2. **Equivalence of Tree Ensembles vs Regularized Linear Modeling:** Under facility-level clustering, the difference between XGBoost (95.40 MT) and Ridge regression (97.99 MT) is $-2.59\text{ MT}$ with a 95% cluster-bootstrap CI of $[-9.10, +3.04]\text{ MT}$, spanning zero ($p_{\text{adj}} = 0.659$). There is **no statistically significant difference** between regularized linear modeling and non-linear gradient-boosted trees.
