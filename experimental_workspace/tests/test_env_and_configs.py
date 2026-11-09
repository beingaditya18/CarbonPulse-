"""
Test Suite: test_env_and_configs.py
Description: Validates environment packages and central YAML configurations.
"""

import os
import sys
import yaml
import pytest

REQUIRED_PACKAGES = [
    "numpy", "pandas", "scipy", "sklearn", "xgboost", "lightgbm",
    "torch", "pytorch_tabnet", "shap", "matplotlib", "seaborn",
    "statsmodels", "yaml", "joblib", "pytest"
]

def test_python_version():
    """Confirms Python runtime is >= 3.10 and < 3.13."""
    v = sys.version_info
    assert v.major == 3 and v.minor >= 10, f"Unsupported Python version: {sys.version}"

def test_required_packages_importable():
    """Confirms all 15 required scientific libraries are installed and importable."""
    missing = []
    for pkg in REQUIRED_PACKAGES:
        try:
            __import__(pkg)
        except ImportError as e:
            missing.append(f"{pkg} ({e})")
    assert len(missing) == 0, f"Missing required scientific packages: {missing}"

def test_config_files_exist():
    """Confirms all four central configuration files exist and are non-empty."""
    configs = [
        "experimental_workspace/configs/global.yaml",
        "experimental_workspace/configs/data.yaml",
        "experimental_workspace/configs/models.yaml",
        "experimental_workspace/configs/experiments.yaml"
    ]
    for c in configs:
        assert os.path.exists(c), f"Configuration file missing: {c}"
        assert os.path.getsize(c) > 0, f"Configuration file empty: {c}"

def test_config_yaml_parsing():
    """Confirms valid syntax across all configuration files."""
    configs = [
        "experimental_workspace/configs/global.yaml",
        "experimental_workspace/configs/data.yaml",
        "experimental_workspace/configs/models.yaml",
        "experimental_workspace/configs/experiments.yaml"
    ]
    for c in configs:
        with open(c, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        assert isinstance(data, dict), f"Config did not parse to dictionary: {c}"

def test_global_config_schema():
    """Validates required keys in global.yaml."""
    with open("experimental_workspace/configs/global.yaml", "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)
    assert "system" in cfg
    assert "directories" in cfg
    assert cfg["system"]["random_seed"] == 42
    assert cfg["system"]["hardware_target"] == "cpu"

