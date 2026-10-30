# Reproducibility Guide & Experimental Manifest

**Project:** Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation of Predictive Accuracy, Interpretability, and Computational Efficiency  
**Repository:** `CarbonPulse AI+`  
**Author / Maintainer:** Senior Machine Learning & Environmental Data Science Research Team  
**Standard Environment:** Python 3.12.6, Windows / Linux / macOS  

---

## 1. Environment Specification

### System Architecture
* **Primary Reference Hardware:** AMD Ryzen 7 / x86_64, 16 Cores, 32 GB RAM
* **Python Runtime:** 3.12.6
* **Package Manager:** `pip` / `virtualenv`

### Core Scientific Dependencies
```
numpy>=2.0.0
scipy>=1.14.0
pandas>=2.2.0
scikit-learn>=1.5.0
xgboost>=1.7.6
interpret>=0.7.0
shap>=0.46.0
matplotlib>=3.8.0
seaborn>=0.13.0
pyyaml>=6.0.1
fastparquet>=2024.5.0
joblib>=1.4.0
pytest>=7.4.0
codecarbon>=2.8.0
```

---

## 2. Directory Structure & Invariants

```
CarbonPulse--main/
├── configs/
│   └── experiment.yaml                 # Master configuration, random seeds, hyperparameters
├── data/
│   ├── raw/
│   │   └── seattle_building_energy_benchmarking_raw.csv  # Statutory Raw Data (SMC 22.920)
│   ├── processed/                      # Parquet matrices partitioned by OSEBuildingID
│   ├── dataset_manifest.json           # Provenance metadata and cryptographic hashes
│   └── README.md                       # Data dictionary and statutory citations
├── models/                             # Serialized trained model binaries (.joblib)
├── results/
│   ├── predictive_metrics.csv          # Held-out test performance metrics
│   ├── cross_validation_metrics.csv    # 5-fold GroupKFold development performance
│   ├── test_predictions.csv            # Individual prediction vectors with OSEBuildingID (7,366 test records)
│   ├── residuals.csv                   # Per-observation prediction errors with OSEBuildingID
│   ├── global_feature_importance.csv   # Model-specific feature attributions
│   ├── local_explanations.csv          # Sample facility attribution breakdowns
│   ├── explanation_stability.csv       # Resampling rank correlation & physical perturbation
│   ├── computational_benchmarks.csv    # Latency, throughput, RAM, and energy
│   ├── energy_benchmarks.csv           # Reconciled hardware energy tracking & conversions
│   ├── paired_model_comparisons.csv    # Clustered permutation p-values, Wilcoxon, CRVE t, & CIs
│   ├── pareto_analysis.csv             # Multi-objective Pareto efficiency frontier
│   ├── ablation_metrics.csv            # Feature set & target scaling ablations
│   └── provenance_manifest.json        # Machine-readable end-to-end artifact run manifest
├── reports/                            # Comprehensive research documentation & provenance_manifest.md
├── figures/                            # 15 publication figures (300 DPI PNG & vector PDF)
├── tables/                             # 8 publication tables (Markdown & LaTeX-ready)
├── src/                                # Modular research software implementation
├── tests/                              # Automated pytest software & scientific QA suite
├── frontend/                           # Isolated Next.js PWA personal sustainability application
├── REPRODUCIBILITY.md                  # This reproduction guide
└── README.md                           # Master project documentation
```

---

## 3. Step-by-Step Reproduction Commands

### Step 0: Clone and Environment Setup
```bash
# Clone the repository
git clone https://github.com/beingaditya18/CarbonPulse-.git
cd CarbonPulse-

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux / macOS:
source venv/bin/activate

# Install locked dependencies
pip install -r requirements.txt
```

### Step 1: Data Ingestion & Quality Validation
Inspects statutory schema, missingness rates, and physical bounds.
```bash
python src/data/validate_data.py
```

### Step 2: Leakage-Free Preprocessing & Group Partitioning
Cleans raw filings, enforces non-negative bounds, and splits into train and test sets strictly by unique `OSEBuildingID` (zero facility overlap).
```bash
python src/data/preprocess.py
```

### Step 3: GroupKFold Cross-Validation Splitting
Generates 5-fold `GroupKFold` indices on development data.
```bash
python src/experiments/create_splits.py
```

### Step 4: Group-Aware Cross-Validation Evaluation
Evaluates all candidate model architectures across the 5 GroupKFold development folds to quantify fold-to-fold variance and model stability.
```bash
python src/experiments/run_cross_validation.py
```

### Step 5: Full Development Training & Serialization
Trains the 8 candidate models on the full development partition and serializes fitted objects into `models/`.
```bash
python src/experiments/run_training.py
```

### Step 6: Held-Out Test Evaluation & Metric Computation
Generates predictions on the untouched held-out test partition (7,366 records across 757 unseen facilities) and saves all evaluation outputs.
```bash
python src/experiments/run_evaluation.py
```

### Step 7: Explainability & Attribution Extraction
Extracts valid GAM spline term contributions, EBM term importances, linear coefficients, and log-scale TreeSHAP values.
```bash
python src/explainability/run_explainers.py
```

### Step 8: Explanation Stability & Physical Perturbation Benchmarks
Measures global rank correlation across bootstrap resamples (Kendall's $\tau$, Spearman $\rho$) and local perturbation invariance using physically bounded raw-space feature modifications.
```bash
python src/explainability/stability_tests.py
```

### Step 9: Computational Benchmarking (Latency, Memory, Energy)
Measures single-sample latency, batch throughput, peak resident memory, and inference energy consumption under standardized workloads.
```bash
python src/benchmarking/benchmark_latency.py
python src/benchmarking/benchmark_memory.py
python src/benchmarking/benchmark_energy.py
```

### Step 10: Clustered Statistical Testing & Pareto Frontier Identification
Performs cluster sign-flip permutation tests ($B=10,000$), cluster-level Wilcoxon signed-rank tests, cluster-robust standard errors (Liang-Zeger CRVE), and cluster-bootstrap 95% confidence intervals ($B=2,000$) grouped strictly by `OSEBuildingID` with Holm-Bonferroni correction.
```bash
python src/statistics/paired_comparisons.py
python src/statistics/pareto_analysis.py
```

### Step 11: Empirical Ablation Studies
Quantifies the impact of geometry-only features, unscaled linear targets, and EBM pairwise interaction terms.
```bash
python src/experiments/run_ablations.py
```

### Step 12: Generate Figures, Tables, Research Report, and Provenance Manifest
Compiles all 15 publication figures, 8 research tables, the master synthesis report, and the machine-readable provenance manifest (`results/provenance_manifest.json` and `reports/provenance_manifest.md`).
```bash
python src/reporting/generate_figures.py
python src/reporting/generate_tables.py
python src/reporting/generate_report.py
python src/reporting/generate_provenance_manifest.py
```

### Step 13: Execute Software QA & Scientific Invariant Test Suite
Runs the full pytest suite (27 passed in 27s) and the frontend Vitest suite (106 passed in 1.5s):
```bash
# Python Scientific Pipeline & Invariants (27 tests)
python -m pytest tests/

# Frontend Web Application Unit Tests (106 tests)
cd frontend && npm test -- --run && cd ..
```

### Or Run the Entire Pipeline End-to-End via Master Orchestrator:
```bash
# Full pipeline (including model fitting):
python src/experiments/run_all.py

# Fast evaluation & reporting suite (using serialized models):
python src/experiments/run_all.py --skip-train
```
