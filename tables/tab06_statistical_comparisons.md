# Table 6: Paired Statistical Comparisons & 95% Clustered Confidence Intervals

| Pair Comparison ($A \\text{ vs. } B$) | Record $\\Delta \\text{MAE}$ (MT) | Building $\\Delta \\text{MAE}$ (MT) | 95% Clustered CI | Cluster Perm $p$-value | Holm-Adj $p$-value | Statistical Outcome |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **XGBOOST** vs. **MEDIAN** | -18.80 MT | -17.28 MT | [-27.31, -11.49] | 0.0001 | 0.0008 | **XGBOOST superior** |
| **XGBOOST** vs. **RIDGE** | -2.59 MT | -1.92 MT | [-8.78, +3.11] | 0.411 | 0.658 | No significant difference |
| **XGBOOST** vs. **GAM** | -3.49 MT | -2.91 MT | [-9.84, +2.14] | 0.278 | 0.658 | No significant difference |
| **XGBOOST** vs. **EBM** | -30.60 MT | -31.39 MT | [-52.34, -13.87] | 0.0001 | 0.0008 | **XGBOOST superior** |
| **XGBOOST** vs. **RF** | -5.78 MT | -4.88 MT | [-10.16, -1.95] | 0.0024 | 0.0096 | **XGBOOST superior** |
| **XGBOOST** vs. **MLP** | -33.58 MT | -39.87 MT | [-51.25, -17.47] | 0.0001 | 0.0008 | **XGBOOST superior** |
| **RIDGE** vs. **MEDIAN** | -16.21 MT | -15.36 MT | [-27.66, -6.94] | 0.0002 | 0.001 | **RIDGE superior** |
| **EBM** vs. **MEDIAN** | +11.79 MT | +14.12 MT | [-3.10, +32.93] | 0.219 | 0.658 | No significant difference |
