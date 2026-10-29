# Table 8: Research Limitations, Threats to Validity, and Reproducibility Parameters

| Dimension | Specification | Methodological Note & Limitation |
| :--- | :--- | :--- |
| **Epistemic Ground Truth** | Regulatory Reference Accounting | Target represents EPA Portfolio Manager calculations from utility meter totals rather than direct physical chimney sensor flux measurements. |
| **Activity Meter Isolation** | Complete ML Withholding | Utility meter readings are withheld from the structural ML feature matrix to prevent trivial formula identity leakage. |
| **Geographic Transferability** | Seattle Municipal Building Stock | Results reflect Seattle's climate zone (Marine 4C) and clean hydro grid; transfer to fossil-intensive grids requires local calibration. |
| **Occupant Behavior** | Unmeasured Confounder | Sub-annual operational schedules, plug-load variances, and behavioral setpoints are unobserved in annual statutory filings. |
| **Energy Tracking Boundary** | CPU Package Power / CodeCarbon | Measures CPU package energy under 45W active TDP model; excludes peripheral motherboards and data center cooling overheads. |
| **Software Reproducibility** | Python 3.12.6 / Pytest Suite | Master configuration in `configs/experiment.yaml`; random seeds fixed at 42 across all pipelines and partitions. |
