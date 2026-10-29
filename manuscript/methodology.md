# Section 3: Research Methodology

## 3.1 Empirical Dataset Provenance & Statutory Framework
The empirical foundation of this study is the **City of Seattle Building Energy Benchmarking Dataset (2015–2025)**, administered by the City of Seattle Office of Sustainability and Environment under Seattle Municipal Code (SMC) 22.920. Under this statutory mandate, owners of all non-residential and multifamily buildings exceeding $20,000 \text{ sq ft}$ are legally required to report annual building performance and utility meter readings through U.S. EPA ENERGY STAR Portfolio Manager.

The raw multi-year dataset comprises 38,309 compliance filings across 11 annual cycles (2015–2025) and 46 features. The pristine dataset was downloaded directly via the City of Seattle Socrata API (`teqw-tu6e`) and verified cryptographically against SHA-256 checksum `d1a8227bf9c7c82aea8279a67405add617271852a985d96bb6e4ac9070e8250f`.

## 3.2 Target Definition & Emissions Accounting Boundary
The primary regression target is `TotalGHGEmissions` ($y$), defined as total annual greenhouse gas emissions expressed in Metric Tons of $\text{CO}_2$ equivalent per year ($\text{MT CO}_2\text{e} / \text{yr}$). It encompasses Scope 1 direct emissions from on-site fossil fuel combustion and Scope 2 indirect emissions from electricity consumption:

$$y = \sum_{k} \text{Activity Data}_k \times \text{Emission Factor}_k$$

Where:
* $k \in \{\text{Electricity}, \text{Natural Gas}, \text{District Steam}\}$
* Emission factors correspond to Seattle City Light grid intensity ($0.01972 \text{ kg CO}_2\text{e/kWh}$) and EPA fuel factors ($5.299 \text{ kg CO}_2\text{e/therm}$ for natural gas; $0.0810 \text{ kg CO}_2\text{e/kBtu}$ for steam).

### Delineation of Research Tasks & Leakage Control
Because the regulatory target is an exact linear function of metered utility consumption, providing utility columns to an ML model converts the task into a trivial accounting identity. We therefore isolate two distinct experimental tasks:
1. **Conventional Accounting Task:** Evaluated using metered activity data multiplied by static emission factors to establish the upper performance ceiling when meters exist.
2. **Unmetered Structural Prediction Task:** Evaluated by strictly withholding all direct utility meter readings (`Electricity(kWh)`, `NaturalGas(therms)`, `SteamUse(kBtu)`, `SiteEnergyUse(kBtu)`, and `EUI`). Models predict emissions purely from observable physical, geometric, vintage, and spatial attributes.

## 3.3 Data Preprocessing & Leakage-Free Hierarchical Partitioning
Data cleaning enforces strict physical bounds without dropping legitimate high-emission facilities:
* Removal of demolished structures (`Demolished == True`, 329 records).
* Elimination of unresolvable non-positive targets ($y \le 0$ or missing, 1,240 records).
* Filtering of extreme unit-misreporting anomalies (intensities $> 50 \text{ kg CO}_2\text{e/sq ft}$, 16 records resulting from gram/kilogram reporting errors).
* The final validated dataset comprises **36,730 observations** (95.9% data retention).

### Group-Level Partitioning
To prevent optimistic intra-building temporal contamination across longitudinal filings, we enforce **GroupShuffleSplit partitioned on unique facility ID (`OSEBuildingID`)**:
* **Development Set (80% facilities):** 29,364 filings across 3,024 unique buildings.
* **Held-Out Test Set (20% facilities):** 7,366 filings across 757 unique buildings.
* **Contamination Check:** Overlap between training and testing facilities is strictly zero ($0$).
* All feature transformers, missing-value imputers, and scalers are fitted exclusively on the development partition.

## 3.4 Model Architectures & Formulations
We evaluate eight candidate architectures:
1. **Conventional Accounting Baseline:** $\hat{y} = \sum AD_i \times EF_i$.
2. **Property Median Intensity Benchmark:** $\hat{y} = \text{GFA} \times \text{MedianIntensity}(\text{BuildingType})$.
3. **Ridge Regression:** L2-regularized linear model minimizing $\|y - X\beta\|_2^2 + \alpha \|\beta\|_2^2$.
4. **Spline Generalized Additive Model (SplineGAM):** Evaluates non-linear additive splines $f(X) = \beta_0 + \sum_j B_j(X_j) \beta_j$ using cubic B-splines with 5 knots and Ridge penalty.
5. **Explainable Boosting Machine (EBM):** Tree-based cyclic gradient boosting with exact pairwise interactions: $g(E[y]) = \beta_0 + \sum f_i(x_i) + \sum f_{ij}(x_i, x_j)$.
6. **Random Forest Regressor:** Bagged ensemble of 150 randomized decision trees (max depth 16).
7. **XGBoost Regressor:** Second-order gradient boosted trees (200 estimators, max depth 6, learning rate 0.05).
8. **Multilayer Perceptron (MLP):** Feed-forward neural network (128–64 hidden units, ReLU, early stopping).

Due to the heavy positive skew of emissions ($\gamma = 89.65$), continuous models are trained with log-stabilized target transforms: $\log(1 + y) \rightarrow \exp(\hat{y}) - 1$.

## 3.5 Explainability & Stability Evaluation
* **Post-Hoc Attribution:** Evaluated via **TreeSHAP** (exact polynomial complexity) on tree ensembles, computing additive Shapley attributions $\phi_{i,j}$ satisfying local accuracy $\sum_j \phi_{i,j} = f(x_i) - E[f(x)]$.
* **Glassbox Interpretability:** Evaluated by extracting exact 1D shape functions from EBM and SplineGAM.
* **Explanation Stability:** Evaluated by computing pairwise **Kendall's rank correlation ($\tau$)** and **Spearman's $\rho$** across five independent bootstrap resamples. Local perturbation robustness is evaluated by measuring attribution invariance under $2\%$ input Gaussian jitter.

## 3.6 Computational Benchmarking & Green AI Footprint
All models are profiled under identical hardware conditions (Intel Core multi-core platform):
* **Inference Latency:** Single-sample latency (ms) over 100 repetitions with warmup; batch throughput across batch sizes $[1, 32, 128, 512]$.
* **Memory Footprint:** Peak resident heap allocation via `tracemalloc` and process RSS via `psutil`.
* **Energy Consumption & Operational Carbon:** Measured over a standardized workload of 10,000 queries using `codecarbon` and a 45W active CPU TDP power model, converted to operational $\text{CO}_2\text{e}$ via regional grid intensity ($0.370 \text{ kg CO}_2\text{e/kWh}$).
