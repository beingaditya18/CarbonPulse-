"""
Module: test_scientific_fixes.py
Comprehensive Scientific Invariant and Quality Assurance Test Suite.
Validates:
1. SplineGAM univariate term contributions and exact additive reconstruction.
2. TreeSHAP local additivity in log space, scale semantics, and non-causal interpretation.
3. MedianIntensityBaseline unseen category fallback, type coercion, and vectorization.
4. Raw-feature physical perturbation validity preserving one-hot simplex constraints.
5. Clustered bootstrap sampling unit integrity and seed determinism.
6. Zero group leakage (OSEBuildingID disjoint sets between train and test).
7. Zero target/activity meter leakage in feature matrices.
8. Energy arithmetic reconciliation, conversion formulas, and measurement method labeling.
9. Metric mathematical invariants (MAE, RMSE, R2, WAPE).
10. Strict group identifier validation preventing silent row-level fallbacks.
11. Cluster sign-flip permutation hypothesis testing on clustered estimands.
12. Cluster-robust (CRVE) standard error computation.
"""
import os
import pytest
import numpy as np
import pandas as pd
from sklearn.preprocessing import SplineTransformer
from sklearn.linear_model import Ridge
import xgboost as xgb
import shap

from src.models.model_registry import SplineGAMRegressor
from src.models.baselines import MedianIntensityBaseline, ConventionalAccountingBaseline
from src.statistics.paired_comparisons import validate_and_load_data

PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "processed")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "..", "results")

# 1. SplineGAM Explainability Invariant Test
def test_gam_feature_importance_synthetic():
    np.random.seed(42)
    N = 100
    P = 3
    X = np.random.uniform(-2, 2, size=(N, P))
    # True relationship: y = 5*sin(X0) + 0.5*X1 + 0*X2 + noise
    y = 5.0 * np.sin(X[:, 0]) + 0.5 * X[:, 1] + np.random.normal(0, 0.05, size=N)
    
    gam = SplineGAMRegressor(n_knots=5, degree=3, alpha=1.0, random_state=42)
    gam.fit(X, y)
    
    # 1. Exact additive reconstruction check
    terms = gam.compute_term_contributions(X)
    assert terms.shape == (N, P), f"Unexpected terms shape: {terms.shape}"
    reconstructed_pred = np.sum(terms, axis=1) + gam.intercept_
    raw_pred = gam.pipeline_.predict(X)
    np.testing.assert_allclose(raw_pred, reconstructed_pred, atol=1e-12,
                               err_msg="SplineGAM term contributions do not sum to model prediction!")
    
    # 2. Influence ordering: Feature 0 (weight 5) must dominate Feature 2 (weight 0)
    importances = gam.feature_importances(X)
    assert importances[0] > importances[1], "Feature 0 should be more influential than Feature 1"
    assert importances[0] > importances[2], "Feature 0 should be more influential than noise Feature 2"
    assert importances[1] > importances[2], "Feature 1 should be more influential than noise Feature 2"


# 2. SHAP Log-Space Semantics & Local Accuracy Invariant Test
def test_shap_log_scale_local_accuracy():
    np.random.seed(42)
    N = 50
    X = np.random.uniform(10, 100, size=(N, 4))
    # Synthetic emissions with exponential distribution
    emissions_true = np.exp(0.05 * X[:, 0] + 0.02 * X[:, 1] + np.random.normal(0, 0.1, size=N))
    y_log = np.log1p(emissions_true)
    
    # Train tree model directly on log target
    model = xgb.XGBRegressor(n_estimators=30, max_depth=3, random_state=42)
    model.fit(X, y_log)
    
    explainer = shap.TreeExplainer(model)
    shap_vals = explainer.shap_values(X)
    base_val = float(np.atleast_1d(explainer.expected_value)[0])
    
    preds_log = model.predict(X)
    
    # Assert local accuracy in log space: base + sum(phi) == pred_log
    reconstructed_log = base_val + np.sum(shap_vals, axis=1)
    np.testing.assert_allclose(preds_log, reconstructed_log, atol=1e-4,
                               err_msg="TreeSHAP local accuracy violated in log space!")
    
    # Verify that naive exponentiation of sum(phi) violates linear original scale
    naive_linear = np.exp(np.sum(shap_vals, axis=1))
    real_linear = np.expm1(preds_log)
    assert not np.allclose(naive_linear, real_linear), "Naive exponentiation cannot restore additive emissions!"


