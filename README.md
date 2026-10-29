# Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation of Predictive Accuracy, Interpretability, and Computational Efficiency

[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/)
[![License: Public Domain / Open Data](https://img.shields.io/badge/License-Public%20Domain-green.svg)](https://data.seattle.gov)
[![Tests: 15 Passed](https://img.shields.io/badge/Tests-15%20Passed-brightgreen.svg)](tests/)

This repository contains the complete, reproducible, scientifically defensible experimental research pipeline supporting the journal manuscript:

> **“Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation of Predictive Accuracy, Interpretability, and Computational Efficiency.”**

---

## 1. Research Objectives & Core Findings

This research investigates three foundational dimensions of environmental machine learning:
1. **Predictive Accuracy:** Evaluates whether statistical machine learning architectures provide measurable value over conventional emissions accounting formulas and heuristic property-type median benchmarks.
2. **Explainability & Stability:** Compares intrinsic glassbox models (Explainable Boosting Machines, SplineGAM) with post-hoc Shapley attributions (TreeSHAP), assessing global feature ranking stability (Kendall's $\tau$) and local perturbation invariance.
3. **Computational Efficiency & Green AI:** Quantifies single-inference latency, batch throughput, memory footprint, and measured/modeled operational energy consumption per 10,000 queries.

### Key Empirical Results:
* **Conventional Accounting Identity:** When metered utility data is available, standard regulatory accounting ($E = \sum AD_i \times EF_i$) achieves **$R^2 = 1.0000$** with **MAE = 0.33 MT $\text{CO}_2\text{e}$** ($0.22\%$ WAPE). Machine learning is redundant when meters exist.
* **Unmetered Structural Prediction:** When utility meters are absent (pre-construction, zoning, screening), **XGBoost Regressor** is the top-performing ML architecture (**MAE = 95.40 MT $\text{CO}_2\text{e}$**, **$R^2 = 0.2747$**, **WAPE = 63.61%**), achieving a statistically significant error reduction of **$-18.80 \text{ MT}$** over the conventional property median baseline ($p < 10^{-70}$, 95% CI $[-21.68, -16.28]$ MT).
* **Linear & Additive Pareto Efficiency:** **Ridge Regression** achieves an MAE of **97.99 MT** (within 2.59 MT of XGBoost) with ultra-fast inference ($0.625 \text{ ms/sample}$, 189k samples/s throughput) and $5.2 \text{ KB}$ serialized footprint.
* **EBM Trade-off:** Explainable Boosting Machines (EBM) enforce exact mathematical additivity but required **780 seconds** to train and yielded higher error (**MAE = 125.99 MT**) on unseen multi-use buildings.
* **Explanation Stability:** Random Forest achieved the highest global feature ranking stability across bootstrap resamples (Kendall's $\tau = 0.9418 \pm 0.0062$).
* **Green AI:** Model inference consumes $< 1.2 \times 10^{-5} \text{ kWh}$ per 10,000 queries ($< 0.005 \text{ g } \text{CO}_2\text{e}$ operational footprint), confirming that computational costs are negligible compared to real-world building emissions.

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
│   │   ├── run_ablations.py            # Feature set & target transform ablations
│   │   └── run_all.py                  # Master end-to-end pipeline orchestrator
│   ├── explainability/
│   │   ├── run_explainers.py           # Ridge weights, SplineGAM effects, EBM shapes, TreeSHAP
│   │   └── stability_tests.py          # Kendall tau rank correlation & local perturbation tests
│   ├── benchmarking/
│   │   ├── benchmark_latency.py        # Micro-latency & batch throughput profiler
│   │   ├── benchmark_memory.py         # Tracemalloc & psutil RAM profiler
│   │   └── benchmark_energy.py         # CodeCarbon & hardware TDP energy tracker
│   ├── statistics/
│   │   ├── paired_comparisons.py       # Wilcoxon signed-rank tests & 95% bootstrap CIs
│   │   └── pareto_analysis.py          # Multi-objective Pareto efficiency frontiers
│   └── reporting/
│       ├── generate_figures.py         # 15 publication figures (PNG @ 300 DPI + vector PDF)
│       ├── generate_tables.py          # 8 standardized Markdown result tables
│       └── generate_report.py          # Automated research report generator
├── tests/
│   ├── test_data_pipeline.py           # Ingestion, schema, and leakage tests
│   ├── test_models.py                  # Estimator contracts and non-negative bounds
│   └── test_scientific_integrity.py    # Provenance checksums & zero-synthetic checks
├── models/                             # Serialized fitted model artifacts (.joblib)
├── results/                            # Machine-readable CSV experiment outputs
├── figures/                            # 15 publication figures (PNG + PDF)
├── tables/                             # 8 publication Markdown tables
├── reports/                            # Detailed analytical and audit reports
├── manuscript/                         # Academic manuscript integration drafts
├── CarbonPulse--main/                  # Existing Next.js / TypeScript frontend application (preserved)
├── requirements.txt                    # Python environment dependencies
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
11. **Benchmark Energy Consumption & Operational Carbon:**
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
    python -m pytest tests/
    ```

---

## 4. Generated Artifacts & Reports

* **Predictive Results:** [results/predictive_metrics.csv](results/predictive_metrics.csv), [results/test_predictions.csv](results/test_predictions.csv), [results/residuals.csv](results/residuals.csv)
* **Explainability Results:** [results/global_feature_importance.csv](results/global_feature_importance.csv), [results/local_explanations.csv](results/local_explanations.csv)
* **Stability Results:** [results/explanation_stability.csv](results/explanation_stability.csv)
* **Computational Benchmarks:** [results/computational_benchmarks.csv](results/computational_benchmarks.csv), [results/latency_benchmarks.csv](results/latency_benchmarks.csv), [results/memory_benchmarks.csv](results/memory_benchmarks.csv)
* **Statistical Tests & Pareto:** [results/paired_model_comparisons.csv](results/paired_model_comparisons.csv), [results/pareto_analysis.csv](results/pareto_analysis.csv)
* **Ablations:** [results/ablation_metrics.csv](results/ablation_metrics.csv)
* **Reports:**
  - [reports/final_experimental_report.md](reports/final_experimental_report.md)
  - [reports/project_audit.md](reports/project_audit.md)
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
  - [reports/test_results.md](reports/test_results.md)
  - [reports/figure_captions.md](reports/figure_captions.md)
  - [reports/literature_gap.md](reports/literature_gap.md)
* **Academic Manuscript Drafts:**
  - [manuscript/methodology.md](manuscript/methodology.md)
  - [manuscript/results.md](manuscript/results.md)
  - [manuscript/discussion.md](manuscript/discussion.md)
  - [manuscript/reference_audit.csv](manuscript/reference_audit.csv)
* **Publication Figures:** 15 vector and raster plots in [figures/](figures/)
* **Publication Tables:** 8 standardized result tables in [tables/](tables/)

---

## 5. Preservation of Existing Frontend Codebase

The pre-existing Next.js 16 / React 19 web application in `CarbonPulse--main/` remains fully preserved and untouched. The research pipeline operates at the repository root and accesses clean interfaces without overwriting web application components.
