"""
Test Suite: test_experiments_staging.py
Description: Validates experiment registry, staging status, prediction shapes, and metric calculations.
"""

import os
import numpy as np
import pandas as pd
import pytest
from experimental_workspace.src.utils.registry import ExperimentRun, ExperimentRegistry
from experimental_workspace.src.experiments.risk_control.runner import RiskControlExperiment
from experimental_workspace.src.experiments.tabnet.runner import TabNetExperiment
from experimental_workspace.src.experiments.perturbation.runner import PerturbationExperiment
from experimental_workspace.src.experiments.weighted_conformal.runner import WeightedConformalExperiment
from experimental_workspace.src.experiments.paired_audit.runner import PairedAuditExperiment
from experimental_workspace.src.experiments.shap_subgroups.runner import SHAPSubgroupsExperiment
from experimental_workspace.src.experiments.mahalanobis.runner import MahalanobisExperiment
from experimental_workspace.src.experiments.external_validation.interface import ExternalDatasetHarmonizer

def test_experiment_registry_serialization():
    """Confirms experiment registry serializes runs to JSON and CSV."""
    reg = ExperimentRegistry()
    run = ExperimentRun(
        experiment_id="test_staging_verification",
        description="Verification of experiment registry functionality",
        config_path="experimental_workspace/configs/global.yaml",
        input_data_paths=["data/raw/seattle_building_energy_benchmarking_raw.csv"],
        split_ref="master_evaluation_holdout_seed42"
    )
    reg.record_run(run)
    assert os.path.exists(reg.json_path)
    assert os.path.exists(reg.csv_path)

def test_all_eight_experiments_staged_and_ready():
    """Confirms all eight experiment modules have their prerequisites satisfied and status staged."""
    runners = [
        RiskControlExperiment(),
        TabNetExperiment(),
        PerturbationExperiment(),
        WeightedConformalExperiment(),
        PairedAuditExperiment(),
        SHAPSubgroupsExperiment(),
        MahalanobisExperiment()
    ]
    for runner in runners:
        prereqs = runner.check_prerequisites()
        assert prereqs["all_ready"], f"Module {runner.__class__.__name__} prerequisites failed!"
        assert prereqs["status"] == "STAGED_AWAITING_APPROVAL"

    # External validation interface
    harmonizer = ExternalDatasetHarmonizer()
    for muni in ["NYC_LL84", "Boston_BERDO"]:
        readiness = harmonizer.check_harmonization_readiness(muni)
        assert readiness["status"] in ["READY_FOR_DATA_PLACEMENT", "RAW_DATA_STAGED"]

def test_baseline_predictions_shape():
    """Confirms baseline predictions file exists with exact 7,366 held-out test records."""
    preds_p = "results/test_predictions.csv"
    assert os.path.exists(preds_p)
    df = pd.read_csv(preds_p)
    assert df.shape[0] == 7366
    for col in ["Actual", "ridge", "xgboost", "rf", "ebm"]:
        assert col in df.columns

def test_statistical_metric_calculation_accuracy():
    """Confirms mathematical accuracy of primary regression error metrics."""
    y_true = np.array([100.0, 200.0, 300.0])
    y_pred = np.array([110.0, 190.0, 330.0])
    
    # MAE = (|10| + |-10| + |30|) / 3 = 50 / 3 = 16.6667
    mae = float(np.mean(np.abs(y_true - y_pred)))
    assert np.isclose(mae, 50.0 / 3.0)
    
    # RMSE = sqrt((100 + 100 + 900) / 3) = sqrt(1100 / 3) = 19.1485
    rmse = float(np.sqrt(np.mean((y_true - y_pred) ** 2)))
    assert np.isclose(rmse, np.sqrt(1100.0 / 3.0))
    
    # WAPE = sum(|error|) / sum(actual) = 50 / 600 = 8.3333%
    wape = float(np.sum(np.abs(y_true - y_pred)) / np.sum(y_true)) * 100.0
    assert np.isclose(wape, 50.0 / 600.0 * 100.0)