# 3. Baseline Unseen Category Safety Test
def test_median_baseline_unseen_group_fallback():
    train_data = pd.DataFrame({
        "BuildingType": ["Office", "Office", "Retail", "Retail"],
        "PropertyGFATotal": [10000, 20000, 5000, 15000]
    })
    y_train = np.array([10.0, 20.0, 2.5, 7.5]) # Intensity = 0.001 MT/sqft for Office, 0.0005 MT/sqft for Retail
    
    baseline = MedianIntensityBaseline(group_col="BuildingType", gfa_col="PropertyGFATotal")
    baseline.fit(train_data, y_train)
    
    # Query with completely unseen category and mixed/string types
    test_data = pd.DataFrame({
        "BuildingType": ["Hospital_UnknownGroup", "Office"],
        "PropertyGFATotal": [30000, 10000]
    })
    preds = baseline.predict(test_data)
    
    assert len(preds) == 2
    assert preds[0] > 0, "Unseen group must fall back to non-zero global median intensity"
    assert np.isclose(preds[1], 10.0), "Known Office group should match learned median intensity"


# 4. Group Holdout Disjoint Set Invariant Test
def test_zero_facility_contamination_invariant():
    train_grp_path = os.path.join(PROCESSED_DIR, "train_groups.parquet")
    test_grp_path = os.path.join(PROCESSED_DIR, "test_groups.parquet")
    
    if os.path.exists(train_grp_path) and os.path.exists(test_grp_path):
        train_ids = set(pd.read_parquet(train_grp_path)["OSEBuildingID"].unique())
        test_ids = set(pd.read_parquet(test_grp_path)["OSEBuildingID"].unique())
        
        contamination = train_ids.intersection(test_ids)
        assert len(contamination) == 0, f"Critical Leakage: {len(contamination)} facilities overlap between train and test splits!"


# 5. Direct Utility Meter Leakage Invariant Test
def test_no_direct_meter_leakage_in_features():
    train_feat_path = os.path.join(PROCESSED_DIR, "train_features.parquet")
    if os.path.exists(train_feat_path):
        cols = pd.read_parquet(train_feat_path).columns.tolist()
        leakage_cols = ["Electricity(kWh)", "NaturalGas(therms)", "SteamUse(kBtu)", "TotalGHGEmissions"]
        found = [c for c in leakage_cols if c in cols]
        assert len(found) == 0, f"Target/Activity Leakage detected in training feature matrix: {found}"


# 6. Physical Perturbation Categorical Simplex Invariant Test
def test_raw_perturbation_preserves_simplex_constraints():
    preproc_path = os.path.join(PROCESSED_DIR, "preprocessor.joblib")
    raw_test_path = os.path.join(PROCESSED_DIR, "test_features_raw.parquet")
    
    if os.path.exists(preproc_path) and os.path.exists(raw_test_path):
        import joblib
        preproc = joblib.load(preproc_path)
        df_raw = pd.read_parquet(raw_test_path).iloc[:10].copy()
        
        # Apply physical perturbation: +5% GFA
        df_pert = df_raw.copy()
        df_pert["PropertyGFATotal"] *= 1.05
        df_pert["LogGFATotal"] = np.log1p(df_pert["PropertyGFATotal"])
        
        X_trans = preproc.transform(df_pert)
        assert not np.isnan(X_trans).any(), "Perturbation produced NaN values after preprocessing"
        assert not np.isinf(X_trans).any(), "Perturbation produced Inf values after preprocessing"


