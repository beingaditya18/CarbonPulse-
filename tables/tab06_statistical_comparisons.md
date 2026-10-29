# Table 6: Paired Statistical Comparisons & 95% Bootstrap Confidence Intervals

| Pair Comparison ($A \text{ vs. } B$) | Error Difference ($\Delta \text{MAE}$, MT) | 95% Bootstrap CI | Wilcoxon $p$-value | Paired $t$ $p$-value | Statistical Outcome |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **XGBOOST** vs. **MEDIAN** | -18.80 MT | [-21.68, -16.28] | 5.15e-73 | 2.89e-49 | **XGBOOST superior** |
| **XGBOOST** vs. **RIDGE** | -2.59 MT | [-4.61, -0.59] | 1.28e-18 | 8.71e-03 | **XGBOOST superior** |
| **XGBOOST** vs. **GAM** | -3.49 MT | [-5.38, -1.63] | 1.55e-13 | 6.35e-04 | **XGBOOST superior** |
| **XGBOOST** vs. **EBM** | -30.60 MT | [-36.96, -24.39] | 1.32e-92 | 1.60e-20 | **XGBOOST superior** |
| **XGBOOST** vs. **RF** | -5.78 MT | [-7.16, -4.42] | 1.56e-12 | 8.38e-17 | **XGBOOST superior** |
| **XGBOOST** vs. **MLP** | -33.58 MT | [-40.61, -27.39] | 2.57e-78 | 2.97e-23 | **XGBOOST superior** |
| **RIDGE** vs. **MEDIAN** | -16.21 MT | [-19.37, -12.97] | 1.30e-30 | 2.36e-22 | **RIDGE superior** |
| **EBM** vs. **MEDIAN** | +11.79 MT | [+5.79, +18.27] | 3.03e-02 | 9.95e-05 | **No significant difference** |
