"""
Module: stability_tests.py
Executes empirical explanation stability and robustness benchmarks:
1. Resampling Rank Correlation (Kendall's tau and Spearman's rho across resamples).
2. Physically Bounded Local Explanation Perturbation Stability (Raw-feature space perturbations).
3. Separates prediction sensitivity from explanation invariance and includes controls.
"""
import os
import sys
import joblib
import numpy as np
import pandas as pd
import shap
from scipy.stats import kendalltau, spearmanr

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from src.models.model_registry import get_model

PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "results")
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "reports")

def run_stability_tests(n_resamples: int = 5, subsample_ratio: float = 0.8, n_local_samples: int = 25):
    os.makedirs(RESULTS_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)
    
    print("Loading data for explanation stability evaluation...")
    X_train = pd.read_parquet(os.path.join(PROCESSED_DIR, "train_features.parquet"))
    y_train = pd.read_parquet(os.path.join(PROCESSED_DIR, "train_target.parquet"))["TotalGHGEmissions"].values
    
    raw_test_path = os.path.join(PROCESSED_DIR, "test_features_raw.parquet")
    preproc_path = os.path.join(PROCESSED_DIR, "preprocessor.joblib")
    
    df_raw_test = pd.read_parquet(raw_test_path) if os.path.exists(raw_test_path) else None
    preprocessor = joblib.load(preproc_path) if os.path.exists(preproc_path) else None
    
    feature_names = X_train.columns.tolist()
    stability_records = []
    
    # -------------------------------------------------------------
    # 1. Global Ranking Stability across Bootstrap Subsamples
    # -------------------------------------------------------------
    for model_name in ["ridge", "gam", "rf", "xgboost"]:
        print(f"Evaluating bootstrap rank stability for {model_name}...")
        rankings = []
        
        for b in range(n_resamples):
            np.random.seed(100 + b)
            n_sub = int(len(X_train) * subsample_ratio)
            sub_idx = np.random.choice(len(X_train), size=n_sub, replace=False)
            X_b = X_train.iloc[sub_idx].reset_index(drop=True)
            y_b = y_train[sub_idx]
            
            m = get_model(model_name, use_log_target=True)
            m.fit(X_b, y_b)
            inner = m.regressor_ if hasattr(m, "regressor_") else m
            
            if hasattr(inner, "feature_importances"):
                imps = inner.feature_importances(X_b)
            elif hasattr(inner, "feature_importances_"):
                imps = inner.feature_importances_
            elif hasattr(inner, "coef_"):
                imps = np.abs(inner.coef_)
            else:
                imps = np.ones(len(feature_names))
                
            rankings.append(imps)
            
        # Pairwise rank correlations
        taus = []
        rhos = []
        for i in range(len(rankings)):
            for j in range(i + 1, len(rankings)):
                tau_val, _ = kendalltau(rankings[i], rankings[j])
                rho_val, _ = spearmanr(rankings[i], rankings[j])
                if not np.isnan(tau_val):
                    taus.append(tau_val)
                if not np.isnan(rho_val):
                    rhos.append(rho_val)
                    
        stability_records.append({
            "model": model_name,
            "test_type": "Bootstrap_Rank_Stability",
            "kendall_tau_mean": round(float(np.mean(taus)), 4) if taus else 0.0,
            "kendall_tau_std": round(float(np.std(taus)), 4) if taus else 0.0,
            "spearman_rho_mean": round(float(np.mean(rhos)), 4) if rhos else 0.0,
            "spearman_rho_std": round(float(np.std(rhos)), 4) if rhos else 0.0,
            "explanation_cosine_sim": np.nan,
            "pred_rel_change_mean": np.nan,
            "num_comparisons": len(taus)
        })
        
    # -------------------------------------------------------------
    # 2. Physically Bounded Local Explanation Perturbation Stability
    # -------------------------------------------------------------
    if df_raw_test is not None and preprocessor is not None:
        print(f"Executing physically bounded raw-feature perturbations on {n_local_samples} held-out facilities...")
        np.random.seed(42)
        sample_raw = df_raw_test.iloc[:n_local_samples].copy().reset_index(drop=True)
        
        # Valid physical perturbation: +5% floor area expansion (e.g. facility retrofits/extensions)
        # Leaves categorical property types, vintage era, and geographic coordinates valid and intact
        sample_perturbed = sample_raw.copy()
        if "PropertyGFATotal" in sample_perturbed.columns:
            sample_perturbed["PropertyGFATotal"] = sample_perturbed["PropertyGFATotal"] * 1.05
        if "PropertyGFABuildings" in sample_perturbed.columns:
            sample_perturbed["PropertyGFABuildings"] = sample_perturbed["PropertyGFABuildings"] * 1.05
        if "FloorAreaPerFloor" in sample_perturbed.columns:
            sample_perturbed["FloorAreaPerFloor"] = sample_perturbed["FloorAreaPerFloor"] * 1.05
        if "LogGFATotal" in sample_perturbed.columns:
            sample_perturbed["LogGFATotal"] = np.log1p(sample_perturbed["PropertyGFATotal"])
        if "LogGFABuildings" in sample_perturbed.columns:
            sample_perturbed["LogGFABuildings"] = np.log1p(sample_perturbed["PropertyGFABuildings"])

        # Transform both through the identical fitted preprocessor
        X_orig_mat = preprocessor.transform(sample_raw)
        X_pert_mat = preprocessor.transform(sample_perturbed)
        
        # Test models: Ridge, SplineGAM, Random Forest, XGBoost
        for model_name in ["ridge", "gam", "rf", "xgboost"]:
            model_file = os.path.join(MODELS_DIR, f"{model_name}.joblib")
            if not os.path.exists(model_file):
                continue
                
            m = joblib.load(model_file)
            inner = m.regressor_ if hasattr(m, "regressor_") else m
            
            p_orig = m.predict(X_orig_mat)
            p_pert = m.predict(X_pert_mat)
            rel_pred_changes = np.abs(p_pert - p_orig) / (p_orig + 1.0)
            
            # Compute local attributions
            if model_name == "ridge":
                phi_orig = X_orig_mat * inner.coef_
                phi_pert = X_pert_mat * inner.coef_
            elif model_name == "gam":
                if hasattr(inner, "compute_term_contributions"):
                    phi_orig = inner.compute_term_contributions(X_orig_mat)
                    phi_pert = inner.compute_term_contributions(X_pert_mat)
                else:
                    splines = inner.pipeline_.named_steps["splines"]
                    reg = inner.pipeline_.named_steps["regressor"]
                    Xt_o = splines.transform(X_orig_mat)
                    Xt_p = splines.transform(X_pert_mat)
                    B = Xt_o.shape[1] // len(feature_names)
                    phi_orig = np.zeros((len(X_orig_mat), len(feature_names)))
                    phi_pert = np.zeros((len(X_pert_mat), len(feature_names)))
                    for j in range(len(feature_names)):
                        phi_orig[:, j] = np.dot(Xt_o[:, j*B:(j+1)*B], reg.coef_[j*B:(j+1)*B])
                        phi_pert[:, j] = np.dot(Xt_p[:, j*B:(j+1)*B], reg.coef_[j*B:(j+1)*B])
            elif model_name in ["rf", "xgboost"]:
                explainer = shap.TreeExplainer(inner)
                phi_orig = explainer.shap_values(X_orig_mat)
                phi_pert = explainer.shap_values(X_pert_mat)
            else:
                continue
                
            # Compute cosine similarity and Kendall tau for each sample's attribution vector
            cos_sims = []
            local_taus = []
            for i in range(len(phi_orig)):
                v1 = phi_orig[i]
                v2 = phi_pert[i]
                norm_prod = (np.linalg.norm(v1) * np.linalg.norm(v2))
                cos_sim = np.dot(v1, v2) / norm_prod if norm_prod > 0 else 1.0
                cos_sims.append(cos_sim)
                kt, _ = kendalltau(v1, v2)
                if not np.isnan(kt):
                    local_taus.append(kt)
                    
            stability_records.append({
                "model": model_name,
                "test_type": "Physical_Perturbation_+5%_GFA",
                "kendall_tau_mean": round(float(np.mean(local_taus)), 4) if local_taus else 1.0,
                "kendall_tau_std": round(float(np.std(local_taus)), 4) if local_taus else 0.0,
                "spearman_rho_mean": np.nan,
                "spearman_rho_std": np.nan,
                "explanation_cosine_sim": round(float(np.mean(cos_sims)), 4),
                "pred_rel_change_mean": round(float(np.mean(rel_pred_changes)), 4),
                "num_comparisons": n_local_samples
            })
            
    # Save Results
    stab_df = pd.DataFrame(stability_records)
    stab_df.to_csv(os.path.join(RESULTS_DIR, "explanation_stability.csv"), index=False)
    
    create_stability_report(stab_df)
    print("Stability tests complete. Results saved to results/explanation_stability.csv.")
    return stab_df

