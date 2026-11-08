"""
Module: task1_parsimonious_ablation.py
Path: experimental_workspace/src/empirical_revision/task1_parsimonious_ablation.py
Author: Aditya Mandloi, Dr. Ashok Kumar Gupta
Affiliation: School of Data Science and Forecasting, Devi Ahilya Vishwavidyalaya, Indore, India
Description:
    Task 1.2: Parsimonious Feature Ablation via TreeSHAP Global Importance.
    Identifies the minimal feature subset (e.g. top 5 to 8 features) capable of matching
    the full 59-feature model's predictive power, evaluating across K in [3, 5, 8, 12, 20, 35, 59],
    conducting paired permutation tests against the full model and naive median baselines.
"""

import os
import sys
import json
import logging
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
import xgboost as xgb
import shap
from scipy import stats
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error, median_absolute_error
import matplotlib.pyplot as plt

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("Task1Ablation")

def compute_global_shap_importance(
    X_train: pd.DataFrame,
    z_train: np.ndarray,
    seed: int = 42
) -> pd.DataFrame:
    """
    Fits an XGBoost model on the log-transformed target and computes
    mean absolute TreeSHAP values across training observations.
    """
    logger.info("Fitting base XGBoost model to determine global TreeSHAP feature importance...")
    model = xgb.XGBRegressor(
        n_estimators=150,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=seed,
        n_jobs=-1
    )
    model.fit(X_train, z_train)

    logger.info("Computing TreeSHAP values for global ranking...")
    explainer = shap.TreeExplainer(model)
    # Subsample 1,000 background instances for fast and exact TreeSHAP computation
    rng = np.random.RandomState(seed)
    eval_idx = rng.choice(len(X_train), size=min(1000, len(X_train)), replace=False)
    shap_vals = explainer.shap_values(X_train.iloc[eval_idx])

    mean_abs_shap = np.mean(np.abs(shap_vals), axis=0)
    feat_df = pd.DataFrame({
        "feature": X_train.columns,
        "mean_abs_shap": mean_abs_shap
    }).sort_values("mean_abs_shap", ascending=False).reset_index(drop=True)

    feat_df["rank"] = np.arange(1, len(feat_df) + 1)
    logger.info(f"Top 5 most impactful features: {list(feat_df['feature'].iloc[:5])}")
    return feat_df

def evaluate_ablation_subsets(
    X_train: pd.DataFrame,
    y_train: np.ndarray,
    z_train: np.ndarray,
    X_test: pd.DataFrame,
    y_test: np.ndarray,
    z_test: np.ndarray,
    ranked_features: List[str],
    subset_sizes: List[int] = [3, 5, 8, 12, 20, 35, 59],
    seed: int = 42
) -> Tuple[pd.DataFrame, Dict[str, np.ndarray]]:
    """
    Iteratively fits XGBoost on top-K features and calculates held-out test metrics.
    Also collects prediction vectors for paired significance testing.
    """
    results = []
    predictions_dict = {}

    # 1. Median Baseline Heuristic
    med_val = float(np.median(y_train))
    med_preds = np.full_like(y_test, med_val)
    predictions_dict["Median_Baseline"] = med_preds

    med_r2 = r2_score(y_test, med_preds)
    med_mae = mean_absolute_error(y_test, med_preds)
    med_rmse = np.sqrt(mean_squared_error(y_test, med_preds))
    med_medae = median_absolute_error(y_test, med_preds)
    med_z_preds = np.log1p(med_preds)
    med_log_r2 = r2_score(z_test, med_z_preds)
    med_log_mae = mean_absolute_error(z_test, med_z_preds)

    results.append({
        "model_type": "Heuristic_Baseline",
        "k_features": 0,
        "features": "Median_Only",
        "r2_physical": float(med_r2),
        "mae_physical": float(med_mae),
        "rmse_physical": float(med_rmse),
        "medae_physical": float(med_medae),
        "r2_log": float(med_log_r2),
        "mae_log": float(med_log_mae)
    })

    # 2. Iterate over feature subsets
    for k in subset_sizes:
        if k > len(ranked_features):
            k = len(ranked_features)
        top_k_feats = ranked_features[:k]
        logger.info(f"Training XGBoost on top K={k} features...")

        X_tr_k = X_train[top_k_feats]
        X_te_k = X_test[top_k_feats]

        model = xgb.XGBRegressor(
            n_estimators=150,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=seed,
            n_jobs=-1
        )
        model.fit(X_tr_k, z_train)

        z_pred = model.predict(X_te_k)
        y_pred = np.clip(np.expm1(z_pred), 0.0, 100000.0)
        predictions_dict[f"Top_{k}"] = y_pred

        r2_phys = r2_score(y_test, y_pred)
        mae_phys = mean_absolute_error(y_test, y_pred)
        rmse_phys = np.sqrt(mean_squared_error(y_test, y_pred))
        medae_phys = median_absolute_error(y_test, y_pred)
        r2_l = r2_score(z_test, z_pred)
        mae_l = mean_absolute_error(z_test, z_pred)

        results.append({
            "model_type": f"XGBoost_Top_{k}",
            "k_features": k,
            "features": ";".join(top_k_feats),
            "r2_physical": float(r2_phys),
            "mae_physical": float(mae_phys),
            "rmse_physical": float(rmse_phys),
            "medae_physical": float(medae_phys),
            "r2_log": float(r2_l),
            "mae_log": float(mae_l)
        })

    return pd.DataFrame(results), predictions_dict

