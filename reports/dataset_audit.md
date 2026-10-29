# Dataset Audit Report: Empirical Carbon Emissions Data Sources

**Manuscript:** Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation of Predictive Accuracy, Interpretability, and Computational Efficiency  
**Date:** October 2026  
**Auditor:** Senior Environmental Data Science & ML Research Team

---

## 1. Overview of Dataset Discovery & Investigation

To satisfy the non-negotiable requirement for an empirical, scientifically defensible evaluation, we conducted an exhaustive investigation of candidate datasets across open government portals, official environmental authorities, and research repositories. 

Five distinct candidates across building, transportation, smart-home, and electrical grid sectors were audited:
1. **City of Seattle Building Energy Benchmarking Data (2015–Present)** — *Office of Sustainability & Environment*
2. **Natural Resources Canada Fuel Consumption & Vehicle $\text{CO}_2$ Ratings** — *Natural Resources Canada*
3. **NYC Local Law 84 / Local Law 97 Energy & Water Disclosure** — *NYC Mayor's Office of Climate & Environmental Justice*
4. **UCI Appliances Energy Prediction Dataset** — *UCI Machine Learning Repository (Candanedo et al., 2017)*
5. **Open Power System Data (OPSD) Multi-Country Grid Time Series** — *Open Power System Data Consortium*

A comprehensive matrix comparing all five datasets is available in [reports/dataset_comparison.csv](file:///c:/Users/adity/Downloads/CarbonPulse--main/reports/dataset_comparison.csv).

---

## 2. In-Depth Audit of Candidate Datasets

### Candidate 1: City of Seattle Building Energy Benchmarking (Selected Primary Dataset)
* **Publisher:** City of Seattle Office of Sustainability & Environment.
* **Statutory Mandate:** Seattle Municipal Code (SMC) 22.920 requires annual energy and greenhouse gas reporting for all non-residential and multifamily structures exceeding $20,000 \text{ sq ft}$.
* **Access URL:** `https://data.seattle.gov/Built-Environment/Building-Energy-Benchmarking-Data-2015-Present/teqw-tu6e`
* **Direct Export:** `https://data.seattle.gov/api/views/teqw-tu6e/rows.csv?accessType=DOWNLOAD`
* **License:** Public Domain / City of Seattle Open Data Terms of Use (unrestricted academic and commercial reuse).
* **Observed Dimensions:** 38,309 records across reporting years 2015 to 2025; 46 features.
* **Target Variable:** `TotalGHGEmissions` (Metric Tons $\text{CO}_2\text{e} / \text{year}$) and `GHGEmissionsIntensity` ($\text{kg CO}_2\text{e} / \text{sq ft} / \text{year}$).
* **Target Derivation Method:** Emissions are calculated in U.S. EPA ENERGY STAR Portfolio Manager by aggregating metered utility consumption (electricity in kWh, natural gas in therms, steam in kBtu) and multiplying by official regional grid and fuel emission factors.
* **Key Features:** Architectural, spatial, and geometric parameters: Gross Floor Area (`PropertyGFATotal`, `PropertyGFABuildings`, `PropertyGFAParking`), `YearBuilt`, `NumberofFloors`, `NumberofBuildings`, property use categories (`LargestPropertyUseType`), spatial coordinates (`Latitude`, `Longitude`), and neighborhood districts.
* **Grouping & Temporal Keys:** `OSEBuildingID` (unique building identifier enabling grouped cross-validation) and `DataYear` (enabling chronological holdout).
* **Target-Validity & Leakage Assessment:** If direct utility consumption columns (`Electricity(kWh)`, `NaturalGas(therms)`, `SteamUse(kBtu)`) are provided as features to an ML model, the model would simply approximate the linear accounting equation ($E = \sum AD_i \times EF_i$). By strictly isolating activity data to evaluate the Conventional Accounting Baseline and training ML models on structural/architectural features, we ensure valid evaluation for unmetered building prediction.

### Candidate 2: Natural Resources Canada Vehicle Fuel Consumption & $\text{CO}_2$ Ratings
* **Publisher:** Natural Resources Canada (NRCan).
* **Access URL:** `https://open.canada.ca/data/dataset/98f1a129-f628-4ce4-b24d-6f16bf24dd64`
* **License:** Open Government Licence - Canada.
* **Observed Dimensions:** ~25,000 vehicle test records (2000–2024); 15 features.
* **Target Variable:** Tailpipe $\text{CO}_2$ emissions ($\text{g CO}_2 / \text{km}$).
* **Target Derivation Method:** Stoichiometric calculation directly proportional to fuel consumption:
  $$\text{CO}_2 (\text{g/km}) = \text{Fuel Consumption } (L/100\text{km}) \times \frac{\text{Fuel Carbon Content (g/L)}}{100}$$
* **Limitation:** While highly accurate, the target is deterministic chemistry. Regressing $\text{CO}_2$ from vehicle attributes is heavily dominated by fuel consumption, offering limited scope to test complex architectural interactions compared to urban building portfolios.

### Candidate 3: NYC Local Law 84 / 97 Energy and Water Data Disclosure
* **Publisher:** NYC Mayor's Office of Climate & Environmental Justice.
* **Access URL:** `https://data.cityofnewyork.us/Environment/Energy-and-Water-Data-Disclosure-for-Local-Law-84-/8nuu-tub5`
* **License:** NYC Open Data Terms of Use.
* **Observed Dimensions:** ~28,000 annual filings; 60+ features.
* **Target Variable:** Total GHG Emissions (Metric Tons $\text{CO}_2\text{e}$).
* **Limitation:** High rate of missingness in property identifiers, complex tax parcel mapping (BBL vs BIN discrepancies), and frequent schema shifts between annual disclosure cycles introduce significant data-cleaning friction without offering scientific advantages over the Seattle dataset.

### Candidate 4: UCI Appliances Energy Prediction
* **Publisher:** UCI Machine Learning Repository (Candanedo et al., University of Mons, 2017).
* **DOI:** `10.24432/C56P48`
* **License:** Creative Commons Attribution 4.0 International (CC BY 4.0).
* **Observed Dimensions:** 19,735 observations at 10-minute intervals over 4.5 months; 29 features.
* **Target Variable:** Sub-metered appliance energy consumption ($\text{Wh}$).
* **Limitation:** This dataset records energy consumption for a *single low-energy house* in Belgium. It contains **no emissions target**. Converting energy to emissions requires multiplying by an assumed constant grid factor, making the emissions target an artificial linear transform of energy. It cannot evaluate cross-facility building variations.

### Candidate 5: Open Power System Data (OPSD) Time Series
* **Publisher:** Open Power System Data Consortium.
* **License:** ODbL / CC-BY 4.0.
* **Target:** Hourly grid electricity carbon intensity ($\text{g CO}_2\text{e} / \text{kWh}$).
* **Limitation:** Grid dispatch time series rather than facility or organizational carbon accounting.

---

## 3. Data Integrity & Verification Checklist

- [x] Primary raw dataset acquired from official portal without third-party intermediaries.
- [x] Pristine raw file saved to `data/raw/seattle_building_energy_benchmarking_raw.csv`.
- [x] Cryptographic SHA-256 verified and recorded (`d1a8227bf9c7c82aea8279a67405add617271852a985d96bb6e4ac9070e8250f`).
- [x] Full provenance, license, and column metadata recorded in `data/dataset_manifest.json` and `data/README.md`.
- [x] Target derivation methodology explicitly classified as EPA Portfolio Manager reference calculation.
- [x] Direct activity data identified and isolated to prevent target leakage.
