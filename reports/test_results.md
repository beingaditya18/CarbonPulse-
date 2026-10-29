# Automated Software Testing & Scientific Quality Assurance Report

**Project:** Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation  
**Date:** October 2026  
**Test Suite:** Pytest 7.4.3 / Python 3.12.6  
**Status:** **15 PASSED, 0 FAILED (100% Pass Rate)**  
**Execution Runtime:** 27.80 seconds  

---

## 1. Test Execution Summary

| Test Module | Test Name | Target / Contract | Status | Duration |
| :--- | :--- | :--- | :--- | :--- |
| `test_data_pipeline.py` | `test_load_raw_dataset_exists_and_valid` | Validates raw CSV presence, column names, >10k rows | **PASSED** | 0.82s |
| `test_data_pipeline.py` | `test_cleaning_removes_demolished_and_preserves_valid` | Enforces physical bounds, positive targets, removes demolished | **PASSED** | 1.15s |
| `test_data_pipeline.py` | `test_group_split_zero_facility_contamination` | Enforces zero facility overlap between Train & Test splits | **PASSED** | 0.94s |
| `test_data_pipeline.py` | `test_leakage_exclusion` | Verifies utility meter columns are strictly withheld from ML matrix | **PASSED** | 0.22s |
| `test_models.py` | `test_conventional_accounting_baseline` | Validates $E = \sum AD_i \times EF_i$ accounting equation | **PASSED** | 0.05s |
| `test_models.py` | `test_median_intensity_baseline` | Validates property-type median intensity heuristic | **PASSED** | 0.04s |
| `test_models.py` | `test_ml_models_fit_and_predict_smoke[ridge]` | Smoke-test fitting, non-negative finite predictions for Ridge | **PASSED** | 0.12s |
| `test_models.py` | `test_ml_models_fit_and_predict_smoke[gam]` | Smoke-test fitting, B-spline basis expansion for SplineGAM | **PASSED** | 0.25s |
| `test_models.py` | `test_ml_models_fit_and_predict_smoke[rf]` | Smoke-test fitting, tree ensemble contract for Random Forest | **PASSED** | 0.65s |
| `test_models.py` | `test_ml_models_fit_and_predict_smoke[xgboost]` | Smoke-test fitting, gradient boosted trees for XGBoost | **PASSED** | 0.58s |
| `test_models.py` | `test_ml_models_fit_and_predict_smoke[mlp]` | Smoke-test fitting, neural network backprop for MLPRegressor | **PASSED** | 0.72s |
| `test_models.py` | `test_ml_models_fit_and_predict_smoke[ebm]` | Smoke-test fitting, cyclic coordinate descent for EBM | **PASSED** | 2.85s |
| `test_scientific_integrity.py` | `test_raw_data_sha256_matches_manifest` | Cryptographic SHA-256 verification against official manifest | **PASSED** | 0.14s |
| `test_scientific_integrity.py` | `test_split_group_isolation_integrity` | Verifies facility counts (>3,000 train, >750 test buildings) | **PASSED** | 0.01s |
| `test_scientific_integrity.py` | `test_no_synthetic_data_contamination` | Validates genuine 38,309 statutory records from City of Seattle | **PASSED** | 0.81s |

---

## 2. Key Verifications Confirmed

1. **Zero Contamination:** Train (3,024 facilities) and Test (757 facilities) have disjoint sets of `OSEBuildingID` tracking keys.
2. **Zero Target Leakage:** Direct utility meters (`Electricity(kWh)`, `NaturalGas(therms)`, `SteamUse(kBtu)`) are absent from the ML feature matrix.
3. **Model Contract Compliance:** All 8 architectures satisfy the unified scikit-learn API (`fit`, `predict`, non-negative predictions, finite float outputs).
4. **Cryptographic Checksum:** Raw dataset matches SHA-256 `d1a8227bf9c7c82aea8279a67405add617271852a985d96bb6e4ac9070e8250f`.
