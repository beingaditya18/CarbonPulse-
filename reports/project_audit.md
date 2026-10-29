# Project Audit Report: CarbonPulse & Explainable AI Pipeline

**Project Title:** Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation of Predictive Accuracy, Interpretability, and Computational Efficiency  
**Date:** October 2026  
**Auditor:** Senior ML Research & Scientific Software Team  
**Repository Location:** `c:\Users\adity\Downloads\CarbonPulse--main`

---

## 1. Executive Summary

This audit assesses the pre-existing state of the `CarbonPulse` codebase and establishes the architectural and scientific implementation plan for the empirical research manuscript. Prior to this work, the repository contained a Next.js / TypeScript frontend application (`CarbonPulse--main`) simulating personal carbon footprint tracking. While the application contained conceptual documentation (`METHODOLOGY.md`) and simulated modules (`shapEngine.ts`, `twinRegression.ts`), it lacked an empirical machine learning pipeline, legitimate environmental observational datasets, statistical benchmarking, explanation fidelity/stability analyses, and hardware-level energy/computational profiling.

This report documents:
1. The structural and technical inventory of the existing codebase.
2. An assessment of existing calculation formulas, assumptions, and scientific limitations.
3. What components can be preserved vs. what requires genuine empirical implementation.
4. The end-to-end scientific research roadmap across all 13 phases.

---

## 2. Inventory of Existing Repository

### 2.1 File and Technology Stack
* **Root Structure:** The workspace contains an unbuilt Next.js 16 / React 19 application in `CarbonPulse--main/`.
* **Primary Languages:** TypeScript, JavaScript, CSS (TailwindCSS v4), JSON, Markdown.
* **State of Frontend Dependencies:** `package.json` specifies `@base-ui/react`, `@tanstack/react-query`, `lucide-react`, `recharts`, `zod`, `zustand`, `vitest`. However, `node_modules` was not installed, and tests (`npm run test`) could not execute without dependency bootstrapping.
* **Absence of Empirical ML Pipeline:** No Python scripts, machine learning training workflows, empirical datasets, or cross-validation harnesses existed in the original repository.

### 2.2 Deep Dive into Existing Calculation Modules
1. **`METHODOLOGY.md`**:
   - Outlines Scope 1, 2, and 3 personal footprint approximations based on published static emission factors (UK DESNZ/DEFRA 2023, IEA/Ember 2023, Scarborough et al. 2023).
   - Formulates the standard conventional carbon accounting equation:
     $$\text{Emissions } (E) = \text{Activity Data } (AD) \times \text{Emission Factor } (EF)$$
   - Outlines mathematical definitions of Shapley values for 5 lifestyle categories (transportation, electricity, food, shopping, waste).

2. **`shapEngine.ts` (`src/lib/shapEngine.ts`)**:
   - **Mechanism:** Implements an algebraic closed-form calculation over a fixed, hand-coded polynomial:
     $$\hat{y} = 1.2 \cdot T + 0.9 \cdot F + 1.5 \cdot E + 1.0 \cdot S + 1.0 \cdot W + 0.01 \cdot (T \cdot S)$$
   - **Explanation:** Computes marginal Shapley contributions analytically by splitting the bilinear interaction term ($0.01 \cdot T \cdot S$) equally between Transportation ($T$) and Shopping ($S$), subtracting a hardcoded baseline constant ($283 \text{ kg CO}_2\text{e}$).
   - **Scientific Assessment:** This is a deterministic heuristic for a client-side user interface. It does **not** evaluate statistical learning on observational data, does not estimate model error, and does not test explanation stability across empirical data perturbations.

3. **`twinRegression.ts` (`src/lib/twinRegression.ts`)**:
   - **Mechanism:** Implements a single-variable Ordinary Least Squares (OLS) closed-form calculation ($\text{Slope} = \frac{N \sum xy - \sum x \sum y}{N \sum x^2 - (\sum x)^2}$) predicting cumulative future carbon trends from daily log indices.
   - **Scientific Assessment:** Useful as a client-side linear extrapolation tool, but cannot capture multi-variable interactions, nonlinear effects, building/industrial dynamics, or complex environmental drivers.

---

## 3. Scientific Deficiencies and Opportunities

| Component | Pre-existing State | Research Requirement |
| :--- | :--- | :--- |
| **Dataset** | None (purely user-entered mock logs) | Legitimate, publicly accessible, verified empirical carbon emissions dataset with full provenance. |
| **Target Validity** | Fixed coefficients | Real-world measured/reported emissions with explicit accounting boundary check ($E = AD \times EF$ check). |
| **Model Architectures** | None (heuristic formulas) | Ridge, GAM, EBM, Random Forest, XGBoost, MLP, plus Conventional Accounting Baseline. |
| **Interpretability** | Hand-coded formula SHAP | Intrinsic EBM shapes & interaction detection; TreeSHAP for ensembles; Kernel/Exact SHAP for MLP; Ridge standardized weights. |
| **Explanation Stability** | Not evaluated | Kendall's $\tau$ and Spearman rank correlations across resamples; local input perturbation sensitivity. |
| **Computational Cost** | Unmeasured | Exact timing (`time.perf_counter`), memory footprint (`tracemalloc`), and measured/estimated energy consumption (`codecarbon`/power model). |
| **Statistical Rigor** | None | Paired bootstrap / Wilcoxon tests, confidence intervals, Pareto-frontier trade-offs. |

