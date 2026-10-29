# Table 4: Explanation Stability and Local Attribution Robustness

| Model Architecture | Evaluation Dimension | Kendall's $\tau$ (Mean $\pm$ Std) | Spearman's $\rho$ (Mean $\pm$ Std) | Sample Size |
| :--- | :--- | :--- | :--- | :--- |
| **RIDGE** | `Bootstrap_Rank_Stability` | 0.8714 $\pm$ 0.0184 | 0.9640 $\pm$ 0.0094 | 10 |
| **RF** | `Bootstrap_Rank_Stability` | 0.9418 $\pm$ 0.0062 | 0.9930 $\pm$ 0.0013 | 10 |
| **XGBOOST** | `Bootstrap_Rank_Stability` | 0.7641 $\pm$ 0.0442 | 0.8915 $\pm$ 0.0437 | 10 |
| **RIDGE** | `Local_Input_Perturbation_2%` | N/A | 0.9457 $\pm$ 0.0383 | 20 |
| **GAM** | `Local_Input_Perturbation_2%` | N/A | 0.9835 $\pm$ 0.0168 | 20 |
| **RF** | `Local_Input_Perturbation_2%` | N/A | 0.8501 $\pm$ 0.3190 | 20 |
| **XGBOOST** | `Local_Input_Perturbation_2%` | N/A | 0.8732 $\pm$ 0.1758 | 20 |
