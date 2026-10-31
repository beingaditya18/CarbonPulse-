"""
Module: external_loader.py
Author: CarbonPulse Research Engineering Team
Description:
    Modular external validation infrastructure for evaluating CarbonPulse ML models
    on cross-municipal benchmarking registries (e.g., New York City Local Law 84 / LL84,
    Boston BERDO, Chicago Energy Benchmarking).
    
    Architecture:
    - BaseExternalBenchmarkingLoader: Abstract base interface defining ingestion, column mapping,
      imputation, schema harmonization, and pipeline execution.
    - NYCLL84DataLoader: Concrete implementation with canonical column schema mapping for NYC LL84.
    - Strict Schema Validation: Enforces physical plausibility and bounds checking on numeric/categorical features.
    - Robust Fallback: If external data cannot be harmonized, is absent, or fails domain integrity tests,
      automatically generates a peer-review-grade LIMITATIONS.md bounding the manuscript's claims strictly
      to the Seattle statutory benchmarking context.
"""
import os
import sys
import abc
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
import numpy as np
import pandas as pd

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from src.data.preprocess import NUMERIC_FEATURES, CATEGORICAL_FEATURES, ACTIVITY_METER_COLUMNS
from src.data.build_features import engineer_features

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("ExternalLoader")

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
LIMITATIONS_FILE = os.path.join(REPO_ROOT, "LIMITATIONS.md")

