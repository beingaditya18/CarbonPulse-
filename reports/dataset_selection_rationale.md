# Dataset Selection Rationale & Target Validity Analysis

**Manuscript Title:** Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation of Predictive Accuracy, Interpretability, and Computational Efficiency  
**Date:** October 2026  
**Authors:** Senior Environmental Data Science & Machine Learning Research Team

---

## 1. Scientific Justification for Primary Dataset Selection

The primary experimental foundation of this study is the **City of Seattle Building Energy Benchmarking Dataset (2015–Present)**, comprising 38,309 multi-year statutory compliance records published by the City of Seattle Office of Sustainability & Environment.

We selected this dataset over alternative candidates (such as vehicle fuel consumption ratings, smart-home appliance sub-metering, and grid dispatch records) for six specific scientific reasons:

1. **Domain Coherence & Real-World Relevance:** Commercial and multifamily buildings account for approximately $30\text{--}40\%$ of global greenhouse gas emissions. Focusing on a single, well-defined municipal building stock avoids the statistical distortion of mixing unrelated sectors (e.g., vehicles, factories, power plants).
2. **Statutory Reliability & Full Census:** Rather than an opt-in or self-selected sample, the dataset represents a legally mandated annual census under Seattle Municipal Code (SMC 22.920) for all commercial and multifamily buildings $\ge 20,000 \text{ sq ft}$.
3. **Rich Physical & Architectural Feature Representation:** The dataset captures the core physical determinants of building energy performance: gross floor area, building height/floors, vintage (year built), primary and secondary property uses, and spatial coordinates.
4. **Hierarchical & Longitudinal Group Structure:** With 38,309 filings linked by permanent facility IDs (`OSEBuildingID`) across reporting years 2015–2025, the data allows rigorous **Group-K-Fold cross-validation** and chronological holdout splits, preventing optimistic intra-building test leakage.
5. **Transparency & Open Provenance:** Published under open-government public domain terms on Socrata Open Data with documented data dictionaries and automated API endpoints.
6. **Defensible emissions target with a documented accounting methodology:** The dataset includes both total emissions (`TotalGHGEmissions`, in Metric Tons $\text{CO}_2\text{e}$) and normalized intensity (`GHGEmissionsIntensity`, in $\text{kg CO}_2\text{e} / \text{sq ft}$).

---

## 2. Critical Target-Validity & Accounting Boundary Analysis

### 2.1 How the Emissions Target is Derived
In municipal building benchmarking programs across North America, building greenhouse gas emissions are not measured via direct flue gas or chimney sensors. Instead, building managers submit utility meter billing data into **U.S. EPA ENERGY STAR Portfolio Manager**, which applies regional carbon emission factors:

$$\text{TotalGHGEmissions } (E) = \sum_{k} \text{Activity Data}_k \times \text{Emission Factor}_k$$

Where:
* $k \in \{\text{Electricity}, \text{Natural Gas}, \text{District Steam}\}$
* $\text{Activity Data}_k$: Metered fuel consumption (kWh of electricity, therms of natural gas, kBtu of district steam).
* $\text{Emission Factor}_k$: Regional grid emission factors (from EPA eGRID or Seattle City Light utility specific factors) and standard fuel combustion factors (from EPA Greenhouse Gas Reporting Program).

### 2.2 The Risk of Trivial Accounting Approximations
If a machine learning model is trained using metered utility consumption (`Electricity(kWh)`, `NaturalGas(therms)`, `SteamUse(kBtu)`) as input features to predict `TotalGHGEmissions`, the model is **merely solving a trivial linear regression to recover known static multiplication constants**.

Such an experiment would be methodologically flawed:
* It does not solve a real-world predictive challenge.
* It could mislead readers into believing machine learning is outperforming conventional methods, when it is simply numerically fitting a known algebraic formula.
* In real-world operational deployments, if metered utility data is already available, **no machine learning model is needed**—the exact conventional accounting multiplication should be executed directly.

### 2.3 The Legitimate Research Formulation
Machine learning provides genuine environmental and economic value when **metered utility consumption is absent or incomplete**:
1. **Pre-Construction & Urban Planning:** Estimating the carbon footprint of proposed building designs before construction and meter installation.
2. **Municipal Policy & Building Performance Standards:** Screening unmetered or non-compliant facilities to prioritize energy audits and decarbonization incentives.
3. **Missing Data Imputation & Retrofit Prioritization:** Predicting emissions trajectories from easily observable architectural features (gross floor area, vintage, occupancy type, height, and geographic location).

### 2.4 Experimental Separation
To maintain strict scientific integrity, our pipeline establishes a clear boundary:
1. **Conventional Accounting Baseline:** Evaluated using metered activity data multiplied by standard emission factors to demonstrate the theoretical upper bound when complete utility records exist.
2. **Structural ML Feature Matrix:** Strictly withholds all direct utility meter quantities (`Electricity(kWh)`, `NaturalGas(therms)`, `SteamUse(kBtu)`, `SiteEnergyUse(kBtu)`, and `EUI`). Models (Ridge, GAM, EBM, Random Forest, XGBoost, MLP) are trained purely on structural, architectural, vintage, and spatial attributes.
3. **Heuristic Benchmark:** Conventional property-use median emissions intensity benchmarks (e.g., standard CBECS / EPA property median emissions per square foot) serve as the true non-ML baseline for unmetered estimation.

### 2.5 Epistemic Ground-Truth Caveat
Because the target variable represents EPA Portfolio Manager calculations derived from utility billing records, this research measures the ability of ML models to predict **standardized regulatory carbon accounting totals**, rather than direct real-time atmospheric chimney fluxes. This distinction is explicitly maintained throughout the manuscript.
