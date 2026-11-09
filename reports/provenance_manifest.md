# Artifact Provenance & Traceability Manifest

**Manifest Generation Date:** 2026-11-08T11:41:03.375924  
**Git Commit:** `b21bcdd52a03f12a47c711628fc11a7d028ca82f` (`main`)  
**Raw Dataset SHA-256:** `D1A8227BF9C7C82AEA8279A67405ADD617271852A985D96BB6E4AC9070E8250F`  
**Hardware Platform:** AMD64 Family 25 Model 80 Stepping 0, AuthenticAMD (Windows-11-10.0.26300-SP0)  

---

## 1. Experimental Partitioning & Integrity Safeguards
* **Development Partition:** 29,364 annual filings across 3,024 unique physical facilities (`OSEBuildingID`).
* **Held-Out Test Partition:** 7,366 annual filings across 757 unique physical facilities (`OSEBuildingID`). Zero overlap with development facilities.
* **Cross-Validation Scope:** 5-fold `GroupKFold` strictly confined to the development partition; transformers fitted inside each fold.
* **Final Test Scope:** Evaluated only once after model freezing; never used for hyperparameter tuning.
* **Activity Leakage Prevention:** Utility meters (`Electricity(kWh)`, `NaturalGas(therms)`, `SteamUse(kBtu)`) withheld from structural ML matrices.

---

## 2. Artifact Registry & Cryptographic Hashes

### 2.1 Cross-Validation (Development Partition Only)
| Artifact Path | Size (Bytes) | SHA-256 Checksum |
| :--- | :--- | :--- |
| `results/cross_validation_metrics.csv` | 2,169 | `37914A946E70B917...` |
| `results/cross_validation_summary.csv` | 1,236 | `74ED0E023F3D8A2B...` |
| `reports/cross_validation_report.md` | 5,774 | `23F5311191AE036D...` |

### 2.2 Final Evaluation (Held-Out Test Partition)
| Artifact Path | Size (Bytes) | SHA-256 Checksum |
| :--- | :--- | :--- |
| `results/predictive_metrics.csv` | 1,021 | `7D10FE7A764C7C6B...` |
| `results/test_predictions.csv` | 1,069,536 | `3803399F61B968F3...` |
| `results/residuals.csv` | 1,174,853 | `CB699D663A9EA609...` |
| `results/subgroup_performance.csv` | 5,379 | `2691720E250C3CAC...` |
| `results/paired_model_comparisons.csv` | 1,977 | `2533F8E75D0313B1...` |
| `results/pareto_analysis.csv` | 1,528 | `A32E96C95F7FA1B8...` |
| `reports/predictive_performance.md` | 14,145 | `D1C43427F7A1E715...` |
| `reports/statistical_validation.md` | 3,541 | `404B2FA38A5EDC65...` |

### 2.3 Explainability & Stability
| Artifact Path | Size (Bytes) | SHA-256 Checksum |
| :--- | :--- | :--- |
| `results/global_feature_importance.csv` | 8,124 | `96B73552C8B73D50...` |
| `results/local_explanations.csv` | 1,128 | `2B444389F1D8B615...` |
| `results/explanation_metadata.json` | 907 | `C8597BAE8FBE80E2...` |
| `results/explanation_stability.csv` | 676 | `78CF14F55CB58C12...` |
| `results/explainer_runtimes.csv` | 153 | `7E1CB34B6C3116E0...` |
| `reports/explainability_analysis.md` | 2,486 | `059827F8288295BF...` |
| `reports/explanation_stability.md` | 1,819 | `F0EAD05786835771...` |

### 2.4 Computational Efficiency & Green AI
| Artifact Path | Size (Bytes) | SHA-256 Checksum |
| :--- | :--- | :--- |
| `results/latency_benchmarks.csv` | 759 | `3D1509E1EB397051...` |
| `results/memory_benchmarks.csv` | 325 | `0F991784F47138DB...` |
| `results/energy_benchmarks.csv` | 2,285 | `C392B6099FE14CE6...` |
| `results/computational_benchmarks.csv` | 2,593 | `1D3864C26C835952...` |
| `reports/computational_efficiency.md` | 3,158 | `3DFEC03850A572FB...` |
