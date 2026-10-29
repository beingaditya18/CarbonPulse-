# Section 4: Experimental Results

## 4.1 Predictive Performance Benchmark

All models were evaluated on the strictly held-out test partition comprising **7,366 annual compliance filings across 757 physical facilities** completely disjoint from the training partition. Table 3 presents the primary predictive accuracy metrics, and Figure 7 and Figure 8 illustrate comparative MAE, RMSE, and $R^2$ scores.

### Predictive Performance Summary (Test Set $N=7,366$)
* **Conventional Accounting Baseline:** Achieves near-perfect agreement ($R^2 = 1.0000$, $\text{MAE} = 0.33 \text{ MT CO}_2\text{e}$, $\text{WAPE} = 0.22\%$, $\text{RMSE} = 3.81 \text{ MT}$). This verifies that when utility meter data is available, regulatory emissions reporting is a direct linear accounting identity.
* **Property Median Intensity Benchmark (Non-ML Heuristic):** Yields $\text{MAE} = 114.20 \text{ MT CO}_2\text{e}$, $R^2 = 0.1812$, and $\text{WAPE} = 76.15\%$.
* **XGBoost Regressor (Top ML Architecture):** Achieves the lowest predictive error among all structural architectures:
  - $\text{MAE} = 95.40 \text{ MT CO}_2\text{e}$
  - $\text{RMSE} = 692.01 \text{ MT CO}_2\text{e}$
  - $R^2 = 0.2747$
  - $\text{WAPE} = 63.61\%$
  - $\text{Median Absolute Error} = 19.44 \text{ MT CO}_2\text{e}$
  - Outperforms the property median heuristic by a margin of $\Delta \text{MAE} = -18.80 \text{ MT CO}_2\text{e}$ (16.5% relative error reduction).
* **Ridge Regression & SplineGAM:** Exhibit strong, competitive accuracy despite their simple structure:
  - **Ridge:** $\text{MAE} = 97.99 \text{ MT CO}_2\text{e}$, $R^2 = 0.2079$, $\text{WAPE} = 65.34\%$.
  - **SplineGAM:** $\text{MAE} = 98.89 \text{ MT CO}_2\text{e}$, $R^2 = 0.1812$, $\text{WAPE} = 65.94\%$.
* **Random Forest:** Achieves $\text{MAE} = 101.18 \text{ MT CO}_2\text{e}$ and $R^2 = 0.2328$.
* **Explainable Boosting Machine (EBM):** Yields $\text{MAE} = 125.99 \text{ MT CO}_2\text{e}$ and $R^2 = 0.0337$. EBM's additive restriction and lack of higher-order interactions resulted in higher error when predicting extreme commercial and university campus outliers.

## 4.2 Statistical Significance & Paired Hypothesis Testing
Table 6 summarizes the paired hypothesis tests and 1,000-resample bootstrap 95% confidence intervals evaluated on identical test observations:
* **XGBoost vs. Median Benchmark:** Statistically significant improvement ($p = 5.15 \times 10^{-73}$ via Wilcoxon signed-rank test; $95\% \text{ CI } [-21.68, -16.28] \text{ MT CO}_2\text{e}$).
* **XGBoost vs. Ridge:** Statistically significant improvement ($\Delta \text{MAE} = -2.59 \text{ MT}$, $p = 1.28 \times 10^{-18}$; $95\% \text{ CI } [-4.61, -0.59] \text{ MT}$).
* **XGBoost vs. EBM:** Statistically significant improvement ($\Delta \text{MAE} = -30.60 \text{ MT}$, $p = 1.32 \times 10^{-92}$; $95\% \text{ CI } [-36.96, -24.39] \text{ MT}$).
* **Ridge vs. Median Benchmark:** Statistically significant improvement ($\Delta \text{MAE} = -16.21 \text{ MT}$, $p = 1.30 \times 10^{-30}$; $95\% \text{ CI } [-19.37, -12.97] \text{ MT}$).

