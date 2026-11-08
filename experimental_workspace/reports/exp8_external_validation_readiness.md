# Experiment 8 — Cross-Municipal Validation Readiness and Schema Harmonization Protocol

**Authors:** Aditya Mandloi, Dr. Ashok Kumar Gupta  
**Affiliation:** School of Data Science and Forecasting, Devi Ahilya Vishwavidyalaya, Indore, India  
**Execution Date:** 2026-11-08  
**Status:** VALIDATED & COMPLETED (Interface Ready)  

---

## 1. Executive Summary & Regulatory Boundary
A critical vulnerability in urban machine learning literature is premature claims of cross-city generalizability based on synthetic or improperly harmonized external data.

Experiment 8 establishes a **formal cross-municipal schema harmonization protocol** for evaluating CarbonPulse AI+ across external statutory jurisdictions without violating data integrity:
- **Jurisdictions Staged:**
  1. **New York City, NY:** NYC Local Law 84 Benchmarking / Local Law 97 Carbon Limits ($>25,000\text{ sq ft}$).
  2. **Boston, MA:** Building Energy Reporting and Disclosure Ordinance (BERDO 2.0, $>20,000\text{ sq ft}$).
- **Strict Guardrail Maintained:** Zero external records are merged into Seattle training matrices. The evaluation interface remains in `INTERFACE_READY_AWAITING_EMPIRICAL_DATA` status until verified municipal public filings are placed into `experimental_workspace/data/external/`.

---

## 2. Cross-Municipal Field Harmonization Matrix

| Canonical Field Concept | Seattle Baseline | NYC LL84 / LL97 | Boston BERDO 2.0 | Data Type | Harmonization Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Building Identifier** | `OSEBuildingID` | `NYC_BIN (or BBL)` | `Building_ID` | Integer / String | Direct key mapping; facility-level cluster unit |
| **Reporting Year** | `DataYear` | `Year_Ending` | `Reporting_Year` | Integer | Temporal filter; longitudinal alignment |
| **Emissions Target** | `TotalGHGEmissions` | `Total_GHG_Emissions_Metric_Tons_CO2e` | `Total_Site_Emissions_MTCO2e` | Float | Direct metric tonnes CO2e; zero conversion needed |
| **Total Floor Area** | `PropertyGFATotal` | `Gross_Floor_Area_ft2` | `Gross_Square_Feet` | Float | Square footage basis; log1p transformation |
| **Primary Property Type** | `BuildingType` | `Primary_Property_Type` | `Property_Type` | Categorical | Ontological mapping to standard 7 macro-categories |
| **Year Built / Vintage** | `BuildingAge (derived from YearBuilt)` | `Year_Built` | `Year_Built` | Integer | Age = ReportingYear - YearBuilt |
| **Floor Count** | `NumberofFloors` | `Number_of_Floors` | `Floors` | Integer | Direct integer floor count; FloorAreaPerFloor derived |
| **Grid Emissions Factor** | `0.015 kg CO2e/kWh (Hydro-dominant Seattle City Light)` | `0.285 kg CO2e/kWh (NYISO Zone J Gas/Nuclear)` | `0.250 kg CO2e/kWh (ISO-NE Regional Mix)` | Float | Marginal carbon intensity adjustment in transfer inference |

---

## 3. Municipal Readiness Audits

### A. New York City (NYC Local Law 84 / Local Law 97)
- **Jurisdiction:** New York City, NY
- **Statutory Mandate:** NYC Local Law 84 / Local Law 97 Compliance Benchmarking
- **Status:** `READY_FOR_DATA_PLACEMENT`
- **Grid Emissions Factor Adjustment:** 0.285 kg CO2e/kWh (Dual-fuel natural gas and nuclear generation mix (Zone J NYC))
- **Target File Placement:** `experimental_workspace/data/external\nyc_ll84_raw.csv`

### B. Boston (BERDO 2.0)
- **Jurisdiction:** Boston, MA
- **Statutory Mandate:** Building Energy Reporting and Disclosure Ordinance (BERDO 2.0)
- **Status:** `READY_FOR_DATA_PLACEMENT`
- **Grid Emissions Factor Adjustment:** 0.25 kg CO2e/kWh (Natural gas and regional imported hydro/nuclear (ISO-NE))
- **Target File Placement:** `experimental_workspace/data/external\boston_berdo_raw.csv`

---

## 4. Methodological Protocol for Empirical Execution
When external datasets are ingested by the research team:
1. **Automated Leakage Audit:** The ingestion pipeline verifies that operational utility meter quantities (`Electricity(kWh)`, `NaturalGas(therms)`, `FuelOil(gallons)`, `DistrictSteam(kBtu)`) are stripped before inference.
2. **Thermodynamic Grid Factor Scaling:** Because Seattle's electric grid is hydro-dominant ($0.015\text{ kg CO}_2\text{e/kWh}$) while NYC ($0.285$) and Boston ($0.250$) rely on regional natural gas and nuclear generation, electricity emissions components must be adjusted by the regional grid carbon intensity ratio $\frac{\gamma_{\text{muni}}}{\gamma_{\text{Seattle}}}$.
3. **Zero Contamination Verification:** The split manager asserts that external records are strictly partitioned into external test manifests and never back-propagated into model weights.
