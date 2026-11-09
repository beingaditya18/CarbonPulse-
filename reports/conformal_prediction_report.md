# Longitudinal Conformal Prediction & CQR Report

**Primary Task:** Facility-Level Uncertainty Quantification for Seattle Building Carbon Benchmarking  
**Development Fit/Val/Cal Partition:** Grouped strictly by `OSEBuildingID` ($70\% / 15\% / 15\%$)  
**Held-Out Evaluation:** $757$ facilities, $7,366$ rows (untouched prior to scoring)  
**Target Variable:** $\log_{1p}(\text{TotalGHGEmissions})$, inverted via $\text{expm1}$ to MT $\text{CO}_2\text{e}$  

---

## 1. Conformal Methodology Performance Summary

# Table 5: Conformal Prediction Evaluation on Held-Out Test Facilities

| Nominal Target | Conformal Methodology | Non-Conformity Threshold | Marginal Coverage (%) | Facility Coverage (%) | Mean Width (MT) | Median Width (MT) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **90%** ($\alpha=0.1$) | `Observation Split (Tonne)` | 121.8753 | **87.67%** | 78.47% | 167.81 MT | 152.60 MT |
| **90%** ($\alpha=0.1$) | `Facility Split (Tonne)` | 90.0294 | **83.14%** | 72.79% | 130.43 MT | 120.75 MT |
| **90%** ($\alpha=0.1$) | `Facility Split (Log)` | 1.556 | **88.94%** | 73.98% | 341.88 MT | 143.66 MT |
| **90%** ($\alpha=0.1$) | `Facility CQR (LightGBM)` | 0.1771 | **88.41%** | 72.79% | 226.82 MT | 133.16 MT |
| **80%** ($\alpha=0.2$) | `Observation Split (Tonne)` | 54.4026 | **74.94%** | 60.50% | 86.52 MT | 85.12 MT |
| **80%** ($\alpha=0.2$) | `Facility Split (Tonne)` | 47.9813 | **72.47%** | 57.07% | 78.13 MT | 78.70 MT |
| **80%** ($\alpha=0.2$) | `Facility Split (Log)` | 1.1999 | **79.74%** | 59.45% | 227.86 MT | 95.75 MT |
| **80%** ($\alpha=0.2$) | `Facility CQR (LightGBM)` | 0.1186 | **77.38%** | 55.61% | 169.90 MT | 97.64 MT |


---

## 2. Applicability Domain Stratification ($\\alpha = 0.10$, Nominal $90\\%$)

| Conformal Method | AD Group | Sample Count | Marginal Coverage (%) | Mean Width (MT) | Median Width (MT) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Observation Split (Tonne)` | **In-Domain** | 6,877 | **88.37%** | 165.78 MT | 151.68 MT |
| `Observation Split (Tonne)` | **Out-of-Domain** | 489 | **77.91%** | 196.32 MT | 202.75 MT |
| `Facility Split (Tonne)` | **In-Domain** | 6,877 | **83.99%** | 128.95 MT | 119.83 MT |
| `Facility Split (Tonne)` | **Out-of-Domain** | 489 | **71.17%** | 151.31 MT | 170.91 MT |
| `Facility Split (Log)` | **In-Domain** | 6,877 | **88.91%** | 291.13 MT | 139.51 MT |
| `Facility Split (Log)` | **Out-of-Domain** | 489 | **89.37%** | 1055.62 MT | 370.82 MT |
| `Facility CQR (LightGBM)` | **In-Domain** | 6,877 | **88.32%** | 200.60 MT | 127.90 MT |
| `Facility CQR (LightGBM)` | **Out-of-Domain** | 489 | **89.57%** | 595.59 MT | 270.50 MT |

---

## 3. Floor-Area Quartile Stratification (\\alpha = 0.10, Nominal 90\\%)

| Conformal Method | GFA Quartile | Sample Count | Marginal Coverage (%) | Mean Width (MT) | Median Width (MT) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Observation Split (Tonne)` | **Q1 (<=25k)** | 1,894 | **98.31%** | 136.57 MT | 134.17 MT |
| `Observation Split (Tonne)` | **Q2 (25k-50k)** | 1,571 | **93.57%** | 146.46 MT | 143.17 MT |
| `Observation Split (Tonne)` | **Q3 (50k-100k)** | 1,993 | **91.42%** | 163.70 MT | 159.20 MT |
| `Observation Split (Tonne)` | **Q4 (>100k)** | 1,908 | **68.34%** | 220.69 MT | 243.75 MT |
| `Facility Split (Tonne)` | **Q1 (<=25k)** | 1,894 | **97.62%** | 104.66 MT | 102.33 MT |
| `Facility Split (Tonne)` | **Q2 (25k-50k)** | 1,571 | **88.03%** | 114.27 MT | 111.33 MT |
| `Facility Split (Tonne)` | **Q3 (50k-100k)** | 1,993 | **86.80%** | 130.47 MT | 127.35 MT |
| `Facility Split (Tonne)` | **Q4 (>100k)** | 1,908 | **60.90%** | 169.28 MT | 180.06 MT |
| `Facility Split (Log)` | **Q1 (<=25k)** | 1,894 | **90.50%** | 71.10 MT | 60.22 MT |
| `Facility Split (Log)` | **Q2 (25k-50k)** | 1,571 | **85.17%** | 117.81 MT | 100.99 MT |
| `Facility Split (Log)` | **Q3 (50k-100k)** | 1,993 | **90.02%** | 198.08 MT | 173.57 MT |
| `Facility Split (Log)` | **Q4 (>100k)** | 1,908 | **89.36%** | 945.38 MT | 621.90 MT |
| `Facility CQR (LightGBM)` | **Q1 (<=25k)** | 1,894 | **93.03%** | 61.84 MT | 52.04 MT |
| `Facility CQR (LightGBM)` | **Q2 (25k-50k)** | 1,571 | **85.81%** | 119.88 MT | 111.09 MT |
| `Facility CQR (LightGBM)` | **Q3 (50k-100k)** | 1,993 | **89.76%** | 173.22 MT | 148.47 MT |
| `Facility CQR (LightGBM)` | **Q4 (>100k)** | 1,908 | **84.54%** | 534.65 MT | 369.38 MT |