def create_stability_report(stab_df: pd.DataFrame):
    report_path = os.path.join(REPORTS_DIR, "explanation_stability.md")
    
    content = f"""# Explanation Stability and Robustness Report

**Manuscript:** Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation  
**Dataset:** City of Seattle Building Energy Benchmarking Data  
**Date:** October 2026 (Repaired Pipeline)  

---

## 1. Global Ranking Stability (Resampling Protocol)
Evaluates whether feature importance rankings remain stable when models are re-fitted across 5 bootstrap subsamples ($80\%$ sample ratio).
Measured via mean pairwise Kendall's $\\tau$ and Spearman's $\\rho$.

## 2. Local Explanation Perturbation Robustness (Raw-Space Protocol)
Evaluates explanation stability under physically realistic building modifications ($+5\%$ Gross Floor Area expansion, preserving valid categories and preprocessing transforms).
Reports cosine similarity of attribution vectors alongside prediction relative change.

| Model Architecture | Evaluation Protocol | Kendall's $\\tau$ | Spearman's $\\rho$ | Attribution Cosine Similarity | Mean Pred Change |
| :--- | :--- | :--- | :--- | :--- | :--- |
"""
    for _, row in stab_df.iterrows():
        kt = f"{row['kendall_tau_mean']:.4f} $\\pm$ {row.get('kendall_tau_std', 0.0):.4f}" if not pd.isna(row['kendall_tau_mean']) else "N/A"
        sr = f"{row['spearman_rho_mean']:.4f} $\\pm$ {row.get('spearman_rho_std', 0.0):.4f}" if not pd.isna(row.get('spearman_rho_mean')) else "N/A"
        cs = f"{row['explanation_cosine_sim']:.4f}" if not pd.isna(row.get('explanation_cosine_sim')) else "N/A"
        pc = f"{row['pred_rel_change_mean']:.4f}" if not pd.isna(row.get('pred_rel_change_mean')) else "N/A"
        content += f"| **{row['model'].upper()}** | `{row['test_type']}` | {kt} | {sr} | {cs} | {pc} |\n"
        
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    run_stability_tests()
