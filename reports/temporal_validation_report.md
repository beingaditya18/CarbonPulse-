# Temporal Validation & Cohort Stratification Report

**Temporal Partitioning:**  
- **Training Set:** Reporting Years 2015--2022 ($N=26,269$ filings, $3,606$ facilities)  
- **Test Set:** Reporting Years 2023--2025 ($N=10,461$ filings, $3,751$ facilities)  

**Stratification Protocol:**  
1. **Observed Cohort:** $10,103$ filings across $3,576$ facilities that were already present in the training historical data. Evaluates longitudinal temporal drift and reporting consistency.  
2. **Unseen Generalization Cohort:** $358$ filings across $175$ entirely new facilities first filing in 2023--2025. Evaluates out-of-facility transferability and generalization to new construction.  

---

## 1. Comparative Performance Across Cohorts

| Model Architecture | Cohort Partition | Sample Size | Unique Buildings | MAE (MT) | RMSE (MT) | $R^2$ | WAPE (%) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RIDGE** | `Overall_2023_2025` | 10,461 | 3,751 | 131.92 | 5415.02 | 0.1651 | 70.31% |
| **RIDGE** | `Observed_Cohort` | 10,103 | 3,576 | 134.39 | 5510.06 | 0.1651 | 70.46% |
| **RIDGE** | `Unseen_Cohort` | 358 | 175 | 62.15 | 135.45 | 0.5243 | 62.39% |
| **RF** | `Overall_2023_2025` | 10,461 | 3,751 | 99.17 | 5288.96 | 0.2035 | 52.86% |
| **RF** | `Observed_Cohort` | 10,103 | 3,576 | 100.42 | 5381.77 | 0.2035 | 52.65% |
| **RF** | `Unseen_Cohort` | 358 | 175 | 64.17 | 157.53 | 0.3566 | 64.43% |
| **XGBOOST** | `Overall_2023_2025` | 10,461 | 3,751 | 116.09 | 5509.04 | 0.1359 | 61.88% |
| **XGBOOST** | `Observed_Cohort` | 10,103 | 3,576 | 118.09 | 5605.73 | 0.1358 | 61.92% |
| **XGBOOST** | `Unseen_Cohort` | 358 | 175 | 59.62 | 149.13 | 0.4234 | 59.85% |

---

## 2. LaTeX Table Code

```latex
\begin{table}[htbp]
\centering
\caption{Temporal Holdout Validation Performance: Observed vs. Unseen Generalization Cohorts (2015--2022 Train $\to$ 2023--2025 Test)}
\label{tab:temporal_validation}
\begin{tabular}{lcccc|cccc}
\toprule
 & \multicolumn{4}{c|}{\textbf{Observed Facilities ($N=10103$)}} & \multicolumn{4}{c}{\textbf{Unseen Facilities ($N=358$)}} \\
\textbf{Model} & \textbf{MAE} & \textbf{RMSE} & \textbf{$R^2$} & \textbf{WAPE} & \textbf{MAE} & \textbf{RMSE} & \textbf{$R^2$} & \textbf{WAPE} \\
\midrule
RIDGE & 134.39 & 5510.06 & 0.1651 & 70.46\% & 62.15 & 135.45 & 0.5243 & 62.39\% \\
RF & 100.42 & 5381.77 & 0.2035 & 52.65\% & 64.17 & 157.53 & 0.3566 & 64.43\% \\
XGBOOST & 118.09 & 5605.73 & 0.1358 & 61.92\% & 59.62 & 149.13 & 0.4234 & 59.85\% \\
\bottomrule
\end{tabular}
\end{table}
```