class BaseExternalBenchmarkingLoader(abc.ABC):
    """
    Abstract interface for external city building energy benchmarking data loaders.
    """
    def __init__(self, dataset_name: str, raw_data_path: Optional[str] = None):
        self.dataset_name = dataset_name
        self.raw_data_path = raw_data_path
        self.column_mapping: Dict[str, str] = {}
        self.validation_errors: List[str] = []

    @abc.abstractmethod
    def define_column_mapping(self) -> Dict[str, str]:
        """Maps source dataset column headers to CarbonPulse canonical schema."""
        pass

    @abc.abstractmethod
    def clean_and_normalize(self, df_raw: pd.DataFrame) -> pd.DataFrame:
        """Applies jurisdiction-specific cleaning and unit standardizations."""
        pass

    def validate_schema(self, df: pd.DataFrame) -> Tuple[bool, List[str]]:
        """
        Validates that transformed DataFrame conforms to CarbonPulse expected types and physical bounds.
        """
        errors = []
        
        # Check required canonical columns
        required_cols = ["OSEBuildingID", "PropertyGFATotal", "TotalGHGEmissions"]
        for col in required_cols:
            if col not in df.columns:
                errors.append(f"Missing mandatory canonical column: '{col}'")

        if errors:
            return False, errors

        # Physical bounds checks
        # 1. Gross Floor Area must be positive and realistic (> 500 sq ft, < 25,000,000 sq ft)
        gfa_invalid = df["PropertyGFATotal"].isna() | (df["PropertyGFATotal"] < 500) | (df["PropertyGFATotal"] > 25_000_000)
        if gfa_invalid.any():
            errors.append(f"PropertyGFATotal has {int(gfa_invalid.sum())} invalid records outside [500, 25M] sq ft.")

        # 2. Emissions must be strictly positive
        ghg_invalid = df["TotalGHGEmissions"].isna() | (df["TotalGHGEmissions"] <= 0)
        if ghg_invalid.any():
            errors.append(f"TotalGHGEmissions has {int(ghg_invalid.sum())} non-positive or null values.")

        # 3. Numeric feature presence
        missing_numeric = [col for col in NUMERIC_FEATURES if col not in df.columns]
        if missing_numeric:
            errors.append(f"Missing expected numeric features: {missing_numeric}")

        # 4. Categorical feature presence
        missing_cat = [col for col in CATEGORICAL_FEATURES if col not in df.columns]
        if missing_cat:
            errors.append(f"Missing expected categorical features: {missing_cat}")

        valid = len(errors) == 0
        return valid, errors

    def generate_limitations_document(self, reason: str, details: List[str] = None) -> str:
        """
        Generates peer-review-grade LIMITATIONS.md documenting explicit jurisdictional boundaries.
        """
        if details is None:
            details = []

        details_md = "\n".join([f"- {d}" for d in details]) if details else "- No detailed diagnostics available."

        content = f"""# Methodological Scope & Jurisdictional Generalization Boundaries

**Manuscript:** Explainable Machine Learning for Screening-Level Building Emissions Estimation Without Meter Data: Accuracy, Cluster-Aware Inference, and Explanation Stability  
**Accompanying Repository:** CarbonPulse AI Benchmark  
**Document Status:** Formal Academic Limitation Boundary (Generated via External Validation Safeguard)  

---

## 1. Jurisdictional Boundary Statement

The predictive models, feature attribution rankings, and empirical findings reported in this publication are **strictly bounded to the municipal jurisdiction of the City of Seattle, Washington (USA)**, governed by Seattle Municipal Code (SMC) Chapter 22.920 (Building Energy Benchmarking and Reporting).

External cross-jurisdictional validation against **{self.dataset_name}** was evaluated through the modular ingestion pipeline (`src/data/external_loader.py`) and reached the following determination:

> **Execution Boundary Notice:**  
> External cross-city inference cannot be asserted without domain-level recalibration.  
> **Primary Reason:** {reason}  
> 
> **Specific Diagnostic Details:**  
{details_md}

---

## 2. Scientific & Thermodynamic Generalization Barriers

Peer reviewers and practitioners must account for three fundamental scientific discrepancies between Seattle and other metropolitan benchmarking jurisdictions:

### A. Regional Grid Emission Factors (Scope 2 Asymmetry)
- **Seattle City Light (SCL):** Operates on an exceptionally clean, hydro-dominant generation mix ($>85\\%$ hydroelectricity), yielding an emission factor of approximately **$0.01972\\text{{ MT CO}}_2\\text{{e}} / \\text{{MWh}}$** ($0.0435\\text{{ lb CO}}_2\\text{{e}} / \\text{{kWh}}$).
- **External Grids (e.g., NYISO / PJM / MISO):** New York City and Midwestern jurisdictions rely heavily on natural gas and fossil peaking units, yielding emission factors between **$0.25$ and $0.45\\text{{ MT CO}}_2\\text{{e}} / \\text{{MWh}}$**—more than **one order of magnitude ($10\\times - 20\\times$) higher**.
- **Impact:** An identical office building with identical electricity consumption will produce vastly disparate emissions in Seattle versus New York or Chicago, rendering raw uncalibrated Seattle-trained models structurally biased elsewhere.

### B. Architectural Vintage, Climate Zones, and Building Typology
- **Climate Zone:** Seattle sits in **IECC Climate Zone 4C (Marine)**, characterized by mild winters and moderate summers, minimizing air conditioning cooling loads compared to **Zone 4A (Humid Subtropical / NYC)** or **Zone 5A (Cold / Chicago)**.
- **Structural Morphology:** Pacific Northwest construction features distinct timber-frame and low-rise campus morphologies, whereas Northeast registries are dominated by pre-war masonry high-rises and dense urban canyons with divergent thermal inertia.

### C. Statutory Reporting Discrepancies and Boundary Definitions
- **Exemptions & Gross Floor Area Thresholds:** Seattle mandates benchmarking for non-residential and multifamily buildings $\\ge 20,000\\text{{ sq ft}}$, whereas NYC LL84 historically mandated thresholds of $\\ge 50,000\\text{{ sq ft}}$ (expanded to $\\ge 25,000\\text{{ sq ft}}$ under LL133).
- **Emissions Boundary Incompatibilities:** Variations in district steam accounting, onsite fuel combustion allocation, and tenant vs. base-building submetering rules create systematic measurement divergence.

---

## 3. Prescribed Path for External Adoption

To adapt the CarbonPulse architecture to an external municipality, researchers must:
1. **Recalibrate Scope 2 Carbon Intensity:** Re-weight the electricity emission factors to match the regional eGRID subregion (e.g., NYCW for New York City).
2. **Re-fit Categorical Embeddings:** Map municipal property type classifications into the standardized 14-category primary use ontology.
3. **Re-train Local Regressors:** Re-estimate tree leaf partitions using localized historical training data under `GroupKFold` clustering by municipal parcel/tax identifiers.
"""
        with open(LIMITATIONS_FILE, "w", encoding="utf-8") as f:
            f.write(content)

        logger.info("Generated peer-review LIMITATIONS.md at %s", LIMITATIONS_FILE)
        return content


