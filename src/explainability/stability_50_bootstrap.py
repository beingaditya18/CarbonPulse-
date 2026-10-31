"""
Module: stability_50_bootstrap.py
Author: CarbonPulse Research Engineering Team
Description:
    Scaled Explanation Stability Experiment executing 50 bootstrap refits.
    Quantifies the rank stability of global feature importance and SHAP attributions:
    - XGBoost: Mean absolute TreeSHAP values across background instances.
    - Random Forest: Mean absolute TreeSHAP values across background instances.
    - Ridge Regression: Absolute standardized regression coefficients.
    - SplineGAM: Standard deviation of univariate spline component functions.
    
    Evaluates all unique C(50, 2) = 1,225 pairwise refit combinations via Kendall's tau (tau)
    and Spearman's rank correlation (rho).
    
    Outputs:
    - Strictly typed JSON file optimized for direct ingestion by Next.js 15 / Recharts frontend.
    - Comprehensive CSV summaries.
    - Detailed scientific Markdown report.
"""
import os
import sys
import json
import time
import logging
from typing import Dict, List, Any, Tuple
import numpy as np
import pandas as pd
import shap
from scipy.stats import kendalltau, spearmanr

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from src.models.model_registry import get_model

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("Stability50")

PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "results")
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "reports")

RANDOM_SEED = 42

def extract_global_importance(
    model: Any,
    model_name: str,
    X_sample: np.ndarray,
    feature_count: int
) -> np.ndarray:
    """
    Extracts global feature importance vectors tailored to model architecture:
    - For Tree Ensembles (XGBoost, RF): Computes mean absolute TreeSHAP values.
    - For Ridge: Computes absolute standardized linear weights.
    - For SplineGAM: Computes sample standard deviation of spline basis shape functions.
    """
    inner = model.regressor_ if hasattr(model, "regressor_") else model

    if model_name in ["xgboost", "xgb"]:
        # TreeSHAP for XGBoost
        explainer = shap.TreeExplainer(inner)
        shap_vals = explainer.shap_values(X_sample)
        # Average absolute impact per feature
        return np.mean(np.abs(shap_vals), axis=0)

    elif model_name in ["rf", "random_forest"]:
        # TreeSHAP for Random Forest
        explainer = shap.TreeExplainer(inner)
        shap_vals = explainer.shap_values(X_sample)
        return np.mean(np.abs(shap_vals), axis=0)

    elif model_name == "ridge":
        # Standardized linear coefficients
        if hasattr(inner, "coef_"):
            return np.abs(inner.coef_)
        return np.ones(feature_count)

    elif model_name == "gam":
        # SplineGAM component dispersion
        if hasattr(inner, "feature_importances"):
            return inner.feature_importances(X_sample)
        elif hasattr(inner, "compute_term_contributions"):
            terms = inner.compute_term_contributions(X_sample)
            return np.std(terms, axis=0)
        else:
            return np.ones(feature_count)

    else:
        # Fallback to feature_importances_ if present
        if hasattr(inner, "feature_importances_"):
            return inner.feature_importances_
        return np.ones(feature_count)

def compute_pairwise_correlations(rankings: List[np.ndarray]) -> Tuple[List[float], List[float]]:
    """
    Computes pairwise Kendall's tau and Spearman's rho across all unique C(N, 2) pairs.
    """
    n = len(rankings)
    taus: List[float] = []
    rhos: List[float] = []

    for i in range(n):
        for j in range(i + 1, n):
            t_val, _ = kendalltau(rankings[i], rankings[j])
            r_val, _ = spearmanr(rankings[i], rankings[j])
            if not np.isnan(t_val):
                taus.append(float(t_val))
            if not np.isnan(r_val):
                rhos.append(float(r_val))

    return taus, rhos

def compute_distribution_stats(values: List[float]) -> Dict[str, float]:
    """Computes summary statistics for a 1D distribution array."""
    arr = np.array(values, dtype=np.float64)
    if len(arr) == 0:
        return {"mean": 0.0, "std": 0.0, "median": 0.0, "min": 0.0, "max": 0.0, "q25": 0.0, "q75": 0.0}
    return {
        "mean": round(float(np.mean(arr)), 4),
        "std": round(float(np.std(arr, ddof=1)), 4),
        "median": round(float(np.median(arr)), 4),
        "min": round(float(np.min(arr)), 4),
        "max": round(float(np.max(arr)), 4),
        "q25": round(float(np.percentile(arr, 25)), 4),
        "q75": round(float(np.percentile(arr, 75)), 4)
    }

