"""
Module: task1_probabilistic_ensemble.py
Path: experimental_workspace/src/empirical_revision/task1_probabilistic_ensemble.py
Author: Aditya Mandloi, Dr. Ashok Kumar Gupta
Affiliation: School of Data Science and Forecasting, Devi Ahilya Vishwavidyalaya, Indore, India
Description:
    Task 1.1: Probabilistic Deep Ensemble with Adversarial Training.
    Trains M=5 heteroscedastic neural networks predicting mean and log-variance under Gaussian NLL,
    integrating adversarial perturbations (FGSM) to capture aleatoric and epistemic uncertainty,
    pushing the physical R2 ceiling and tightening conformal prediction intervals.
"""

import os
import sys
import json
import logging
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error, median_absolute_error
import matplotlib.pyplot as plt

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("Task1DeepEnsemble")

class HeteroscedasticMLP(nn.Module):
    """
    Feedforward network predicting both mean mu(x) and log-variance log_sigma2(x).
    """
    def __init__(self, in_features: int, hidden_dims: List[int] = [128, 64, 32], dropout: float = 0.15):
        super().__init__()
        layers = []
        curr_dim = in_features
        for h_dim in hidden_dims:
            layers.append(nn.Linear(curr_dim, h_dim))
            layers.append(nn.LayerNorm(h_dim))
            layers.append(nn.GELU())
            layers.append(nn.Dropout(dropout))
            curr_dim = h_dim
        self.backbone = nn.Sequential(*layers)
        self.mu_head = nn.Linear(curr_dim, 1)
        self.logvar_head = nn.Linear(curr_dim, 1)

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        feat = self.backbone(x)
        mu = self.mu_head(feat)
        # Clamped log-variance to prevent numerical explosion
        logvar = torch.clamp(self.logvar_head(feat), min=-6.0, max=6.0)
        return mu, logvar

def gaussian_nll_loss(y: torch.Tensor, mu: torch.Tensor, logvar: torch.Tensor) -> torch.Tensor:
    """Computes Gaussian Negative Log-Likelihood loss."""
    var = torch.exp(logvar)
    loss = 0.5 * logvar + 0.5 * ((y - mu) ** 2) / (var + 1e-6)
    return torch.mean(loss)

