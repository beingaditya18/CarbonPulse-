# Table 4: Explanation Stability and Local Attribution Robustness

| Model Architecture | Evaluation Dimension | Kendall's $\tau$ (Mean $\pm$ Std) | Spearman's $\rho$ (Mean $\pm$ Std) | Sample Size |
| :--- | :--- | :--- | :--- | :--- |
| **RIDGE** | `Bootstrap_Rank_Stability` | 0.8805 $\pm$ 0.0222 | 0.9691 $\pm$ 0.0119 | 50 |
| **GAM** | `Bootstrap_Rank_Stability` | 0.8907 $\pm$ 0.0185 | 0.9760 $\pm$ 0.0070 | 50 |
| **RF** | `Bootstrap_Rank_Stability` | 0.9405 $\pm$ 0.0107 | 0.9924 $\pm$ 0.0026 | 50 |
| **XGBOOST** | `Bootstrap_Rank_Stability` | 0.7594 $\pm$ 0.0364 | 0.8895 $\pm$ 0.0368 | 50 |
| **RIDGE** | `Physical_Perturbation_+5%_GFA` | 0.9613 $\pm$ 0.0643 | nan $\pm$ nan | 25 |
| **GAM** | `Physical_Perturbation_+5%_GFA` | 0.9978 $\pm$ 0.0022 | nan $\pm$ nan | 25 |
| **RF** | `Physical_Perturbation_+5%_GFA` | 0.9134 $\pm$ 0.1281 | nan $\pm$ nan | 25 |
| **XGBOOST** | `Physical_Perturbation_+5%_GFA` | 0.9666 $\pm$ 0.0392 | nan $\pm$ nan | 25 |
