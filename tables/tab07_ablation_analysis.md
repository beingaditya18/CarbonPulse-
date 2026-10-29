# Table 7: Ablation Analysis of Feature Representation & Target Transformation

| Ablation Condition | Feature Count | MAE (MT $\text{CO}_2\text{e}$) | $R^2$ Score | Error Penalty ($\Delta \text{MAE}$) |
| :--- | :--- | :--- | :--- | :--- |
| **Full Feature Matrix (59 structural, vintage, spatial, and use-class features)** | 59 | 95.82 | 0.3314 | Baseline (0.00) |
| **Reduced Geometric Features Only (12 numeric features without categorical use classes)** | 12 | 107.90 | 0.3643 | +12.08 MT |
| **Ridge Regression with Log-Stabilized Target log1p(y)** | 59 | 97.99 | 0.2079 | +2.17 MT |
| **Ridge Regression with Native Linear Target y (No transformation)** | 59 | 125.63 | 0.4971 | +29.81 MT |
