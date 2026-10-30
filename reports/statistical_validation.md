# Statistical Validation & Hypothesis Testing Report

**Manuscript:** Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation  
**Dataset:** City of Seattle Building Energy Benchmarking Data  
**Statistical Design:** Cluster-Aware Paired Inference Protocol  
**Date:** October 2026  

---

## 1. Methodology & Theoretical Assumptions
* **Independent Sampling Unit:** Physical facility structure (`OSEBuildingID`, $M=757$ independent facility clusters in held-out test split).
* **Target Estimand:** Difference in Mean Absolute Error $\Delta\text{MAE}_{A,B} = \mathbb{E}[|y - \hat{y}_A| - |y - \hat{y}_B|]$ on identical observations.
* **Intra-Cluster Correlation:** Observations within the same facility share unobserved architectural, structural, and microclimatic determinants across consecutive reporting cycles. Standard row-level tests violate independence and inflate Type I error rates.
* **Cluster Sign-Flip Permutation Test:** Under $H_0$, Model A and Model B errors are exchangeable within each cluster. Randomly multiplying cluster total error contrasts by Rademacher signs ($S_k \in \{-1, +1\}$) non-parametrically estimates the finite-sample null distribution under arbitrary longitudinal covariance.
* **Cluster-Level Wilcoxon Signed-Rank Test:** Conducted on independent cluster-aggregated mean differences $\{\bar{D}_k\}_{k=1}^K$ to evaluate non-parametric shift in the cluster-level error distribution.
* **Cluster-Robust Standard Errors (CRVE):** Liang-Zeger cluster-robust sandwich estimator with $K - 1 = 756$ degrees of freedom.
* **Multiple Testing Correction:** Controls family-wise error rate at $\alpha = 0.01$ via the step-down Holm-Bonferroni method across all candidate comparisons.

---

## 2. Cluster-Aware Comparison Results

| Model A | Model B | Mean $\Delta$MAE (MT) | Cluster 95% CI | Cluster Perm $p$-val | Holm-Adj $p$-val | Cluster-Robust $t$ ($p$-val) | Conclusion |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **XGBOOST** | MEDIAN | -18.80 | [-27.35, -11.13] | 0.0001 | 0.0008 | -4.66 (3.76e-06) | **XGBOOST superior** |
| **XGBOOST** | RIDGE | -2.59 | [-9.10, +3.04] | 0.409 | 0.659 | -0.86 (3.89e-01) | No significant difference |
| **XGBOOST** | GAM | -3.49 | [-10.54, +2.14] | 0.283 | 0.659 | -1.12 (2.63e-01) | No significant difference |
| **XGBOOST** | EBM | -30.60 | [-54.02, -13.50] | 0.0001 | 0.0008 | -2.99 (2.91e-03) | **XGBOOST superior** |
| **XGBOOST** | RF | -5.78 | [-10.09, -2.13] | 0.0022 | 0.0088 | -2.77 (5.75e-03) | **XGBOOST superior** |
| **XGBOOST** | MLP | -33.58 | [-52.82, -16.94] | 0.0002 | 0.0012 | -3.83 (1.41e-04) | **XGBOOST superior** |
| **RIDGE** | MEDIAN | -16.21 | [-27.86, -7.57] | 0.0002 | 0.0012 | -3.05 (2.38e-03) | **RIDGE superior** |
| **EBM** | MEDIAN | +11.79 | [-3.80, +32.61] | 0.22 | 0.659 | +1.27 (2.04e-01) | No significant difference |

---

## 3. Key Statistical Findings & Methodological Interpretations
1. **Machine Learning Value Over Median Baseline:** XGBoost demonstrates a statistically significant error reduction over the Property-Type Median Benchmark ($\Delta\text{MAE} = -18.80\text{ MT}$, $p_{\text{adj}} < 10^{-3}$, 95% Clustered CI strictly excluding zero), confirming that architectural and mechanical features provide legitimate predictive value for unmetered screening.
2. **Linear vs Non-linear Differences Under Facility Clustering:** While XGBoost achieves the lowest point-estimate error ($\text{MAE} = 95.40\text{ MT}$ vs Ridge $\text{MAE} = 97.99\text{ MT}$), the 95% cluster-bootstrap confidence interval for $\Delta\text{MAE}$ spans zero ($[-9.10, +3.04]\text{ MT}$). This proves that when variance is clustered at the facility level, the performance difference between XGBoost and regularized linear modeling is **not statistically significant**, demonstrating that Ridge regression remains highly competitive in practice.