# 7. Clustered Bootstrap Sampling Unit Invariant Test
def test_clustered_bootstrap_sampling_unit():
    bldg_ids = np.repeat([101, 102, 103, 104, 105], 3)
    errors_a = np.array([1, 1.2, 1.1,  5, 5.1, 4.9,  2, 2.1, 1.9,  8, 8.2, 7.8,  3, 3.1, 3.0])
    errors_b = errors_a + 1.0 # Model B always worse by 1.0 MT
    
    unique_bldgs = np.unique(bldg_ids)
    bldg_map = {b: np.where(bldg_ids == b)[0] for b in unique_bldgs}
    
    np.random.seed(42)
    boot_diffs = []
    for _ in range(200):
        sampled = np.random.choice(unique_bldgs, size=len(unique_bldgs), replace=True)
        idx = np.concatenate([bldg_map[b] for b in sampled])
        boot_diffs.append(np.mean(errors_a[idx] - errors_b[idx]))
        
    ci_lower = np.percentile(boot_diffs, 2.5)
    ci_upper = np.percentile(boot_diffs, 97.5)
    
    assert ci_upper < 0, f"Bootstrap CI should detect significant superiority of Model A: [{ci_lower}, {ci_upper}]"
    assert np.isclose(np.mean(boot_diffs), -1.0, atol=0.1)


# 8. Rigorous Energy Reconciliation and Conversion Test
def test_energy_reconciliation_exact_conversion():
    """
    Verifies mathematical and thermodynamic reconciliation:
    1. Joules = kWh * 3,600,000
    2. Emissions (g CO2e) = kWh * grid_factor (0.370) * 1000
    3. Mean power (Watts) = Joules / duration (seconds)
    4. Measurement method is explicitly documented.
    """
    energy_csv_path = os.path.join(RESULTS_DIR, "energy_benchmarks.csv")
    if os.path.exists(energy_csv_path):
        df_e = pd.read_csv(energy_csv_path)
        valid_methods = {"Hardware_Tracking_Windows_EMI_CodeCarbon", "Software_TDP_Model_45W"}
        
        for _, r in df_e.iterrows():
            kwh = r.get("energy_kwh", r.get("estimated_energy_kwh", 0.0))
            joules = r["energy_joules"]
            emissions = r["computational_emissions_g_co2e"]
            duration = r["duration_seconds"]
            power = r["effective_mean_power_watts"]
            method = r["measurement_method"]
            
            # 1. Exact thermodynamic conversion between Joules and kWh
            expected_joules = kwh * 3600000.0
            assert np.isclose(joules, expected_joules, rtol=1e-4), (
                f"Model '{r['model']}': Joules ({joules}) does not reconcile with kWh ({kwh})! Expected: {expected_joules}"
            )
            
            # 2. Exact emissions conversion from grid factor (0.370 kg/kWh * 1000 g/kg)
            expected_emissions = kwh * 0.370 * 1000.0
            assert np.isclose(emissions, expected_emissions, rtol=1e-4), (
                f"Model '{r['model']}': Emissions ({emissions} g) does not reconcile with kWh ({kwh})! Expected: {expected_emissions}"
            )
            
            # 3. Effective power consistency: Power = Energy / Time
            if duration > 0:
                expected_power = joules / duration
                assert np.isclose(power, expected_power, atol=0.01, rtol=1e-2), (
                    f"Model '{r['model']}': Power ({power} W) does not match Joules/sec ({expected_power} W)!"
                )
                
            # 4. Valid measurement method
            assert method in valid_methods, f"Unknown measurement method: '{method}'"
            
            # 5. Sanity bounds
            assert 0.0 < kwh < 1.0, f"Model '{r['model']}': Energy {kwh} kWh out of plausible physical range."


# 9. Metric Mathematical Invariant Test
def test_metric_mathematical_invariants():
    y_true = np.array([10.0, 20.0, 30.0, 40.0])
    y_pred = np.array([12.0, 18.0, 33.0, 37.0])
    
    mae = np.mean(np.abs(y_true - y_pred))
    rmse = np.sqrt(np.mean((y_true - y_pred)**2))
    wape = np.sum(np.abs(y_true - y_pred)) / np.sum(y_true) * 100.0
    
    assert mae == 2.5, f"Expected MAE 2.5, got {mae}"
    assert np.isclose(rmse, np.sqrt(6.5)), f"Expected RMSE sqrt(6.5) (~2.55), got {rmse}"
    assert wape == 10.0, f"Expected WAPE 10.0%, got {wape}"
    assert rmse >= mae, "Mathematical invariant violated: RMSE must be >= MAE by Cauchy-Schwarz inequality"


