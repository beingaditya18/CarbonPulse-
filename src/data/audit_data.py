"""
Module: audit_data.py
Executes the rigorous data audit reconciling:
    38,309 (raw) -> 37,069 (valid target) -> 36,730 (final records).
Generates:
    - results/exclusion_log.csv: one row per dropped record and exact reason
    - results/feature_dictionary.csv: feature, source, why included (and excluded columns)
    - data/processed/test_tracking.parquet & train_tracking.parquet: preserving row ID, facility ID, and DataYear
Verifies the facility-disjoint split:
    3,024 dev / 757 test facilities, 29,364 / 7,366 rows.
"""
import os
import sys
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import GroupShuffleSplit

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from src.data.load_data import load_raw_dataset

RAW_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw", "seattle_building_energy_benchmarking_raw.csv")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "results")
PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed")
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "reports")

def run_data_audit():
    os.makedirs(RESULTS_DIR, exist_ok=True)
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)

    print("=" * 80)
    print("TASK 1: RECONCILING DATA AUDIT & EXCLUSION LOG")
    print("=" * 80)

    # Load pristine raw dataset
    df_raw = load_raw_dataset(RAW_DATA_PATH)
    raw_count = len(df_raw)
    print(f"Step 0: Pristine raw records: {raw_count:,}")
    assert raw_count == 38309, f"Expected 38,309 raw records, found {raw_count}"

    # Track exclusions per record
    exclusion_records = []

    # Stage 1: Reconcile 38,309 -> 37,069 (valid target)
    target_col = "TotalGHGEmissions"
    target_series = pd.to_numeric(df_raw[target_col], errors="coerce")
    valid_target_mask = target_series.notna() & (target_series > 0)
    dropped_target_df = df_raw[~valid_target_mask].copy()

    for idx, row in dropped_target_df.iterrows():
        exclusion_records.append({
            "raw_row_id": int(idx),
            "OSEBuildingID": row.get("OSEBuildingID"),
            "DataYear": row.get("DataYear"),
            "BuildingName": row.get("BuildingName"),
            "TotalGHGEmissions": row.get("TotalGHGEmissions"),
            "PropertyGFATotal": row.get("PropertyGFATotal"),
            "CalculatedIntensity_kg_sqft": np.nan,
            "exclusion_stage": "Stage_1_Target_Validity",
            "exclusion_reason": "Missing or non-positive emissions target (TotalGHGEmissions is null or <= 0)"
        })

    df_valid_target = df_raw[valid_target_mask].copy()
    valid_target_count = len(df_valid_target)
    print(f"Step 1: Valid target records: {valid_target_count:,} (dropped {len(dropped_target_df):,})")
    assert valid_target_count == 37069, f"Expected 37,069 records with valid target, found {valid_target_count}"

    # Stage 2: Filter demolished buildings among valid target records
    demolished_mask = df_valid_target.get("Demolished", False) == True
    dropped_demolished_df = df_valid_target[demolished_mask].copy()

    for idx, row in dropped_demolished_df.iterrows():
        gfa = float(row.get("PropertyGFATotal", 0) or 0)
        ghg = float(row.get("TotalGHGEmissions", 0) or 0)
        intensity = (ghg * 1000.0 / gfa) if gfa > 0 else np.nan
        exclusion_records.append({
            "raw_row_id": int(idx),
            "OSEBuildingID": row.get("OSEBuildingID"),
            "DataYear": row.get("DataYear"),
            "BuildingName": row.get("BuildingName"),
            "TotalGHGEmissions": ghg,
            "PropertyGFATotal": gfa,
            "CalculatedIntensity_kg_sqft": round(intensity, 4) if pd.notna(intensity) else np.nan,
            "exclusion_stage": "Stage_2_Building_Lifecycle",
            "exclusion_reason": "Demolished building structure (Demolished == True; reporting lifecycle termination)"
        })

    df_non_demolished = df_valid_target[~demolished_mask].copy()
    print(f"Step 2a: Non-demolished valid records: {len(df_non_demolished):,} (dropped {len(dropped_demolished_df):,})")

    # Stage 3: Filter extreme data-entry unit errors (calculated intensity > 50 kg CO2e / sq ft)
    gfa_series = pd.to_numeric(df_non_demolished["PropertyGFATotal"], errors="coerce").fillna(0)
    ghg_series = pd.to_numeric(df_non_demolished["TotalGHGEmissions"], errors="coerce").fillna(0)
    calculated_intensity = (ghg_series * 1000.0) / np.maximum(1.0, gfa_series)

    unit_error_mask = calculated_intensity > 50.0
    dropped_unit_error_df = df_non_demolished[unit_error_mask].copy()

    for idx, row in dropped_unit_error_df.iterrows():
        gfa = float(row.get("PropertyGFATotal", 0) or 0)
        ghg = float(row.get("TotalGHGEmissions", 0) or 0)
        intensity = (ghg * 1000.0 / gfa) if gfa > 0 else np.nan
        exclusion_records.append({
            "raw_row_id": int(idx),
            "OSEBuildingID": row.get("OSEBuildingID"),
            "DataYear": row.get("DataYear"),
            "BuildingName": row.get("BuildingName"),
            "TotalGHGEmissions": ghg,
            "PropertyGFATotal": gfa,
            "CalculatedIntensity_kg_sqft": round(intensity, 4) if pd.notna(intensity) else np.nan,
            "exclusion_stage": "Stage_3_Thermodynamic_Physical_Validity",
            "exclusion_reason": f"Extreme data-entry unit error (Calculated intensity {intensity:.1f} kg CO2e/sq ft exceeds thermodynamic threshold of 50.0 kg/sq ft)"
        })

    df_final = df_non_demolished[~unit_error_mask].copy()
    final_count = len(df_final)
    print(f"Step 3: Final verified cohort: {final_count:,} (dropped {len(dropped_unit_error_df):,})")
    assert final_count == 36730, f"Expected 36,730 final records, found {final_count}"

    total_dropped = len(exclusion_records)
    print(f"Total dropped records: {total_dropped:,} (38,309 - {total_dropped:,} = {raw_count - total_dropped:,})")
    assert total_dropped == (raw_count - final_count) == 1579, f"Exclusion record count mismatch: {total_dropped}"

    # Export exclusion_log.csv
    exclusion_df = pd.DataFrame(exclusion_records)
    exclusion_log_path = os.path.join(RESULTS_DIR, "exclusion_log.csv")
    exclusion_df.to_csv(exclusion_log_path, index=False)
    print(f"Saved exclusion log to {exclusion_log_path} ({len(exclusion_df)} rows).")

    # Confirm the facility-disjoint split: 3,024 dev / 757 test facilities, 29,364 / 7,366 rows
    print("\n" + "=" * 80)
    print("CONFIRMING FACILITY-DISJOINT SPLIT (OSEBuildingID, Seed 42, test_size=0.2)")
    print("=" * 80)

    groups = df_final["OSEBuildingID"].values
    gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    train_idx, test_idx = next(gss.split(df_final, groups=groups))

    df_train = df_final.iloc[train_idx].copy().reset_index(drop=True)
    df_test = df_final.iloc[test_idx].copy().reset_index(drop=True)

    n_train_rows = len(df_train)
    n_test_rows = len(df_test)
    n_train_fac = df_train["OSEBuildingID"].nunique()
    n_test_fac = df_test["OSEBuildingID"].nunique()

    print(f"Dev partition:  {n_train_rows:,} rows across {n_train_fac:,} unique facilities")
    print(f"Test partition: {n_test_rows:,} rows across {n_test_fac:,} unique facilities")

    assert n_train_rows == 29364, f"Expected 29,364 dev rows, found {n_train_rows}"
    assert n_test_rows == 7366, f"Expected 7,366 test rows, found {n_test_rows}"
    assert n_train_fac == 3024, f"Expected 3,024 dev facilities, found {n_train_fac}"
    assert n_test_fac == 757, f"Expected 757 test facilities, found {n_test_fac}"

    # Ensure zero facility overlap
    overlap = set(df_train["OSEBuildingID"]).intersection(set(df_test["OSEBuildingID"]))
    assert len(overlap) == 0, f"Critical contamination: {len(overlap)} facilities overlap between dev and test!"
    print(f"Facility disjointness confirmed: 0 overlapping buildings across dev and test splits.")

    # Save tracking parquet files with original indices, facility ID, and DataYear
    df_train[["OSEBuildingID", "DataYear", "BuildingName"]].assign(
        row_id=df_train.index
    ).to_parquet(os.path.join(PROCESSED_DIR, "train_tracking.parquet"), index=False)

    df_test[["OSEBuildingID", "DataYear", "BuildingName"]].assign(
        row_id=df_test.index
    ).to_parquet(os.path.join(PROCESSED_DIR, "test_tracking.parquet"), index=False)
    print(f"Saved train and test tracking identifiers to data/processed/.")

    # Generate feature_dictionary.csv (feature, source, why included)
    print("\n" + "=" * 80)
    print("GENERATING FEATURE DICTIONARY (results/feature_dictionary.csv)")
    print("=" * 80)

    feature_dict_rows = [
        # Included Numeric Features
        {
            "feature": "BuildingAge",
            "source": "Engineered Architectural Feature (DataYear - YearBuilt)",
            "why included": "Architectural vintage dictates thermal insulation envelope and baseline HVAC energy efficiency standards."
        },
        {
            "feature": "NumberofFloors",
            "source": "Seattle Building Energy Benchmarking (Statutory Filing)",
            "why included": "Vertical geometry correlates with building surface-to-volume ratio and stack-effect heating/cooling losses."
        },
        {
            "feature": "NumberofBuildings",
            "source": "Seattle Building Energy Benchmarking (Statutory Filing)",
            "why included": "Differentiates single standalone structures from campus topologies with shared or decentralized utility plants."
        },
        {
            "feature": "PropertyGFATotal",
            "source": "Seattle Building Energy Benchmarking (Statutory Filing)",
            "why included": "Primary physical scale determinant of conditioned volume, space conditioning demand, and aggregate emissions."
        },
        {
            "feature": "PropertyGFABuildings",
            "source": "Seattle Building Energy Benchmarking (Statutory Filing)",
            "why included": "Isolates fully enclosed, occupied, and conditioned building space from unconditioned accessory structures."
        },
        {
            "feature": "PropertyGFAParking",
            "source": "Seattle Building Energy Benchmarking (Statutory Filing)",
            "why included": "Quantifies unconditioned or minimally ventilated vehicle storage area that exhibits near-zero thermal load."
        },
        {
            "feature": "FloorAreaPerFloor",
            "source": "Engineered Architectural Feature (PropertyGFABuildings / NumberofFloors)",
            "why included": "Proxies structural floorplate aspect ratio, core-to-perimeter depth, and natural daylight penetration potential."
        },
        {
            "feature": "ParkingRatio",
            "source": "Engineered Architectural Feature (PropertyGFAParking / PropertyGFATotal)",
            "why included": "Controls for the dilution of gross building square footage caused by unconditioned structured parking."
        },
        {
            "feature": "LogGFATotal",
            "source": "Engineered Architectural Feature (log1p(PropertyGFATotal))",
            "why included": "Compresses heavy-tailed building size distribution into linear/additive feature space."
        },
        {
            "feature": "LogGFABuildings",
            "source": "Engineered Architectural Feature (log1p(PropertyGFABuildings))",
            "why included": "Linearizes power-law relationship between conditioned square footage and annual greenhouse gas emissions."
        },
        {
            "feature": "Latitude",
            "source": "Seattle Building Energy Benchmarking / GIS Centroid",
            "why included": "Encodes spatial coordinates to capture microclimatic gradients, topography, and urban density variations."
        },
        {
            "feature": "Longitude",
            "source": "Seattle Building Energy Benchmarking / GIS Centroid",
            "why included": "Encodes spatial coordinates to capture geographic orientation relative to Puget Sound and Lake Washington."
        },
        # Included Categorical Features
        {
            "feature": "BuildingType",
            "source": "Seattle Building Energy Benchmarking (Statutory Filing)",
            "why included": "Categorizes building archetype (NonResidential, Multifamily LR/MR/HR, Campus) governing primary occupancy schedules."
        },
        {
            "feature": "PrimaryUseCategory",
            "source": "Engineered Categorical Feature (from EPAPropertyType / LargestPropertyUseType)",
            "why included": "Defines primary programmatic function (Office, School, Hospital, Warehouse, Retail) driving internal process loads."
        },
        {
            "feature": "Neighborhood",
            "source": "Seattle Municipal Neighborhood Districts",
            "why included": "Captures municipal sub-market zoning constraints, local grid topology, and urban fabric density."
        },
        {
            "feature": "VintageEra",
            "source": "Engineered Regulatory Feature (Pre-1950, 1951-1980, 1981-2000, Post-2000)",
            "why included": "Categorizes construction against major historical energy code milestones (pre-code, early ASHRAE 90.1, modern WSEC)."
        },
        {
            "feature": "CouncilDistrict",
            "source": "Seattle Municipal City Council Districts (District_1 to District_7)",
            "why included": "Captures municipal planning, political administrative boundaries, and local civil infrastructure investments."
        },
        # Excluded Features (Target Leakage or Meter Derived - Violating Rule 5)
        {
            "feature": "Electricity(kWh) [EXCLUDED]",
            "source": "Utility Meter Billing Record",
            "why included": "EXCLUDED: Direct utility meter reading; violates meter-free mandate and introduces circular target leakage."
        },
        {
            "feature": "NaturalGas(therms) [EXCLUDED]",
            "source": "Utility Meter Billing Record",
            "why included": "EXCLUDED: Direct on-site fuel combustion meter reading; violates meter-free mandate."
        },
        {
            "feature": "SteamUse(kBtu) [EXCLUDED]",
            "source": "District Energy Utility Meter",
            "why included": "EXCLUDED: Direct district thermal energy meter reading; violates meter-free mandate."
        },
        {
            "feature": "SiteEnergyUse(kBtu) [EXCLUDED]",
            "source": "Portfolio Manager Aggregate Consumption",
            "why included": "EXCLUDED: Aggregate annual site energy consumption directly derived from utility meters."
        },
        {
            "feature": "SiteEUI(kBtu/sf) [EXCLUDED]",
            "source": "Portfolio Manager Derived Intensity",
            "why included": "EXCLUDED: Normalized energy use intensity derived from utility meter consumption."
        },
        {
            "feature": "ENERGYSTARScore [EXCLUDED]",
            "source": "EPA Portfolio Manager Benchmark Rating (1-100)",
            "why included": "EXCLUDED: Rating algorithm embeds empirical weather-normalized utility meter consumption against CBECS."
        },
        {
            "feature": "GHGEmissionsIntensity [EXCLUDED]",
            "source": "Statutory Annual Benchmark Target",
            "why included": "EXCLUDED: Target-derived ratio (TotalGHGEmissions / PropertyGFATotal); constitutes fatal target leakage."
        },
        {
            "feature": "TotalGHGEmissions [TARGET]",
            "source": "Statutory Annual Benchmark Target",
            "why included": "TARGET VARIABLE: Ground truth annual emissions in Metric Tons CO2e; withheld from feature matrices."
        }
    ]

    feat_dict_df = pd.DataFrame(feature_dict_rows)
    feat_dict_path = os.path.join(RESULTS_DIR, "feature_dictionary.csv")
    feat_dict_df.to_csv(feat_dict_path, index=False)
    # Also save to reports for documentation parity
    feat_dict_df.to_csv(os.path.join(REPORTS_DIR, "feature_dictionary.csv"), index=False)
    print(f"Saved feature dictionary to {feat_dict_path} ({len(feat_dict_df)} documented features).")

    return {
        "raw_count": raw_count,
        "valid_target_count": valid_target_count,
        "final_count": final_count,
        "total_dropped": total_dropped,
        "train_rows": n_train_rows,
        "test_rows": n_test_rows,
        "train_facilities": n_train_fac,
        "test_facilities": n_test_fac
    }

if __name__ == "__main__":
    run_data_audit()

