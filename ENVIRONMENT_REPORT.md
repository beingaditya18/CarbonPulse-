# CarbonPulse AI+ — Experimental Environment & Dependency Report

**Report Generation Date:** 2026-11-08  
**Environment Status:** Fully Provisioned, Isolated, and Verified  
**Runtime Target:** Multi-threaded CPU Execution  

---

## 1. Host Hardware & System Specification

| System Attribute | Value / Specification |
| :--- | :--- |
| **Operating System** | Windows 11 Pro (10.0.26300-SP0) |
| **CPU Architecture** | AMD64 / x86_64 |
| **Processor Model** | AMD64 Family 25 Model 80 Stepping 0, AuthenticAMD |
| **Physical CPU Cores** | 8 Cores |
| **Logical CPU Threads** | 16 Threads |
| **Total Physical RAM** | 15.34 GB |
| **Available RAM** | 3.21 GB (at baseline inspection) |
| **Local Disk Space** | Total: 356.54 GB \| Free: 18.75 GB |
| **GPU Acceleration** | None (CUDA Available: `False`) |
| **Primary Compute Mode** | Multi-threaded CPU OpenMP / PyTorch CPU |

---

## 2. Virtual Environment Configuration

* **Isolation Strategy:** Dedicated virtual environment located at `experimental_workspace/.venv/`.
* **Python Runtime:** Python 3.12.6 (`C:\Users\adity\Downloads\CarbonPulse--main\experimental_workspace\.venv\Scripts\python.exe`).
* **Package Manager:** `pip` 24.2.
* **Isolation Guarantee:** The global project environment and baseline scripts are not altered; new dependencies (notably `pytorch-tabnet==4.1.0`) reside strictly within `experimental_workspace/.venv/`.

---

## 3. Pinned Core Dependencies & Verified Versions

| Package Name | Pinned Version | Functional Role in Experimental Suite | Verification Status |
| :--- | :---: | :--- | :---: |
| **python** | 3.12.6 | Master execution runtime | ✓ VERIFIED |
| **numpy** | 2.0.2 | Numerical array operations and matrix transforms | ✓ VERIFIED |
| **pandas** | 3.0.3 | Tabular dataset manipulation and Parquet I/O | ✓ VERIFIED |
| **scipy** | 1.18.0 | Statistical distributions and hypothesis testing | ✓ VERIFIED |
| **scikit-learn** | 1.9.0 | Preprocessing, GroupKFold, Ridge, and metrics | ✓ VERIFIED |
| **xgboost** | 1.7.6 | Gradient boosting benchmark & tree SHAP explainer | ✓ VERIFIED |
| **lightgbm** | 4.7.0 | High-efficiency gradient boosted decision trees | ✓ VERIFIED |
| **torch** | 2.6.0+cpu | PyTorch CPU deep tabular tensor backend | ✓ VERIFIED |
| **pytorch-tabnet** | 4.1.0 | Exp 2: Deep tabular attentive learning architecture | ✓ VERIFIED |
| **shap** | 0.52.0 | TreeSHAP and KernelSHAP attribution engines | ✓ VERIFIED |
| **matplotlib** | 3.8.4 | Static vector publication plot generation | ✓ VERIFIED |
| **seaborn** | 0.13.2 | Statistical distribution plotting | ✓ VERIFIED |
| **statsmodels** | 0.14.6 | Paired statistical tests and regression diagnostics | ✓ VERIFIED |
| **pyyaml** | 6.0.2 | Immutable configuration parser | ✓ VERIFIED |
| **joblib** | 1.5.3 | Serialized model loading and multiprocessing | ✓ VERIFIED |
| **pytest** | 7.4.3 | Automated infrastructure verification test harness | ✓ VERIFIED |
| **psutil** | 7.0.0 | Memory tracking and computational benchmarking | ✓ VERIFIED |
| **pyarrow** | 25.0.0 | High-performance columnar Parquet engine | ✓ VERIFIED |

---

## 4. Environment Reproduction Commands

To replicate this exact isolated environment from a clean shell:

```powershell
# 1. Navigate to project root
cd C:\Users\adity\Downloads\CarbonPulse--main

# 2. Create the isolated virtual environment
python -m venv experimental_workspace/.venv --system-site-packages

# 3. Activate the environment
.\experimental_workspace\.venv\Scripts\Activate.ps1

# 4. Install pinned experimental requirements
pip install -r experimental_workspace/requirements-experiments.txt

# 5. Run the infrastructure verification tests
python -m pytest experimental_workspace/tests
```