---

## 4. Architectural Implementation Plan

The root workspace (`c:\Users\adity\Downloads\CarbonPulse--main`) is structured into a modular Python research pipeline while keeping the existing web application completely preserved:

```
CarbonPulse/
├── configs/
│   └── experiment.yaml                 # Master configuration file (hyperparameters, paths, seeds)
├── data/
│   ├── raw/                            # Read-only pristine original data
│   ├── processed/                      # Preprocessed, validated modeling matrices
│   ├── dataset_manifest.json           # SHA-256 hashes, provenance, schema metadata
│   └── README.md                       # Data dictionary, licensing, source documentation
├── src/
│   ├── data/
│   │   ├── load_data.py                # Ingestion and raw schema verification
│   │   ├── validate_data.py            # Quality control, physical bounds, duplicate detection
│   │   ├── preprocess.py               # Leakage-free preprocessing pipelines
│   │   └── build_features.py           # Domain feature engineering
│   ├── models/
│   │   ├── baselines.py                # Activity × Emission Factor conventional baseline
│   │   ├── model_registry.py           # Model factory (Ridge, GAM, EBM, RF, XGB, MLP)
│   │   └── train_models.py             # Training harness with cross-validation
│   ├── experiments/
│   │   ├── create_splits.py            # GroupKFold / K-Fold reproducible split generator
│   │   ├── run_training.py             # Model fitting & hyperparameter tracking
│   │   ├── run_evaluation.py           # Predictive performance metrics (MAE, RMSE, R2, WAPE)
│   │   └── run_all.py                  # End-to-end master execution pipeline
│   ├── explainability/
│   │   ├── run_explainers.py           # EBM shapes, TreeSHAP, KernelSHAP, standardized weights
│   │   ├── stability_tests.py          # Kendall's tau rank stability & local perturbation tests
│   │   └── plot_explanations.py        # Explainability visualizer
│   ├── benchmarking/
│   │   ├── benchmark_latency.py        # Micro-benchmarking single and batch inference
│   │   ├── benchmark_memory.py         # Peak RAM tracking
│   │   └── benchmark_energy.py         # Energy and operational carbon footprint tracking
│   ├── statistics/
│   │   ├── paired_comparisons.py       # Paired statistical hypothesis tests & bootstrap CIs
│   │   └── pareto_analysis.py          # Multi-objective Pareto frontier (Error vs Latency vs Energy)
│   └── reporting/
│       ├── generate_tables.py          # LaTeX and Markdown table generator
│       ├── generate_figures.py         # 15 publication-grade figures (PNG + PDF)
│       └── generate_report.py          # Master experimental report generator
├── tests/
│   ├── test_data_pipeline.py           # Schema, leakage, and transform tests
│   ├── test_models.py                  # Model fit/predict contract tests
│   ├── test_explainability.py          # SHAP/EBM output shape and consistency tests
│   └── test_scientific_integrity.py    # Zero-placeholder, zero-synthetic contamination checks
├── results/                            # Machine-readable CSV/JSON outputs
├── figures/                            # Vector & raster publication figures
├── tables/                             # Formatted result tables
├── reports/                            # Detailed analytical and audit reports
├── manuscript/                         # Academic manuscript integration (methodology, results, discussion)
└── README.md                           # Master execution manual
```

---

## 5. Execution Protocol and Milestones

1. **Phase 1 (Complete):** Repository audit & plan established.
2. **Phase 2 & 3:** Dataset discovery, acquisition, provenance verification, and target-validity analysis.
3. **Phase 4:** Data engineering, physical range validation, missingness handling, and feature pipeline.
4. **Phase 5 & 6:** Baseline and model implementations, unit/integration testing, and scientific integrity tests.
5. **Phase 7:** Full predictive performance benchmarking across held-out test splits.
6. **Phase 8:** Explainability analysis, intrinsic feature curve extraction, and explanation stability (Kendall's $\tau$).
7. **Phase 9:** Computational efficiency, latency, peak memory, and energy profiling (`codecarbon`).
8. **Phase 10:** Statistical validation, paired tests, and Pareto efficiency frontiers.
9. **Phase 11:** 15 publication-grade figures, LaTeX/Markdown tables, and experimental reports.
10. **Phase 12 & 13:** Manuscript integration, reference audit, and final scientific-integrity validation.
