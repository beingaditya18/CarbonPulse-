"""
Module: preprocess.py
Cleans the Seattle Building Energy Benchmarking dataset, enforces strict physical validity,
partitions facilities using GroupKFold / Group holdout to prevent longitudinal data leakage,
and fits preprocessing transformers strictly on development data.
"""
import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import GroupShuffleSplit
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from src.data.load_data import load_raw_dataset
from src.data.build_features import engineer_features

PROCESSED_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed")
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "reports")

NUMERIC_FEATURES = [
    "BuildingAge",
    "NumberofFloors",
    "NumberofBuildings",
    "PropertyGFATotal",
    "PropertyGFABuildings",
    "PropertyGFAParking",
    "FloorAreaPerFloor",
    "ParkingRatio",
    "LogGFATotal",
    "LogGFABuildings",
    "Latitude",
    "Longitude"
]

CATEGORICAL_FEATURES = [
    "BuildingType",
    "PrimaryUseCategory",
    "Neighborhood",
    "VintageEra",
    "CouncilDistrict"
]

ACTIVITY_METER_COLUMNS = [
    "Electricity(kWh)",
    "NaturalGas(therms)",
    "SteamUse(kBtu)"
]

def clean_dataset(df_raw: pd.DataFrame) -> tuple[pd.DataFrame, list[dict]]:
    """
    Cleans raw statutory records and enforces physical bounds without dropping legitimate extremes.
    
    Returns:
        Cleaned DataFrame and audit log of filtering decisions.
    """
    decisions_log = []
    initial_count = len(df_raw)
    
    # 1. Filter out demolished buildings
    df = df_raw.copy()
    if "Demolished" in df.columns:
        demolished_mask = df["Demolished"] == True
        drop_count = int(demolished_mask.sum())
        dem_bldgs = set(df.loc[demolished_mask, "OSEBuildingID"].dropna())
        df = df[~demolished_mask]
        rem_bldgs = set(df["OSEBuildingID"].dropna())
        bldgs_lost = len(dem_bldgs - rem_bldgs)
        decisions_log.append({
            "step": "filter_demolished",
            "condition": "Demolished == True",
            "records_removed": drop_count,
            "unique_buildings_lost": bldgs_lost,
            "reason": "Building structure no longer exists; reporting lifecycle termination"
        })
        
    # 2. Filter non-positive or missing target
    target_col = "TotalGHGEmissions"
    target_valid_mask = df[target_col].notna() & (df[target_col] > 0)
    drop_count = int((~target_valid_mask).sum())
    inv_bldgs = set(df.loc[~target_valid_mask, "OSEBuildingID"].dropna())
    df = df[target_valid_mask]
    rem_bldgs = set(df["OSEBuildingID"].dropna())
    bldgs_lost = len(inv_bldgs - rem_bldgs)
    decisions_log.append({
        "step": "filter_invalid_target",
        "condition": "TotalGHGEmissions is null or <= 0",
        "records_removed": drop_count,
        "unique_buildings_lost": bldgs_lost,
        "reason": "Missing or non-positive emissions target cannot support supervised regression"
    })
    
    # 3. Filter impossible gross floor area
    gfa_valid_mask = df["PropertyGFATotal"] > 0
    drop_count = int((~gfa_valid_mask).sum())
    gfa_bldgs = set(df.loc[~gfa_valid_mask, "OSEBuildingID"].dropna())
    df = df[gfa_valid_mask]
    rem_bldgs = set(df["OSEBuildingID"].dropna())
    bldgs_lost = len(gfa_bldgs - rem_bldgs)
    decisions_log.append({
        "step": "filter_invalid_gfa",
        "condition": "PropertyGFATotal <= 0",
        "records_removed": drop_count,
        "unique_buildings_lost": bldgs_lost,
        "reason": "Physically impossible zero or negative building gross floor area"
    })
    
    # 4. Filter obvious reporting unit errors in intensity
    # Standard building intensity is between 0.05 and 20 kg CO2e / sq ft.
    # Exactly 16 anomalous records in raw data report intensities > 50 kg/sqft (up to 49,800 kg/sqft) due to gram/kg unit entry bugs.
    calc_intensity = (df["TotalGHGEmissions"] * 1000.0) / df["PropertyGFATotal"]
    unit_error_mask = calc_intensity > 50.0
    drop_count = int(unit_error_mask.sum())
    unit_bldgs = set(df.loc[unit_error_mask, "OSEBuildingID"].dropna())
    df = df[~unit_error_mask]
    rem_bldgs = set(df["OSEBuildingID"].dropna())
    bldgs_lost = len(unit_bldgs - rem_bldgs)
    decisions_log.append({
        "step": "filter_unit_errors",
        "condition": "Calculated Intensity > 50.0 kg CO2e / sq ft",
        "records_removed": drop_count,
        "unique_buildings_lost": bldgs_lost,
        "reason": "Extreme data-entry unit errors (3-4 orders of magnitude beyond thermodynamic limits for buildings)"
    })
    
    print(f"Data cleaning complete: {initial_count:,} raw records -> {len(df):,} validated records ({len(df)/initial_count*100:.1f}% retained).")
    return df, decisions_log

