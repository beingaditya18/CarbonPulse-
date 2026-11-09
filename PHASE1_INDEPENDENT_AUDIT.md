# Phase 1 Independent Technical Audit & Verification Report

**Document Status:** Final Verified Audit  
**Date:** 2026-11-08  
**Auditor:** Senior ML Infrastructure & Reproducibility Specialist  
**Strict Boundary:** **SETUP AUDIT AND CORRECTIONS ONLY. ZERO SCIENTIFIC EXPERIMENTS EXECUTED. ZERO MANUSCRIPT MODIFICATIONS.**  

---

## 1. Executive Summary & Verification Classification

A second-pass, critical technical audit of the CarbonPulse AI+ experimental infrastructure setup was executed. Rather than accepting walkthrough claims at face value, every file, hash, code module, configuration parameter, and test suite was independently inspected directly on the filesystem and executed in the runtime environment.

### Verification Classification Taxonomy
* **VERIFIED FROM EXECUTION:** Independently executed in the runtime environment; actual outputs, exit codes, and timestamps captured.
* **VERIFIED FROM SOURCE CODE:** Confirmed by static inspection and line-by-line tracing of the Python, Parquet, or YAML code.
* **REPORTED BUT NOT INDEPENDENTLY VERIFIED:** Stated in preliminary documentation without standalone execution logs in Phase 1.
* **NOT VERIFIED:** Assertion lacks an empirical test fixture in the repository.
* **FAILED:** Assertion is mathematically or factually incorrect.

### Primary Verification Matrix

| Claim / Artifact Tested | Classification | Audit Evidence & Notes |
| :--- | :---: | :--- |
| **Raw Statutory Dataset (38,309 rows, 46 cols)** | **VERIFIED FROM EXECUTION** | `data/raw/seattle_building_energy_benchmarking_raw.csv` read with pandas; exact shape `(38309, 46)`, SHA-256: `D1A8227BF9C7C82AEA8279A67405ADD617271852A985D96BB6E4AC9070E8250F`. |
| **Cleaned Validated Records (36,730 total)** | **VERIFIED FROM EXECUTION** | Sum of `train_features.parquet` (29,364) and `test_features.parquet` (7,366) exactly equals 36,730. Matches cleaning decision log: 38,309 raw - 329 demolished - 1,236 non-positive target - 14 unit errors = 36,730. |
| **Total Validated Facilities (3,781 unique)** | **VERIFIED FROM EXECUTION** | `train_groups.parquet` has 3,024 unique `OSEBuildingID`; `test_groups.parquet` has 757 unique `OSEBuildingID`. Sum equals 3,781. |
| **Master Evaluation Split Isolation (0 Overlap)** | **VERIFIED FROM EXECUTION** | `set(train_groups).intersection(set(test_groups))` executed; returns `set()` (exactly zero building overlap across all 11 reporting years). |
| **Temporal Split Zero Building Overlap** | **FAILED (First-Pass Claim) -> CORRECTED** | First-pass claimed zero overlap based on year ordering ($\max(\text{Year}_{\text{train}}) < \min(\text{Year}_{\text{test}})$). Real facility audit revealed 3,538 overlapping buildings (95.26% of test set), as temporal evaluation is a *longitudinal forecasting test*, not an unseen-facility spatial test. Corrected and decomposed into observed vs unseen cohorts. |
| **Formula Leakage Prevention (10 meters withheld)** | **VERIFIED FROM EXECUTION** | Feature matrix columns inspected against list of 10 utility meters (`Electricity(kWh)`, `NaturalGas(therms)`, `SteamUse(kBtu)`, `SiteEUI`, etc.); 0 forbidden columns found. |
| **Baseline Models Stored & Predictable** | **VERIFIED FROM EXECUTION** | All 8 `.joblib` models loaded from `models/` and evaluated on test features; predictions match `results/test_predictions.csv` row-by-row. |
| **Baseline Hash Coverage (104 files)** | **REPORTED BUT NOT INDEPENDENTLY VERIFIED -> EXPANDED** | The initial `baseline_hashes.json` only tracked 104 data/model/report files, omitting `src/`, `scripts/`, `tests/`, and `figures/`. Corrected by expanding to 173 baseline files and verifying byte-level identity. |
| **Virtual Environment Isolation** | **VERIFIED FROM EXECUTION** | `experimental_workspace/.venv/` created and activated; `pytorch-tabnet==4.1.0` installed without modifying global site-packages. |
| **Infrastructure Setup Tests (18 tests)** | **VERIFIED FROM EXECUTION** | Executed via `pytest experimental_workspace/tests`; 18/18 passed in 11.48s. |
| **Baseline Test Suite (28 tests)** | **VERIFIED FROM EXECUTION** | Executed via `pytest tests`; 28/28 passed in 16.77s. |
| **Guaranteed Conditional Coverage (Exp 4)** | **FAILED (Theoretical Claim) -> CORRECTED** | First-pass claimed "guaranteed conditional coverage" for locally weighted conformal. Mathematically impossible in finite samples without distribution assumptions (Vovk 2012, Barber et al. 2019). Corrected to marginal coverage with empirical local adaptivity. |

---

## 2. Issue Register

The following register details every discrepancy, unphysical assumption, missing file, or technical contradiction detected during the second-pass audit, along with the concrete corrective actions implemented:

