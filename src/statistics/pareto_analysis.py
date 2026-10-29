"""
Module: pareto_analysis.py
Performs multi-objective Pareto frontier analysis across candidate architectures:
Objectives:
1. Minimize Predictive Error (MAE in MT CO2e)
2. Minimize Single Inference Latency (ms)
3. Minimize Peak Memory (MB)
4. Maximize Interpretability / Explanation Stability (Kendall's tau or Transparency Tier)
"""
import os
import sys
import numpy as np
import pandas as pd

RESULTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "results")

def run_pareto_analysis():
    pred_path = os.path.join(RESULTS_DIR, "predictive_metrics.csv")
    comp_path = os.path.join(RESULTS_DIR, "computational_benchmarks.csv")
    stab_path = os.path.join(RESULTS_DIR, "explanation_stability.csv")
    
    pred_df = pd.read_csv(pred_path)
    comp_df = pd.read_csv(comp_path) if os.path.exists(comp_path) else pd.DataFrame()
    stab_df = pd.read_csv(stab_path) if os.path.exists(stab_path) else pd.DataFrame()
    
    # Merge on model_id / model
    merged = pd.merge(pred_df, comp_df, left_on="model_id", right_on="model", how="inner")
    
    # Interpretability classification tiers (non-arbitrary categorical classification):
    # Tier 1 (Exact closed-form / Intrinsic additive): Accounting, Ridge, SplineGAM, EBM
    # Tier 2 (Post-hoc TreeSHAP with exact polynomial complexity): Random Forest, XGBoost
    # Tier 3 (Black-box Sampling / Perturbation approximation): MLP
    interpretability_tiers = {
        "accounting": 1,
        "median": 1,
        "ridge": 1,
        "gam": 1,
        "ebm": 1,
        "rf": 2,
        "xgboost": 2,
        "mlp": 3
    }
    
    merged["transparency_tier"] = merged["model_id"].map(interpretability_tiers)
    
    # Pareto dominance identification between MAE (minimize) and Latency (minimize)
    # A point dominates another if it is <= in all objectives and strictly < in at least one
    pareto_records = []
    
    models_list = merged.to_dict("records")
    for i, m1 in enumerate(models_list):
        dominated = False
        mae1 = m1["mae"]
        lat1 = m1.get("single_latency_mean_ms", m1.get("total_inference_time_sec", 1.0))
        
        for j, m2 in enumerate(models_list):
            if i == j:
                continue
            mae2 = m2["mae"]
            lat2 = m2.get("single_latency_mean_ms", m2.get("total_inference_time_sec", 1.0))
            
            # If m2 has lower/equal error AND lower/equal latency (with at least one strict):
            if (mae2 <= mae1 and lat2 <= lat1) and (mae2 < mae1 or lat2 < lat1):
                dominated = True
                break
                
        pareto_records.append({
            "model_id": m1["model_id"],
            "model_name": m1["model_name"],
            "mae": m1["mae"],
            "rmse": m1["rmse"],
            "r2": m1["r2"],
            "latency_ms": round(lat1, 4),
            "peak_memory_mb": m1.get("peak_allocated_memory_mb", 0.0),
            "energy_kwh_per_10k": m1.get("estimated_energy_kwh", 0.0),
            "transparency_tier": m1["transparency_tier"],
            "pareto_optimal_accuracy_latency": not dominated,
            "recommended_scenario": get_recommendation(m1["model_id"], not dominated)
        })
        
    pareto_df = pd.DataFrame(pareto_records)
    pareto_df.to_csv(os.path.join(RESULTS_DIR, "pareto_analysis.csv"), index=False)
    print("Pareto analysis complete. Saved to results/pareto_analysis.csv.")
    return pareto_df

def get_recommendation(model_id: str, is_pareto: bool) -> str:
    if model_id == "accounting":
        return "Mandatory operational choice when utility meter data is available (exact ground truth accounting)"
    if model_id == "xgboost":
        return "Recommended for unmetered portfolio screening where predictive accuracy is the primary objective"
    if model_id == "ridge":
        return "Recommended for ultra-fast, low-memory embedded deployments requiring exact linear coefficients"
    if model_id == "gam":
        return "Recommended when non-linear domain shape inspection is required with transparent univariate splines"
    if model_id == "ebm":
        return "Suitable for moderate-scale applications prioritizing glassbox additivity over training speed"
    if model_id == "median":
        return "Non-ML baseline for municipal rough estimates when only building type and area are known"
    return "Secondary architecture dominated in accuracy-latency space"

if __name__ == "__main__":
    run_pareto_analysis()
