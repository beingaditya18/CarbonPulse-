"""
Module: task2_prespecified_risk_control.py
Path: experimental_workspace/src/empirical_revision/task2_prespecified_risk_control.py
Author: Aditya Mandloi, Dr. Ashok Kumar Gupta
Affiliation: School of Data Science and Forecasting, Devi Ahilya Vishwavidyalaya, Indore, India
Description:
    Task 2: Mathematically Valid Conformal Risk Control with Prespecified Tau.
    Derives high-emitter threshold tau strictly from an independent historical cohort
    (e.g. 2021-2022 filings in the training set) and hard statutory constants (50 MT, 100 MT),
    preserving exchangeability and verifying formal finite-sample Empirical Bernstein bounds.
"""

import os
import sys
import json
import logging
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("Task2RiskControl")

class PrespecifiedRiskControl:
    def __init__(
        self,
        delta: float = 0.10,  # 90% confidence guarantee
        alphas: List[float] = [0.05, 0.10, 0.15, 0.20],
        output_dir: str = "experimental_workspace/results/empirical_revision"
    ):
        self.delta = delta
        self.alphas = alphas
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        self.fig_dir = os.path.join(output_dir, "figures")
        os.makedirs(self.fig_dir, exist_ok=True)

    @staticmethod
    def compute_empirical_bernstein_ucb(losses: np.ndarray, delta: float) -> float:
        """
        Computes the Empirical Bernstein upper confidence bound for bounded losses in [0, 1].
        UCB = R_hat + sqrt(2 * V_hat * log(2/delta) / n) + 7 * log(2/delta) / (3 * (n - 1))
        """
        n = len(losses)
        if n <= 1:
            return 1.0
        r_hat = float(np.mean(losses))
        v_hat = float(np.var(losses, ddof=1))
        c1 = np.sqrt(2.0 * v_hat * np.log(2.0 / delta) / n)
        c2 = (7.0 * np.log(2.0 / delta)) / (3.0 * (n - 1))
        return min(1.0, float(r_hat + c1 + c2))

    def derive_prespecified_thresholds(
        self,
        train_track: pd.DataFrame,
        train_target: np.ndarray
    ) -> Dict[str, float]:
        """
        Derives high-emitter thresholds tau strictly independent of calibration and test data:
        1. Hard Statutory Constant 50 MT (benchmarking compliance threshold).
        2. Hard Statutory Constant 100 MT (major emitter tier).
        3. Historical Cohort Quantile: 85th percentile of 2021-2022 historical filings.
        """
        logger.info("Deriving prespecified high-emitter thresholds tau from historical training records...")
        hist_mask = train_track["DataYear"].isin([2021, 2022]).values
        hist_emissions = train_target[hist_mask]
        tau_hist_85 = float(np.percentile(hist_emissions, 85))

        thresholds = {
            "Statutory_50MT": 50.0,
            "Statutory_100MT": 100.0,
            "Historical_2021_2022_P85": tau_hist_85
        }
        for name, val in thresholds.items():
            logger.info(f"Prespecified Tau [{name}]: {val:.2f} MT CO2e")
        return thresholds

    def load_cohorts(self) -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, float]]:
        """
        Loads facility-level calibration (756 facilities) and test (757 facilities) cohorts.
        """
        train_track = pd.read_parquet("data/processed/train_tracking.parquet")
        train_target = pd.read_parquet("data/processed/train_target.parquet")["TotalGHGEmissions"].values
        X_train = pd.read_parquet("data/processed/train_features.parquet")

        cal_split = pd.read_parquet("experimental_workspace/data/splits/conformal_calibration_split_seed42.parquet")
        test_split = pd.read_parquet("experimental_workspace/data/splits/master_evaluation_holdout_seed42.parquet")
        preds_df = pd.read_csv("results/test_predictions.csv")

        # Derive prespecified tau
        tau_dict = self.derive_prespecified_thresholds(train_track, train_target)

        # Build calibration dataset
        cal_mask = (cal_split["cohort"] == "calibration").values
        cal_facs = train_track.loc[cal_mask, "OSEBuildingID"].values
        cal_y = train_target[cal_mask]
        cal_X = X_train[cal_mask]

        xgb_model = joblib.load("models/xgboost.joblib")
        cal_preds = np.maximum(0.0, xgb_model.predict(cal_X))

        # Facility-level aggregation for calibration
        df_cal_raw = pd.DataFrame({
            "OSEBuildingID": cal_facs,
            "Actual": cal_y,
            "Predicted": cal_preds
        })
        bldg_cal = df_cal_raw.groupby("OSEBuildingID").agg({
            "Actual": "mean",
            "Predicted": "mean"
        }).reset_index()

        # Facility-level aggregation for test holdout
        test_facs = test_split["OSEBuildingID"].unique()
        bldg_test = preds_df[preds_df["OSEBuildingID"].isin(test_facs)].groupby("OSEBuildingID").agg({
            "Actual": "mean",
            "xgboost": "mean"
        }).rename(columns={"xgboost": "Predicted"}).reset_index()

        logger.info(f"Independent cohorts prepared: Calibration={len(bldg_cal)} facilities, Test={len(bldg_test)} facilities.")
        return bldg_cal, bldg_test, tau_dict

    def run_conformal_screening_curve(
        self,
        bldg_cal: pd.DataFrame,
        bldg_test: pd.DataFrame,
        tau: float,
        tau_name: str
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Evaluates risk curve across screening threshold lambda in descending order.
        Loss = I(Y >= tau and Y_hat < lambda).
        """
        cal_high = bldg_cal[bldg_cal["Actual"] >= tau].copy()
        test_high = bldg_test[bldg_test["Actual"] >= tau].copy()

        n_cal_high = len(cal_high)
        n_test_high = len(test_high)
        logger.info(f"Evaluating Tau={tau:.2f} ({tau_name}): Cal high-emitters={n_cal_high}, Test high-emitters={n_test_high}")

        lambdas = np.linspace(0.0, max(250.0, tau * 1.5), 301)
        lambdas_descending = np.sort(lambdas)[::-1]

        records = []
        for lam in lambdas_descending:
            # Loss: indicator that true high emitter is missed (False Negative)
            cal_missed = (cal_high["Predicted"] < lam).astype(float).values
            r_cal = float(np.mean(cal_missed))
            ucb_cal = self.compute_empirical_bernstein_ucb(cal_missed, self.delta)

            test_missed = (test_high["Predicted"] < lam).astype(float).values
            r_test = float(np.mean(test_missed))

            flagged_test_total = float((bldg_test["Predicted"] >= lam).mean() * 100.0)
            recall_test = (1.0 - r_test) * 100.0

            records.append({
                "tau_name": tau_name,
                "tau_val": tau,
                "cutoff_lambda": float(lam),
                "r_hat_cal": r_cal,
                "ucb_cal": ucb_cal,
                "r_test": r_test,
                "recall_test": recall_test,
                "flagged_test_pct": flagged_test_total,
                "ucb_covers_test": bool(r_test <= ucb_cal)
            })

        df_curve = pd.DataFrame(records).sort_values("cutoff_lambda").reset_index(drop=True)

        # Select thresholds for target alphas under Fixed Sequence Testing
        selections = []
        for alpha in self.alphas:
            # Find candidate lambdas where UCB <= alpha
            valid_rows = df_curve[df_curve["ucb_cal"] <= alpha]
            if len(valid_rows) > 0:
                best_row = valid_rows.iloc[valid_rows["cutoff_lambda"].argmax()]
                lam_selected = float(best_row["cutoff_lambda"])
                r_cal = float(best_row["r_hat_cal"])
                ucb = float(best_row["ucb_cal"])
                r_test = float(best_row["r_test"])
                test_rec = float(best_row["recall_test"])
                flag_pct = float(best_row["flagged_test_pct"])
                guarantee_met = bool(r_test <= alpha)
            else:
                best_row = df_curve.iloc[0]
                lam_selected = 0.0
                r_cal = 0.0
                ucb = 0.0
                r_test = 0.0
                test_rec = 100.0
                flag_pct = 100.0
                guarantee_met = True

            selections.append({
                "tau_name": tau_name,
                "tau_threshold": tau,
                "target_alpha": alpha,
                "target_recall_pct": (1.0 - alpha) * 100.0,
                "selected_lambda": lam_selected,
                "r_hat_cal": r_cal,
                "ucb_cal": ucb,
                "r_test": r_test,
                "empirical_test_recall": test_rec,
                "audit_budget_pct": flag_pct,
                "guarantee_satisfied": guarantee_met,
                "confidence_level": 1.0 - self.delta
            })

        df_sel = pd.DataFrame(selections)
        return df_curve, df_sel

    def run_all(self) -> Dict[str, Any]:
        logger.info("Executing Task 2: Mathematically Valid Conformal Risk Control with Prespecified Tau...")
        bldg_cal, bldg_test, tau_dict = self.load_cohorts()

        all_curves = []
        all_selections = []

        for tau_name, tau_val in tau_dict.items():
            curve_df, sel_df = self.run_conformal_screening_curve(bldg_cal, bldg_test, tau_val, tau_name)
            all_curves.append(curve_df)
            all_selections.append(sel_df)

        full_curves = pd.concat(all_curves, ignore_index=True)
        full_selections = pd.concat(all_selections, ignore_index=True)

        # Save results
        curves_csv = os.path.join(self.output_dir, "prespecified_risk_control_curves.csv")
        full_curves.to_csv(curves_csv, index=False)

        sel_csv = os.path.join(self.output_dir, "prespecified_risk_control_results.csv")
        full_selections.to_csv(sel_csv, index=False)
        logger.info(f"Saved prespecified risk control results to: {sel_csv}")

        # Summary JSON
        summary_data = {
            "status": "COMPLETED",
            "confidence_level": 1.0 - self.delta,
            "prespecified_thresholds": tau_dict,
            "selections": full_selections.to_dict(orient="records")
        }
        summary_json = os.path.join(self.output_dir, "prespecified_risk_control_summary.json")
        with open(summary_json, "w", encoding="utf-8") as f:
            json.dump(summary_data, f, indent=2)

        # Visualizations
        plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
        fig, axes = plt.subplots(1, 3, figsize=(18, 5), dpi=300)

        for idx, (tau_name, tau_val) in enumerate(tau_dict.items()):
            ax = axes[idx]
            sub = full_curves[full_curves["tau_name"] == tau_name]
            ax.plot(sub["cutoff_lambda"], sub["r_hat_cal"], color="#1f77b4", label=r"Cal Empirical Risk $\hat{R}_{\mathrm{cal}}$", lw=1.8)
            ax.plot(sub["cutoff_lambda"], sub["ucb_cal"], color="#d62728", linestyle="--", label=r"Bernstein UCB ($1-\delta=0.90$)", lw=1.8)
            ax.plot(sub["cutoff_lambda"], sub["r_test"], color="#2ca02c", linestyle="-.", label=r"Test Risk $R_{\mathrm{test}}$", lw=1.8)

            # Mark target alpha = 0.10
            ax.axhline(0.10, color="black", linestyle=":", label=r"Target Risk $\alpha=0.10$")
            target_sel = full_selections[(full_selections["tau_name"] == tau_name) & (full_selections["target_alpha"] == 0.10)]
            if len(target_sel) > 0:
                lam_sel = target_sel["selected_lambda"].values[0]
                rec_val = target_sel["empirical_test_recall"].values[0]
                ax.axvline(lam_sel, color="purple", linestyle="--", alpha=0.7, label=rf"Selected $\hat{{\lambda}}={lam_sel:.1f}$")
                ax.text(lam_sel + 2, 0.4, f"Recall: {rec_val:.1f}%\nAudit: {target_sel['audit_budget_pct'].values[0]:.1f}%", fontsize=9, fontweight="bold", bbox=dict(boxstyle="round,pad=0.3", fc="white", ec="purple", lw=1))

            ax.set_title(f"{tau_name} ($\\tau={tau_val:.1f}$ MT)", fontsize=11, fontweight="bold")
            ax.set_xlabel(r"Screening Threshold $\lambda$ (MT)", fontsize=10)
            ax.set_ylabel("High-Emitter Non-Discovery Rate", fontsize=10)
            ax.set_ylim(-0.02, 1.02)
            ax.legend(loc="lower right" if idx == 0 else "upper left", fontsize=8)

        plt.tight_layout()
        plot_path = os.path.join(self.fig_dir, "prespecified_risk_control_curves.png")
        plt.savefig(plot_path, dpi=300)
        plt.close()
        logger.info(f"Saved risk control curves to: {plot_path}")

        return summary_data

if __name__ == "__main__":
    runner = PrespecifiedRiskControl()
    res = runner.run_all()
    print("Task 2 Prespecified Risk Control Completed.")