class NYCLL84DataLoader(BaseExternalBenchmarkingLoader):
    """
    Ingests and harmonizes New York City Local Law 84 (LL84) energy benchmarking records.
    Maps NYC Open Data attributes to canonical CarbonPulse feature definitions.
    """
    def __init__(self, raw_data_path: Optional[str] = None):
        super().__init__(dataset_name="NYC Local Law 84 (LL84)", raw_data_path=raw_data_path)
        self.column_mapping = self.define_column_mapping()

    def define_column_mapping(self) -> Dict[str, str]:
        """
        Defines translation dictionary from NYC LL84 column headers to CarbonPulse schema.
        """
        return {
            # Identifier
            "Property Id": "OSEBuildingID",
            "NYC Borough, Block and Lot (BBL)": "TaxParcelIdentificationNumber",
            
            # Physical Dimensions & Age
            "Year Built": "YearBuilt",
            "Property GFA - Self-Reported (ft²)": "PropertyGFATotal",
            "Largest Property Use Type - Gross Floor Area (ft²)": "PropertyGFABuildings",
            "Number of Buildings": "NumberofBuildings",
            
            # Property Categorization
            "Primary Property Type - Self-Selected": "BuildingType",
            "Largest Property Use Type": "PrimaryPropertyType",
            "Borough": "Neighborhood",
            
            # Geographic Coordinates
            "Latitude": "Latitude",
            "Longitude": "Longitude",
            
            # Targets & Activity Energy
            "Total GHG Emissions (Metric Tons CO2e)": "TotalGHGEmissions",
            "Electricity Use - Grid Purchase (kWh)": "Electricity(kWh)",
            "Natural Gas Use (therms)": "NaturalGas(therms)",
            "District Steam Use (kBtu)": "SteamUse(kBtu)"
        }

    def clean_and_normalize(self, df_raw: pd.DataFrame) -> pd.DataFrame:
        """
        Cleans NYC LL84 records and standardizes columns to CarbonPulse schema.
        """
        df = df_raw.copy()

        # Rename columns according to mapping
        rename_dict = {k: v for k, v in self.column_mapping.items() if k in df.columns}
        df = df.rename(columns=rename_dict)

        # Standardize numerics
        numeric_targets = ["PropertyGFATotal", "TotalGHGEmissions", "YearBuilt", "Latitude", "Longitude"]
        for col in numeric_targets:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")

        # Fill default / secondary features if absent
        if "PropertyGFABuildings" not in df.columns and "PropertyGFATotal" in df.columns:
            df["PropertyGFABuildings"] = df["PropertyGFATotal"]
        if "PropertyGFAParking" not in df.columns:
            df["PropertyGFAParking"] = 0.0
        if "NumberofFloors" not in df.columns:
            df["NumberofFloors"] = 1.0
        if "NumberofBuildings" not in df.columns:
            df["NumberofBuildings"] = 1.0

        # Filter invalid GFA and GHG
        valid_mask = (
            df.get("PropertyGFATotal", pd.Series([np.nan])).notna() &
            (df.get("PropertyGFATotal", 0) > 0) &
            df.get("TotalGHGEmissions", pd.Series([np.nan])).notna() &
            (df.get("TotalGHGEmissions", 0) > 0)
        )
        df = df[valid_mask].copy().reset_index(drop=True)

        # Apply CarbonPulse feature engineering
        df_engineered = engineer_features(df)
        return df_engineered

    def run_ingestion_pipeline(self) -> Tuple[bool, Optional[pd.DataFrame], List[str]]:
        """
        Executes full external validation ingestion.
        If file is missing or harmonization fails, triggers graceful fallback to LIMITATIONS.md.
        """
        if self.raw_data_path is None or not os.path.exists(self.raw_data_path):
            reason = f"External validation file for {self.dataset_name} was not found at configured path."
            details = [
                f"Configured raw data path: '{self.raw_data_path}'",
                "NYC Open Data LL84 repository was not staged in data/external/ prior to execution.",
                "Automatic fallback activated to preserve scientific reproducibility without ungrounded extrapolations."
            ]
            self.generate_limitations_document(reason, details)
            return False, None, [reason]

        try:
            logger.info("Reading external benchmarking dataset: %s", self.raw_data_path)
            # Support CSV or Parquet
            if self.raw_data_path.endswith(".parquet"):
                df_raw = pd.read_parquet(self.raw_data_path)
            else:
                df_raw = pd.read_csv(self.raw_data_path, low_memory=False)

            df_clean = self.clean_and_normalize(df_raw)
            is_valid, errors = self.validate_schema(df_clean)

            if not is_valid:
                reason = f"Schema validation failed for external dataset {self.dataset_name}."
                self.generate_limitations_document(reason, errors)
                return False, None, errors

            logger.info("Successfully ingested and harmonized %d external filings from %s.",
                        len(df_clean), self.dataset_name)
            return True, df_clean, []

        except Exception as exc:
            reason = f"Ingestion runtime exception while parsing {self.dataset_name}: {exc}"
            self.generate_limitations_document(reason, [str(exc)])
            return False, None, [reason]

if __name__ == "__main__":
    # Test fallback routine with non-existent path to verify automatic LIMITATIONS.md generation
    loader = NYCLL84DataLoader(raw_data_path="data/external/nyc_ll84_benchmarking_sample.csv")
    success, data, errors = loader.run_ingestion_pipeline()
    print(f"External Ingestion Status: Success={success}")
    print(f"Errors Logged: {errors}")
    print(f"LIMITATIONS.md verified at: {LIMITATIONS_FILE}")

