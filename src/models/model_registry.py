"""
Module: model_registry.py
Factory for instantiating and configuring all candidate regression architectures:
1. ConventionalAccountingBaseline (Scope 1+2 activity meter formula)
2. MedianIntensityBaseline (Property-type median carbon intensity)
3. Ridge Regression (L2 regularized linear model)
4. Generalized Additive Model (SplineGAM: B-splines + L2 regularization)
5. Explainable Boosting Machine (EBM: InterpretML glassbox model)
6. Random Forest Regressor
7. XGBoost Regressor
8. Multilayer Perceptron (MLP) Regressor
"""
import os
import sys
import yaml
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import SplineTransformer
from sklearn.pipeline import Pipeline
from sklearn.compose import TransformedTargetRegressor
import xgboost as xgb
from interpret.glassbox import ExplainableBoostingRegressor

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from src.models.baselines import (
    ConventionalAccountingBaseline,
    MedianIntensityBaseline,
    MeanBaseline
)

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "configs", "experiment.yaml")

def load_config(path: str = CONFIG_PATH) -> dict:
    if os.path.exists(path):
        with open(path, "r") as f:
            return yaml.safe_load(f)
    return {}

from sklearn.base import BaseEstimator, RegressorMixin

class SplineGAMRegressor(BaseEstimator, RegressorMixin):
    """
    Generalized Additive Model (GAM) formulation via univariate B-spline basis expansion
    and ridge penalty, fitting f(X) = sum_j f_j(X_j).
    """
    def __init__(self, n_knots: int = 5, degree: int = 3, alpha: float = 10.0, random_state: int = 42):
        self.n_knots = n_knots
        self.degree = degree
        self.alpha = alpha
        self.random_state = random_state
        
    def _build_pipeline(self):
        return Pipeline([
            ("splines", SplineTransformer(n_knots=self.n_knots, degree=self.degree, include_bias=False)),
            ("regressor", Ridge(alpha=self.alpha, random_state=self.random_state))
        ])
        
    def fit(self, X, y):
        self.pipeline_ = self._build_pipeline()
        self.pipeline_.fit(X, y)
        self.is_fitted_ = True
        return self
        
    def predict(self, X):
        preds = self.pipeline_.predict(X)
        return np.maximum(0.0, preds)
        
    @property
    def coef_(self):
        return self.pipeline_.named_steps["regressor"].coef_

def get_model(model_name: str, config: dict = None, use_log_target: bool = True):
    """
    Factory creating configured model instance.
    
    Args:
        model_name: Identifier in ['accounting', 'median', 'mean', 'ridge', 'gam', 'ebm', 'rf', 'xgboost', 'mlp'].
        config: Dictionary of model parameters (loaded from experiment.yaml if None).
        use_log_target: Whether to wrap model in TransformedTargetRegressor(func=np.log1p, inverse_func=np.expm1).
        
    Returns:
        Configured scikit-learn compatible estimator.
    """
    if config is None:
        config = load_config()
        
    cfg_models = config.get("models", {})
    seed = config.get("experiment", {}).get("random_seed", 42)
    
    name = model_name.lower().strip()
    
    if name in ["accounting", "conventional"]:
        ac_cfg = cfg_models.get("baseline_accounting", {}).get("factors", {})
        return ConventionalAccountingBaseline(
            ef_electricity=ac_cfg.get("electricity_kwh", 0.00001972),
            ef_natural_gas=ac_cfg.get("naturalgas_therms", 0.005299),
            ef_steam=ac_cfg.get("steamuse_kbtu", 0.00008100)
        )
        
    if name in ["median", "heuristic"]:
        return MedianIntensityBaseline(group_col="BuildingType", gfa_col="PropertyGFATotal")
        
    if name in ["mean"]:
        return MeanBaseline()
        
    # Machine Learning Models
    if name == "ridge":
        r_cfg = cfg_models.get("ridge", {})
        base_model = Ridge(
            alpha=r_cfg.get("alpha", 10.0),
            random_state=seed
        )
    elif name == "gam":
        gam_cfg = cfg_models.get("gam", {})
        base_model = SplineGAMRegressor(
            n_knots=gam_cfg.get("n_knots", 5),
            degree=gam_cfg.get("degree", 3),
            alpha=gam_cfg.get("alpha", 10.0),
            random_state=seed
        )
    elif name == "ebm":
        ebm_cfg = cfg_models.get("ebm", {})
        base_model = ExplainableBoostingRegressor(
            max_bins=ebm_cfg.get("max_bins", 256),
            max_interaction_bins=ebm_cfg.get("max_interaction_bins", 32),
            interactions=ebm_cfg.get("interactions", 10),
            outer_bags=ebm_cfg.get("outer_bags", 8),
            inner_bags=ebm_cfg.get("inner_bags", 0),
            learning_rate=ebm_cfg.get("learning_rate", 0.05),
            random_state=seed
        )
    elif name in ["rf", "random_forest"]:
        rf_cfg = cfg_models.get("random_forest", {})
        base_model = RandomForestRegressor(
            n_estimators=rf_cfg.get("n_estimators", 150),
            max_depth=rf_cfg.get("max_depth", 16),
            min_samples_split=rf_cfg.get("min_samples_split", 5),
            min_samples_leaf=rf_cfg.get("min_samples_leaf", 2),
            n_jobs=rf_cfg.get("n_jobs", -1),
            random_state=seed
        )
    elif name in ["xgboost", "xgb"]:
        xgb_cfg = cfg_models.get("xgboost", {})
        base_model = xgb.XGBRegressor(
            n_estimators=xgb_cfg.get("n_estimators", 200),
            max_depth=xgb_cfg.get("max_depth", 6),
            learning_rate=xgb_cfg.get("learning_rate", 0.05),
            subsample=xgb_cfg.get("subsample", 0.8),
            colsample_bytree=xgb_cfg.get("colsample_bytree", 0.8),
            n_jobs=xgb_cfg.get("n_jobs", -1),
            random_state=seed
        )
    elif name in ["mlp", "neural_net"]:
        mlp_cfg = cfg_models.get("mlp", {})
        base_model = MLPRegressor(
            hidden_layer_sizes=tuple(mlp_cfg.get("hidden_layer_sizes", [128, 64])),
            activation=mlp_cfg.get("activation", "relu"),
            alpha=mlp_cfg.get("alpha", 0.001),
            learning_rate_init=mlp_cfg.get("learning_rate_init", 0.001),
            max_iter=mlp_cfg.get("max_iter", 200),
            early_stopping=mlp_cfg.get("early_stopping", True),
            random_state=seed
        )
    else:
        raise ValueError(f"Unknown model identifier: '{model_name}'")
        
    # Wrap in TransformedTargetRegressor with log1p / expm1 if requested to handle extreme positive skew
    if use_log_target and name not in ["accounting", "median", "mean"]:
        return TransformedTargetRegressor(
            regressor=base_model,
            func=np.log1p,
            inverse_func=np.expm1
        )
        
    return base_model

if __name__ == "__main__":
    for m in ["accounting", "median", "ridge", "gam", "ebm", "rf", "xgboost", "mlp"]:
        inst = get_model(m)
        print(f"Model '{m}': instantiated successfully -> {type(inst).__name__}")
