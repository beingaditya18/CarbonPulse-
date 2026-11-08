# Cross-Municipal Schema Harmonization Checklist

**Protocol Version:** 1.0.0  
**Scope:** Evaluation of CarbonPulse unmetered structural estimators on external municipal compliance registries (New York City LL84 / Boston BERDO).  
**Phase Status:** Setup Only — No external data downloaded or combined.  

---

## 1. Prerequisites Checklist

Before any external municipal dataset is integrated into the validation pipeline, each item below must be verified by the research team:

- [ ] **1. Statutory Mandate & Legal Cleanliness:** Data is published under an open municipal license or public-domain ordinance without proprietary restrictions.
- [ ] **2. Persistent Building Identifier:** Contains a permanent municipal structure key (`BIN`/`BBL` in NYC, `Building_ID` in Boston) to permit cluster-level evaluation.
- [ ] **3. Temporal Separation:** Multi-year filings must distinguish reporting year from compliance submission year.
- [ ] **4. Target Emissions Consistency:**
  - Target must represent total Scope 1 + Scope 2 emissions.
  - Measurement units must be verified as Metric Tons $\text{CO}_2\text{e}$ (or algebraically converted with documented factors).
  - Explicit documentation of biogenic emissions and district steam accounting.
- [ ] **5. Floor Area Definition Harmonization:**
  - Must report Gross Floor Area (GFA) in square feet (or square meters convertible via $1 \text{ m}^2 = 10.7639 \text{ sq ft}$).
  - Must document whether interior parking, unconditioned basements, and exterior balconies are included.
- [ ] **6. Grid Emission Factor Adjustment:**
  - Seattle City Light baseline utilizes hydro-heavy regional factor ($\approx 0.0197 \text{ kg CO}_2\text{e/kWh}$).
  - External jurisdictions must be evaluated using their local subregion marginal or average grid factor (e.g., NYISO Zone J $\approx 0.285 \text{ kg CO}_2\text{e/kWh}$; ISO-NE $\approx 0.250 \text{ kg CO}_2\text{e/kWh}$).
- [ ] **7. Strict Isolation Safeguard:**
  - External municipal records must remain in `experimental_workspace/data/external/` as pure out-of-distribution evaluation targets.
  - Under no circumstances may external municipal observations be pooled into the Seattle training partition.