class ProbabilisticDeepEnsemble:
    def __init__(
        self,
        num_models: int = 5,
        hidden_dims: List[int] = [128, 64, 32],
        adversarial_epsilon: float = 0.01,
        learning_rate: float = 0.005,
        weight_decay: float = 1e-4,
        max_epochs: int = 40,
        batch_size: int = 256,
        seed: int = 42
    ):
        self.num_models = num_models
        self.hidden_dims = hidden_dims
        self.adv_eps = adversarial_epsilon
        self.lr = learning_rate
        self.weight_decay = weight_decay
        self.max_epochs = max_epochs
        self.batch_size = batch_size
        self.seed = seed
        self.models: List[HeteroscedasticMLP] = []
        self.scaler = StandardScaler()

    def fit(self, X_train: np.ndarray, y_train: np.ndarray, X_val: np.ndarray, y_val: np.ndarray):
        """Fits ensemble members with diverse seed initializations and adversarial training."""
        logger.info(f"Standardizing features and preparing {self.num_models} probabilistic ensemble members...")
        X_train_std = self.scaler.fit_transform(X_train)
        X_val_std = self.scaler.transform(X_val)

        z_train = np.log1p(np.maximum(0.0, y_train)).astype(np.float32).reshape(-1, 1)
        z_val = np.log1p(np.maximum(0.0, y_val)).astype(np.float32).reshape(-1, 1)

        in_dim = X_train_std.shape[1]
        self.models = []

        for m_idx in range(self.num_models):
            torch.manual_seed(self.seed + m_idx * 17)
            np.random.seed(self.seed + m_idx * 17)
            logger.info(f"Training Ensemble Member {m_idx + 1}/{self.num_models}...")

            model = HeteroscedasticMLP(in_features=in_dim, hidden_dims=self.hidden_dims)
            optimizer = optim.AdamW(model.parameters(), lr=self.lr, weight_decay=self.weight_decay)
            scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=self.max_epochs)

            dataset = TensorDataset(torch.tensor(X_train_std, dtype=torch.float32), torch.tensor(z_train, dtype=torch.float32))
            loader = DataLoader(dataset, batch_size=self.batch_size, shuffle=True, drop_last=False)

            best_val_loss = float("inf")
            best_state = None

            for epoch in range(self.max_epochs):
                model.train()
                for bx, by in loader:
                    bx.requires_grad = True
                    # Clean forward pass
                    mu, logvar = model(bx)
                    clean_loss = gaussian_nll_loss(by, mu, logvar)

                    # Compute adversarial gradient
                    clean_loss.backward(retain_graph=True)
                    grad_sign = bx.grad.data.sign() if bx.grad is not None else torch.zeros_like(bx)

                    # Adversarial perturbation
                    bx_adv = bx + self.adv_eps * grad_sign
                    bx.grad.zero_()
                    optimizer.zero_grad()

                    # Adversarial forward pass
                    mu_adv, logvar_adv = model(bx_adv)
                    adv_loss = gaussian_nll_loss(by, mu_adv, logvar_adv)

                    # Total combined robust loss
                    total_loss = 0.5 * clean_loss + 0.5 * adv_loss
                    total_loss.backward()
                    optimizer.step()

                scheduler.step()

                # Validation step
                model.eval()
                with torch.no_grad():
                    vx = torch.tensor(X_val_std, dtype=torch.float32)
                    vy = torch.tensor(z_val, dtype=torch.float32)
                    v_mu, v_logvar = model(vx)
                    v_loss = float(gaussian_nll_loss(vy, v_mu, v_logvar))

                if v_loss < best_val_loss:
                    best_val_loss = v_loss
                    best_state = {k: v.cpu().clone() for k, v in model.state_dict().items()}

            if best_state is not None:
                model.load_state_dict(best_state)
            model.eval()
            self.models.append(model)
            logger.info(f"Member {m_idx + 1} Best Validation NLL: {best_val_loss:.4f}")

    def predict(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Returns:
            y_pred: Back-transformed expected emissions on MT scale.
            aleatoric_std: Physical aleatoric uncertainty.
            epistemic_std: Disagreement across ensemble weights.
            total_std: Combined uncertainty standard deviation.
        """
        X_std = self.scaler.transform(X)
        tx = torch.tensor(X_std, dtype=torch.float32)

        mu_list = []
        var_list = []

        with torch.no_grad():
            for model in self.models:
                model.eval()
                m, lv = model(tx)
                mu_list.append(m.numpy().ravel())
                var_list.append(torch.exp(lv).numpy().ravel())

        # Disaggregate uncertainties in log-space
        mu_stack = np.array(mu_list)      # Shape (M, N)
        var_stack = np.array(var_list)    # Shape (M, N)

        log_mu_ens = np.mean(mu_stack, axis=0)
        log_aleatoric_var = np.mean(var_stack, axis=0)
        log_epistemic_var = np.var(mu_stack, axis=0, ddof=1)
        log_total_var = log_aleatoric_var + log_epistemic_var

        # Back-transform point prediction to physical metric tonnes
        y_pred = np.clip(np.expm1(log_mu_ens), 0.0, 100000.0)

        # Delta method for physical uncertainty conversion
        # d(expm1(z))/dz = exp(z) = y_pred + 1
        d_factor = y_pred + 1.0
        aleatoric_std = np.sqrt(log_aleatoric_var) * d_factor
        epistemic_std = np.sqrt(log_epistemic_var) * d_factor
        total_std = np.sqrt(log_total_var) * d_factor

        return y_pred, aleatoric_std, epistemic_std, total_std

def run_probabilistic_ensemble_task(
    config_path: str = "experimental_workspace/configs/empirical_revision.yaml",
    output_dir: str = "experimental_workspace/results/empirical_revision"
) -> Dict[str, Any]:
    """Executes Task 1.1 Deep Ensemble benchmarking and uncertainty quantification."""
    logger.info("Executing Task 1.1: Probabilistic Deep Ensemble with Adversarial Training...")
    os.makedirs(output_dir, exist_ok=True)
    fig_dir = os.path.join(output_dir, "figures")
    os.makedirs(fig_dir, exist_ok=True)

    # Load data
    X_train_df = pd.read_parquet("data/processed/train_features.parquet")
    y_train = pd.read_parquet("data/processed/train_target.parquet")["TotalGHGEmissions"].values
    track_train = pd.read_parquet("data/processed/train_tracking.parquet")

    X_test_df = pd.read_parquet("data/processed/test_features.parquet")
    y_test = pd.read_parquet("data/processed/test_target.parquet")["TotalGHGEmissions"].values

    # Inner facility-disjoint validation split (85% train-proper / 15% validation)
    dev_facs = track_train["OSEBuildingID"].unique()
    rng = np.random.RandomState(42)
    shuffled_facs = rng.permutation(dev_facs)
    n_train_facs = int(len(dev_facs) * 0.85)
    train_fac_set = set(shuffled_facs[:n_train_facs])

    train_mask = track_train["OSEBuildingID"].isin(train_fac_set).values
    val_mask = ~train_mask

    X_train_sub = X_train_df.iloc[train_mask].values
    y_train_sub = y_train[train_mask]
    X_val_sub = X_train_df.iloc[val_mask].values
    y_val_sub = y_train[val_mask]
    X_test_sub = X_test_df.values

    # Initialize and train Deep Ensemble
    ensemble = ProbabilisticDeepEnsemble(
        num_models=5,
        hidden_dims=[128, 64, 32],
        adversarial_epsilon=0.01,
        learning_rate=0.005,
        weight_decay=1e-4,
        max_epochs=40,
        batch_size=256,
        seed=42
    )
    ensemble.fit(X_train_sub, y_train_sub, X_val_sub, y_val_sub)

    # Predict on test cohort
    logger.info("Evaluating Probabilistic Deep Ensemble on held-out test cohort (7,366 records)...")
    y_test_pred, aleat_std, epist_std, tot_std = ensemble.predict(X_test_sub)

    # Compute physical and log-scale metrics
    r2_phys = float(r2_score(y_test, y_test_pred))
    mae_phys = float(mean_absolute_error(y_test, y_test_pred))
    rmse_phys = float(np.sqrt(mean_squared_error(y_test, y_test_pred)))
    medae_phys = float(median_absolute_error(y_test, y_test_pred))

    nz = y_test > 1e-3
    mape_phys = float(np.mean(np.abs((y_test[nz] - y_test_pred[nz]) / y_test[nz])) * 100.0)

    z_test = np.log1p(np.maximum(0.0, y_test))
    z_pred = np.log1p(np.maximum(0.0, y_test_pred))
    r2_log = float(r2_score(z_test, z_pred))
    mae_log = float(mean_absolute_error(z_test, z_pred))

    metrics_ensemble = {
        "model": "Probabilistic_Deep_Ensemble",
        "r2_physical": r2_phys,
        "mae_physical": mae_phys,
        "rmse_physical": rmse_phys,
        "medae_physical": medae_phys,
        "mape_physical": mape_phys,
        "r2_log_scale": r2_log,
        "mae_log_scale": mae_log,
        "mean_aleatoric_std": float(np.mean(aleat_std)),
        "mean_epistemic_std": float(np.mean(epist_std)),
        "mean_total_std": float(np.mean(tot_std))
    }

    # Load baseline benchmarks for side-by-side comparison
    benchmarks_path = "experimental_workspace/results/tabnet/model_benchmark_comparison.csv"
    if os.path.exists(benchmarks_path):
        df_bench = pd.read_csv(benchmarks_path)
    else:
        df_bench = pd.DataFrame()

    comparison_rows = [
        {
            "model": "Probabilistic Deep Ensemble (M=5)",
            "r2": r2_phys,
            "mae": mae_phys,
            "rmse": rmse_phys,
            "medae": medae_phys,
            "mape": mape_phys,
            "log_r2": r2_log,
            "log_mae": mae_log
        }
    ]
    for _, r in df_bench.iterrows():
        comparison_rows.append({
            "model": r["model"],
            "r2": r["r2"],
            "mae": r["mae"],
            "rmse": r["rmse"],
            "medae": r["medae"],
            "mape": r["mape"],
            "log_r2": r["log_r2"],
            "log_mae": r["log_mae"]
        })
    df_comp = pd.DataFrame(comparison_rows).sort_values("mae").reset_index(drop=True)

    # Save metrics and predictions
    comp_csv = os.path.join(output_dir, "probabilistic_ensemble_comparison.csv")
    df_comp.to_csv(comp_csv, index=False)
    logger.info(f"Saved ensemble comparison to: {comp_csv}")

    preds_df = pd.DataFrame({
        "Actual": y_test,
        "Ensemble_pred": y_test_pred,
        "Aleatoric_std": aleat_std,
        "Epistemic_std": epist_std,
        "Total_std": tot_std
    })
    preds_parquet = os.path.join(output_dir, "deep_ensemble_predictions.parquet")
    preds_df.to_parquet(preds_parquet, index=False)

    # Visualization: Epistemic vs Aleatoric Uncertainty
    plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
    fig, axes = plt.subplots(1, 2, figsize=(14, 5), dpi=300)

    # Plot A: Actual vs Predicted with Epistemic Bands
    ax1 = axes[0]
    sample_idx = np.random.RandomState(42).choice(len(y_test), size=120, replace=False)
    sorted_order = np.argsort(y_test[sample_idx])
    sx = np.arange(len(sorted_order))
    sy = y_test[sample_idx][sorted_order]
    sp = y_test_pred[sample_idx][sorted_order]
    sep = epist_std[sample_idx][sorted_order]

    ax1.scatter(sx, sy, color="black", label="Actual Emissions", s=18, alpha=0.85)
    ax1.plot(sx, sp, color="#1f77b4", lw=1.8, label="Ensemble Mean $\\mu_{\\text{ens}}$")
    ax1.fill_between(sx, np.maximum(0, sp - sep), sp + sep, color="#1f77b4", alpha=0.25, label="Epistemic Uncertainty ($\pm 1\\sigma_{\\text{epist}}$)")
    ax1.set_title("A. Deep Ensemble Predictions & Epistemic Uncertainty", fontsize=11, fontweight="bold", pad=8)
    ax1.set_xlabel("Sample Buildings (Ordered by True Emissions)", fontsize=10)
    ax1.set_ylabel("Emissions (MT CO2e)", fontsize=10)
    ax1.set_yscale("log")
    ax1.legend(loc="upper left", frameon=True, fontsize=9)

    # Plot B: Model Performance Comparison (MAE vs Physical R2)
    ax2 = axes[1]
    filtered_comp = df_comp[~df_comp["model"].isin(["ACCOUNTING"])].copy()
    ax2.barh(filtered_comp["model"], filtered_comp["r2"], color="#2ca02c", alpha=0.85)
    ax2.set_title("B. Physical $R^2$ Benchmark Ceiling Comparison", fontsize=11, fontweight="bold", pad=8)
    ax2.set_xlabel("Physical $R^2$ (Higher is Better)", fontsize=10)
    ax2.set_xlim(0, max(filtered_comp["r2"]) * 1.25)
    for i, val in enumerate(filtered_comp["r2"]):
        ax2.text(val + 0.005, i, f"{val:.4f}", va="center", fontsize=9, fontweight="bold")

    plt.tight_layout()
    plot_path = os.path.join(fig_dir, "probabilistic_ensemble_evaluation.png")
    plt.savefig(plot_path, dpi=300)
    plt.close()
    logger.info(f"Saved ensemble evaluation plot to: {plot_path}")

    return {
        "status": "COMPLETED",
        "ensemble_metrics": metrics_ensemble,
        "comparison_table": df_comp.to_dict(orient="records")
    }

if __name__ == "__main__":
    results = run_probabilistic_ensemble_task()
    print("Probabilistic Ensemble Completed:", results["ensemble_metrics"])

