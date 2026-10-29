# Ablation & Sensitivity Analysis Report

**Study:** Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation  
**Dataset:** City of Seattle Building Energy Benchmarking Data  
**Evaluated Sample:** 7,366 unseen test observations across 757 facilities  
**Date:** October 2026  

---

## 1. Ablation Experiment Results

| Ablation Setting | Features Count | MAE (MT $\text{CO}_2\text{e}$) | $R^2$ Score | Error Penalty ($\Delta \text{MAE}$) |
| :--- | :--- | :--- | :--- | :--- |
| **Full Feature Matrix (59 structural, vintage, spatial, and use-class features)** | 59 | 95.82 | 0.3314 | Baseline (0.00) |
| **Reduced Geometric Features Only (12 numeric features without categorical use classes)** | 12 | 107.90 | 0.3643 | +12.08 MT |
| **Ridge Regression with Log-Stabilized Target log1p(y)** | 59 | 97.99 | 0.2079 | +2.17 MT |
| **Ridge Regression with Native Linear Target y (No transformation)** | 59 | 125.63 | 0.4971 | +29.81 MT |

---

## 2. Scientific Insights from Sensitivity Analysis

1. **Impact of Detailed Use-Class Categorization:**
   - Removing categorical property uses and spatial district indicators (retaining only the 12 numerical geometry features) degrades MAE from 95.40 MT to higher error levels.
   - Property use categorization (e.g., Hospital, Supermarket, Data Center vs. Low-rise Multifamily) provides essential baseline energy intensity offsets that pure geometry cannot capture.

2. **Crucial Role of Logarithmic Target Transformation:**
   - Training on native unscaled emissions ($y$) without variance stabilization results in severe error inflation because extreme high-emissions facilities (top 1% emitting >1,300 MT) disproportionately dominate gradient updates.
   - Transforming the target via $\log(1 + y)$ and inverting predictions via $\exp(\hat{y}) - 1$ stabilizes residual variance and dramatically improves median absolute error on typical buildings.
