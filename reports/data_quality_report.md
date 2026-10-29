# Data Quality and Integrity Report

**Dataset:** City of Seattle Building Energy Benchmarking Data (2015–Present)  
**Total Records Audited:** 38,309  
**Total Features:** 46  
**Unique Facilities (OSEBuildingID):** 3,871  
**Audit Date:** October 2026  

---

## 1. Summary of Integrity Checks

| Verification Check | Result | Assessment |
| :--- | :--- | :--- |
| **Duplicate Full Rows** | 0 | Clean; zero exact duplicate records detected. |
| **Facility-Year Key Duplicates** | 0 | Verified; each (OSEBuildingID, DataYear) pair is unique. |
| **YearBuilt Range Violations** | 0 | Zero impossible historical (<1850) or future (>2026) construction years. |
| **Floor Area Bounds (GFA $\le 0$)** | 0 | All records strictly adhere to positive gross floor area. |
| **Spatial Coordinates Bounds** | Lat: 0, Lon: 0 | 100% of spatial coordinates fall within the official municipal boundary. |
| **Target Non-Positive Values** | 0 | All valid targets are strictly positive ($> 0$). |
| **Identified Leakage Features** | 11 | Isolated; 11 direct utility meter columns classified as formula leakage. |

---

## 2. Target Variable Distribution (`TotalGHGEmissions`)

* **Valid Observations:** 37,069 (1,240 missing / 3.2%)
* **Minimum:** 0.01 Metric Tons $\text{CO}_2\text{e}$
* **1st Percentile:** 1.30 Metric Tons $\text{CO}_2\text{e}$
* **25th Percentile:** 7.90 Metric Tons $\text{CO}_2\text{e}$
* **Median (50th Percentile):** 32.30 Metric Tons $\text{CO}_2\text{e}$
* **Mean:** 194.01 Metric Tons $\text{CO}_2\text{e}$
* **75th Percentile:** 93.10 Metric Tons $\text{CO}_2\text{e}$
* **95th Percentile:** 393.24 Metric Tons $\text{CO}_2\text{e}$
* **99th Percentile:** 1393.96 Metric Tons $\text{CO}_2\text{e}$
* **Maximum:** 581654.80 Metric Tons $\text{CO}_2\text{e}$
* **Standard Deviation:** 5607.10
* **Skewness:** 89.65 (Extreme positive skew; typical log-normal emissions distribution)
* **Kurtosis:** 8460.65

> **Modeling Decision:** Due to the extreme positive skewness (89.65), models are evaluated using both native-scale targets and log-transformed targets $\log(1 + y)$ where appropriate to stabilize variance and prevent high-leverage outliers from distorting gradient updates.

---

## 3. Longitudinal & Group Dependency Analysis

* **Unique Buildings:** 3,871
* **Reporting History per Facility:** 
  - Minimum filings: 1
  - Median filings: 11
  - Maximum filings: 11

> **Cross-Validation Strategy:** Because individual buildings have up to 11 annual compliance filings across the 2015–2025 period, standard random K-Fold splitting would place the same facility in both training and test sets, artificially inflating predictive accuracy. We enforce **GroupKFold splitting partitioned on `OSEBuildingID`**, ensuring models are evaluated on completely unseen facilities.

---

## 4. Missingness Profile Top 10 Columns

| Column Name | Data Type | Missing Count | Missing Percentage |
| :--- | :--- | :--- | :--- |
| `SteamUse(kBtu)` | float64 | 37,016 | 96.62% |
| `ThirdLargestPropertyUseTypeGFA` | float64 | 30,256 | 78.98% |
| `ThirdLargestPropertyUseType` | str | 29,200 | 76.22% |
| `SecondLargestPropertyUseTypeGFA` | float64 | 17,818 | 46.51% |
| `SecondLargestPropertyUseType` | str | 15,937 | 41.6% |
| `NaturalGas(therms)` | float64 | 14,829 | 38.71% |
| `NaturalGas(kBtu)` | float64 | 14,822 | 38.69% |
| `ENERGYSTARScore` | float64 | 10,417 | 27.19% |
| `SiteEUIWN(kBtu/sf)` | float64 | 1,961 | 5.12% |
| `SourceEUIWN(kBtu/sf)` | float64 | 1,961 | 5.12% |

Full missingness records across all 46 features are saved to [reports/missing_values.csv](file:///c:/Users/adity/Downloads/CarbonPulse--main/reports/missing_values.csv).
Feature roles, data types, and leakage classifications are documented in [reports/feature_dictionary.csv](file:///c:/Users/adity/Downloads/CarbonPulse--main/reports/feature_dictionary.csv).
