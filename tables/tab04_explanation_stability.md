# Table 4: Explanation Stability and Local Attribution Robustness

| Model Architecture | Evaluation Dimension | Kendall's $\tau$ (Mean $\pm$ Std) | Spearman's $\rho$ (Mean $\pm$ Std) | Sample Size |
| :--- | :--- | :--- | :--- | :--- |
| **RIDGE** | `Bootstrap_Rank_Stability` | 0.8714 $\pm$ 0.0184 | 0.9640 $\pm$ 0.0094 | 10 |
| **GAM** | `Bootstrap_Rank_Stability` | 0.8985 $\pm$ 0.0203 | 0.9793 $\pm$ 0.0073 | 10 |
| **RF** | `Bootstrap_Rank_Stability` | 0.9418 $\pm$ 0.0062 | 0.9930 $\pm$ 0.0013 | 10 |
| **XGBOOST** | `Bootstrap_Rank_Stability` | 0.7641 $\pm$ 0.0442 | 0.8915 $\pm$ 0.0437 | 10 |
| **RIDGE** | `Physical_Perturbation_+5%_GFA` | 0.9613 $\pm$ 0.0643 | nan $\pm$ nan | 25 |
| **GAM** | `Physical_Perturbation_+5%_GFA` | 0.9978 $\pm$ 0.0022 | nan $\pm$ nan | 25 |
| **RF** | `Physical_Perturbation_+5%_GFA` | 0.9134 $\pm$ 0.1281 | nan $\pm$ nan | 25 |
| **XGBOOST** | `Physical_Perturbation_+5%_GFA` | 0.9666 $\pm$ 0.0392 | nan $\pm$ nan | 25 |
