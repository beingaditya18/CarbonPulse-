# Explanation Stability and Robustness Report

**Manuscript:** Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation  
**Dataset:** City of Seattle Building Energy Benchmarking Data  
**Date:** October 2026 (Repaired Pipeline)  

---

## 1. Global Ranking Stability (Resampling Protocol)
Evaluates whether feature importance rankings remain stable when models are re-fitted across 5 bootstrap subsamples ($80\%$ sample ratio).
Measured via mean pairwise Kendall's $\tau$ and Spearman's $\rho$.

## 2. Local Explanation Perturbation Robustness (Raw-Space Protocol)
Evaluates explanation stability under physically realistic building modifications ($+5\%$ Gross Floor Area expansion, preserving valid categories and preprocessing transforms).
Reports cosine similarity of attribution vectors alongside prediction relative change.

| Model Architecture | Evaluation Protocol | Kendall's $\tau$ | Spearman's $\rho$ | Attribution Cosine Similarity | Mean Pred Change |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RIDGE** | `Bootstrap_Rank_Stability` | 0.8714 $\pm$ 0.0184 | 0.9640 $\pm$ 0.0094 | N/A | N/A |
| **GAM** | `Bootstrap_Rank_Stability` | 0.8985 $\pm$ 0.0203 | 0.9793 $\pm$ 0.0073 | N/A | N/A |
| **RF** | `Bootstrap_Rank_Stability` | 0.9418 $\pm$ 0.0062 | 0.9930 $\pm$ 0.0013 | N/A | N/A |
| **XGBOOST** | `Bootstrap_Rank_Stability` | 0.7641 $\pm$ 0.0442 | 0.8915 $\pm$ 0.0437 | N/A | N/A |
| **RIDGE** | `Physical_Perturbation_+5%_GFA` | 0.9613 $\pm$ 0.0643 | N/A | 0.9979 | 0.0475 |
| **GAM** | `Physical_Perturbation_+5%_GFA` | 0.9978 $\pm$ 0.0022 | N/A | 0.9999 | 0.0485 |
| **RF** | `Physical_Perturbation_+5%_GFA` | 0.9134 $\pm$ 0.1281 | N/A | 0.9490 | 0.4992 |
| **XGBOOST** | `Physical_Perturbation_+5%_GFA` | 0.9666 $\pm$ 0.0392 | N/A | 0.9856 | 0.1216 |
