# CarbonPulse AI+ — Dataset Inventory and Scientific Validation Report

**Validation Timestamp:** 2026-11-08T11:56:25.852012  
**Overall Validation Status:** **PASSED**  
**Raw Statutory File:** `data/raw/seattle_building_energy_benchmarking_raw.csv`  
**Processed Directory:** `data/processed`  

---

## 1. Statutory Raw Dataset Properties
* **Dataset Shape:** 38,309 rows x 46 columns
* **Total Unique Buildings (`OSEBuildingID`):** 3,871
* **Exact Duplicate Rows:** 0
* **Compound Key (`OSEBuildingID`, `DataYear`) Duplicates:** 0
* **Target Missingness:** 1,240 records (3.24%)
* **Target Non-Positive Values:** 0

### Longitudinal Compliance Distribution (Reporting Years 2015–2025)
| Reporting Year | Annual Filings Count |
| :---: | :---: |
| 2015 | 3,175 |
| 2016 | 3,253 |
| 2017 | 3,310 |
| 2018 | 3,381 |
| 2019 | 3,456 |
| 2020 | 3,530 |
| 2021 | 3,578 |
| 2022 | 3,617 |
| 2023 | 3,687 |
| 2024 | 3,712 |
| 2025 | 3,610 |

---

## 2. Processed Experimental Partitions
* **Development Partition:** 29,364 observations across 3,024 physical buildings
* **Held-Out Test Partition:** 7,366 observations across 757 physical buildings
* **Total Validated Records:** 36,730 observations across 3,781 unique buildings
* **Engineered Feature Dimensions:** 59 features (12 continuous, 5 categorical encoded)

---

## 3. Methodological Safeguards & Leakage Prevention
* **Formula Leakage Audit:** **PASSED (Zero Leakage)**
* **Direct Utility Meters Withheld:** Electricity(kWh), NaturalGas(therms), SteamUse(kBtu), SiteEnergyUse(kBtu), SiteEUI(kBtu/sf), SourceEUI(kBtu/sf)...
* **Physical Bounding Applied:** Gross Floor Area $> 0$, Emissions Intensity $\le 50.0 \text{ kg CO}_2\text{e/sq ft}$
* **Demolished Structures Filtered:** 329 terminal lifecycle filings excluded

---

## 4. Cohort Isolation & Building ID Integrity
* **Train / Test Facility Overlap:** **0** facilities (Strict 100% Facility Isolation)
* **Clustered Group Key:** `OSEBuildingID` strictly utilized across all splits

---

## 5. Baseline Scientific Reproducibility Verification
| Verification Dimension | Expected Chapter Baseline | Actual Validated Count | Status |
| :--- | :---: | :---: | :---: |
| **Total Validated Records** | 36,730 | 36,730 | ✓ MATCH |
| **Total Unique Facilities** | 3,781 | 3,781 | ✓ MATCH |
| **Held-Out Test Facilities** | 757 | 757 | ✓ MATCH |
| **Held-Out Test Observations** | 7,366 | 7,366 | ✓ MATCH |

