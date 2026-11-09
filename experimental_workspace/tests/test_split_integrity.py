"""
Test Suite: test_split_integrity.py
Description: Validates building-level split isolation across master, conformal, temporal, and k-fold splits.
"""

import os
import pandas as pd
import pytest
from experimental_workspace.src.splits.split_manager import SplitManager

@pytest.fixture(scope="module")
def split_registry():
    manager = SplitManager()
    return manager.generate_all_experimental_splits()

def test_master_evaluation_split_integrity(split_registry):
    """Confirms master evaluation split has zero facility overlap."""
    m = split_registry["master_evaluation"]
    assert m["zero_leakage"]
    assert m["overlap_count"] == 0
    assert m["train_buildings"] == 3024
    assert m["test_buildings"] == 757
    assert os.path.exists(m["split_path"])

def test_conformal_calibration_split_integrity(split_registry):
    """Confirms conformal calibration sub-partition has zero facility overlap with training-proper."""
    c = split_registry["conformal_calibration"]
    assert c["zero_leakage"]
    assert c["overlap_count"] == 0
    assert c["train_proper_buildings"] > 0
    assert c["calibration_buildings"] > 0
    assert os.path.exists(c["split_path"])

def test_temporal_split_chronology_preservation(split_registry):
    """Confirms historical training years (2015-2022) precede future test years (2023-2025)."""
    t = split_registry["temporal_validation"]
    assert t["temporal_chronology_preserved"]
    assert t["train_observations"] > 0
    assert t["test_observations"] > 0
    assert os.path.exists(t["split_path"])

def test_grouped_kfold_intra_fold_isolation(split_registry):
    """Confirms zero facility overlap across all 5 cross-validation folds."""
    k = split_registry["grouped_kfold"]
    assert k["all_folds_zero_overlap"]
    for fld in k["folds"]:
        assert fld["overlap"] == 0, f"Fold {fld['fold']} had overlapping buildings!"
    assert os.path.exists(k["split_path"])