| Issue ID | Severity | Description & Evidence | Affected Files | Corrective Action Taken | Status |
| :---: | :---: | :--- | :--- | :--- | :---: |
| **ISS-01** | **HIGH** | **Temporal Split Overlap Conflation:** The preliminary walkthrough conflated temporal chronology preservation ($\text{Year} \le 2022 < 2023 \le \text{Year}$) with facility isolation, failing to document that 3,538 of 3,714 future buildings (95.26%) are repeat observations from the historical training cohort. | `experimental_workspace/src/splits/split_manager.py`, `SPLIT_INTEGRITY_REPORT.md` | Annotated temporal split with explicit cohort flags: `test_longitudinal_observed` (10,061 rows / 3,538 buildings) and `test_unseen_generalization` (359 rows / 176 buildings). Documented distinct experimental scopes in `SPLIT_DESIGN_REVIEW.md`. | **RESOLVED** |
| **ISS-02** | **HIGH** | **Incomplete Baseline Backup Coverage:** `baseline_backup/baseline_hashes.json` initially tracked only 104 data and result files, omitting 69 baseline files across `src/` (34 python modules), `scripts/` (1 script), `tests/` (4 test suites), and `figures/` (30 plots). | `baseline_backup/`, `baseline_hashes.json` | Scanned and copied all 69 omitted baseline files into `baseline_backup/`. Recalculated SHA-256 for all 173 files and verified zero mismatches. | **RESOLVED** |
| **ISS-03** | **MEDIUM** | **Unphysical Perturbation Feature Propagation:** Exp 3 runner initially documented only $+5\%$ scaling on `PropertyGFATotal`, which would create unphysical feature vectors if `LogGFATotal`, `LogGFABuildings`, `FloorAreaPerFloor`, and `ParkingRatio` were not simultaneously updated under simplex area conservation ($G_{\text{tot}} = G_{\text{bldg}} + G_{\text{parking}}$). | `experimental_workspace/src/experiments/perturbation/runner.py`, `configs/experiments.yaml` | Codified exact physical propagation equations in `runner.py`: proportional scaling of building and parking components, followed by synchronous updates of log transforms and floorplate ratios. | **RESOLVED** |
| **ISS-04** | **MEDIUM** | **Unsupported Conditional Conformal Claim:** Exp 4 runner claimed "guaranteed conditional coverage" for locally weighted conformal prediction. In finite samples with continuous features, exact conditional validity $\mathbb{P}(Y \in C(X) \mid X=x) \ge 1-\alpha$ is impossible (Barber et al., 2019). | `experimental_workspace/src/experiments/weighted_conformal/runner.py` | Removed all claims of guaranteed conditional coverage. Formulated the exact theoretical guarantee: valid marginal coverage ($\ge 1-\alpha$) under exchangeability, with empirical subgroup adaptivity via secondary residual variance regression. | **RESOLVED** |
| **ISS-05** | **MEDIUM** | **Repeated Measures Conflation in Paired Audit Test:** Exp 5 runner did not explicitly prohibit treating annual repeated filings as independent observations in the audit-budget evaluation, which would falsely inflate statistical degrees of freedom. | `experimental_workspace/src/experiments/paired_audit/runner.py` | Defined physical building (`OSEBuildingID`) as the primary independent statistical unit. Enforced facility-level emissions aggregation ($\bar{Y}_j, \hat{\bar{Y}}_j$) before ranking, pairing, and sign-flip permutation testing (2,000 resamples). | **RESOLVED** |
| **ISS-06** | **LOW** | **PowerShell CLI Invocation Failure:** Direct terminal invocation of `pytest` failed with `CommandNotFoundException` because `pytest.exe` was located in Python's user Scripts directory rather than in the Windows `$env:PATH`. | Terminal environment | Documented canonical invocation via Python module syntax: `python -m pytest <path>`, which reliably resolves via `sys.executable`. | **RESOLVED** |
| **ISS-07** | **LOW** | **Missing CPU PyTorch Wheel Specification:** `requirements-experiments.txt` listed `torch==2.6.0+cpu`, which fails on external machines without the PyTorch CPU extra-index URL. | `requirements-experiments.txt`, `ENVIRONMENT_REPORT.md` | Added `--extra-index-url https://download.pytorch.org/whl/cpu` and fallback instructions for standard PyPI `torch>=2.0.0` CPU installs. | **RESOLVED** |

---

## 3. Contradictions & Missing Evidence Analysis

1. **Spatial vs. Temporal Evaluation Design:**  
   The primary scientific claim of CarbonPulse rests on **unmetered spatial generalization to unseen buildings**. This is measured strictly by the Master 80/20 GroupShuffleSplit (3,024 train vs. 757 test buildings; 0 building overlap). In contrast, the temporal split (2015–2022 vs. 2023–2025) measures **longitudinal policy compliance forecasting**. Conflating these two led to confusion in the preliminary walkthrough; both splits have now been formally partitioned and explicitly distinguished.

2. **Test Suite Scope:**  
   The 18 setup tests in `experimental_workspace/tests/` were audited. They rigorously verify real dataset shapes, absence of forbidden meter features, zero facility overlap in splits, and mathematical error calculations on test vectors. However, they are **infrastructure and pipeline integrity tests**, not proofs of model predictive accuracy or scientific superiority. Scientific claims remain strictly deferred until the actual execution of Experiments 1–8.

