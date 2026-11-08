# CarbonPulse AI+ — Test Suite Quality & Implementation Review

**Document Status:** Verified Technical Audit  
**Date:** 2026-11-08  
**Scope:** Test Architecture Audit, Assertion Integrity, Mocking Analysis, and Execution Discrepancy Resolution.  

---

## 1. Test Suite Quality & Behavior vs. Mocking Audit

A technical evaluation of the 18 infrastructure setup tests and 28 baseline tests was performed to determine whether they test actual code behavior or merely check file presence and mocked outputs.

### 1.1 Infrastructure Setup Tests (`experimental_workspace/tests/`, 18 Tests)
* **`test_env_and_configs.py` (5 Tests):**
  - `test_python_version`: Tests actual `sys.version_info` against `>= 3.10`.
  - `test_required_packages_importable`: Dynamically imports all 15 scientific libraries, verifying binary loading.
  - `test_config_files_exist` & `test_config_yaml_parsing`: Reads and parses YAML files through PyYAML.
  - `test_global_config_schema`: Asserts dictionary schema structure.
  - *Quality Rating:* High utility for environment verification; non-mocked.
* **`test_data_validation.py` (5 Tests):**
  - `test_raw_dataset_shape`: Loads the real 13.3 MB CSV and asserts shape `(38309, 46)`.
  - `test_raw_zero_exact_duplicates`: Executes pandas duplicate row checking on all 38,309 records.
  - `test_processed_partitions_shapes`: Reads real Parquet files and asserts shapes `(29364, 59)` and `(7366, 59)`.
  - `test_leakage_safeguards_strict_exclusion`: Performs real set membership check against 10 forbidden meter names.
  - `test_cohort_isolation_zero_facility_overlap`: Computes real set intersection of `train_groups` and `test_groups` building IDs.
  - *Quality Rating:* High rigor; operates on real statutory data; non-mocked.
* **`test_split_integrity.py` (4 Tests):**
  - `test_master_evaluation_split_integrity`: Asserts zero facility overlap in master 80/20 split.
  - `test_conformal_calibration_split_integrity`: Asserts zero facility overlap in 75/25 conformal calibration sub-split.
  - `test_temporal_split_chronology_preservation`: Asserts chronological ordering ($\max(\text{Year}_{\text{train}}) < \min(\text{Year}_{\text{test}})$).
  - `test_grouped_kfold_intra_fold_isolation`: Computes set intersections across all 5 cross-validation folds.
  - *Quality Rating:* High mathematical rigor; proves absence of data leakage.
* **`test_experiments_staging.py` (4 Tests):**
  - `test_experiment_registry_serialization`: Instantiates `ExperimentRun` and asserts real disk writing to JSON and CSV.
  - `test_all_eight_experiments_staged_and_ready`: Calls `check_prerequisites()` on all 8 experiment runners.
  - `test_baseline_predictions_shape`: Reads `test_predictions.csv` and checks shape and columns.
  - `test_statistical_metric_calculation_accuracy`: Calculates MAE, RMSE, and WAPE on known synthetic test vectors.
  - *Quality Rating:* Functional staging and mathematical invariant verification.

### 1.2 Baseline Tests (`tests/`, 28 Tests)
* **`test_data_pipeline.py` (4 Tests):** Verifies raw loading, demolished cleaning, facility group splitting, and leakage exclusion.
* **`test_models.py` (8 Tests):** Tests fitting and predicting for conventional accounting, property median, and machine learning models (Ridge, GAM, EBM, RF, XGBoost, MLP).
* **`test_scientific_fixes.py` (13 Tests):**
  - Tests actual cluster sign-flip permutation tests (2,000 resamples).
  - Tests cluster-robust variance estimation (CRVE).
  - Tests simplex constraint preservation under $+5\%$ GFA perturbation.
  - Tests TreeSHAP additivity ($\sum \phi_i = f(x) - \mathbb{E}[f(x)]$).
* **`test_scientific_integrity.py` (3 Tests):** Verifies raw SHA-256 hash against manifest, checks group isolation, and tests absence of synthetic data contamination.

---

## 2. Investigation of the Initial PyTest Invocation Failure

### 2.1 The Observed Failure
During the first-pass execution, running `pytest tests` in Windows PowerShell produced:
```
pytest : The term 'pytest' is not recognized as the name of a cmdlet, function, script file, or operable program.
```
However, running `python -m pytest tests` or invoking via the virtual environment succeeded immediately.

