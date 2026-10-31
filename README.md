# Explainable Machine Learning for Screening-Level Building Emissions Estimation Without Meter Data: Accuracy, Cluster-Aware Inference, and Explanation Stability

[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**License:** MIT (code); dataset terms per City of Seattle Open Data.

This repository contains the complete, reproducible, scientifically defensible experimental research pipeline supporting the Springer Nature book chapter:

> **“Explainable Machine Learning for Screening-Level Building Emissions Estimation Without Meter Data: Accuracy, Cluster-Aware Inference, and Explanation Stability.”**

---

## 1. Research Objectives & Core Findings

This research investigates three foundational dimensions of environmental machine learning:
1. **Predictive Accuracy:** Evaluates whether statistical machine learning architectures provide measurable value over conventional emissions accounting formulas and heuristic property-type median benchmarks.
2. **Explainability & Stability:** Compares intrinsic glassbox models (Explainable Boosting Machines, SplineGAM) with post-hoc Shapley attributions (TreeSHAP), assessing global feature ranking stability (Kendall's $\tau$) and local perturbation invariance.
3. **Computational Efficiency:** Quantifies single-inference latency, batch throughput, and resident memory footprint across each model family, evaluating multi-objective Pareto trade-offs.

### Key Empirical Results:
* **Conventional Accounting Identity:** When metered utility data is available, standard regulatory accounting ($E = \sum AD_i \times EF_i$) achieves **$R^2 = 1.0000$** with **MAE = 0.33 MT $\text{CO}_2\text{e}$** ($0.22\%$ WAPE). Machine learning is redundant when meters exist.
* **Unmetered Structural Prediction:** When utility meters are absent (pre-construction, zoning, screening), **XGBoost Regressor** is the top-performing ML architecture (**MAE = 95.40 MT $\text{CO}_2\text{e}$**, **$R^2 = 0.2747$**, **WAPE = 63.61%**), achieving a statistically significant error reduction of **$-18.80 \text{ MT}$** over the conventional property median baseline ($p_{\text{adj}} = 8.0 \times 10^{-4}$ via cluster sign-flip permutation test, Cluster Wilcoxon $p = 1.09 \times 10^{-8}$, 95% Clustered CI $[-27.35, -11.13]$ MT across 757 held-out facilities). Note that when compared against Ridge Regression, the 95% clustered confidence interval spans zero ($[-9.10, +3.04]$ MT, cluster permutation $p_{\text{adj}} = 0.659$, cluster-robust $t = -0.86$), confirming that regularized linear modeling is statistically indistinguishable from XGBoost when accounting for facility-level grouping.
* **Model Training & Target Transformation:** All ML models are trained on log1p(TotalGHGEmissions) and predictions are back-transformed with expm1; the property-median benchmark is not.
* **Linear & Additive Pareto Efficiency:** **Ridge Regression** achieves an MAE of **97.99 MT** (within 2.59 MT of XGBoost) with ultra-fast inference ($0.225 \text{ ms/sample}$, 437k samples/s throughput) and $5.2 \text{ KB}$ serialized footprint.
* **EBM Trade-off:** Explainable Boosting Machines (EBM) enforce exact mathematical additivity but required extensive training and yielded higher error (**MAE = 125.99 MT**) on unseen complex facilities.
* **Explanation Stability:** Random Forest achieved the highest global feature ranking stability across five random 80% subsamples (without replacement) (Kendall's $\tau = 0.9418 \pm 0.0062$). Under physical $+5\%$ Gross Floor Area perturbation preserving simplex constraints, SplineGAM and Ridge attributions demonstrated $\ge 0.997$ cosine stability.

### Exploratory Computational-Energy Outputs
These outputs were measured on one Windows host with CodeCarbon, have no validated measurement protocol, and are NOT used in the accompanying chapter.

> **Note (Known Issue):** `results/cross_validation_*.csv` contain numerically unstable Ridge and MLP folds and are not used in the chapter. The final chapter evaluation strictly uses the group holdout test partition (3,024 train vs. 757 test facilities).

---

## 2. Repository Structure

```
CarbonPulse/
├── configs/
│   └── experiment.yaml                 # Master configuration (hyperparameters, seeds, split ratios)
├── data/
│   ├── dataset_manifest.json           # SHA-256 hashes, provenance, schema definitions
│   ├── README.md                       # Data dictionary & feature taxonomy
│   ├── raw/
│   │   └── seattle_building_energy_benchmarking_raw.csv # Pristine statutory data (38,309 rows, 46 cols)
│   └── processed/
│       ├── train_features.parquet      # Development feature matrix (29,364 rows, 59 cols)
│       ├── train_target.parquet        # Development target (TotalGHGEmissions)
│       ├── test_features.parquet       # Held-out test feature matrix (7,366 rows, 59 cols)
│       ├── test_target.parquet         # Held-out test target
│       ├── test_activity.parquet       # Meter activity for testing Accounting Baseline
│       ├── train_groups.parquet        # Development cluster units (OSEBuildingID)
│       ├── test_groups.parquet         # Held-out cluster units (OSEBuildingID)
│       ├── split_metadata.json         # Partition dimensions & facility counts
│       └── cv_splits.json              # 5-fold GroupKFold split indices
├── src/
│   ├── data/
│   │   ├── load_data.py                # Schema validation & ingestion
│   │   ├── validate_data.py            # 14-point data quality & physical bounds suite
│   │   ├── build_features.py           # Domain feature engineering
│   │   └── preprocess.py               # Leakage-free group holdout preprocessing
│   ├── models/
│   │   ├── baselines.py                # Conventional Accounting & Property Median Baselines
│   │   └── model_registry.py           # Factory for all 8 architectures
│   ├── experiments/
│   │   ├── create_splits.py            # GroupKFold partition generator
│   │   ├── run_training.py             # Model training harness & timer
│   │   ├── run_evaluation.py           # Predictive performance metrics calculator
│   │   ├── run_cross_validation.py     # 5-fold GroupKFold cross-validation runner
│   │   ├── run_ablations.py            # Feature set & target transform ablations
│   │   └── run_all.py                  # Master end-to-end pipeline orchestrator
│   ├── explainability/
│   │   ├── run_explainers.py           # Ridge weights, SplineGAM effects, EBM shapes, TreeSHAP
│   │   └── stability_tests.py          # Kendall tau rank correlation & local perturbation tests
│   ├── benchmarking/
│   │   ├── benchmark_latency.py        # Micro-latency & batch throughput profiler
│   │   ├── benchmark_memory.py         # Tracemalloc & psutil RAM profiler
│   │   └── benchmark_energy.py         # CodeCarbon exploratory energy profiler
│   ├── statistics/
│   │   ├── paired_comparisons.py       # Wilcoxon signed-rank tests & 95% bootstrap CIs
│   │   └── pareto_analysis.py          # Multi-objective Pareto efficiency frontiers
│   └── reporting/
│       ├── generate_figures.py         # 15 publication figures (PNG @ 300 DPI + vector PDF)
│       ├── generate_tables.py          # 8 standardized Markdown result tables
│       ├── generate_report.py          # Automated research report generator
│       └── generate_provenance_manifest.py # Cryptographic SHA-256 provenance manifest generator
├── tests/
│   ├── test_data_pipeline.py           # Ingestion, schema, and leakage tests
│   ├── test_models.py                  # Estimator contracts and non-negative bounds
│   ├── test_scientific_integrity.py    # Provenance checksums & zero-synthetic checks
│   └── test_scientific_fixes.py        # Invariant tests: GAM additivity, clustered bootstrap, SHAP bounds
├── models/                             # Serialized fitted model artifacts (.joblib)
├── results/                            # Machine-readable CSV experiment outputs
├── figures/                            # 15 publication figures (PNG + PDF)
├── tables/                             # 8 publication Markdown tables
├── reports/                            # Detailed analytical and audit reports
├── frontend/                           # Separate demo application (illustrative UI)
├── CITATION.cff                        # Machine-readable citation metadata
├── LICENSE                             # MIT Open Source License
├── requirements.txt                    # Pinned Python environment dependencies
├── REPRODUCIBILITY.md                  # Comprehensive reproduction guide
└── README.md                           # This execution manual
```

---

## 3. Quick Start & Complete Reproduction

### 3.1 Environment Setup
Ensure Python 3.12 is installed, then install all verified dependencies:
```bash
pip install -r requirements.txt
```

### 3.2 Single-Command Full Reproduction
To run the entire pipeline end-to-end (validation, preprocessing, evaluation, explainability, stability, computational benchmarks, Pareto analysis, ablations, figures, tables, and automated tests):
```bash
python src/experiments/run_all.py --skip-train
```
*(Note: Remove `--skip-train` to re-train all models from scratch, which takes ~13 minutes on an 8-core CPU due to EBM pairwise interaction boosting).*

### 3.3 Individual Pipeline Commands
Every experiment can be executed independently:

1. **Verify Raw Data Provenance:**
   ```bash
   python src/data/download_dataset.py
   ```
2. **Execute Data Quality Validation:**
   ```bash
   python src/data/validate_data.py
   ```
3. **Run Leakage-Free Preprocessing:**
   ```bash
   python src/data/preprocess.py
   ```
4. **Generate GroupKFold Cross-Validation Splits:**
   ```bash
   python src/experiments/create_splits.py
   ```
5. **Train All 8 Model Architectures:**
   ```bash
   python src/experiments/run_training.py
   ```
6. **Evaluate Predictive Performance on Unseen Test Facilities:**
   ```bash
   python src/experiments/run_evaluation.py
   ```
7. **Run Explainability & TreeSHAP Attribution:**
   ```bash
   python src/explainability/run_explainers.py
   ```
8. **Execute Explanation Stability (Kendall's $\tau$ & Perturbation Tests):**
   ```bash
   python src/explainability/stability_tests.py
   ```
9. **Benchmark Computational Latency & Throughput:**
   ```bash
   python src/benchmarking/benchmark_latency.py
   ```
10. **Benchmark Peak Memory Allocation:**
    ```bash
    python src/benchmarking/benchmark_memory.py
    ```
11. **Benchmark Energy Consumption (Exploratory):**
    ```bash
    python src/benchmarking/benchmark_energy.py
    ```
12. **Run Paired Statistical Tests & Bootstrap CIs:**
    ```bash
    python src/statistics/paired_comparisons.py
    ```
13. **Generate Multi-Objective Pareto Frontier:**
    ```bash
    python src/statistics/pareto_analysis.py
    ```
14. **Run Sensitivity & Ablation Experiments:**
    ```bash
    python src/experiments/run_ablations.py
    ```
15. **Generate All 15 Publication Figures (PNG & PDF):**
    ```bash
    python src/reporting/generate_figures.py
    ```
16. **Generate All 8 Research Tables:**
    ```bash
    python src/reporting/generate_tables.py
    ```
17. **Generate Master Research Report:**
    ```bash
    python src/reporting/generate_report.py
    ```
18. **Execute Automated Scientific Test Suite:**
    ```bash
    python -m pytest tests/ -q
    ```

---



---

## 3. Q1 Journal Revision Experimental Upgrades

This codebase incorporates five major experimental and diagnostic upgrades executed for the peer-reviewed journal revision:

### 3.1 Grouped K-Fold Cross-Validation (`src/experiments/run_grouped_cv.py`)
- **Protocol:** Genuine 5-Fold `GroupKFold` cross-validation grouped strictly by facility cluster (`OSEBuildingID`), guaranteeing zero longitudinal facility contamination across splits.
- **Leakage Prevention:** All preprocessing pipelines (numeric imputation, standard scaling, categorical one-hot encoding) are fitted strictly within each training fold.
- **Numerical Robustness:** Solves the known fold instability issues of unregularized/ill-conditioned models by explicitly resetting partition indices (`reset_index(drop=True)`) and enforcing physical bounding on log-inverse transforms (`np.clip(a_min=0, a_max=100000)`).
- **Execution:**
  ```bash
  python -m src.experiments.run_grouped_cv
  ```
- **Outputs:** `results/grouped_cv_metrics.csv`, `results/grouped_cv_summary.csv`, `reports/grouped_cv_report.md`.

### 3.2 Scaled 50-Bootstrap Explanation Stability (`src/explainability/stability_50_bootstrap.py`)
- **Protocol:** Scales global explanation ranking stability benchmarks from 5 to 50 bootstrap refits ($80\%$ subsampling ratio without replacement).
- **Attribution Metrics:**
  - *Tree Ensembles (XGBoost, Random Forest):* Mean absolute TreeSHAP attributions across background instances.
  - *Interpretable Models (Ridge, SplineGAM):* Absolute standardized linear coefficients ($|\beta|$) and sample standard deviation of spline basis functions.
- **Correlations:** Evaluates all unique $\binom{50}{2} = 1,225$ pairwise refit comparisons via Kendall's $\tau$ and Spearman's $\rho$.
- **Frontend Export:** Produces a strictly typed JSON artifact (`results/explanation_stability_50_refits.json`) formatted for direct ingestion by Next.js 15 and Recharts visualization.
- **Execution:**
  ```bash
  python -m src.explainability.stability_50_bootstrap
  ```
- **Outputs:** `results/explanation_stability_50_refits.json`, `results/explanation_stability_50_summary.csv`, `reports/explanation_stability_50_report.md`.

### 3.3 Chronological Temporal Holdout & Stratification (`src/experiments/run_temporal_validation.py`)
- **Protocol:** Strict time-series partitioning using reporting years 2015–2022 for model training ($N=26,269$) and reporting years 2023–2025 for holdout evaluation ($N=10,461$).
- **Stratified Cohorts:**
  - *Observed Cohort ($96.6\%$ of test set):* Evaluates longitudinal drift on buildings present in the historical training partition.
  - *Unseen Generalization Cohort ($3.4\%$ of test set):* Evaluates true out-of-facility transferability to newly constructed or newly regulated facilities.
- **Execution:**
  ```bash
  python -m src.experiments.run_temporal_validation
  ```
- **Outputs:** `results/temporal_validation_metrics.csv`, `reports/temporal_validation_report.md`.

### 3.4 Random Forest Perturbation Sensitivity Diagnosis (`src/diagnostics/rf_perturbation_diagnostic.py`)
- **Objective:** Dissects the anomalous $+49.92\%$ prediction shift under $+5\%$ Gross Floor Area (GFA) perturbation.
- **Key Discovery:** Proves that $82.3\%$ of the apparent shift ($41.07$ percentage points of the mean) is driven by a single outlier (Instance 13, a K-12 School of 93,218 sq ft) crossing a dense split threshold in $137/150$ trees ($91.3\%$ of estimators), amplified non-linearly by $\text{expm1}$.
- **Empirical Proof:** The robust median relative change across the held-out cohort is only **$2.42\%$**, confirming that the phenomenon is an isolated threshold-crossing artifact rather than a systemic model defect.
- **Execution:**
  ```bash
  python -m src.diagnostics.rf_perturbation_diagnostic
  ```
- **Outputs:** `results/rf_perturbation_diagnostic.csv`, `results/rf_perturbation_diagnostic.json`, `reports/rf_sensitivity_diagnostic.md`.

### 3.5 External Validation Pipeline & Fallback (`src/data/external_loader.py`)
- **Architecture:** Abstract base loader (`BaseExternalBenchmarkingLoader`) and canonical NYC Local Law 84 adapter (`NYCLL84DataLoader`).
- **Schema Validation:** Strict type and physical bounds validation implemented in both Python and TypeScript/Zod (`frontend/src/schemas/externalValidationSchema.ts`).
- **Academic Limitation Fallback:** Automatically generates `LIMITATIONS.md` when external validation data is absent, explicitly bounding the manuscript's empirical claims to the City of Seattle jurisdiction and documenting thermodynamic Scope 2 grid differences.

## 4. Generated Artifacts & Reports

* **Predictive Results:** [results/predictive_metrics.csv](results/predictive_metrics.csv), [results/test_predictions.csv](results/test_predictions.csv), [results/residuals.csv](results/residuals.csv), [results/subgroup_performance.csv](results/subgroup_performance.csv)
* **Cross-Validation Development Results:** [results/cross_validation_metrics.csv](results/cross_validation_metrics.csv), [results/cross_validation_summary.csv](results/cross_validation_summary.csv)
* **Explainability Results:** [results/global_feature_importance.csv](results/global_feature_importance.csv), [results/local_explanations.csv](results/local_explanations.csv), [results/explanation_metadata.json](results/explanation_metadata.json)
* **Stability Results:** [results/explanation_stability.csv](results/explanation_stability.csv)
* **Computational Benchmarks:** [results/computational_benchmarks.csv](results/computational_benchmarks.csv), [results/latency_benchmarks.csv](results/latency_benchmarks.csv), [results/memory_benchmarks.csv](results/memory_benchmarks.csv), [results/energy_benchmarks.csv](results/energy_benchmarks.csv)
* **Statistical Tests & Pareto:** [results/paired_model_comparisons.csv](results/paired_model_comparisons.csv), [results/pareto_analysis.csv](results/pareto_analysis.csv)
* **Ablations:** [results/ablation_metrics.csv](results/ablation_metrics.csv)
* **Reports:**
  - [reports/final_experimental_report.md](reports/final_experimental_report.md)
  - [reports/provenance_manifest.md](reports/provenance_manifest.md)
  - [reports/cross_validation_report.md](reports/cross_validation_report.md)
  - [reports/dataset_audit.md](reports/dataset_audit.md)
  - [reports/dataset_selection_rationale.md](reports/dataset_selection_rationale.md)
  - [reports/data_quality_report.md](reports/data_quality_report.md)
  - [reports/experimental_protocol.md](reports/experimental_protocol.md)
  - [reports/predictive_performance.md](reports/predictive_performance.md)
  - [reports/explainability_analysis.md](reports/explainability_analysis.md)
  - [reports/explanation_stability.md](reports/explanation_stability.md)
  - [reports/computational_efficiency.md](reports/computational_efficiency.md)
  - [reports/statistical_validation.md](reports/statistical_validation.md)
  - [reports/ablation_analysis.md](reports/ablation_analysis.md)
  - [reports/figure_captions.md](reports/figure_captions.md)
  - [reports/literature_gap.md](reports/literature_gap.md)
* **Publication Figures:** 15 vector and raster plots in [figures/](figures/)
* **Publication Tables:** 8 standardized result tables in [tables/](tables/)

---

## 5. Citation

If you use this codebase, methodology, or empirical benchmarks, please cite:

```bibtex
@software{mandloi2026carbonpulse,
  author = {Mandloi, Aditya and Agrawal, Anshika},
  title = {CarbonPulse: Explainable Machine Learning for Screening-Level Building Emissions Estimation Without Meter Data},
  year = {2026},
  version = {1.0.0},
  doi = {10.5281/zenodo.XXXXXXX},
  url = {https://github.com/beingaditya18/CarbonPulse-}
}
```

---

## 6. Demo Application

frontend/ is a separate demo application. It is not part of the evaluated results in the chapter, and any figures shown in it are illustrative.

Live Demo: https://carbon-pulse-3ciymie91-beingaditya18s-projects.vercel.app/