def run_scaled_stability_experiment(
    n_bootstrap: int = 50,
    subsample_ratio: float = 0.8,
    eval_sample_size: int = 150,
    models: List[str] = None
) -> Dict[str, Any]:
    """
    Executes the 50-bootstrap refit stability experiment.
    
    Args:
        n_bootstrap: Number of bootstrap iterations (default 50).
        subsample_ratio: Fraction of training instances sampled per bootstrap (default 0.8).
        eval_sample_size: Representative background sample size for TreeSHAP evaluations (default 150).
        models: List of model identifiers.
        
    Returns:
        Structured JSON dictionary ready for Recharts / Next.js 15 consumption.
    """
    os.makedirs(RESULTS_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)

    if models is None:
        models = ["xgboost", "rf", "ridge", "gam"]

    logger.info("Initializing 50-Bootstrap Explanation Stability Experiment")
    logger.info("Iterations: %d | Subsample Ratio: %.2f | Models: %s", n_bootstrap, subsample_ratio, models)

    # 1. Load Training and Test Data
    X_train_df = pd.read_parquet(os.path.join(PROCESSED_DIR, "train_features.parquet"))
    y_train = pd.read_parquet(os.path.join(PROCESSED_DIR, "train_target.parquet"))["TotalGHGEmissions"].values
    feature_names = X_train_df.columns.tolist()
    n_features = len(feature_names)
    n_train = len(X_train_df)

    logger.info("Loaded training data: %d observations across %d features.", n_train, n_features)

    # 2. Fixed Background Reference for SHAP
    np.random.seed(RANDOM_SEED)
    eval_indices = np.random.choice(n_train, size=min(eval_sample_size, n_train), replace=False)
    X_eval = X_train_df.iloc[eval_indices].values

    # Containers for results
    model_rankings: Dict[str, List[np.ndarray]] = {m: [] for m in models}
    model_distributions: Dict[str, Dict[str, List[float]]] = {}
    model_summaries: List[Dict[str, Any]] = []

    expected_pairs = (n_bootstrap * (n_bootstrap - 1)) // 2
    logger.info("Expected pairwise comparisons per model: %d", expected_pairs)

    # 3. Execute Bootstrap Refits
    display_names = {
        "xgboost": "XGBoost (TreeSHAP)",
        "rf": "Random Forest (TreeSHAP)",
        "ridge": "Ridge Regression (|Beta|)",
        "gam": "SplineGAM (Basis SD)"
    }

    for model_name in models:
        logger.info("Starting 50 bootstrap refits for %s...", model_name.upper())
        t0_model = time.perf_counter()

        for b in range(n_bootstrap):
            # Deterministic seed progression
            bootstrap_seed = RANDOM_SEED + b
            np.random.seed(bootstrap_seed)

            # Sample without replacement at subsample_ratio
            sample_size = int(n_train * subsample_ratio)
            b_idx = np.random.choice(n_train, size=sample_size, replace=False)
            X_b = X_train_df.iloc[b_idx].values
            y_b = y_train[b_idx]

            # Fit model
            m = get_model(model_name, use_log_target=True)
            m.fit(X_b, y_b)

            # Extract global feature importance
            imps = extract_global_importance(m, model_name, X_eval, n_features)
            model_rankings[model_name].append(imps)

            if (b + 1) % 10 == 0 or (b + 1) == n_bootstrap:
                logger.info("[%s] Completed %d/%d bootstrap refits (%.1fs elapsed)",
                            model_name.upper(), b + 1, n_bootstrap, time.perf_counter() - t0_model)

        # 4. Compute Pairwise Correlations
        taus, rhos = compute_pairwise_correlations(model_rankings[model_name])
        model_distributions[model_name] = {
            "kendallTau": [round(v, 4) for v in taus],
            "spearmanRho": [round(v, 4) for v in rhos]
        }

        tau_stats = compute_distribution_stats(taus)
        rho_stats = compute_distribution_stats(rhos)

        model_summaries.append({
            "modelId": model_name,
            "displayName": display_names.get(model_name, model_name),
            "totalComparisons": len(taus),
            "kendallTau": tau_stats,
            "spearmanRho": rho_stats
        })

    # 5. Compute Feature Importance Stability Across Refits
    feature_variability = []
    for f_idx, f_name in enumerate(feature_names):
        entry = {"feature": f_name}
        for model_name in models:
            # Array of shape (50, n_features)
            mat = np.array(model_rankings[model_name])
            feat_vals = mat[:, f_idx]
            entry[f"{model_name}Mean"] = round(float(np.mean(feat_vals)), 4)
            entry[f"{model_name}Std"] = round(float(np.std(feat_vals, ddof=1)), 4)
        feature_variability.append(entry)

    # Sort features by XGBoost mean importance descending
    feature_variability.sort(key=lambda x: x.get("xgboostMean", 0.0), reverse=True)

    # 6. Recharts-Optimized Boxplot / Distribution Points
    recharts_summary = []
    for s in model_summaries:
        m_id = s["modelId"]
        kt = s["kendallTau"]
        sr = s["spearmanRho"]
        recharts_summary.append({
            "model": s["displayName"],
            "modelId": m_id,
            "tauMean": kt["mean"],
            "tauStd": kt["std"],
            "tauMedian": kt["median"],
            "tauMin": kt["min"],
            "tauMax": kt["max"],
            "tauQ25": kt["q25"],
            "tauQ75": kt["q75"],
            "rhoMean": sr["mean"],
            "rhoStd": sr["std"],
            "rhoMedian": sr["median"],
            "rhoMin": sr["min"],
            "rhoMax": sr["max"],
            "rhoQ25": sr["q25"],
            "rhoQ75": sr["q75"]
        })

    # 7. Construct Full JSON Output
    output_payload: Dict[str, Any] = {
        "metadata": {
            "experiment": "50_bootstrap_refit_explanation_stability",
            "date": time.strftime("%Y-%m-%d"),
            "nBootstrapRefits": n_bootstrap,
            "totalPairwiseComparisons": expected_pairs,
            "subsampleRatio": subsample_ratio,
            "randomSeed": RANDOM_SEED,
            "featureCount": n_features,
            "modelsEvaluated": models,
            "explanationMethods": {
                "xgboost": "TreeSHAP (Mean Absolute Attribution)",
                "rf": "TreeSHAP (Mean Absolute Attribution)",
                "ridge": "Standardized Linear Regression Absolute Coefficients",
                "gam": "SplineGAM Basis Function Standard Deviation"
            }
        },
        "summary": model_summaries,
        "rechartsData": recharts_summary,
        "topFeaturesStability": feature_variability[:15],
        "distributions": model_distributions
    }

    # 8. Save Artifacts
    json_path = os.path.join(RESULTS_DIR, "explanation_stability_50_refits.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(output_payload, f, indent=2)

    # Save CSV summary
    csv_rows = []
    for s in model_summaries:
        csv_rows.append({
            "model": s["modelId"],
            "display_name": s["displayName"],
            "comparisons": s["totalComparisons"],
            "kendall_tau_mean": s["kendallTau"]["mean"],
            "kendall_tau_std": s["kendallTau"]["std"],
            "kendall_tau_median": s["kendallTau"]["median"],
            "kendall_tau_min": s["kendallTau"]["min"],
            "kendall_tau_max": s["kendallTau"]["max"],
            "spearman_rho_mean": s["spearmanRho"]["mean"],
            "spearman_rho_std": s["spearmanRho"]["std"],
            "spearman_rho_median": s["spearmanRho"]["median"],
            "spearman_rho_min": s["spearmanRho"]["min"],
            "spearman_rho_max": s["spearmanRho"]["max"]
        })
    csv_df = pd.DataFrame(csv_rows)
    csv_path = os.path.join(RESULTS_DIR, "explanation_stability_50_summary.csv")
    csv_df.to_csv(csv_path, index=False)

    # Markdown Report
    report_md_path = os.path.join(REPORTS_DIR, "explanation_stability_50_report.md")
    report_content = f"""# Scaled Explanation Stability Report (50 Bootstrap Refits)

**Experiment:** 50 Bootstrap Refits ($80\\%$ Subsample Ratio, $\\binom{{50}}{{2}} = 1,225$ Pairwise Comparisons)  
**Models:** XGBoost (TreeSHAP), Random Forest (TreeSHAP), Ridge Regression ($|\\beta|$), SplineGAM (Basis SD)  
**Seed Protocol:** Deterministic sequence starting at Seed {RANDOM_SEED}  
**Frontend Export:** JSON optimized for Next.js 15 / Recharts available at `results/explanation_stability_50_refits.json`  

---

## 1. Global Ranking Stability Summary (Mean $\\pm$ Standard Deviation)

| Model Architecture | Attribution Method | Pairwise Pairs | Kendall's $\\tau$ (Mean $\\pm$ SD) | Spearman's $\\rho$ (Mean $\\pm$ SD) | $\\tau$ Median [Min, Max] |
| :--- | :--- | :--- | :--- | :--- | :--- |
"""
    for _, r in csv_df.iterrows():
        kt_str = f"{r['kendall_tau_mean']:.4f} $\\pm$ {r['kendall_tau_std']:.4f}"
        sr_str = f"{r['spearman_rho_mean']:.4f} $\\pm$ {r['spearman_rho_std']:.4f}"
        range_str = f"{r['kendall_tau_median']:.4f} [{r['kendall_tau_min']:.4f}, {r['kendall_tau_max']:.4f}]"
        report_content += f"| **{r['display_name']}** | `{output_payload['metadata']['explanationMethods'].get(r['model'], 'N/A')}` | {r['comparisons']:,} | {kt_str} | {sr_str} | {range_str} |\n"

    report_content += "\n---\n\n## 2. Top-10 Features by Stability & Attribution Magnitude\n\n"
    report_content += "| Feature Name | XGBoost (Mean $\\pm$ SD) | Random Forest (Mean $\\pm$ SD) | Ridge (Mean $\\pm$ SD) | SplineGAM (Mean $\\pm$ SD) |\n"
    report_content += "| :--- | :--- | :--- | :--- | :--- |\n"
    for feat in feature_variability[:10]:
        report_content += (
            f"| `{feat['feature']}` "
            f"| {feat.get('xgboostMean', 0):.3f} $\\pm$ {feat.get('xgboostStd', 0):.3f} "
            f"| {feat.get('rfMean', 0):.3f} $\\pm$ {feat.get('rfStd', 0):.3f} "
            f"| {feat.get('ridgeMean', 0):.3f} $\\pm$ {feat.get('ridgeStd', 0):.3f} "
            f"| {feat.get('gamMean', 0):.3f} $\\pm$ {feat.get('gamStd', 0):.3f} |\n"
        )

    with open(report_md_path, "w", encoding="utf-8") as f:
        f.write(report_content)

    # Console Summary
    print("\n" + "=" * 80)
    print("50-BOOTSTRAP EXPLANATION STABILITY BENCHMARK (1,225 PAIRWISE COMPARISONS)")
    print("=" * 80)
    print(f"{'MODEL':<24} | {'KENDALL TAU (MEAN ± SD)':<26} | {'SPEARMAN RHO (MEAN ± SD)':<26}")
    print("-" * 80)
    for _, r in csv_df.iterrows():
        kt_col = f"{r['kendall_tau_mean']:.4f} ± {r['kendall_tau_std']:.4f}"
        sr_col = f"{r['spearman_rho_mean']:.4f} ± {r['spearman_rho_std']:.4f}"
        print(f"{r['display_name']:<24} | {kt_col:<26} | {sr_col:<26}")
    print("=" * 80)

    logger.info("Saved 50-bootstrap stability artifacts to:")
    logger.info("  JSON: %s", json_path)
    logger.info("  CSV:  %s", csv_path)
    logger.info("  MD:   %s", report_md_path)

    return output_payload

if __name__ == "__main__":
    run_scaled_stability_experiment()

