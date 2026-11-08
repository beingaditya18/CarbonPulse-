# CarbonPulse AI+ — Experimental Infrastructure Setup Audit

**Audit Date:** 2026-11-08  
**Audit Status:** **COMPLETED & VERIFIED (READY FOR SCIENTIFIC EXECUTION)**  
**Auditor:** Senior ML Infrastructure & Reproducibility Specialist  
**Execution Boundary:** Environment and Infrastructure Setup Only (No Experiments Executed)  

---

## 1. Setup Status Checklist

| Verification Domain | Requirement | Observed Status | Evidence / Artifact |
| :--- | :--- | :---: | :--- |
| **Repository Baseline** | Original files unchanged; read-only preservation | **✓ PASSED** | 104/104 baseline files match SHA-256 hashes in `baseline_backup/baseline_hashes.json` |
| **Git Working Tree** | No deleted historical Git records | **✓ PASSED** | Git commit `b21bcdd52a03f12a47c711628fc11a7d028ca82f` preserved |
| **Environment Isolation** | Isolated virtualenv; core packages pinned | **✓ PASSED** | `experimental_workspace/.venv/` with `pytorch-tabnet==4.1.0` and 16 scientific packages |
| **Hardware Configuration** | Multi-threaded CPU execution configured | **✓ PASSED** | 8-core / 16-thread AMD64 CPU, 15.34 GB RAM, PyTorch CPU backend |
| **Central Configuration** | 4 validated YAML configs with real dataset fields | **✓ PASSED** | `global.yaml`, `data.yaml`, `models.yaml`, `experiments.yaml` |
| **Data Inventory & Counts** | Exact baseline records and building counts | **✓ PASSED** | 38,309 raw, 36,730 cleaned (29,364 train / 7,366 test), 3,781 buildings (3,024 train / 757 test) |
| **Formula Leakage** | Complete exclusion of activity meter columns | **✓ PASSED** | 0 forbidden meter columns in feature matrices |
| **Split Isolation** | Zero facility ID contamination across splits | **✓ PASSED** | 0 building overlap in master 80/20, conformal 75/25, and 5-fold CV |
| **Temporal Monotonicity** | Chronological ordering preserved | **✓ PASSED** | 2015–2022 historical train precedes 2023–2025 holdout evaluation |
| **Registry & Logging** | Automated cryptographic lineage logging | **✓ PASSED** | `registry.py` logging to `experiment_registry.json` and `.csv` |
| **Automated Test Suite** | 100% test pass rate on setup & infrastructure | **✓ PASSED** | 18/18 pytest tests passing in 13.85s |
| **External Jurisdiction** | Interface ready; zero data pollution | **✓ PASSED** | `interface.py` & `harmonization_checklist.md` for NYC LL84 and Boston BERDO |

---

## 2. Inventory of Generated Configuration and Report Artifacts

### Configuration Specifications
* `experimental_workspace/configs/global.yaml`: Master system, hardware, and directory definitions.
* `experimental_workspace/configs/data.yaml`: Real dataset schema, units, features, and split rules.
* `experimental_workspace/configs/models.yaml`: Hyperparameters for 8 baseline models and TabNet.
* `experimental_workspace/configs/experiments.yaml`: Dedicated configurations for all 8 scientific experiments.

### Infrastructure & Registry Modules
* `experimental_workspace/src/data/validator.py`: Automated dataset and leakage validator.
* `experimental_workspace/src/splits/split_manager.py`: Leakage-free building-level split generator.
* `experimental_workspace/src/utils/registry.py`: Experiment run registry and lineage tracker.
* `experimental_workspace/src/experiments/external_validation/interface.py`: Cross-municipal schema harmonizer.
* `experimental_workspace/src/experiments/risk_control/runner.py`: Experiment 1 staging runner.
* `experimental_workspace/src/experiments/tabnet/runner.py`: Experiment 2 staging runner.
* `experimental_workspace/src/experiments/perturbation/runner.py`: Experiment 3 staging runner.
* `experimental_workspace/src/experiments/weighted_conformal/runner.py`: Experiment 4 staging runner.
* `experimental_workspace/src/experiments/paired_audit/runner.py`: Experiment 5 staging runner.
* `experimental_workspace/src/experiments/shap_subgroups/runner.py`: Experiment 6 staging runner.
* `experimental_workspace/src/experiments/mahalanobis/runner.py`: Experiment 7 staging runner.

### Scientific Reports & Checklists
* `SETUP_WALKTHROUGH.md`: Complete end-to-end setup guide and architectural documentation.
* `SETUP_AUDIT.md` / `experimental_workspace/reports/setup_audit.md`: This verification and status audit.
* `DATA_INVENTORY.md` / `experimental_workspace/reports/data_inventory.md`: Full empirical dataset profile.
* `ENVIRONMENT_REPORT.md` / `experimental_workspace/reports/environment_report.md`: System specs & pinned packages.
* `SPLIT_INTEGRITY_REPORT.md` / `experimental_workspace/reports/split_integrity_report.md`: Cluster isolation proof.
* `experimental_workspace/data/external/harmonization_checklist.md`: 7-point municipal integration checklist.
* `requirements-experiments.txt`: Pinned dependency specification.

---

## 3. Verification Command for External Researchers

To independently verify this complete setup in a single command:

```powershell
.\experimental_workspace\.venv\Scripts\python.exe -m pytest experimental_workspace/tests -v
```