def paired_statistical_test(
    y_true: np.ndarray,
    y_pred_a: np.ndarray,
    y_pred_b: np.ndarray,
    name_a: str,
    name_b: str,
    n_permutations: int = 5000,
    seed: int = 42
) -> Dict[str, Any]:
    """
    Performs a paired sign-flip permutation test and bootstrap CI on absolute errors.
    H0: Mean absolute error of model A equals model B.
    """
    err_a = np.abs(y_true - y_pred_a)
    err_b = np.abs(y_true - y_pred_b)
    diff = err_a - err_b  # Negative diff means A is better (lower error)
    obs_mean_diff = float(np.mean(diff))

    rng = np.random.RandomState(seed)
    n = len(diff)
    perm_diffs = np.zeros(n_permutations)
    for i in range(n_permutations):
        signs = rng.choice([-1.0, 1.0], size=n)
        perm_diffs[i] = np.mean(diff * signs)

    p_val_two_sided = float(np.mean(np.abs(perm_diffs) >= np.abs(obs_mean_diff)))

    # Bootstrap 95% CI on mean error difference
    b_means = np.zeros(2000)
    for b in range(2000):
        resample_idx = rng.randint(0, n, size=n)
        b_means[b] = np.mean(diff[resample_idx])
    ci_lower = float(np.percentile(b_means, 2.5))
    ci_upper = float(np.percentile(b_means, 97.5))

    # Wilcoxon signed-rank test
    w_stat, w_pval = stats.wilcoxon(err_a, err_b)

    return {
        "comparison": f"{name_a} vs {name_b}",
        "obs_mean_diff_mae": obs_mean_diff,
        "ci_95_diff": [ci_lower, ci_upper],
        "permutation_p_value": p_val_two_sided,
        "wilcoxon_stat": float(w_stat),
        "wilcoxon_p_value": float(w_pval)
    }

