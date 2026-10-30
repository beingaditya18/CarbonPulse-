# Table 6: Paired Statistical Comparisons & 95% Clustered Confidence Intervals

| Pair Comparison ($A \text{ vs. } B$) | Error Difference ($\Delta \text{MAE}$, MT) | 95% Clustered CI | Cluster Perm $p$-value | Holm-Adj $p$-value | Cluster-Robust $t$ ($p$-val) | Statistical Outcome |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **XGBOOST** vs. **MEDIAN** | -18.80 MT | [-27.35, -11.13] | 1.00e-04 | 8.00e-04 | -4.66 (3.76e-06) | **XGBOOST superior** |
| **XGBOOST** vs. **RIDGE** | -2.59 MT | [-9.10, +3.04] | 4.09e-01 | 6.59e-01 | -0.86 (3.89e-01) | **No significant difference** |
| **XGBOOST** vs. **GAM** | -3.49 MT | [-10.54, +2.14] | 2.83e-01 | 6.59e-01 | -1.12 (2.63e-01) | **No significant difference** |
| **XGBOOST** vs. **EBM** | -30.60 MT | [-54.02, -13.50] | 1.00e-04 | 8.00e-04 | -2.99 (2.91e-03) | **XGBOOST superior** |
| **XGBOOST** vs. **RF** | -5.78 MT | [-10.09, -2.13] | 2.20e-03 | 8.80e-03 | -2.77 (5.75e-03) | **XGBOOST superior** |
| **XGBOOST** vs. **MLP** | -33.58 MT | [-52.82, -16.94] | 2.00e-04 | 1.20e-03 | -3.83 (1.41e-04) | **XGBOOST superior** |
| **RIDGE** vs. **MEDIAN** | -16.21 MT | [-27.86, -7.57] | 2.00e-04 | 1.20e-03 | -3.05 (2.38e-03) | **RIDGE superior** |
| **EBM** vs. **MEDIAN** | +11.79 MT | [-3.80, +32.61] | 2.20e-01 | 6.59e-01 | +1.27 (2.04e-01) | **No significant difference** |