def partition_and_preprocess(
    test_size: float = 0.2,
    random_seed: int = 42
) -> dict:
    """
    Executes end-to-end data preparation:
    1. Loads raw dataset.
    2. Cleans and enforces physical constraints.
    3. Engineers domain features.
    4. Splits into Train and Test partitions by unique OSEBuildingID (Group holdout).
    5. Fits ColumnTransformer strictly on Train.
    6. Transforms both Train and Test.
    7. Saves all matrices and pipeline artifacts.
    """
    os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)
    
    # Load and clean
    df_raw = load_raw_dataset()
    df_clean, decisions_log = clean_dataset(df_raw)
    
    # Engineer features
    df_feat = engineer_features(df_clean)
    
    # Group holdout split by OSEBuildingID
    groups = df_feat["OSEBuildingID"].values
    gss = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=random_seed)
    train_idx, test_idx = next(gss.split(df_feat, groups=groups))
    
    train_df = df_feat.iloc[train_idx].copy().reset_index(drop=True)
    test_df = df_feat.iloc[test_idx].copy().reset_index(drop=True)
    
    # Verify group isolation
    train_buildings = set(train_df["OSEBuildingID"].unique())
    test_buildings = set(test_df["OSEBuildingID"].unique())
    overlap = train_buildings.intersection(test_buildings)
    assert len(overlap) == 0, f"Critical contamination: {len(overlap)} buildings overlap between train and test!"
    
    print(f"Partitioned dataset by OSEBuildingID (Seed={random_seed}):")
    print(f"  Training: {len(train_df):,} filings across {len(train_buildings):,} facilities")
    print(f"  Testing:  {len(test_df):,} filings across {len(test_buildings):,} facilities")
    
    # Feature matrices and targets
    X_train_raw = train_df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    X_test_raw = test_df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    
    y_train = train_df["TotalGHGEmissions"].values
    y_test = test_df["TotalGHGEmissions"].values
    
    # Activity meter data for conventional accounting baseline
    act_test = test_df[ACTIVITY_METER_COLUMNS].copy()
    act_train = train_df[ACTIVITY_METER_COLUMNS].copy()
    
    # Build Preprocessing Pipeline
    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])
    
    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, NUMERIC_FEATURES),
            ("cat", cat_pipeline, CATEGORICAL_FEATURES)
        ],
        remainder="drop"
    )
    
    # Fit strictly on development data
    preprocessor.fit(X_train_raw)
    
    # Get feature names after one-hot encoding
    encoded_cat_names = preprocessor.named_transformers_["cat"].named_steps["encoder"].get_feature_names_out(CATEGORICAL_FEATURES)
    all_feature_names = list(NUMERIC_FEATURES) + list(encoded_cat_names)
    
    # Transform matrices
    X_train_trans = preprocessor.transform(X_train_raw)
    X_test_trans = preprocessor.transform(X_test_raw)
    
    X_train_df = pd.DataFrame(X_train_trans, columns=all_feature_names)
    X_test_df = pd.DataFrame(X_test_trans, columns=all_feature_names)
    
    # Save processed parquets
    X_train_df.to_parquet(os.path.join(PROCESSED_DATA_DIR, "train_features.parquet"), index=False)
    X_test_df.to_parquet(os.path.join(PROCESSED_DATA_DIR, "test_features.parquet"), index=False)
    
    pd.DataFrame({"TotalGHGEmissions": y_train}).to_parquet(os.path.join(PROCESSED_DATA_DIR, "train_target.parquet"), index=False)
    pd.DataFrame({"TotalGHGEmissions": y_test}).to_parquet(os.path.join(PROCESSED_DATA_DIR, "test_target.parquet"), index=False)
    
    act_train.to_parquet(os.path.join(PROCESSED_DATA_DIR, "train_activity.parquet"), index=False)
    act_test.to_parquet(os.path.join(PROCESSED_DATA_DIR, "test_activity.parquet"), index=False)
    
    # Also save un-scaled raw features (needed for tree models, EBM, and interpretability where raw scale is preferred)
    X_train_raw.to_parquet(os.path.join(PROCESSED_DATA_DIR, "train_features_raw.parquet"), index=False)
    X_test_raw.to_parquet(os.path.join(PROCESSED_DATA_DIR, "test_features_raw.parquet"), index=False)
    
    # Save facility cluster identifiers for clustered bootstrap and cross-validation
    pd.DataFrame({"OSEBuildingID": train_df["OSEBuildingID"].values}).to_parquet(
        os.path.join(PROCESSED_DATA_DIR, "train_groups.parquet"), index=False
    )
    pd.DataFrame({"OSEBuildingID": test_df["OSEBuildingID"].values}).to_parquet(
        os.path.join(PROCESSED_DATA_DIR, "test_groups.parquet"), index=False
    )
    
    # Save metadata and pipeline
    joblib.dump(preprocessor, os.path.join(PROCESSED_DATA_DIR, "preprocessor.joblib"))
    
    split_meta = {
        "random_seed": random_seed,
        "test_size_fraction": test_size,
        "train_observations": int(len(train_df)),
        "test_observations": int(len(test_df)),
        "train_unique_buildings": int(len(train_buildings)),
        "test_unique_buildings": int(len(test_buildings)),
        "total_transformed_features": int(len(all_feature_names)),
        "numeric_features": NUMERIC_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "transformed_feature_names": all_feature_names,
        "cleaning_decisions": decisions_log
    }
    
    with open(os.path.join(PROCESSED_DATA_DIR, "split_metadata.json"), "w") as f:
        json.dump(split_meta, f, indent=2)
        
    print(f"Preprocessing completed successfully. Artifacts saved to {PROCESSED_DATA_DIR}.")
    return split_meta

if __name__ == "__main__":
    partition_and_preprocess()
