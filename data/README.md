# Carbon Emissions Benchmarking Data Directory

This directory contains the observational datasets used in the research manuscript:  
*“Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation of Predictive Accuracy, Interpretability, and Computational Efficiency.”*

---

## 1. Directory Structure

```
data/
├── dataset_manifest.json                       # Formal metadata, cryptographic hashes, and provenance
├── README.md                                   # This documentation and data dictionary
├── raw/
│   └── seattle_building_energy_benchmarking_raw.csv  # Pristine unmodified statutory dataset (38,309 rows, 46 cols)
└── processed/
    ├── seattle_benchmarking_cleaned.parquet    # Fully cleaned multi-year dataset
    ├── seattle_benchmarking_train.parquet      # Development / training split
    ├── seattle_benchmarking_test.parquet       # Held-out evaluation test split
    └── feature_metadata.json                   # Encoders, scalers, and column classifications
```

---

## 2. Dataset Overview: City of Seattle Building Energy Benchmarking

* **Source Authority:** City of Seattle Office of Sustainability & Environment.
* **Statutory Requirement:** Seattle Municipal Code (SMC) 22.920 mandates annual reporting for all non-residential and multifamily buildings $\ge 20,000 \text{ sq ft}$.
* **Data Portal:** [data.seattle.gov (Resource ID: `teqw-tu6e`)](https://data.seattle.gov/Built-Environment/Building-Energy-Benchmarking-Data-2015-Present/teqw-tu6e)
* **Raw File Size:** 13,321,421 bytes (~13.3 MB).
* **SHA-256 Checksum:** `d1a8227bf9c7c82aea8279a67405add617271852a985d96bb6e4ac9070e8250f`.
* **Observations:** 38,309 records across reporting years 2015–2025.
* **Geographic Scope:** Seattle, Washington, USA (Commercial, Mixed-Use, Educational, Healthcare, Hospitality, Multifamily).

---

## 3. Data Dictionary & Feature Taxonomy

Features are partitioned into four distinct research categories:

### A. Target Variables
| Field Name | Type | Description | Units |
| :--- | :--- | :--- | :--- |
| `TotalGHGEmissions` | Continuous | Total annual greenhouse gas emissions (Scope 1 direct fossil fuel + Scope 2 indirect electricity) | Metric Tons $\text{CO}_2\text{e} / \text{year}$ |
| `GHGEmissionsIntensity` | Continuous | Total emissions normalized by gross square footage | $\text{kg CO}_2\text{e} / \text{sq ft} / \text{year}$ |

### B. Structural, Architectural & Spatial Features (ML Input Matrix)
These features represent observable physical characteristics available prior to construction, during urban planning, or in unmetered retrofit screening:
* `BuildingType`: Primary occupancy classification (NonResidential, Multifamily HR, Multifamily MR, Multifamily LR, Campus, Nonresidential COS).
* `PrimaryPropertyType`: Detailed building category (e.g., Large Office, K-12 School, Hotel, Hospital, Retail, Warehouse).
* `YearBuilt`: Construction year, capturing historical thermal envelope codes.
* `NumberofFloors`: Vertical height and structural scale.
* `NumberofBuildings`: Campus or complex clustering.
* `PropertyGFATotal`: Total gross floor area ($\text{sq ft}$).
* `PropertyGFABuildings`: Conditioned gross building floor area ($\text{sq ft}$).
* `PropertyGFAParking`: Attached and enclosed parking garage floor area ($\text{sq ft}$).
* `LargestPropertyUseType`: Primary designated space use.
* `LargestPropertyUseTypeGFA`: Area dedicated to primary use.
* `SecondLargestPropertyUseType`: Secondary designated space use.
* `SecondLargestPropertyUseTypeGFA`: Area dedicated to secondary use.
* `Neighborhood`: Urban district (Downtown, Capitol Hill, Lake Union, Ballard, etc.).
* `Latitude` / `Longitude`: Spatial coordinates for geospatial variation.

### C. Direct Activity Meter Data (Withheld from ML Matrix to Prevent Formula Leakage)
* `Electricity(kWh)`: Total electricity consumption.
* `NaturalGas(therms)`: Total on-site fossil gas consumption.
* `SteamUse(kBtu)`: Total district steam consumption.
* `SiteEnergyUse(kBtu)`: Total site energy aggregated across all fuel carriers.

> **CRITICAL SCIENTIFIC RULE:** Because EPA Portfolio Manager derives `TotalGHGEmissions` algebraically from activity meters via emission factors ($E = \sum AD_i \times EF_i$), providing utility meter totals to an ML model converts the task into a trivial linear identity. Therefore, activity meter columns are **strictly withheld** from the ML feature matrix and are reserved exclusively for evaluating the **Conventional Activity $\times$ Emission Factor Accounting Baseline**.

### D. Identifiers & Grouping Variables
* `OSEBuildingID`: Unique permanent facility identifier, enabling **GroupKFold** cross-validation to prevent intra-building temporal contamination across multiple reporting years.
* `DataYear`: Reporting year (2015–2025), enabling chronological validation.
