# Applicability Domain (AD) Evaluation Report

**Study:** CarbonPulse Longitudinal GHG Estimation  
**Reference Partition:** Development facilities ($N=3024$ unique facilities)  
**Evaluation Partition:** Held-out test facilities ($N=757$ unique facilities, $N=7366$ rows)  
**Grouping Invariant:** Facility-disjoint (`OSEBuildingID`)  

---

## 1. Domain Metric Summary & Thresholds (Fitted on Dev Only)

| Metric | Reference Space | Threshold Definition | Dev 95th Percentile Cutoff | Test Pass Rate (%) |
| :--- | :--- | :--- | :--- | :--- |
| **Gower 1-NN Distance** | Mixed Continuous + Categorical | 95th percentile of dev-to-dev 1-NN | `0.1133` | `98.8%` |
| **Robust Mahalanobis ($D_M$)** | Numeric Features (MinCovDet) | 95th percentile of dev robust distance | `1.7026` | `93.9%` |
| **Feature Envelope Violations** | Hyper-box Bounding Envelope | Zero out-of-range features | Count = 0 | `100.0%` |
| **Composite In-Domain** | Multi-criteria Conjunction | Violations=0 $\land$ Gower $\le \tau_G \land D_M \le \tau_M$ | All Satisfied | **`92.9%`** |

---

## 2. Test Cohort Stratification

- **Test Facilities In-Domain:** **704 / 757 (93.0%)**
- **Test Facilities Out-of-Domain / Boundary:** **53 / 757 (7.0%)**
- **Test Observations In-Domain:** **6,841 / 7,366 (92.9%)**
- **Test Observations Out-of-Domain / Boundary:** **525 / 7,366 (7.1%)**

### Breakdown of Boundary / Out-of-Domain Triggers
- Feature Envelope Violations: 0 records (0.0%)
- Gower Distance Exceeded: 91 records (1.2%)
- Robust Mahalanobis Exceeded: 451 records (6.1%)
