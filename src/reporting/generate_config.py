"""
Module: generate_config.py
Generates /results/config.json containing exact configuration, package versions, and reproducibility seeds.
"""
import os
import sys
import json
import platform
import importlib.metadata

def generate_config():
    results_dir = os.path.join(os.path.dirname(__file__), "..", "..", "results")
    os.makedirs(results_dir, exist_ok=True)
    
    packages_to_log = [
        "numpy",
        "pandas",
        "scipy",
        "scikit-learn",
        "xgboost",
        "lightgbm",
        "shap",
        "joblib",
        "pytest",
        "pyarrow"
    ]
    
    pkg_versions = {}
    for pkg in packages_to_log:
        try:
            pkg_versions[pkg] = importlib.metadata.version(pkg)
        except Exception:
            pkg_versions[pkg] = "not installed"
            
    config_payload = {
        "study": {
            "title": "Meter-free Annual Building GHG Emissions Estimation",
            "journal": "Journal of Building Engineering",
            "dataset": "Seattle Building Energy Benchmarking Data",
            "primary_grouping": "OSEBuildingID"
        },
        "reproducibility": {
            "random_seed": 42,
            "python_version": platform.python_version(),
            "os": platform.platform(),
            "package_versions": pkg_versions
        },
        "data_partitions": {
            "raw_records": 38309,
            "valid_target_records": 37069,
            "final_clean_records": 36730,
            "dropped_missing_target": 1240,
            "dropped_demolished": 325,
            "dropped_unit_reporting_errors": 14,
            "development_partition": {
                "facilities": 3024,
                "records": 29364,
                "fraction": 0.80
            },
            "held_out_test_partition": {
                "facilities": 757,
                "records": 7366,
                "fraction": 0.20,
                "policy": "Strictly held-out; touched once for final evaluation"
            }
        },
        "experimental_settings": {
            "target": "log1p(TotalGHGEmissions)",
            "inverse_transformation": "expm1(z)",
            "evaluation_scale": "Metric Tonnes CO2e",
            "cv_protocol": "5-fold GroupKFold by OSEBuildingID",
            "explanation_stability": {
                "bootstrap_refits": 50,
                "subsample_ratio": 0.80,
                "pairwise_comparisons": 1225
            },
            "gfa_perturbation": {
                "factor": 1.05,
                "derived_features_recomputed": [
                    "PropertyGFATotal",
                    "PropertyGFABuildings",
                    "FloorAreaPerFloor",
                    "ParkingRatio",
                    "LogGFATotal",
                    "LogGFABuildings"
                ]
            },
            "conformal_prediction": {
                "dev_split": "70% Fit / 15% Val / 15% Cal",
                "calibration_facilities": 455,
                "alpha_levels": [0.10, 0.20],
                "quantile_rule": "k = ceil((G_cal + 1) * (1 - alpha))",
                "methods": [
                    "Observation Split Conformal (Tonne)",
                    "Facility Split Conformal (Tonne)",
                    "Facility Split Conformal (Log)",
                    "Facility CQR (LightGBM)"
                ]
            },
            "applicability_domain": {
                "methods": [
                    "Gower 1-NN Distance (mixed continuous + categorical)",
                    "Robust Mahalanobis Distance (MinCovDet)",
                    "Feature Envelope Violations (Bounding Hyper-box)"
                ],
                "reference_partition": "Development partition only"
            }
        }
    }
    
    config_path = os.path.join(results_dir, "config.json")
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config_payload, f, indent=2)
        
    print(f"Reproducibility configuration written to: {config_path}")
    return config_payload

if __name__ == "__main__":
    generate_config()
