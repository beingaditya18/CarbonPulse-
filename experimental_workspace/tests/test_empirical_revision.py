"""
Module: test_empirical_revision.py
Path: experimental_workspace/tests/test_empirical_revision.py
Author: Aditya Mandloi, Dr. Ashok Kumar Gupta
Affiliation: School of Data Science and Forecasting, Devi Ahilya Vishwavidyalaya, Indore, India
Description:
    Integration and unit tests verifying the mathematical integrity of the 5 empirical revision tasks:
    1. Task 1: Probabilistic Deep Ensemble and Parsimonious Ablation outputs.
    2. Task 2: Prespecified Risk Control exchangeability and Empirical Bernstein bounds.
    3. Task 3: MNAR data-masking and fail-safe AUDIT_REQUIRED abstention logic.
    4. Task 4: Statsmodels Holm-Bonferroni multiplicity correction and bootstrap CIs.
    5. Task 5: Domain adaptation sample weights and large-stratum conformal coverage >= 90%.
"""

import os
import json
import pytest
import numpy as np
import pandas as pd
from statsmodels.stats.multitest import multipletests

RESULTS_DIR = "experimental_workspace/results/empirical_revision"

def test_task1_probabilistic_ensemble_artifacts():
    """Verifies that Deep Ensemble predictions, comparison metrics, and plots exist and are non-empty."""
    comp_csv = os.path.join(RESULTS_DIR, "probabilistic_ensemble_comparison.csv")
    preds_parquet = os.path.join(RESULTS_DIR, "deep_ensemble_predictions.parquet")
    fig_path = os.path.join(RESULTS_DIR, "figures", "probabilistic_ensemble_evaluation.png")

    assert os.path.exists(comp_csv), "probabilistic_ensemble_comparison.csv missing"
    assert os.path.exists(preds_parquet), "deep_ensemble_predictions.parquet missing"
    assert os.path.exists(fig_path), "Ensemble evaluation figure missing"

    df_comp = pd.read_csv(comp_csv)
    assert "Probabilistic Deep Ensemble (M=5)" in df_comp["model"].values
    ens_row = df_comp[df_comp["model"] == "Probabilistic Deep Ensemble (M=5)"].iloc[0]
    assert ens_row["mae"] > 0
    assert ens_row["log_r2"] > 0.50

    preds_df = pd.read_parquet(preds_parquet)
    assert len(preds_df) == 7366
    assert "Aleatoric_std" in preds_df.columns
    assert "Epistemic_std" in preds_df.columns
    assert (preds_df["Epistemic_std"] >= 0).all()

def test_task1_parsimonious_ablation():
    """Verifies feature ablation sweep, top feature identification, and statistical tests."""
    ablation_csv = os.path.join(RESULTS_DIR, "feature_ablation_results.csv")
    feat_rank_csv = os.path.join(RESULTS_DIR, "feature_importance_ranking.csv")
    tests_json = os.path.join(RESULTS_DIR, "ablation_statistical_tests.json")

    assert os.path.exists(ablation_csv), "feature_ablation_results.csv missing"
    assert os.path.exists(feat_rank_csv), "feature_importance_ranking.csv missing"
    assert os.path.exists(tests_json), "ablation_statistical_tests.json missing"

    df_ab = pd.read_csv(ablation_csv)
    assert len(df_ab) >= 8  # Median + K in [3, 5, 8, 12, 20, 35, 59]
    top5_row = df_ab[df_ab["k_features"] == 5].iloc[0]
    full_row = df_ab[df_ab["k_features"] == 59].iloc[0]
    med_row = df_ab[df_ab["k_features"] == 0].iloc[0]

    # Parsimonious model must vastly outperform median baseline
    assert top5_row["mae_physical"] < med_row["mae_physical"]
    assert top5_row["r2_physical"] > 0.35

    with open(tests_json, "r", encoding="utf-8") as f:
        tests = json.load(f)
    assert len(tests) == 3
    # Top 8 vs Median must be strongly statistically significant (p < 0.001)
    top8_vs_med = [t for t in tests if "Median Baseline" in t["comparison"]][0]
    assert top8_vs_med["wilcoxon_p_value"] < 1e-10

