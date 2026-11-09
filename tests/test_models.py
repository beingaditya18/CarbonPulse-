"""
Unit and Integration Tests for Model Registry and Estimation Baselines.
Verifies estimator contracts, prediction shapes, and non-negative constraints.
"""
import os
import sys
import pytest
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.models.baselines import ConventionalAccountingBaseline, MedianIntensityBaseline
from src.models.model_registry import get_model

def test_conventional_accounting_baseline():
    ac = ConventionalAccountingBaseline()
    test_activity = pd.DataFrame({
        "Electricity(kWh)": [100000.0, 50000.0],
        "NaturalGas(therms)": [1000.0, 0.0],
        "SteamUse(kBtu)": [0.0, 20000.0]
    })
    preds = ac.predict(test_activity)
    assert len(preds) == 2
    assert (preds >= 0).all()
    # 100,000 * 0.00001972 + 1,000 * 0.005299 = 1.972 + 5.299 = 7.271 MT CO2e
    assert np.isclose(preds[0], 7.271, atol=1e-2)

def test_median_intensity_baseline():
    X_sample = pd.DataFrame({
        "BuildingType": ["NonResidential", "NonResidential", "Multifamily", "Multifamily"],
        "PropertyGFATotal": [100000, 200000, 50000, 100000]
    })
    y_sample = np.array([100.0, 200.0, 25.0, 50.0]) # intensity = 0.001 and 0.0005
    
    med = MedianIntensityBaseline()
    med.fit(X_sample, y_sample)
    preds = med.predict(X_sample)
    assert len(preds) == 4
    assert np.allclose(preds, y_sample)

@pytest.mark.parametrize("model_name", ["ridge", "gam", "rf", "xgboost", "mlp", "ebm"])
def test_ml_models_fit_and_predict_smoke(model_name):
    # Small synthetic sample with 5 features
    np.random.seed(42)
    X = pd.DataFrame(np.random.randn(30, 5), columns=[f"feat_{i}" for i in range(5)])
    y = np.random.uniform(5.0, 100.0, size=30)
    
    model = get_model(model_name, use_log_target=True)
    model.fit(X, y)
    preds = model.predict(X)
    
    assert len(preds) == 30
    assert not np.isnan(preds).any(), f"{model_name} produced NaN predictions"
    assert (preds >= 0).all(), f"{model_name} produced negative emissions predictions"
