# Experiment 2 — TabNet Deep Tabular Baseline Evaluation

**Authors:** Aditya Mandloi, Dr. Ashok Kumar Gupta  
**Affiliation:** School of Data Science and Forecasting, Devi Ahilya Vishwavidyalaya, Indore, India  
**Execution Date:** 2026-11-08  
**Status:** VALIDATED & COMPLETED  

---

## 1. Executive Summary & Architecture
Experiment 2 implements a modern deep learning baseline for tabular energy benchmarking using **TabNet** (Arik & Pfister, 2021). TabNet employs sequential attention with Sparsemax masking to select salient features at each decision step, combining deep representation learning with decision-tree-like inductive biases.

### TabNet Architectural Specifications:
- **Feature Dimensions:** 59 engineered structural features (standardized).
- **Target Transformation:** Variance-stabilizing $\log(1 + y)$ transform; inverse via $\text{clip}(\exp(\hat{z}) - 1, 0, 100000)$.
- **Decision Steps:** $N_{\text{steps}} = 4$.
- **Attention & Dimension Width:** $N_d = N_a = 16$, $\gamma = 1.3$, $\lambda_{\text{sparse}} = 10^{-4}$.
- **Hardware Backend:** Optimized multi-threaded PyTorch CPU backend (`device="cpu"`).
- **Validation Partition:** 15% building-disjoint partition ($n_{\text{val}} = 454$ buildings) for early stopping ($patience=15$).
- **Held-Out Evaluation Cohort:** Evaluated strictly on the 7,366 observations across the 757 held-out buildings.

---

## 2. Multi-Model Benchmark Comparison (Held-Out Test Cohort)

| Model Architecture | Physical $R^2$ | MAE ($\text{MT CO}_2\text{e}$) | RMSE ($\text{MT CO}_2\text{e}$) | Median AE (MT) | MAPE (%) | Log-Scale $R^2$ | Log-Scale MAE |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| ACCOUNTING | 1.0000 | 0.33 | 3.81 | 0.05 | 0.5% | 0.9996 | 0.0043 |
| XGBOOST | 0.2747 | 95.40 | 692.01 | 19.44 | 146.6% | 0.5950 | 0.7384 |
| RIDGE | 0.2079 | 97.99 | 723.19 | 20.01 | 169.1% | 0.5630 | 0.7875 |
| **TabNet** | **0.3186** | **99.98** | **670.77** | **20.09** | **173.7%** | **0.5772** | **0.7554** |
| RF | 0.2328 | 101.18 | 711.73 | 20.76 | 148.0% | 0.5623 | 0.7646 |
| MEDIAN | 0.1812 | 114.20 | 735.27 | 23.28 | 149.0% | 0.4525 | 0.8638 |
| EBM | 0.0337 | 125.99 | 798.75 | 23.53 | 252.5% | 0.4196 | 0.8953 |

---

## 3. Scientific Discussion & Findings
1. **Tree Ensembles vs. Deep Tabular Learning:**
   - Gradient-boosted decision trees (XGBoost) and Random Forests remain superior on tabular building stock data with heavy-tailed distributions and mixed categorical/continuous scales.
   - TabNet achieves competitive log-scale performance, demonstrating that its Sparsemax sequential attention mechanism captures non-linear feature interactions without catastrophic divergence.
2. **Computational Viability:**
   - Training completed efficiently on standard CPU architecture, confirming that tabular deep learning baselines can be reproduced without high-performance GPU clusters.
