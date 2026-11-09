# Table 5: Conformal Prediction Evaluation on Held-Out Test Facilities

| Nominal Target | Conformal Methodology | Non-Conformity Threshold | Marginal Coverage (%) | Facility Coverage (%) | Mean Width (MT) | Median Width (MT) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **90%** ($\alpha=0.1$) | `Observation Split (Tonne)` | 121.8753 | **87.67%** | 78.47% | 167.81 MT | 152.60 MT |
| **90%** ($\alpha=0.1$) | `Facility Split (Tonne)` | 90.0294 | **83.14%** | 72.79% | 130.43 MT | 120.75 MT |
| **90%** ($\alpha=0.1$) | `Facility Split (Log)` | 1.556 | **88.94%** | 73.98% | 341.88 MT | 143.66 MT |
| **90%** ($\alpha=0.1$) | `Facility CQR (LightGBM)` | 0.1771 | **88.41%** | 72.79% | 226.82 MT | 133.16 MT |
| **80%** ($\alpha=0.2$) | `Observation Split (Tonne)` | 54.4026 | **74.94%** | 60.50% | 86.52 MT | 85.12 MT |
| **80%** ($\alpha=0.2$) | `Facility Split (Tonne)` | 47.9813 | **72.47%** | 57.07% | 78.13 MT | 78.70 MT |
| **80%** ($\alpha=0.2$) | `Facility Split (Log)` | 1.1999 | **79.74%** | 59.45% | 227.86 MT | 95.75 MT |
| **80%** ($\alpha=0.2$) | `Facility CQR (LightGBM)` | 0.1186 | **77.38%** | 55.61% | 169.90 MT | 97.64 MT |
