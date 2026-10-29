"""
Module: build_features.py
Constructs domain-specific physical and architectural features from raw building attributes.
Prevents lookahead leakage by using only contemporaneous and structural attributes.
"""
import os
import sys
import numpy as np
import pandas as pd

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes domain features for carbon emissions modeling:
    - BuildingAge: Age at reporting time (DataYear - YearBuilt)
    - FloorAreaPerFloor: Average conditioned floorplate area
    - ParkingRatio: Fraction of total area allocated to parking
    - HasParking: Binary indicator
    - IsMultifamily: Sector categorization indicator
    - Consolidated property use types
    
    Args:
        df: Input DataFrame with raw columns.
        
    Returns:
        DataFrame enriched with engineered features.
    """
    out = df.copy()
    
    # 1. Temporal & Vintage Features
    data_year = pd.to_numeric(out.get("DataYear", 2023), errors="coerce").fillna(2023)
    year_built = pd.to_numeric(out.get("YearBuilt", 1980), errors="coerce").fillna(1980)
    out["BuildingAge"] = np.maximum(0, data_year - year_built)
    
    # Vintage Eras based on energy code epochs
    # Pre-1950 (uninsulated masonry/timber), 1950-1979 (pre-ASHRAE 90.1), 1980-2000 (first energy codes), Post-2000 (modern codes)
    out["VintageEra"] = pd.cut(
        year_built,
        bins=[-np.inf, 1950, 1980, 2000, np.inf],
        labels=["Pre-1950", "1951-1980", "1981-2000", "Post-2000"]
    ).astype(str)
    
    # 2. Geometric & Architectural Ratios
    floors = pd.to_numeric(out.get("NumberofFloors", 1), errors="coerce").fillna(1)
    floors = np.maximum(1, floors)
    gfa_bldg = pd.to_numeric(out.get("PropertyGFABuildings", 0), errors="coerce").fillna(0)
    gfa_total = pd.to_numeric(out.get("PropertyGFATotal", 1), errors="coerce").fillna(1)
    gfa_total = np.maximum(1, gfa_total)
    gfa_parking = pd.to_numeric(out.get("PropertyGFAParking", 0), errors="coerce").fillna(0)
    
    out["FloorAreaPerFloor"] = gfa_bldg / floors
    out["ParkingRatio"] = np.clip(gfa_parking / gfa_total, 0.0, 1.0)
    out["HasParking"] = (gfa_parking > 0).astype(int)
    
    # 3. Scale Log-Transforms
    out["LogGFATotal"] = np.log1p(gfa_total)
    out["LogGFABuildings"] = np.log1p(np.maximum(0, gfa_bldg))
    
    # 4. Sector Indicators
    building_type_str = out.get("BuildingType", "").astype(str)
    out["IsMultifamily"] = building_type_str.str.contains("Multifamily", case=False, na=False).astype(int)
    out["IsCampus"] = building_type_str.str.contains("Campus|University|Hospital", case=False, na=False).astype(int)
    
    # 5. Categorical Property Type Normalization
    # PrimaryPropertyType or EPAPropertyType or LargestPropertyUseType
    prop_type = out.get("EPAPropertyType", out.get("LargestPropertyUseType", out.get("BuildingType", "Other"))).fillna("Other").astype(str)
    top_types = [
        "Multifamily Housing", "Office", "Non-Refrigerated Warehouse", "K-12 School",
        "Retail Store", "Hotel", "Medical Office", "Senior Living Community",
        "Hospital (General Medical & Surgical)", "College/University", "Distribution Center",
        "Supermarket/Grocery Store", "Worship Facility", "Mixed Use Property"
    ]
    out["PrimaryUseCategory"] = prop_type.apply(lambda x: x if x in top_types else "Other")
    
    # Standardize CouncilDistrictCode and ZipCode as categorical strings
    if "CouncilDistrictCode" in out.columns:
        out["CouncilDistrict"] = "District_" + out["CouncilDistrictCode"].astype(str)
    else:
        out["CouncilDistrict"] = "District_Unknown"
        
    return out

if __name__ == "__main__":
    import os
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
    from src.data.load_data import load_raw_dataset
    df = load_raw_dataset()
    df_feat = engineer_features(df)
    print(f"Engineered features successfully. New shape: {df_feat.shape}")
    print("New columns:", [c for c in df_feat.columns if c not in df.columns])