### 2.2 Root-Cause Analysis
1. **Windows `$env:PATH` Resolution:** In standard Windows installations, `pip install` places package entry-point scripts (`pytest.exe`, `pip.exe`) in either `C:\Python312\Scripts` or `C:\Users\<user>\AppData\Roaming\Python\Python312\Scripts`.
2. **Sandbox Environment Bounds:** The secure execution sandbox initializes PowerShell with standard system directories in `$env:PATH`, omitting user Python script directories.
3. **Module Resolution vs. Binary Resolution:** When invoking `python -m pytest`, the Python interpreter resolves `pytest` directly through `sys.path`, where `pytest` 7.4.3 is fully installed. Similarly, using the virtual environment executable `experimental_workspace\.venv\Scripts\python.exe -m pytest` resolves pytest deterministically.

### 2.3 Permanent Corrective Rule
Always invoke the test suite via the explicit Python module syntax:
```powershell
.\experimental_workspace\.venv\Scripts\python.exe -m pytest <test_path>
```

---

## 3. Fresh Test Execution Logs & Environment Evidence

### 3.1 Setup Test Suite Execution Log (Exit Code: 0)
```
[Timestamp: 2026-11-08T12:12:49]
Command: .\experimental_workspace\.venv\Scripts\python.exe -m pytest experimental_workspace/tests -v
Platform: Windows 11 (Python 3.12.6, pytest-7.4.3, pluggy-1.6.0)

collected 18 items
experimental_workspace/tests/test_data_validation.py::test_raw_dataset_shape PASSED [  5%]
experimental_workspace/tests/test_data_validation.py::test_raw_zero_exact_duplicates PASSED [ 11%]
experimental_workspace/tests/test_data_validation.py::test_processed_partitions_shapes PASSED [ 16%]
experimental_workspace/tests/test_data_validation.py::test_leakage_safeguards_strict_exclusion PASSED [ 22%]
experimental_workspace/tests/test_data_validation.py::test_cohort_isolation_zero_facility_overlap PASSED [ 27%]
experimental_workspace/tests/test_env_and_configs.py::test_python_version PASSED [ 33%]
experimental_workspace/tests/test_env_and_configs.py::test_required_packages_importable PASSED [ 38%]
experimental_workspace/tests/test_env_and_configs.py::test_config_files_exist PASSED [ 44%]
experimental_workspace/tests/test_env_and_configs.py::test_config_yaml_parsing PASSED [ 50%]
experimental_workspace/tests/test_env_and_configs.py::test_global_config_schema PASSED [ 55%]
experimental_workspace/tests/test_experiments_staging.py::test_experiment_registry_serialization PASSED [ 61%]
experimental_workspace/tests/test_experiments_staging.py::test_all_eight_experiments_staged_and_ready PASSED [ 66%]
experimental_workspace/tests/test_experiments_staging.py::test_baseline_predictions_shape PASSED [ 72%]
experimental_workspace/tests/test_experiments_staging.py::test_statistical_metric_calculation_accuracy PASSED [ 77%]
experimental_workspace/tests/test_split_integrity.py::test_master_evaluation_split_integrity PASSED [ 83%]
experimental_workspace/tests/test_split_integrity.py::test_conformal_calibration_split_integrity PASSED [ 88%]
experimental_workspace/tests/test_split_integrity.py::test_temporal_split_chronology_preservation PASSED [ 94%]
experimental_workspace/tests/test_split_integrity.py::test_grouped_kfold_intra_fold_isolation PASSED [100%]

============================= 18 passed in 11.48s =============================
```

### 3.2 Baseline Test Suite Execution Log (Exit Code: 0)
```
[Timestamp: 2026-11-08T12:13:16]
Command: .\experimental_workspace\.venv\Scripts\python.exe -m pytest tests
Platform: Windows 11 (Python 3.12.6, pytest-7.4.3, pluggy-1.6.0)

collected 28 items
tests/test_data_pipeline.py ....                                         [ 14%]
tests/test_models.py ........                                            [ 42%]
tests/test_scientific_fixes.py .............                             [ 89%]
tests/test_scientific_integrity.py ...                                   [100%]

====================== 28 passed, 40 warnings in 16.77s =======================
```

