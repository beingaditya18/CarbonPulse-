# Table 3: Predictive Accuracy Benchmark on 7,366 Held-Out Facilities

| Architecture | MAE (MT $\text{CO}_2\text{e}$) | RMSE (MT $\text{CO}_2\text{e}$) | $R^2$ Score | WAPE (%) | NRMSE | Median AE (MT) | Mean Bias (MT) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Conventional Accounting (Activity x EF)** | 0.33 | 3.81 | 1.0000 | 0.2% | 0.025 | 0.05 | +0.11 |
| **Property Median Intensity Benchmark** | 114.20 | 735.27 | 0.1812 | 76.2% | 4.903 | 23.28 | -66.90 |
| **Ridge Regression** | 97.99 | 723.19 | 0.2079 | 65.3% | 4.822 | 20.01 | -65.05 |
| **Generalized Additive Model (SplineGAM)** | 98.89 | 735.28 | 0.1812 | 65.9% | 4.903 | 19.82 | -65.78 |
| **Explainable Boosting Machine (EBM)** | 125.99 | 798.75 | 0.0337 | 84.0% | 5.326 | 23.53 | -29.29 |
| **Random Forest Regressor** | 101.18 | 711.73 | 0.2328 | 67.5% | 4.746 | 20.76 | -72.02 |
| **XGBoost Regressor** | 95.40 | 692.01 | 0.2747 | 63.6% | 4.615 | 19.44 | -68.77 |
| **Multilayer Perceptron (MLP)** | 128.98 | 781.83 | 0.0743 | 86.0% | 5.213 | 24.98 | -18.19 |
