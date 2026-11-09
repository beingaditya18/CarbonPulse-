# Table 2: Evaluated Architectures and Hyperparameter Configurations

| Model Identifier | Architecture Class | Primary Hyperparameters | Target Transform |
| :--- | :--- | :--- | :--- |
| **Conventional Accounting** | Stoichiometric Physical Accounting | Static factors: Elec=0.00001972 MT/kWh, Gas=0.005299 MT/therm, Steam=0.000081 MT/kBtu | None (Exact linear identity) |
| **Median Benchmark** | Non-ML Property Heuristic | Median carbon intensity per `BuildingType` class evaluated on training data | None (Linear scaling by GFA) |
| **Ridge Regression** | Regularized Linear Model | L2 penalty $\alpha = 10.0$, standardized features, analytical solver | $\log(1 + y) \rightarrow \exp(\hat{y}) - 1$ |
| **SplineGAM** | Generalized Additive Model | Degree-3 cubic B-splines, 5 internal knots per numeric feature, Ridge penalty $\alpha = 10.0$ | $\log(1 + y) \rightarrow \exp(\hat{y}) - 1$ |
| **EBM** | Explainable Boosting Machine | Max bins = 256, 8 outer bags, 10 pairwise interactions, learning rate = 0.05 | $\log(1 + y) \rightarrow \exp(\hat{y}) - 1$ |
| **Random Forest** | Bagged Decision Tree Ensemble | 150 estimators, max depth = 16, min samples split = 5, min samples leaf = 2 | $\log(1 + y) \rightarrow \exp(\hat{y}) - 1$ |
| **XGBoost** | Gradient Boosted Decision Trees | 200 trees, max depth = 6, learning rate = 0.05, subsample = 0.8, colsample = 0.8 | $\log(1 + y) \rightarrow \exp(\hat{y}) - 1$ |
| **MLP Regressor** | Deep Multilayer Perceptron | Layers = (128, 64), ReLU activation, Adam optimizer, $\alpha = 0.001$, early stopping | $\log(1 + y) \rightarrow \exp(\hat{y}) - 1$ |
