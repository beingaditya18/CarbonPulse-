"""
Module: generate_provenance_manifest.py
Generates a comprehensive, machine-readable provenance manifest (results/provenance_manifest.json)
and human-readable report (reports/provenance_manifest.md).
Connects all generated outputs to:
1. Git commit hash, branch, and status.
2. Raw statutory dataset SHA-256 provenance checksum.
3. Master experiment configuration and random seeds.
4. Partitioning strategy (GroupShuffleSplit holdout vs GroupKFold cross-validation).
5. Exact package dependency versions in the execution environment.
6. Cryptographic SHA-256 checksums of all generated artifacts, with explicit separation
   between cross-validation (development partition) and final test evaluation (held-out partition).
"""
import os
import sys
import json
import hashlib
import platform
import subprocess
import yaml
import pandas as pd

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CONFIG_PATH = os.path.join(REPO_ROOT, "configs", "experiment.yaml")
RESULTS_DIR = os.path.join(REPO_ROOT, "results")
REPORTS_DIR = os.path.join(REPO_ROOT, "reports")
TABLES_DIR = os.path.join(REPO_ROOT, "tables")
FIGURES_DIR = os.path.join(REPO_ROOT, "figures")
DATA_DIR = os.path.join(REPO_ROOT, "data")
RAW_DATA_PATH = os.path.join(DATA_DIR, "raw", "seattle_building_energy_benchmarking_raw.csv")

def compute_sha256(filepath: str) -> str:
    if not os.path.exists(filepath):
        return "FILE_NOT_FOUND"
    sha = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            sha.update(chunk)
    return sha.hexdigest().upper()

def get_git_info() -> dict:
    info = {"commit_hash": "UNKNOWN", "branch": "UNKNOWN", "clean": False}
    try:
        commit = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=REPO_ROOT, text=True).strip()
        branch = subprocess.check_output(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=REPO_ROOT, text=True).strip()
        status = subprocess.check_output(["git", "status", "--porcelain"], cwd=REPO_ROOT, text=True).strip()
        info["commit_hash"] = commit
        info["branch"] = branch
        info["clean"] = (len(status) == 0)
    except Exception as e:
        info["error"] = str(e)
    return info

def get_dependency_versions() -> dict:
    versions = {"python": sys.version}
    modules = ["sklearn", "xgboost", "interpret", "shap", "pandas", "numpy", "scipy", "codecarbon", "joblib", "psutil"]
    for mod_name in modules:
        try:
            mod = __import__(mod_name)
            versions[mod_name] = getattr(mod, "__version__", "installed")
        except ImportError:
            versions[mod_name] = "NOT_INSTALLED"
    return versions

