# CarbonPulse: Explainable Machine Learning for Screening-Level Building Emissions Without Meter Data

[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Release](https://img.shields.io/badge/Release-v1.2.0-orange.svg)](https://github.com/beingaditya18/CarbonPulse-)
[![Code Style: Black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

> **Solving the Cold-Start Problem in Urban Emissions Tracking.** 
> This repository contains the complete, mathematically rigorous, and fully reproducible machine learning pipeline for estimating building-level greenhouse gas (GHG) emissions using *only* structural and property attributes. 

Building-level GHG data is often unavailable, delayed, or inconsistently reported. **CarbonPulse** bridges this gap, providing a scientifically defensible framework for meter-free prediction, robust uncertainty quantification, and AI-driven audit prioritisation.

### 👥 Authors & Affiliation
* **Aditya Mandloi**¹* ([adityamandloi10@gmail.com](mailto:adityamandloi10@gmail.com))
* **Dr. Ashok Kumar Gupta**¹

¹ *School of Data Science and Forecasting, Devi Ahilya Vishwavidyalaya, Indore, India*  
*\* Corresponding author*

---

## 🚀 Core Scientific Innovations

CarbonPulse moves beyond basic predictive modeling to establish a highly reliable, cluster-aware framework for environmental data science:

*   📊 **Meter-Free "Cold-Start" Prediction:** Benchmarks state-of-the-art structural models (TabNet, XGBoost, EBMs) against historical baselines to predict emissions for newly constructed or unmonitored buildings.
*   🛡️ **Strict Conformal Risk Control:** Implements building-maximum conformal intervals to guarantee simultaneous *all-years* coverage of a building's reporting history, ensuring uncertainty metrics are operationally dependable.
*   🌍 **Proven External Transferability:** Models trained on City of Seattle benchmarking data (36k+ records) demonstrated strong rank transfer ($\rho = 0.8053$) when evaluated on a completely external cohort of 1,760 facilities in Boston (BERDO 2021).
*   🎯 **High-Yield Audit Screening:** Reconciled facility-level audit tests prove that AI-driven screening captures up to **+56.32% more emissions** (63,051 t CO₂e) at a 20% inspection budget compared to traditional property-median heuristics.
*   🔧 **Physics-Aware Monotonicity:** Standard tree-based models can yield physically impossible negative responses to building expansions. By enforcing strict positive monotonic constraints on area features, our adapted XGBoost architecture **completely eliminates (0%)** these threshold-crossing anomalies.

---

## 📈 Predictive Performance Benchmark

Evaluated on a strictly zero-leakage, facility-disjoint holdout of 7,366 annual records from 757 independent facilities. 

| Architecture | Physical $R^2$ | MAE (t CO₂e) | RMSE (t CO₂e) | MedAE (t CO₂e) | Log $R^2$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Lag-1 Persistence** *(Requires prior data)* | 0.9354 | 25.78 | 206.51 | 3.15 | 0.9054 |
| 🏆 **TabNet** | **0.3186** | 99.98 | **670.77** | 20.09 | 0.5772 |
| 🛡️ **XGBoost (Domain-Adapted)** | 0.3909 | 94.30 | 634.17 | 18.96 | 0.5937 |
| 🎯 **XGBoost (Monotonic)** | 0.2691 | **93.86** | 694.69 | **19.35** | 0.5896 |
| **XGBoost (Standard)** | 0.2747 | 95.40 | 692.01 | 19.44 | 0.5950 |
| **Random Forest** | 0.2328 | 101.18 | 711.73 | 20.76 | 0.5623 |
| **Ridge Regression** | 0.2079 | 97.99 | 723.19 | 20.01 | 0.5630 |
| **Deep Ensemble (M=5)** | 0.1056 | 108.47 | 768.48 | 19.94 | 0.5797 |
| **Explainable Boosting Machine (EBM)** | 0.0337 | 125.99 | 798.75 | 23.53 | 0.4196 |
| *Median Baseline Heuristic* | *-0.0212* | *137.59* | *821.16* | *27.10* | *-0.0046* |

*Note: Lag-1 persistence uses prior administrative filings and serves as a historical ceiling, not a structural cold-start competitor.*

---

## 🏗️ Repository Architecture

CarbonPulse is engineered for transparency, modularity, and strict cryptographic provenance.

```text
CarbonPulse/
├── configs/
│   └── experiment.yaml                 # Master configuration and hyperparameter grids
├── data/
│   ├── dataset_manifest.json           # SHA-256 hashes & dataset provenance
│   ├── raw/                            # Pristine statutory data
│   └── processed/                      # Development & holdout feature matrices
├── src/
│   ├── data/                           # Ingestion, validation, and external adapters (NYC/Boston)
│   ├── models/                         # Registry for all evaluated architectures
│   ├── experiments/                    # GroupKFold CV, temporal validation, & orchestrators
│   ├── explainability/                 # SplineGAM effects, TreeSHAP, and 50-bootstrap stability
│   ├── diagnostics/                    # Conformal calibration & RF perturbation sensitivity
│   └── statistics/                     # Cluster Wilcoxon, sign-flip tests, & bootstrap CIs
├── tests/                              # Comprehensive 52-test automated verification suite
├── results/                            # Machine-readable CSV experiment outputs
├── reports/                            # Automated analytical and audit reports
├── frontend/                           # Illustrative Next.js UI demo application
└── README.md                           # Execution manual
⚡ Quick Start & Full Reproduction
1. Environment Setup
CarbonPulse requires Python 3.12+. Clone the repository and install all strictly pinned dependencies:
git clone [https://github.com/beingaditya18/CarbonPulse-.git](https://github.com/beingaditya18/CarbonPulse-.git)
cd CarbonPulse-
pip install -r requirements.txt
2. End-to-End Pipeline Execution
Run the complete, reproducible pipeline (data validation, preprocessing, evaluation, explainability, stability, and generating all publication figures/tables) with a single command:
python src/experiments/run_all.py --skip-train
hyperparameters).
3. Automated Verification
Verify the integrity of the environment and pipeline logic using the bundled pytest suite:
python -m pytest tests/ -q
📝 Citation
If this codebase, methodology, or the empirical benchmarks accelerate your research, please cite our work:
@software{mandloi2026carbonpulse,
  author = {Mandloi, Aditya and Gupta, Ashok Kumar},
  title = {CarbonPulse: Explainable Machine Learning for Screening-Level Building Emissions Estimation Without Meter Data},
  year = {2026},
  version = {1.2.0},
  url = {[https://github.com/beingaditya18/CarbonPulse-](https://github.com/beingaditya18/CarbonPulse-)}
}
