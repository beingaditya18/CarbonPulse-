# Research Manuscript Figure Captions

**Manuscript Title:** Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation of Predictive Accuracy, Interpretability, and Computational Efficiency  
**Date:** October 2026  

---

* **Figure 1: End-to-End Scientific Research & Benchmarking Pipeline.** Schematic representation of data ingestion, schema validation, leakage-free feature engineering, group-holdout partitioning (3,024 development facilities vs. 757 held-out test facilities), multi-architecture regression training, explainability evaluation (TreeSHAP/EBM), explanation stability testing (Kendall's $	au$), and hardware-level computational benchmarking.
* **Figure 2: Empirical Target Distribution for City of Seattle Building Emissions.** Frequency histogram and kernel density estimation of statutory `TotalGHGEmissions` across 36,730 verified records. Left panel depicts extreme positive skewness ($\gamma = 89.65$) on native scale (Metric Tons $	ext{CO}_2	ext{e}$); right panel illustrates variance stabilization under logarithmic transform $\log(1 + y)$.
* **Figure 3: Data Missingness Profile Across Statutory Benchmarking Features.** Ranked bar plot of missing value percentages across raw columns. Highlighted columns (e.g., steam use, natural gas) reflect fuel-carrier non-applicability in all-electric buildings rather than reporting errors.
* **Figure 4: Correlation Matrix of Key Physical and Spatial Features.** Bivariate Pearson correlation coefficients across structural determinants. Building gross floor area (`LogGFATotal`, `PropertyGFABuildings`) displays dominant positive correlation with total facility emissions.
* **Figure 5: Actual vs. Predicted Emissions on 7,366 Unseen Test Filings.** Scatter plots of actual emissions versus predictions across Conventional Accounting ($R^2 = 1.0000$), XGBoost Regressor ($R^2 = 0.2747$), and Ridge Regression ($R^2 = 0.2079$). Red dashed line indicates the 1:1 line of identity.
* **Figure 6: Error Residual Distributions.** Kernel density estimates of prediction residuals ($e_i = y_i - \hat{y}_i$) across XGBoost, Random Forest, Ridge, and SplineGAM, trimmed to $[-300, 300] 	ext{ MT CO}_2	ext{e}$.
* **Figure 7: Predictive Accuracy Comparison Across All Architectures.** Bar charts comparing Mean Absolute Error (MAE) and Root Mean Squared Error (RMSE) across all eight evaluated models on held-out test facilities.
* **Figure 8: Fraction of Variance Explained ($R^2$ Score).** Comparison of $R^2$ scores illustrating the performance ceiling of unmetered structural estimation ($R^2 pprox 0.275$ for XGBoost) relative to exact utility accounting ($R^2 = 1.0000$).
* **Figure 9: Feature Effects and Non-Linear Response Curves.** Empirical response curves showing non-linear scaling of emissions with building gross floor area and historical vintage construction epochs.
* **Figure 10: Global Feature Importance via TreeSHAP (XGBoost).** Mean absolute Shapley attributions ($E[|\phi_j|]$) ranking the structural determinants of building carbon emissions.
* **Figure 11: Local Attribution Breakdown for Representative Buildings.** Waterfall visualization decomposing individual facility predictions into additive feature contributions relative to the municipal baseline.
* **Figure 12: Explanation Stability Across Training Resamples (Kendall's $	au$).** Mean Kendall's tau rank correlation and standard deviation across five independent bootstrap resamples for Ridge, Random Forest, and XGBoost.
* **Figure 13: Computational Efficiency Benchmarks.** Comparison of single-observation inference latency (ms/sample on log scale) and peak resident heap memory allocation (MB) during batch evaluation.
* **Figure 14: Computational Operational Carbon Footprint.** Measured energy consumption and associated grid greenhouse gas emissions for a standardized workload of 10,000 queries based on U.S. average grid intensity ($0.370 	ext{ kg CO}_2	ext{e/kWh}$).
* **Figure 15: Pareto Frontier of Predictive Accuracy vs. Inference Latency.** Multi-objective trade-off curve identifying non-dominated architectures (Conventional Accounting, XGBoost) and dominated models in error-latency space.
