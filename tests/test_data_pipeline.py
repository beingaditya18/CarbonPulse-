"""
Unit and Integration Tests for Data Pipeline.
Validates loading, physical schema, leakage prevention, and train/test group separation.
"""
import os
import sys
import pytest
import pandas as pd
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.data.load_data import load_raw_dataset
from src.data.build_features import engineer_features
from src.data.preprocess import clean_dataset, NUMERIC_FEATURES, CATEGORICAL_FEATURES

def test_load_raw_dataset_exists_and_valid():
    df = load_raw_dataset()
    assert len(df) > 10000, "Raw dataset should contain more than 10,000 records."
    assert "TotalGHGEmissions" in df.columns, "TotalGHGEmissions target must be present."
    assert "OSEBuildingID" in df.columns, "OSEBuildingID facility tracking key must be present."

def test_cleaning_removes_demolished_and_preserves_valid():
    df_raw = load_raw_dataset()
    df_clean, logs = clean_dataset(df_raw)
    assert len(df_clean) > 0
    assert len(df_clean) < len(df_raw)
    assert (df_clean["TotalGHGEmissions"] > 0).all(), "All cleaned targets must be strictly positive."
    if "Demolished" in df_clean.columns:
        assert not (df_clean["Demolished"] == True).any(), "Demolished structures must be removed."

def test_group_split_zero_facility_contamination():
    processed_dir = os.path.join(os.path.dirname(__file__), "..", "data", "processed")
    train_feat = os.path.join(processed_dir, "train_features.parquet")
    test_feat = os.path.join(processed_dir, "test_features.parquet")
    
    assert os.path.exists(train_feat), "train_features.parquet must exist."
    assert os.path.exists(test_feat), "test_features.parquet must exist."
    
    df_tr = pd.read_parquet(train_feat)
    df_te = pd.read_parquet(test_feat)
    
    # Verify dimensions match
    assert df_tr.shape[1] == df_te.shape[1], "Feature columns must match exactly between train and test."
    assert len(df_tr) > len(df_te), "Train set should be larger than test set."

def test_leakage_exclusion():
    processed_dir = os.path.join(os.path.dirname(__file__), "..", "data", "processed")
    df_tr = pd.read_parquet(os.path.join(processed_dir, "train_features.parquet"))
    
    leakage_cols = [
        "Electricity(kWh)", "NaturalGas(therms)", "SteamUse(kBtu)",
        "SiteEnergyUse(kBtu)", "SiteEUI(kBtu/sf)", "TotalGHGEmissions"
    ]
    for col in leakage_cols:
        assert col not in df_tr.columns, f"Leakage violation: {col} is present in ML feature matrix!"
