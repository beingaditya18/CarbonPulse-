# CarbonPulse AI+ — Environment Reproducibility Review

**Document Status:** Verified Technical Review  
**Date:** 2026-11-08  
**Scope:** Virtual Environment Isolation, Dependency Resolution, and PyTorch CPU Portability.  

---

## 1. Analysis of the `--system-site-packages` Strategy

### 1.1 Context and Technical Rationale
During Phase 2 setup on the host Windows machine, the command:
```powershell
python -m venv experimental_workspace/.venv --system-site-packages
```
was selected. 

The technical rationale was:
1. **Host Environment State:** The host Python 3.12.6 installation already possessed pre-compiled scientific wheels (NumPy 2.0.2, SciPy 1.18.0, scikit-learn 1.9.0, XGBoost 1.7.6, LightGBM 4.7.0, and PyTorch 2.6.0 CPU).
2. **Bandwidth and Sandbox Efficiency:** Sharing read access to these verified base packages avoided redundant re-downloading of over 2.5 GB of binary wheels from PyPI.
3. **Targeted Isolation:** New experimental packages (`pytorch-tabnet==4.1.0`) were installed strictly inside `experimental_workspace/.venv/Lib/site-packages/` without altering global site-packages.

### 1.2 Clean Environment Compatibility (Without `--system-site-packages`)
For an external researcher deploying on a fresh workstation or CI runner, `--system-site-packages` is **not required**. A pure, isolated virtual environment can be created from scratch using `requirements-experiments.txt`.

---

## 2. PyTorch CPU Installation Resolution

### 2.1 The Wheel Index Nuance on Windows
On Windows systems, PyTorch distributes CPU-only binary wheels via a dedicated repository rather than standard PyPI:
* **PyTorch CPU Wheel Index:** `https://download.pytorch.org/whl/cpu`
* **Wheel Identifier:** `torch==2.6.0+cpu`

If an external researcher runs `pip install -r requirements-experiments.txt` without the PyTorch wheel index specified, standard PyPI will attempt to download the CUDA-enabled wheel (~2.8 GB) or raise:
```
ERROR: Could not find a version that satisfies the requirement torch==2.6.0+cpu
```

### 2.2 Robust Portable Specification
To guarantee clean installation across all platforms (Windows, Linux, macOS), the dependency specification in `requirements-experiments.txt` has been updated with the extra-index URL:

```ini
--extra-index-url https://download.pytorch.org/whl/cpu
torch==2.6.0+cpu; sys_platform == 'win32'
torch==2.6.0; sys_platform != 'win32'
pytorch-tabnet==4.1.0
numpy==2.0.2
pandas==3.0.3
scipy==1.18.0
scikit-learn==1.9.0
xgboost==1.7.6
lightgbm==4.7.0
shap==0.52.0
matplotlib==3.8.4
seaborn==0.13.2
statsmodels==0.14.6
PyYAML==6.0.2
joblib==1.5.3
pytest==7.4.3
psutil==7.0.0
pyarrow==25.0.0
tqdm==4.67.1
```

---

## 3. Verified Dependency Manifest

| Package Name | Exact Version | Platform Target | Verification Status |
| :--- | :---: | :---: | :---: |
| **Python** | 3.12.6 | Windows AMD64 | ✓ Verified (`sys.version`) |
| **numpy** | 2.0.2 | CPU (OpenBLAS) | ✓ Verified (`numpy.__version__`) |
| **pandas** | 3.0.3 | Native C-extensions | ✓ Verified (`pandas.__version__`) |
| **scipy** | 1.18.0 | CPU (OpenBLAS/Lapack) | ✓ Verified (`scipy.__version__`) |
| **scikit-learn** | 1.9.0 | OpenMP Multi-threaded | ✓ Verified (`sklearn.__version__`) |
| **xgboost** | 1.7.6 | OpenMP Multi-threaded | ✓ Verified (`xgboost.__version__`) |
| **lightgbm** | 4.7.0 | OpenMP Multi-threaded | ✓ Verified (`lightgbm.__version__`) |
| **torch** | 2.6.0+cpu | Multi-threaded CPU | ✓ Verified (`torch.__version__`, `cuda=False`) |
| **pytorch-tabnet** | 4.1.0 | Pure Python / Torch | ✓ Verified (`pytorch_tabnet.__file__`) |
| **shap** | 0.52.0 | C-accelerated TreeSHAP | ✓ Verified (`shap.__version__`) |
| **matplotlib** | 3.8.4 | Agg / Vector | ✓ Verified (`matplotlib.__version__`) |
| **seaborn** | 0.13.2 | Matplotlib wrapper | ✓ Verified (`seaborn.__version__`) |
| **statsmodels** | 0.14.6 | Cython / SciPy | ✓ Verified (`statsmodels.__version__`) |
| **pyyaml** | 6.0.2 | LibYAML / C-parser | ✓ Verified (`yaml.__version__`) |
| **joblib** | 1.5.3 | Loky / Multiprocessing | ✓ Verified (`joblib.__version__`) |
| **pytest** | 7.4.3 | Test Harness | ✓ Verified (`pytest.__version__`) |
| **psutil** | 7.0.0 | Win32 / C-bindings | ✓ Verified (`psutil.__version__`) |
| **pyarrow** | 25.0.0 | Arrow Columnar C++ | ✓ Verified (`pyarrow.__version__`) |

---

## 4. End-to-End Clean Clone Setup Commands

### On Windows PowerShell:
```powershell
# 1. Create clean virtual environment (without system site packages)
python -m venv .clean_venv

# 2. Activate environment
.\.clean_venv\Scripts\Activate.ps1

# 3. Upgrade pip
python -m pip install --upgrade pip

# 4. Install PyTorch CPU first from official wheel index
pip install torch==2.6.0+cpu --extra-index-url https://download.pytorch.org/whl/cpu

# 5. Install remaining pinned dependencies
pip install -r requirements-experiments.txt

# 6. Verify environment and test suite
python -m pytest experimental_workspace/tests -v
```

### On Linux / macOS:
```bash
# 1. Create clean virtual environment
python3 -m venv .clean_venv

# 2. Activate environment
source .clean_venv/bin/activate

# 3. Upgrade pip
python3 -m pip install --upgrade pip

# 4. Install PyTorch CPU and pinned requirements
pip install -r requirements-experiments.txt

# 5. Verify environment and test suite
python3 -m pytest experimental_workspace/tests -v
```