## 4.3 Interpretability, Feature Importance & Attribution Stability
Global feature importance across explainers (Figure 10, Table 4) reveals consistent identification of physical emissions drivers:
1. **Dominant Features:** Building gross floor area (`LogGFATotal`, `PropertyGFABuildings`) is universally the primary determinant of emissions across all models, followed by energy-intensive occupancy types (`BuildingType_Hospital`) and building age (`BuildingAge`).
2. **Global Rank Stability (Bootstrap Resampling):**
   - **Random Forest:** Achieves highest rank stability: Kendall's $\tau = 0.9418 \pm 0.0062$ (Spearman's $\rho = 0.9930 \pm 0.0013$).
   - **Ridge Regression:** Kendall's $\tau = 0.8714 \pm 0.0184$ ($\rho = 0.9640 \pm 0.0094$).
   - **XGBoost:** Kendall's $\tau = 0.7641 \pm 0.0442$ ($\rho = 0.8915 \pm 0.0437$).
3. **Local Perturbation Invariance:**
   - SplineGAM exhibits the highest local Lipschitz stability under 2% input noise (robustness index $0.9835 \pm 0.0168$), followed by Ridge ($0.9457 \pm 0.0383$) and XGBoost ($0.8732 \pm 0.1758$).

## 4.4 Computational Efficiency & Green AI Operational Carbon
Table 5 and Figure 13 present computational benchmarks across 10,000 standardized queries:
* **Inference Latency:**
  - Ridge is the fastest ML model ($0.625 \text{ ms/sample}$, throughput $189,551 \text{ samples/s}$).
  - XGBoost achieves $1.388 \text{ ms/sample}$ (throughput $61,150 \text{ samples/s}$).
  - EBM achieves $1.633 \text{ ms/sample}$ (throughput $75,761 \text{ samples/s}$).
  - Random Forest requires $63.90 \text{ ms/sample}$ ($46\times$ slower than XGBoost due to deep 150-tree evaluations).
* **Memory & Storage:**
  - Ridge requires $5.2 \text{ KB}$ disk storage and $11.2 \text{ MB}$ peak RAM.
  - XGBoost requires $772.9 \text{ KB}$ disk storage and $1.54 \text{ MB}$ peak RAM.
  - Random Forest requires $63.5 \text{ MB}$ disk storage and $62.8 \text{ MB}$ peak RAM.
* **Energy Consumption & Operational Carbon:**
  - A 10,000-query inference workload consumes between $2 \times 10^{-8} \text{ kWh}$ (EBM) and $1.13 \times 10^{-5} \text{ kWh}$ (Random Forest).
  - The associated operational carbon footprint ranges from $0.000006 \text{ g}$ to $0.0042 \text{ g } \text{CO}_2\text{e}$, demonstrating negligible computational overhead compared to real-world facility emissions.

## 4.5 Pareto Frontier Analysis
Figure 15 illustrates the multi-objective Pareto efficiency frontier between predictive accuracy (MAE) and inference latency:
* **Non-Dominated Architectures:**
  - **Conventional Accounting:** Absolute optimum when utility meter data is available ($\text{MAE} = 0.33 \text{ MT}$, latency $0.545 \text{ ms}$).
  - **XGBoost Regressor:** Optimal unmetered model for predictive accuracy ($\text{MAE} = 95.40 \text{ MT}$, latency $1.388 \text{ ms}$).
* **Dominated Models:**
  - Random Forest is strictly dominated by XGBoost across both accuracy (101.18 vs 95.40 MT) and latency (63.90 vs 1.39 ms).
  - SplineGAM is dominated by Ridge in inference speed ($9.059$ vs $0.625 \text{ ms}$) with comparable accuracy (98.89 vs 97.99 MT).

## 4.6 Ablation Analysis Results
Table 7 summarizes the sensitivity experiments:
1. **Feature Set Ablation:** Restricting features to 12 pure geometric features (excluding categorical property types and spatial districts) increases XGBoost MAE by $+12.08 \text{ MT}$ ($+12.6\%$), proving that property use taxonomy provides indispensable baseline intensity adjustments.
2. **Target Transformation Ablation:** Training Ridge directly on native unscaled emissions ($y$) increases MAE from $97.99 \text{ MT}$ to $125.63 \text{ MT}$ ($+28.2\%$ error penalty), demonstrating the necessity of logarithmic variance stabilization in highly skewed building emissions portfolios.