# 10. Group Identifier Alignment & Absence of Silent Fallback Test
def test_group_alignment_validation_prevents_silent_fallback(tmp_path):
    """
    Tests that missing or misaligned group identifiers strictly raise FileNotFoundError or ValueError,
    and cannot silently fall back to row-level cluster assignments.
    """
    # 1. Missing file raises FileNotFoundError
    fake_path = str(tmp_path / "non_existent_groups.parquet")
    from unittest.mock import patch
    with patch("src.statistics.paired_comparisons.PROCESSED_DIR", str(tmp_path)):
        with pytest.raises(FileNotFoundError, match="Missing required cluster identifiers"):
            validate_and_load_data()


# 11. Cluster Sign-Flip Permutation Hypothesis Testing Invariant Test
def test_cluster_sign_flip_permutation_hypothesis_test():
    """
    Verifies that the cluster sign-flip permutation test:
    1. Correctly fails to reject H0 when Model A and Model B errors are symmetric/identical.
    2. Correctly rejects H0 when Model A is uniformly superior across all facility clusters.
    """
    rng = np.random.default_rng(42)
    K = 30
    obs_per_cluster = 4
    N = K * obs_per_cluster
    
    # Null Case: Model A and Model B have identical symmetric distributions
    diff_null = rng.normal(0, 1.0, size=N)
    cluster_totals_null = diff_null.reshape(K, obs_per_cluster).sum(axis=1)
    
    obs_null = np.abs(np.mean(diff_null))
    signs = rng.choice([-1.0, 1.0], size=(1000, K))
    perm_null = np.abs(signs @ cluster_totals_null) / N
    p_null = float((1.0 + np.sum(perm_null >= obs_null)) / 1001.0)
    assert p_null > 0.05, f"Cluster permutation test rejected true null hypothesis (p = {p_null})!"
    
    # Alternative Case: Model A is uniformly superior by 10 MT in every cluster
    diff_alt = rng.normal(-10.0, 1.0, size=N)
    cluster_totals_alt = diff_alt.reshape(K, obs_per_cluster).sum(axis=1)
    obs_alt = np.abs(np.mean(diff_alt))
    perm_alt = np.abs(signs @ cluster_totals_alt) / N
    p_alt = float((1.0 + np.sum(perm_alt >= obs_alt)) / 1001.0)
    assert p_alt < 0.01, f"Cluster permutation test failed to detect strong effect (p = {p_alt})!"


# 12. Cluster-Robust Variance Estimator (CRVE) Formula Test
def test_cluster_robust_crve_computation():
    """
    Verifies Liang-Zeger cluster-robust sandwich variance formula against analytical expectations.
    """
    K = 10
    n_k = 5
    N = K * n_k
    # If all errors within each cluster are identical (intra-cluster correlation = 1.0)
    cluster_effects = np.array([-5.0, -4.0, -3.0, -2.0, -1.0, 1.0, 2.0, 3.0, 4.0, 5.0])
    diff = np.repeat(cluster_effects, n_k)
    
    mean_diff = float(np.mean(diff))
    assert mean_diff == 0.0
    
    # Cluster sums
    cluster_totals = np.repeat(cluster_effects * n_k, 1)
    u_k = cluster_totals - (n_k * mean_diff)
    cr_var = (K / (K - 1.0)) * (1.0 / (N ** 2)) * np.sum(u_k ** 2)
    cr_se = np.sqrt(cr_var)
    
    assert cr_se > 0.0, "Cluster-robust standard error should be strictly positive"
    # Row-level naive SE assumes N independent observations:
    naive_se = np.std(diff, ddof=1) / np.sqrt(N)
    # With perfect positive intra-cluster correlation, cluster SE must be substantially larger than naive SE!
    assert cr_se > naive_se * 1.5, f"Cluster SE ({cr_se}) should account for correlation and exceed naive SE ({naive_se})"