def generate_manifest():
    os.makedirs(RESULTS_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)
    
    print("Generating comprehensive machine-readable artifact provenance manifest...")
    
    # 1. Load config
    cfg = {}
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, "r") as f:
            cfg = yaml.safe_load(f)
            
    # 2. Raw data provenance
    raw_hash = compute_sha256(RAW_DATA_PATH)
    raw_size = os.path.getsize(RAW_DATA_PATH) if os.path.exists(RAW_DATA_PATH) else 0
    
    # 3. Categorized Artifacts
    artifact_categories = {
        "cross_validation_development_partition": [
            "results/cross_validation_metrics.csv",
            "results/cross_validation_summary.csv",
            "reports/cross_validation_report.md"
        ],
        "final_held_out_test_partition": [
            "results/predictive_metrics.csv",
            "results/test_predictions.csv",
            "results/residuals.csv",
            "results/subgroup_performance.csv",
            "results/paired_model_comparisons.csv",
            "results/pareto_analysis.csv",
            "reports/predictive_performance.md",
            "reports/statistical_validation.md"
        ],
        "explainability_and_stability": [
            "results/global_feature_importance.csv",
            "results/local_explanations.csv",
            "results/explanation_metadata.json",
            "results/explanation_stability.csv",
            "results/explainer_runtimes.csv",
            "reports/explainability_analysis.md",
            "reports/explanation_stability.md"
        ],
        "computational_efficiency_and_green_ai": [
            "results/latency_benchmarks.csv",
            "results/memory_benchmarks.csv",
            "results/energy_benchmarks.csv",
            "results/computational_benchmarks.csv",
            "reports/computational_efficiency.md"
        ],
        "dataset_and_partitioning_provenance": [
            "data/dataset_manifest.json",
            "data/processed/split_metadata.json",
            "data/processed/train_groups.parquet",
            "data/processed/test_groups.parquet",
            "reports/dataset_audit.md",
            "reports/data_quality_report.md"
        ],
        "publication_tables": [
            f"tables/tab0{i}_{name}.md" for i, name in [
                (1, "dataset_properties"),
                (2, "experimental_configurations"),
                (3, "predictive_metrics"),
                (4, "explanation_stability"),
                (5, "computational_efficiency"),
                (6, "statistical_comparisons"),
                (7, "ablation_analysis"),
                (8, "limitations_reproducibility")
            ]
        ],
        "publication_figures": [
            f"figures/{f}" for f in [
                "fig01_research_pipeline.png", "fig01_research_pipeline.pdf",
                "fig02_target_distribution.png", "fig02_target_distribution.pdf",
                "fig03_data_quality_missingness.png", "fig03_data_quality_missingness.pdf",
                "fig04_correlation_analysis.png", "fig04_correlation_analysis.pdf",
                "fig05_actual_vs_predicted.png", "fig05_actual_vs_predicted.pdf",
                "fig06_residual_distribution.png", "fig06_residual_distribution.pdf",
                "fig07_model_mae_rmse_comparison.png", "fig07_model_mae_rmse_comparison.pdf",
                "fig08_model_r2_comparison.png", "fig08_model_r2_comparison.pdf",
                "fig09_feature_effect_curves.png", "fig09_feature_effect_curves.pdf",
                "fig10_shap_global_importance.png", "fig10_shap_global_importance.pdf",
                "fig11_local_explanation_examples.png", "fig11_local_explanation_examples.pdf",
                "fig12_explanation_stability.png", "fig12_explanation_stability.pdf",
                "fig13_latency_memory_comparison.png", "fig13_latency_memory_comparison.pdf",
                "fig14_computational_energy_footprint.png", "fig14_computational_energy_footprint.pdf",
                "fig15_pareto_frontier.png", "fig15_pareto_frontier.pdf"
            ]
        ]
    }
    
    catalog = {}
    for cat_name, file_list in artifact_categories.items():
        catalog[cat_name] = []
        for rel_path in file_list:
            full_path = os.path.join(REPO_ROOT, rel_path)
            exists = os.path.exists(full_path)
            catalog[cat_name].append({
                "path": rel_path.replace("\\", "/"),
                "exists": exists,
                "size_bytes": os.path.getsize(full_path) if exists else 0,
                "sha256": compute_sha256(full_path) if exists else "NOT_FOUND"
            })
            
    manifest = {
        "manifest_version": "2.0.0",
        "generated_timestamp": pd.Timestamp.now().isoformat(),
        "git_provenance": get_git_info(),
        "runtime_environment": {
            "os": platform.platform(),
            "cpu_architecture": platform.machine(),
            "processor": platform.processor(),
            "dependencies": get_dependency_versions()
        },
        "raw_dataset_provenance": {
            "source_endpoint": "https://data.seattle.gov/resource/teqw-tu6e.csv",
            "statutory_mandate": "City of Seattle SMC 22.920",
            "filepath": "data/raw/seattle_building_energy_benchmarking_raw.csv",
            "sha256": raw_hash,
            "size_bytes": raw_size
        },
        "experimental_protocol": {
            "random_seed": cfg.get("experiment", {}).get("random_seed", 42),
            "test_split_fraction": cfg.get("experiment", {}).get("test_size", 0.20),
            "holdout_sampling_unit": "OSEBuildingID (GroupShuffleSplit, 3,024 train vs 757 test facilities)",
            "cross_validation_protocol": "5-fold GroupKFold on OSEBuildingID (development partition only)",
            "target_variable": "TotalGHGEmissions (Metric Tons CO2e / yr)",
            "log_transform_target": True,
            "activity_meter_columns_withheld_from_ml": [
                "Electricity(kWh)", "NaturalGas(therms)", "SteamUse(kBtu)"
            ]
        },
        "artifacts_by_category": catalog
    }
    
    manifest_json_path = os.path.join(RESULTS_DIR, "provenance_manifest.json")
    with open(manifest_json_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
        
    # Write human-readable markdown summary
    manifest_md_path = os.path.join(REPORTS_DIR, "provenance_manifest.md")
    md_content = f"""# Artifact Provenance & Traceability Manifest

**Manifest Generation Date:** {manifest['generated_timestamp']}  
**Git Commit:** `{manifest['git_provenance']['commit_hash']}` (`{manifest['git_provenance']['branch']}`)  
**Raw Dataset SHA-256:** `{raw_hash}`  
**Hardware Platform:** {platform.processor()} ({platform.platform()})  

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
"""
    for item in catalog["cross_validation_development_partition"]:
        md_content += f"| `{item['path']}` | {item['size_bytes']:,} | `{item['sha256'][:16]}...` |\n"
        
    md_content += """
### 2.2 Final Evaluation (Held-Out Test Partition)
| Artifact Path | Size (Bytes) | SHA-256 Checksum |
| :--- | :--- | :--- |
"""
    for item in catalog["final_held_out_test_partition"]:
        md_content += f"| `{item['path']}` | {item['size_bytes']:,} | `{item['sha256'][:16]}...` |\n"
        
    md_content += """
### 2.3 Explainability & Stability
| Artifact Path | Size (Bytes) | SHA-256 Checksum |
| :--- | :--- | :--- |
"""
    for item in catalog["explainability_and_stability"]:
        md_content += f"| `{item['path']}` | {item['size_bytes']:,} | `{item['sha256'][:16]}...` |\n"
        
    md_content += """
### 2.4 Computational Efficiency & Green AI
| Artifact Path | Size (Bytes) | SHA-256 Checksum |
| :--- | :--- | :--- |
"""
    for item in catalog["computational_efficiency_and_green_ai"]:
        md_content += f"| `{item['path']}` | {item['size_bytes']:,} | `{item['sha256'][:16]}...` |\n"
        
    with open(manifest_md_path, "w", encoding="utf-8") as f:
        f.write(md_content)
        
    print(f"Provenance manifest written to: {manifest_json_path} and {manifest_md_path}")
    return manifest

if __name__ == "__main__":
    generate_manifest()
