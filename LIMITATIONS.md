# Methodological Scope & Jurisdictional Generalization Boundaries

**Manuscript:** Explainable Machine Learning for Screening-Level Building Emissions Estimation Without Meter Data: Accuracy, Cluster-Aware Inference, and Explanation Stability  
**Accompanying Repository:** CarbonPulse AI Benchmark  
**Document Status:** Formal Academic Limitation Boundary (Generated via External Validation Safeguard)  

---

## 1. Jurisdictional Boundary Statement

The predictive models, feature attribution rankings, and empirical findings reported in this publication are **strictly bounded to the municipal jurisdiction of the City of Seattle, Washington (USA)**, governed by Seattle Municipal Code (SMC) Chapter 22.920 (Building Energy Benchmarking and Reporting).

External cross-jurisdictional validation against **NYC Local Law 84 (LL84)** was evaluated through the modular ingestion pipeline (`src/data/external_loader.py`) and reached the following determination:

> **Execution Boundary Notice:**  
> External cross-city inference cannot be asserted without domain-level recalibration.  
> **Primary Reason:** External validation file for NYC Local Law 84 (LL84) was not found at configured path.  
> 
> **Specific Diagnostic Details:**  
- Configured raw data path: 'data/external/nyc_ll84_benchmarking_sample.csv'
- NYC Open Data LL84 repository was not staged in data/external/ prior to execution.
- Automatic fallback activated to preserve scientific reproducibility without ungrounded extrapolations.

---

## 2. Scientific & Thermodynamic Generalization Barriers

Peer reviewers and practitioners must account for three fundamental scientific discrepancies between Seattle and other metropolitan benchmarking jurisdictions:

### A. Regional Grid Emission Factors (Scope 2 Asymmetry)
- **Seattle City Light (SCL):** Operates on an exceptionally clean, hydro-dominant generation mix ($>85\%$ hydroelectricity), yielding an emission factor of approximately **$0.01972\text{ MT CO}_2\text{e} / \text{MWh}$** ($0.0435\text{ lb CO}_2\text{e} / \text{kWh}$).
- **External Grids (e.g., NYISO / PJM / MISO):** New York City and Midwestern jurisdictions rely heavily on natural gas and fossil peaking units, yielding emission factors between **$0.25$ and $0.45\text{ MT CO}_2\text{e} / \text{MWh}$**—more than **one order of magnitude ($10\times - 20\times$) higher**.
- **Impact:** An identical office building with identical electricity consumption will produce vastly disparate emissions in Seattle versus New York or Chicago, rendering raw uncalibrated Seattle-trained models structurally biased elsewhere.

### B. Architectural Vintage, Climate Zones, and Building Typology
- **Climate Zone:** Seattle sits in **IECC Climate Zone 4C (Marine)**, characterized by mild winters and moderate summers, minimizing air conditioning cooling loads compared to **Zone 4A (Humid Subtropical / NYC)** or **Zone 5A (Cold / Chicago)**.
- **Structural Morphology:** Pacific Northwest construction features distinct timber-frame and low-rise campus morphologies, whereas Northeast registries are dominated by pre-war masonry high-rises and dense urban canyons with divergent thermal inertia.

### C. Statutory Reporting Discrepancies and Boundary Definitions
- **Exemptions & Gross Floor Area Thresholds:** Seattle mandates benchmarking for non-residential and multifamily buildings $\ge 20,000\text{ sq ft}$, whereas NYC LL84 historically mandated thresholds of $\ge 50,000\text{ sq ft}$ (expanded to $\ge 25,000\text{ sq ft}$ under LL133).
- **Emissions Boundary Incompatibilities:** Variations in district steam accounting, onsite fuel combustion allocation, and tenant vs. base-building submetering rules create systematic measurement divergence.

---

## 3. Prescribed Path for External Adoption

To adapt the CarbonPulse architecture to an external municipality, researchers must:
1. **Recalibrate Scope 2 Carbon Intensity:** Re-weight the electricity emission factors to match the regional eGRID subregion (e.g., NYCW for New York City).
2. **Re-fit Categorical Embeddings:** Map municipal property type classifications into the standardized 14-category primary use ontology.
3. **Re-train Local Regressors:** Re-estimate tree leaf partitions using localized historical training data under `GroupKFold` clustering by municipal parcel/tax identifiers.
