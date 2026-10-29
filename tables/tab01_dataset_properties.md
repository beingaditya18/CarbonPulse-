# Table 1: Dataset Characteristics & Provenance Summary

| Property Dimension | Specification / Metric | Description & Provenance |
| :--- | :--- | :--- |
| **Official Dataset Name** | City of Seattle Building Energy Benchmarking Data | Mandated municipal compliance filing under Seattle Municipal Code (SMC 22.920) |
| **Publisher & Custodian** | City of Seattle Office of Sustainability & Environment | Published via data.seattle.gov Open Data portal (Resource ID: `teqw-tu6e`) |
| **Temporal Coverage** | Reporting Years 2015 – 2025 | 11 consecutive reporting cycles |
| **Geographic Bounding Box** | Seattle, Washington, USA | Latitude: [47.49° N, 47.73° N], Longitude: [-122.44° W, -122.24° W] |
| **Total Statutory Filings** | 38,309 records | Complete census of commercial and multifamily structures >= 20,000 sq ft |
| **Cleaned & Validated Records** | 36,730 records | 95.9% retained after physical bounds validation and removal of demolished buildings |
| **Unique Physical Facilities** | 3,781 unique facilities (`OSEBuildingID`) | Supports group-level partitioning to prevent intra-facility temporal leakage |
| **Primary Target Variable** | `TotalGHGEmissions` | Scope 1 fossil combustion + Scope 2 electricity emissions (Metric Tons CO2e / yr) |
| **Intensity Benchmark Target** | `GHGEmissionsIntensity` | Area-normalized footprint (kg CO2e / sq ft / yr) |
| **Accounting Mechanism** | EPA ENERGY STAR Portfolio Manager | Derived from verified utility meter bills via static regional emission factors |
| **Development Partition** | 29,364 observations across 3,024 facilities | 80% facility GroupShuffleSplit for model training and cross-validation |
| **Held-Out Test Partition** | 7,366 observations across 757 facilities | 20% facility GroupShuffleSplit strictly isolated until final testing |