def run_parsimonious_ablation_task(
    output_dir: str = "experimental_workspace/results/empirical_revision"
) -> Dict[str, Any]:
    """Orchestrates Task 1.2 feature ranking, ablation sweep, and hypothesis testing."""
    logger.info("Executing Task 1.2: Parsimonious Feature Ablation via TreeSHAP...")
    os.makedirs(output_dir, exist_ok=True)
    fig_dir = os.path.join(output_dir, "figures")
    os.makedirs(fig_dir, exist_ok=True)

    # 1. Load data
    X_train_df = pd.read_parquet("data/processed/train_features.parquet")
    y_train = pd.read_parquet("data/processed/train_target.parquet")["TotalGHGEmissions"].values
    z_train = np.log1p(np.maximum(0.0, y_train))

    X_test_df = pd.read_parquet("data/processed/test_features.parquet")
    y_test = pd.read_parquet("data/processed/test_target.parquet")["TotalGHGEmissions"].values
    z_test = np.log1p(np.maximum(0.0, y_test))

    # 2. Global TreeSHAP Feature Ranking
    feat_rank_df = compute_global_shap_importance(X_train_df, z_train)
    feat_rank_csv = os.path.join(output_dir, "feature_importance_ranking.csv")
    feat_rank_df.to_csv(feat_rank_csv, index=False)
    logger.info(f"Saved global feature importance ranking to: {feat_rank_csv}")

    ranked_features = list(feat_rank_df["feature"].values)

    # 3. Ablation evaluation across subsets
    subset_sizes = [3, 5, 8, 12, 20, 35, 59]
    res_df, preds_dict = evaluate_ablation_subsets(
        X_train=X_train_df,
        y_train=y_train,
        z_train=z_train,
        X_test=X_test_df,
        y_test=y_test,
        z_test=z_test,
        ranked_features=ranked_features,
        subset_sizes=subset_sizes
    )
    ablation_csv = os.path.join(output_dir, "feature_ablation_results.csv")
    res_df.to_csv(ablation_csv, index=False)
    logger.info(f"Saved ablation performance sweep to: {ablation_csv}")

    # 4. Statistical hypothesis testing: Top-8 vs Full-59, Top-5 vs Full-59, and Top-8 vs Median
    stats_top8_vs_full = paired_statistical_test(
        y_test, preds_dict["Top_8"], preds_dict["Top_59"],
        name_a="Top-8 Features", name_b="Full 59 Features"
    )
    stats_top5_vs_full = paired_statistical_test(
        y_test, preds_dict["Top_5"], preds_dict["Top_59"],
        name_a="Top-5 Features", name_b="Full 59 Features"
    )
    stats_top8_vs_median = paired_statistical_test(
        y_test, preds_dict["Top_8"], preds_dict["Median_Baseline"],
        name_a="Top-8 Features", name_b="Median Baseline"
    )

    tests_summary = [stats_top8_vs_full, stats_top5_vs_full, stats_top8_vs_median]
    tests_json = os.path.join(output_dir, "ablation_statistical_tests.json")
    with open(tests_json, "w", encoding="utf-8") as f:
        json.dump(tests_summary, f, indent=2)
    logger.info(f"Saved paired statistical tests to: {tests_json}")

    # 5. Visualization: Ablation Curve and Top Features Bar Chart
    plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5.5), dpi=300)

    # Plot A: Feature count vs MAE and R2
    xgb_rows = res_df[res_df["k_features"] > 0].copy()
    ax1.plot(xgb_rows["k_features"], xgb_rows["mae_physical"], marker="o", color="#d62728", lw=2, label="Physical MAE (MT CO2e)")
    ax1.set_xlabel("Number of Selected Features (K)", fontsize=11, fontweight="bold")
    ax1.set_ylabel("Mean Absolute Error (Physical MT)", fontsize=11, color="#d62728", fontweight="bold")
    ax1.tick_params(axis="y", labelcolor="#d62728")

    ax1_twin = ax1.twinx()
    ax1_twin.plot(xgb_rows["k_features"], xgb_rows["r2_physical"], marker="s", color="#1f77b4", lw=2, linestyle="--", label="Physical R²")
    ax1_twin.set_ylabel("Coefficient of Determination ($R^2$)", fontsize=11, color="#1f77b4", fontweight="bold")
    ax1_twin.tick_params(axis="y", labelcolor="#1f77b4")

    # Mark the parsimonious sweet spot (K=8)
    ax1.axvline(x=8, color="gray", linestyle=":", lw=1.5, alpha=0.8, label="Parsimonious Elbow (K=8)")
    ax1.set_title("A. Predictive Performance vs Feature Dimensionality", fontsize=12, fontweight="bold", pad=10)

    # Plot B: Top 15 Feature Importances (TreeSHAP)
    top_15 = feat_rank_df.head(15).iloc[::-1]  # Reverse for horizontal bar chart
    ax2.barh(top_15["feature"], top_15["mean_abs_shap"], color="#2ca02c", alpha=0.85)
    ax2.set_xlabel("Mean Absolute SHAP Value (Log-scale Impact)", fontsize=11, fontweight="bold")
    ax2.set_title("B. Top 15 Global Features by TreeSHAP Attribution", fontsize=12, fontweight="bold", pad=10)

    plt.tight_layout()
    curve_plot_path = os.path.join(fig_dir, "feature_ablation_and_importance.png")
    plt.savefig(curve_plot_path, dpi=300)
    plt.close()
    logger.info(f"Saved feature ablation plot to: {curve_plot_path}")

    return {
        "status": "COMPLETED",
        "top_features": ranked_features[:8],
        "ablation_results": res_df.to_dict(orient="records"),
        "statistical_tests": tests_summary
    }

if __name__ == "__main__":
    out = run_parsimonious_ablation_task()
    print("Parsimonious Ablation Completed.")
    print("Top 8 Features:", out["top_features"])

