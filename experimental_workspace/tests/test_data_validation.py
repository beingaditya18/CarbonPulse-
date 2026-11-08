"""
Test Suite: test_data_validation.py
Description: Validates data loading, schema, physical bounds, and leakage prevention.
"""

import os
import pandas as pd
import pytest
from experimental_workspace.src.data.validator import DatasetValidator

@pytest.fixture(scope="module")
def validation_results():
    validator = DatasetValidator()
    return validator.run_full_validation()

def test_raw_dataset_shape(validation_results):
    """Confirms raw Seattle statutory benchmark shape is exactly (38,309, 46)."""
    raw = validation_results["raw_dataset"]
    assert raw["shape"] == (38309, 46), f"Unexpected raw data shape: {raw['shape']}"

def test_raw_zero_exact_duplicates(validation_results):
    """Confirms zero duplicate full rows in raw data."""
    raw = validation_results["raw_dataset"]
    assert raw["duplicate_full_rows"] == 0

def test_processed_partitions_shapes(validation_results):
    """Confirms exact observation counts for train (29,364) and test (7,366)."""
    proc = validation_results["processed_partitions"]
    assert proc["train_observations"] == 29364
    assert proc["test_observations"] == 7366
    assert proc["total_observations"] == 36730
    assert proc["feature_columns_count"] == 59

def test_leakage_safeguards_strict_exclusion(validation_results):
    """Confirms direct activity utility meters are strictly withheld from features."""
    leak = validation_results["leakage_safeguards"]
    assert leak["passed"], f"Leakage detected! Present forbidden: {leak['forbidden_meters_detected']}"
    assert len(leak["forbidden_meters_detected"]) == 0

def test_cohort_isolation_zero_facility_overlap(validation_results):
    """Confirms zero facility ID overlap between development and held-out test partitions."""
    cohort = validation_results["cohort_isolation"]
    assert cohort["passed"]
    assert cohort["overlap_count"] == 0
    assert cohort["train_unique_buildings"] == 3024
    assert cohort["test_unique_buildings"] == 757
    assert cohort["total_unique_buildings"] == 3781

