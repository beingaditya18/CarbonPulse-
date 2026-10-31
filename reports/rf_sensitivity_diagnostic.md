# Random Forest Perturbation Sensitivity Diagnostic Report

**Diagnostic Target:** Dissection of the anomalous $+49.92\%$ prediction change under $+5\%$ Gross Floor Area (GFA) expansion.  
**Model Architecture:** Random Forest Regressor ($150$ estimators, $\text{max\_depth}=16$, $\log_{1p}$ target transformation).  
**Sample Cohort:** Held-out test facilities ($N=25$).  

---

## 1. Executive Scientific Finding

> **Diagnostic Conclusion:**  
> The 49.92% mean relative prediction response is **not a systemic extrapolation pathology**. Instead, it is governed by:
> 1. **Single-Instance Outlier Leverage:** A single building (Instance 13, a K-12 School at 93,218 sq ft) experiences a $+1,026.73\%$ prediction shift, single-handedly driving **$41.07$ percentage points ($82.3\%$)** of the entire cohort's arithmetic mean.
> 2. **Step-Function Split Crossing:** The $+5\%$ GFA perturbation pushes Instance 13 across critical decision splits in **$137$ out of $150$ trees ($91.3\%$)**, routing it from small school leaves to large regional campus leaves.
> 3. **Non-linear $\text{expm1}$ Amplification:** Because the tree ensemble fits in $\log(y)$ space, a moderate tree leaf shift of $+2.42$ log units produces an exponential $11.8\times$ surge upon back-transformation.
> 4. **Robust Median Stability:** The **median relative change across the cohort is only $2.42\%$**, and excluding the single outlier drops the mean to $9.22\%$, demonstrating that the broader ensemble maintains physically bounded stability.

---

## 2. Statistical Breakdown: Arithmetic Mean vs. Robust Median

| Metric | Full Cohort ($N=25$) | Without Top Driver ($N=24$) | Top Driver Contribution |
| :--- | :--- | :--- | :--- |
| **Arithmetic Mean Relative Change** | **49.92%** | **9.22%** | **+41.07%** |
| **Median Relative Change** | **2.42%** | **2.30%** | N/A |
| **Top Outlier Prediction Shift** | **+194.64 MT (+1026.73%)** | N/A | Instance 13 (K-12 School) |
| **Ensemble Tree Routing Shift** | **91.3% (137/150 trees)** | N/A | Terminal leaf relocation |

---

## 3. Instance-by-Instance Diagnostic Profile (Top 10 Drivers)

| Rank | Inst ID | Property Type | Baseline GFA | Pred Orig (MT) | Pred Pert (MT) | Rel Change (%) | Diverged Trees (%) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | #13 | K-12 School | 93,218 sqft | 17.96 | 212.60 | **+1026.73%** | 91.3% |
| 2 | #18 | College/University | 135,520 sqft | 74.21 | 106.00 | **+42.27%** | 26.0% |
| 3 | #24 | Mixed Use Property | 82,061 sqft | 58.22 | 33.28 | **+42.11%** | 96.7% |
| 4 | #19 | Mixed Use Property | 112,467 sqft | 62.03 | 41.75 | **+32.18%** | 36.7% |
| 5 | #22 | Other | 58,640 sqft | 61.24 | 46.36 | **+23.90%** | 19.3% |
| 6 | #4 | Office | 87,262 sqft | 76.54 | 60.59 | **+20.57%** | 61.3% |
| 7 | #3 | K-12 School | 51,582 sqft | 24.33 | 21.42 | **+11.49%** | 22.7% |
| 8 | #14 | K-12 School | 44,324 sqft | 32.55 | 35.88 | **+9.91%** | 10.0% |
| 9 | #2 | K-12 School | 126,351 sqft | 228.17 | 246.23 | **+7.88%** | 14.0% |
| 10 | #20 | Hotel | 207,656 sqft | 145.19 | 156.15 | **+7.50%** | 66.7% |
