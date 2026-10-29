# Section 5: Discussion & Methodological Implications

## 5.1 When is Machine Learning Genuinely Necessary?
A central contribution of this study is resolving the conflation between regulatory emissions accounting and statistical predictive estimation. Our results establish a clear operational decision boundary:

1. **When Utility Meter Data Exists:** The **Conventional Accounting Baseline** achieves an $R^2$ of $1.0000$ with an average error of $0.33 \text{ MT CO}_2\text{e}$ ($0.22\%$ WAPE). In operational settings where monthly electric bills and gas meter totals are logged, machine learning provides **zero incremental value** and should not be deployed. Direct multiplication by standardized regional emissions factors represents the scientifically and economically sound choice.
2. **When Utility Meter Data is Absent:** In municipal policy screening, pre-construction zoning approvals, building energy rating mandates, and unmetered retrofit prioritization, utility billing data is unavailable. Here, statistical machine learning models demonstrate significant, defensible value: **XGBoost reduces predictive error by 18.80 MT $\text{CO}_2\text{e}$ compared to conventional property-type median benchmarks ($p < 10^{-70}$)**.

## 5.2 The Interpretability vs. Accuracy Trade-Off in Environmental Practice
Our empirical results challenge the common assumption that glassbox additive models will naturally match or exceed tree ensembles in tabular regression:
* **The Performance Gap:** Explainable Boosting Machines (EBM) achieved an MAE of $125.99 \text{ MT}$, compared to $95.40 \text{ MT}$ for XGBoost. While EBM enforces strict mathematical additivity ($f(x) = \beta_0 + \sum f_i(x_i) + \sum f_{ij}(x_i, x_j)$), restricting interactions to pairwise terms limits its capacity to model complex combinatorial interactions in large, multi-use facilities (e.g., high-rise mixed-use hospitals with parking structures and multiple HVAC zones).
* **Training Latency Bottleneck:** EBM required **780.0 seconds** of training time across 8 cores to evaluate pairwise interactions, compared to **4.76 seconds** for XGBoost. In large-scale municipal applications requiring frequent re-training across dynamic building cohorts, gradient-boosted trees combined with post-hoc TreeSHAP offer superior scalability and predictive precision.
* **The Role of Regularized Linear Models:** Ridge regression demonstrated remarkable Pareto efficiency: achieving an MAE of $97.99 \text{ MT}$ (within $2.59 \text{ MT}$ of XGBoost) with $0.27 \text{ s}$ training time, $0.625 \text{ ms}$ inference latency, and exact standardized linear weights. For resource-constrained embedded systems or simple regulatory compliance calculators, Ridge regression represents an outstanding operational compromise.

## 5.3 Explanation Stability & the Non-Causal Nature of Attributions
Our stability analysis confirms that TreeSHAP and linear weights reliably capture the primary physical determinants of building emissions:
* **Feature Consistency:** Gross floor area (`LogGFATotal`, `PropertyGFABuildings`), intensive healthcare occupancy (`BuildingType_Hospital`), and building vintage (`BuildingAge`) were universally identified as the top predictive drivers across all eight architectures.
* **High Bootstrap Stability:** Random Forest ($\tau = 0.9418$) and Ridge ($\tau = 0.8714$) demonstrated high rank stability across independent bootstrap splits, confirming that global feature rankings are not fragile artifacts of a single split.
* **The Non-Causal Imperative:** We emphasize that feature importance scores (whether derived from SHAP values, EBM shapes, or regression coefficients) represent **statistical associations**, not causal proofs. An attribution showing that floor area contributes $+50 \text{ MT}$ does not imply that repartitioning a facility will causally reduce emissions by that amount. Sub-annual equipment scheduling, HVAC maintenance quality, envelope insulation levels, and occupant behaviors remain unmeasured in statutory benchmarking datasets.

## 5.4 Green AI & Computational Footprint Assessment
Our hardware-level energy profiling demonstrates that the operational carbon footprint of inference across all evaluated models is negligible:
* Evaluating 10,000 building filings requires between $2 \times 10^{-8} \text{ kWh}$ and $1.13 \times 10^{-5} \text{ kWh}$, producing less than $0.005 \text{ g } \text{CO}_2\text{e}$ under average U.S. grid intensity.
* Because a typical commercial building emits $30\text{--}500 \text{ Metric Tons } \text{CO}_2\text{e}$ ($30,000,000\text{--}500,000,000 \text{ g } \text{CO}_2\text{e}$), any model-informed operational improvement that reduces physical building emissions by even $0.001\%$ offsets its computational lifetime inference footprint within minutes.

## 5.5 Limitations & Threats to Validity
1. **Epistemic Ground-Truth Caveat:** In municipal benchmarking programs, reported emissions are derived from utility billing aggregations processed through EPA ENERGY STAR Portfolio Manager. Consequently, our benchmark measures model agreement with **standardized regulatory accounting estimates**, rather than real-time physical chimney gas sensor fluxes.
2. **Geographic & Climate Specificity:** The empirical dataset is localized to the City of Seattle (ASHRAE Climate Zone 4C Marine) and benefits from Seattle City Light's predominantly hydroelectric, low-carbon grid ($0.0197 \text{ kg CO}_2\text{e/kWh}$). Deploying these structural models in regions with coal- or gas-dominated grids (e.g., $0.70 \text{ kg CO}_2\text{e/kWh}$) will require regional re-calibration.
3. **Unobserved Confounders:** Building energy benchmarking records do not capture sub-metered operational hours, internal thermostat setpoints, seasonal occupancy surges, or localized microclimates.

## 5.6 Data Availability & Reproducibility Statement
All raw data, processed matrices, configuration files, trained model artifacts, and evaluation scripts are structured in an open-access reproducible repository:
* **Raw Data Source:** City of Seattle Open Data Portal (Socrata Resource `teqw-tu6e`).
* **Code & Pipeline:** Fully executable from end-to-end via `python src/experiments/run_all.py`.
* **Testing Suite:** 15 automated pytest unit and integration tests passing at 100% (`python -m pytest tests/`).
