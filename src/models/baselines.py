"""
Module: baselines.py
Implements scientific reference baselines:
1. Conventional Activity-Data x Emission-Factor Accounting Baseline.
2. Property-Type Median Carbon Intensity Heuristic Baseline.
3. Global Mean Baseline.
"""
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, RegressorMixin

class ConventionalAccountingBaseline(BaseEstimator, RegressorMixin):
    """
    Conventional GHG Protocol Scope 1 & 2 emissions accounting model.
    Calculates TotalGHGEmissions = sum(Activity_k * EF_k).
    
    Default factors calibrated to EPA Portfolio Manager & Seattle City Light:
    - electricity_kwh: 0.00001972 MT CO2e / kWh
    - naturalgas_therms: 0.005299 MT CO2e / therm
    - steamuse_kbtu: 0.00008100 MT CO2e / kBtu
    """
    def __init__(
        self,
        ef_electricity: float = 0.00001972,
        ef_natural_gas: float = 0.005299,
        ef_steam: float = 0.00008100
    ):
        self.ef_electricity = ef_electricity
        self.ef_natural_gas = ef_natural_gas
        self.ef_steam = ef_steam
        
    def fit(self, X_activity: pd.DataFrame, y: np.ndarray = None):
        # Deterministic formula; no parameter learning required, but fits scikit-learn API
        self.is_fitted_ = True
        return self
        
    def predict(self, X_activity: pd.DataFrame) -> np.ndarray:
        """
        Predicts emissions directly from activity data.
        
        Args:
            X_activity: DataFrame with columns 'Electricity(kWh)', 'NaturalGas(therms)', 'SteamUse(kBtu)'.
        """
        elec = pd.to_numeric(X_activity.get("Electricity(kWh)", 0), errors="coerce").fillna(0).values
        gas = pd.to_numeric(X_activity.get("NaturalGas(therms)", 0), errors="coerce").fillna(0).values
        steam = pd.to_numeric(X_activity.get("SteamUse(kBtu)", 0), errors="coerce").fillna(0).values
        
        emissions = (
            elec * self.ef_electricity +
            gas * self.ef_natural_gas +
            steam * self.ef_steam
        )
        return np.maximum(0.0, emissions)

class MedianIntensityBaseline(BaseEstimator, RegressorMixin):
    """
    Non-ML heuristic benchmark for unmetered buildings:
    Calculates median carbon intensity (MT CO2e / sq ft) by property type on training data.
    Predicts: y_pred = PropertyGFATotal * MedianIntensity(BuildingType).
    """
    def __init__(self, group_col: str = "BuildingType", gfa_col: str = "PropertyGFATotal"):
        self.group_col = group_col
        self.gfa_col = gfa_col
        self.group_intensities_ = {}
        self.global_median_intensity_ = 0.000622 # ~0.62 kg CO2e / sqft default
        
    def fit(self, X_raw: pd.DataFrame, y: np.ndarray):
        df = X_raw.copy()
        gfa = pd.to_numeric(df[self.gfa_col], errors="coerce").fillna(1).values
        gfa = np.maximum(1, gfa)
        intensities = y / gfa
        
        df["_intensity"] = intensities
        self.group_intensities_ = df.groupby(self.group_col)["_intensity"].median().to_dict()
        self.global_median_intensity_ = float(np.median(intensities))
        self.is_fitted_ = True
        return self
        
    def predict(self, X_raw: pd.DataFrame) -> np.ndarray:
        df = X_raw.copy()
        gfa = pd.to_numeric(df.get(self.gfa_col, 1), errors="coerce").fillna(1.0).values
        gfa = np.maximum(0.0, gfa)
        
        # Safe group extraction with fallback to global training median
        groups = df.get(self.group_col, pd.Series(["Other"] * len(df))).fillna("Other").astype(str)
        intensities = np.array([self.group_intensities_.get(grp, self.global_median_intensity_) for grp in groups], dtype=float)
        
        preds = gfa * intensities
        return np.maximum(0.0, preds)

class MeanBaseline(BaseEstimator, RegressorMixin):
    """Predicts global training mean."""
    def __init__(self):
        self.mean_ = 0.0
        
    def fit(self, X, y: np.ndarray):
        self.mean_ = float(np.mean(y))
        self.is_fitted_ = True
        return self
        
    def predict(self, X) -> np.ndarray:
        return np.full(shape=(len(X),), fill_value=self.mean_)
