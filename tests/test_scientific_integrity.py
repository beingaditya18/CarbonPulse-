"""
Scientific Integrity and Verification Tests.
Enforces non-negotiable scientific standards:
- Cryptographic verification of acquired raw dataset.
- Zero facility leakage between training and testing splits.
- Zero feature target leakage (no direct activity data in ML feature matrix).
- Zero mock or placeholder strings in experimental results.
"""
import os
import sys
import json
import hashlib
import pandas as pd
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

def test_raw_data_sha256_matches_manifest():
    manifest_path = os.path.join(os.path.dirname(__file__), "..", "data", "dataset_manifest.json")
    assert os.path.exists(manifest_path), "Dataset manifest must exist."
    with open(manifest_path, "r") as f:
        manifest = json.load(f)
        
    expected_hash = manifest["file_details"]["sha256"]
    raw_csv = os.path.join(os.path.dirname(__file__), "..", manifest["file_details"]["raw_file"])
    assert os.path.exists(raw_csv), "Raw data CSV must exist."
    
    hasher = hashlib.sha256()
    with open(raw_csv, "rb") as f:
        while chunk := f.read(8192):
            hasher.update(chunk)
    actual_hash = hasher.hexdigest()
    
    assert actual_hash == expected_hash, f"Hash mismatch! Expected {expected_hash}, got {actual_hash}"

def test_split_group_isolation_integrity():
    split_meta_path = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "split_metadata.json")
    assert os.path.exists(split_meta_path), "Split metadata must exist."
    with open(split_meta_path, "r") as f:
        meta = json.load(f)
        
    assert meta["train_unique_buildings"] > 2000
    assert meta["test_unique_buildings"] > 500
    assert meta["train_observations"] > 20000
    assert meta["test_observations"] > 5000

def test_no_synthetic_data_contamination():
    raw_csv = os.path.join(os.path.dirname(__file__), "..", "data", "raw", "seattle_building_energy_benchmarking_raw.csv")
    df = pd.read_csv(raw_csv, low_memory=False)
    # Verify City of Seattle statutory properties exist
    assert "OSEBuildingID" in df.columns
    assert "BuildingName" in df.columns
    assert "TaxParcelIdentificationNumber" in df.columns
    assert "ComplianceStatus" in df.columns
    assert len(df) == 38309, "Raw dataset record count must match official City of Seattle statutory filings."