def test_task2_prespecified_risk_control():
    """Verifies that tau thresholds are prespecified and Empirical Bernstein bounds satisfy guarantees."""
    res_csv = os.path.join(RESULTS_DIR, "prespecified_risk_control_results.csv")
    curves_csv = os.path.join(RESULTS_DIR, "prespecified_risk_control_curves.csv")
    sum_json = os.path.join(RESULTS_DIR, "prespecified_risk_control_summary.json")

    assert os.path.exists(res_csv), "prespecified_risk_control_results.csv missing"
    assert os.path.exists(curves_csv), "prespecified_risk_control_curves.csv missing"
    assert os.path.exists(sum_json), "prespecified_risk_control_summary.json missing"

    df_res = pd.read_csv(res_csv)
    # Check that Statutory 50 MT, 100 MT, and Historical 2021-2022 P85 are evaluated
    assert "Statutory_50MT" in df_res["tau_name"].values
    assert "Statutory_100MT" in df_res["tau_name"].values
    assert "Historical_2021_2022_P85" in df_res["tau_name"].values

    # Check that for Historical P85 at alpha=0.10, guarantee is formally satisfied
    p85_a10 = df_res[(df_res["tau_name"] == "Historical_2021_2022_P85") & (df_res["target_alpha"] == 0.10)].iloc[0]
    assert p85_a10["guarantee_satisfied"] == True
    assert p85_a10["empirical_test_recall"] >= 90.0

def test_task3_mnar_abstention_policy():
    """Verifies that strict abstention prevents catastrophic undetected emissions under MNAR."""
    res_csv = os.path.join(RESULTS_DIR, "mnar_simulation_comparison.csv")
    assert os.path.exists(res_csv), "mnar_simulation_comparison.csv missing"

    df_mnar = pd.read_csv(res_csv)
    assert len(df_mnar) == 3

    naive_row = df_mnar[df_mnar["policy"] == "Blind_Median_Imputation"].iloc[0]
    abstain_row = df_mnar[df_mnar["policy"] == "Strict_Abstention_AUDIT_REQUIRED"].iloc[0]

    # Blind imputation must suffer severe large-stratum evasion compared to abstention
    assert naive_row["large_stratum_recall_pct"] < 60.0
    assert abstain_row["large_stratum_recall_pct"] == 100.0
    assert abstain_row["missed_emissions_mt"] < naive_row["missed_emissions_mt"]

def test_task4_multiplicity_corrections():
    """Verifies Holm-Bonferroni correction and bootstrap confidence intervals across budget tiers."""
    tests_csv = os.path.join(RESULTS_DIR, "multiplicity_corrected_audit_tests.csv")
    assert os.path.exists(tests_csv), "multiplicity_corrected_audit_tests.csv missing"

    df_tests = pd.read_csv(tests_csv)
    assert len(df_tests) == 16  # 4 budgets x 4 models
    assert "holm_adjusted_p_value" in df_tests.columns
    assert "ci_95_lower_mt" in df_tests.columns
    assert "ci_95_upper_mt" in df_tests.columns

    # Holm adjusted p-values must be greater than or equal to raw p-values
    assert (df_tests["holm_adjusted_p_value"] >= df_tests["raw_perm_p_value"] - 1e-9).all()
    # Upper CI must be greater than lower CI
    assert (df_tests["ci_95_upper_mt"] > df_tests["ci_95_lower_mt"]).all()

def test_task5_domain_adaptation_large_strata():
    """Verifies domain adaptation lifts large building coverage to >= 90%."""
    comp_csv = os.path.join(RESULTS_DIR, "domain_adaptation_strata_comparison.csv")
    assert os.path.exists(comp_csv), "domain_adaptation_strata_comparison.csv missing"

    df_strat = pd.read_csv(comp_csv)
    large_row = df_strat[df_strat["stratum"] == "Large (>200k sq ft)"].iloc[0]

    # Large stratum coverage must be lifted to >= 90%
    assert large_row["adapted_coverage_pct"] >= 90.0
    # Large stratum R2 must improve with domain adaptation
    assert large_row["adapted_r2"] > large_row["base_r2"]
    assert large_row["coverage_lift_pct"] > 35.0

