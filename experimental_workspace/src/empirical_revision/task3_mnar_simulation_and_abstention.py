"""
Module: task3_mnar_simulation_and_abstention.py
Path: experimental_workspace/src/empirical_revision/task3_mnar_simulation_and_abstention.py
Author: Aditya Mandloi, Dr. Ashok Kumar Gupta
Affiliation: School of Data Science and Forecasting, Devi Ahilya Vishwavidyalaya, Indore, India
Description:
    Task 3: Missing Not At Random (MNAR) Simulation and Fail-Safe Abstention Policy.
    Simulates adversarial administrative reporting (strategic structural feature omission and
    -20% under-reporting on the top 10% largest facilities), contrasting naive imputation
    against the strict AUDIT_REQUIRED abstention policy to demonstrate robustness against evasion.
"""

import os
import sys
import json
import logging
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
import joblib
from sklearn.impute import SimpleImputer
import matplotlib.pyplot as plt

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("Task3MNAR")

# Primary structural features essential for physical emissions modeling
PRIMARY_STRUCTURAL_FEATURES = [
    "PropertyGFATotal",
    "PropertyGFABuildings",
    "LogGFATotal",
    "LogGFABuildings",
    "FloorAreaPerFloor",
    "NumberofFloors"
]

class MNARSimulationEngine:
    def __init__(
        self,
        output_dir: str = "experimental_workspace/results/empirical_revision",
        tau_high: float = 50.0  # High-emitter statutory threshold (MT CO2e)
    ):
        self.output_dir = output_dir
        self.tau_high = tau_high
        os.makedirs(self.output_dir, exist_ok=True)
        self.fig_dir = os.path.join(output_dir, "figures")
        os.makedirs(self.fig_dir, exist_ok=True)

    def load_test_data(self) -> Tuple[pd.DataFrame, pd.DataFrame, np.ndarray, pd.DataFrame]:
        """Loads test features, tracking, raw physical properties, and target."""
        X_test_df = pd.read_parquet("data/processed/test_features.parquet")
        y_test = pd.read_parquet("data/processed/test_target.parquet")["TotalGHGEmissions"].values
        track_test = pd.read_parquet("data/processed/test_tracking.parquet")
        raw_test = pd.read_parquet("data/processed/test_features_raw.parquet")
        return X_test_df, raw_test, y_test, track_test

    def apply_adversarial_mnar_masking(
        self,
        X_test: pd.DataFrame,
        raw_test: pd.DataFrame,
        top_pct: float = 0.10
    ) -> Tuple[pd.DataFrame, np.ndarray]:
        """
        Systematically drops primary structural features specifically for the top 10%
        largest facilities by PropertyGFATotal (MNAR mechanism simulating strategic concealment).
        """
        X_masked = X_test.copy()
        gfa = raw_test["PropertyGFATotal"].values
        cutoff_gfa = np.percentile(gfa, (1.0 - top_pct) * 100.0)
        large_mask = (gfa >= cutoff_gfa)
        n_large = int(np.sum(large_mask))
        logger.info(f"MNAR Masking: Identified top {top_pct*100:.0f}% largest buildings (GFA >= {cutoff_gfa:,.0f} sq ft, n={n_large}).")

        # Find columns in X_test that match primary structural features
        cols_to_mask = [col for col in X_test.columns if any(psf.lower() in col.lower() for psf in PRIMARY_STRUCTURAL_FEATURES)]
        logger.info(f"Omitted structural columns under MNAR: {cols_to_mask}")

        for col in cols_to_mask:
            X_masked.loc[large_mask, col] = np.nan

        return X_masked, large_mask

    def evaluate_naive_imputation_policy(
        self,
        X_train_df: pd.DataFrame,
        X_masked: pd.DataFrame,
        y_test: np.ndarray,
        large_mask: np.ndarray,
        model: Any,
        screening_threshold: float = 30.0
    ) -> Dict[str, Any]:
        """
        Policy 1: Blind Imputation (Status Quo).
        Imputes missing values with training median and generates standard predictions.
        """
        imputer = SimpleImputer(strategy="median")
        imputer.fit(X_train_df)
        X_imputed = pd.DataFrame(imputer.transform(X_masked), columns=X_masked.columns)

        preds = np.maximum(0.0, model.predict(X_imputed))
        flagged = (preds >= screening_threshold)

        # High emitters (true Y >= tau_high)
        is_high = (y_test >= self.tau_high)
        high_recalled = flagged & is_high
        recall_pct = float(np.sum(high_recalled) / np.sum(is_high) * 100.0)

        # Strategic large emitters evading detection
        large_high_emitters = is_high & large_mask
        large_recalled = flagged & large_high_emitters
        large_recall_pct = float(np.sum(large_recalled) / np.sum(large_high_emitters) * 100.0) if np.sum(large_high_emitters) > 0 else 100.0

        # Uncaptured emissions from missed high emitters
        missed_high = is_high & (~flagged)
        missed_emissions = float(np.sum(y_test[missed_high]))

        return {
            "policy": "Blind_Median_Imputation",
            "overall_audit_pct": float(np.mean(flagged) * 100.0),
            "overall_high_emitter_recall": recall_pct,
            "large_stratum_recall": large_recall_pct,
            "missed_high_emitters_count": int(np.sum(missed_high)),
            "missed_emissions_mt": missed_emissions,
            "predictions": preds,
            "audit_flags": flagged
        }

    def evaluate_strict_abstention_policy(
        self,
        X_train_df: pd.DataFrame,
        X_masked: pd.DataFrame,
        y_test: np.ndarray,
        large_mask: np.ndarray,
        model: Any,
        screening_threshold: float = 30.0
    ) -> Dict[str, Any]:
        """
        Policy 2: CarbonPulse AI+ Strict Abstention Policy.
        If any primary structural feature is missing, model abstains from prediction
        and outputs AUDIT_REQUIRED flag. Facility is immediately routed to mandatory physical audit.
        """
        # Detect rows missing primary structural features
        cols_structural = [col for col in X_masked.columns if any(psf.lower() in col.lower() for psf in PRIMARY_STRUCTURAL_FEATURES)]
        structural_missing_mask = X_masked[cols_structural].isna().any(axis=1).values

        # Complete records are processed normally via model
        imputer = SimpleImputer(strategy="median")
        imputer.fit(X_train_df)
        X_imputed = pd.DataFrame(imputer.transform(X_masked), columns=X_masked.columns)
        clean_preds = np.maximum(0.0, model.predict(X_imputed))

        # Deployment flag: either model flags it OR abstention triggers AUDIT_REQUIRED
        audit_required_flags = structural_missing_mask
        model_flagged = (~audit_required_flags) & (clean_preds >= screening_threshold)
        total_audit_flags = audit_required_flags | model_flagged

        # High emitters (true Y >= tau_high)
        is_high = (y_test >= self.tau_high)
        high_recalled = total_audit_flags & is_high
        recall_pct = float(np.sum(high_recalled) / np.sum(is_high) * 100.0)

        # Strategic large emitters: under abstention, all are flagged
        large_high_emitters = is_high & large_mask
        large_recalled = total_audit_flags & large_high_emitters
        large_recall_pct = float(np.sum(large_recalled) / np.sum(large_high_emitters) * 100.0) if np.sum(large_high_emitters) > 0 else 100.0

        # Uncaptured emissions
        missed_high = is_high & (~total_audit_flags)
        missed_emissions = float(np.sum(y_test[missed_high]))

        return {
            "policy": "Strict_Abstention_AUDIT_REQUIRED",
            "overall_audit_pct": float(np.mean(total_audit_flags) * 100.0),
            "abstention_triggered_pct": float(np.mean(audit_required_flags) * 100.0),
            "overall_high_emitter_recall": recall_pct,
            "large_stratum_recall": large_recall_pct,
            "missed_high_emitters_count": int(np.sum(missed_high)),
            "missed_emissions_mt": missed_emissions,
            "audit_flags": total_audit_flags
        }

    def run_simulation(self) -> Dict[str, Any]:
        logger.info("Executing Task 3: Adversarial MNAR Masking and Abstention Evaluation...")
        X_train_df = pd.read_parquet("data/processed/train_features.parquet")
        X_test_df, raw_test, y_test, track_test = self.load_test_data()

        # Load production XGBoost
        model = joblib.load("models/xgboost.joblib")

        # Baseline Clean Evaluation (Zero MNAR)
        clean_preds = np.maximum(0.0, model.predict(X_test_df))
        screening_lam = 30.0  # Screening cutoff in MT CO2e
        clean_flags = clean_preds >= screening_lam
        is_high = y_test >= self.tau_high
        clean_recall = float(np.sum(clean_flags & is_high) / np.sum(is_high) * 100.0)
        clean_missed_mt = float(np.sum(y_test[is_high & (~clean_flags)]))

        # Apply Adversarial MNAR Masking on Top 10%
        X_masked, large_mask = self.apply_adversarial_mnar_masking(X_test_df, raw_test, top_pct=0.10)

        # Policy 1: Naive Imputation
        res_naive = self.evaluate_naive_imputation_policy(
            X_train_df, X_masked, y_test, large_mask, model, screening_threshold=screening_lam
        )

        # Policy 2: Strict Abstention
        res_abstain = self.evaluate_strict_abstention_policy(
            X_train_df, X_masked, y_test, large_mask, model, screening_threshold=screening_lam
        )

        # Save structured results
        summary_rows = [
            {
                "scenario": "Baseline_Clean_Reporting",
                "policy": "Standard_Inference",
                "audit_budget_pct": float(np.mean(clean_flags) * 100.0),
                "high_emitter_recall_pct": clean_recall,
                "large_stratum_recall_pct": float(np.sum(clean_flags & is_high & large_mask) / np.sum(is_high & large_mask) * 100.0),
                "missed_emissions_mt": clean_missed_mt,
                "missed_emitters_count": int(np.sum(is_high & (~clean_flags)))
            },
            {
                "scenario": "Adversarial_MNAR_Top10pct",
                "policy": "Blind_Median_Imputation",
                "audit_budget_pct": res_naive["overall_audit_pct"],
                "high_emitter_recall_pct": res_naive["overall_high_emitter_recall"],
                "large_stratum_recall_pct": res_naive["large_stratum_recall"],
                "missed_emissions_mt": res_naive["missed_emissions_mt"],
                "missed_emitters_count": res_naive["missed_high_emitters_count"]
            },
            {
                "scenario": "Adversarial_MNAR_Top10pct",
                "policy": "Strict_Abstention_AUDIT_REQUIRED",
                "audit_budget_pct": res_abstain["overall_audit_pct"],
                "high_emitter_recall_pct": res_abstain["overall_high_emitter_recall"],
                "large_stratum_recall_pct": res_abstain["large_stratum_recall"],
                "missed_emissions_mt": res_abstain["missed_emissions_mt"],
                "missed_emitters_count": res_abstain["missed_high_emitters_count"]
            }
        ]
        df_summary = pd.DataFrame(summary_rows)
        res_csv = os.path.join(self.output_dir, "mnar_simulation_comparison.csv")
        df_summary.to_csv(res_csv, index=False)
        logger.info(f"Saved MNAR simulation results to: {res_csv}")

        # Summary JSON
        summary_json = os.path.join(self.output_dir, "mnar_simulation_summary.json")
        with open(summary_json, "w", encoding="utf-8") as f:
            json.dump({"status": "COMPLETED", "scenarios": summary_rows}, f, indent=2)

        # Visualization: Missed Emissions and Large-Stratum Recall Under MNAR
        plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5.2), dpi=300)

        # Plot A: Missed Emissions (MT CO2e)
        policies = ["Clean Baseline", "Blind Imputation\n(Adversarial MNAR)", "Strict Abstention\n(CarbonPulse AI+)"]
        missed_vals = [clean_missed_mt, res_naive["missed_emissions_mt"], res_abstain["missed_emissions_mt"]]
        colors = ["#1f77b4", "#d62728", "#2ca02c"]

        bars = ax1.bar(policies, missed_vals, color=colors, width=0.55, alpha=0.88, edgecolor="black")
        ax1.set_ylabel("Undetected Emissions from High Emitters (MT CO2e)", fontsize=10, fontweight="bold")
        ax1.set_title("A. Undetected Emissions Under Adversarial Feature Omission", fontsize=11, fontweight="bold", pad=10)
        for bar in bars:
            h = bar.get_height()
            ax1.text(bar.get_x() + bar.get_width() / 2., h + max(missed_vals) * 0.02, f"{h:,.0f} MT", ha="center", va="bottom", fontsize=10, fontweight="bold")
        ax1.set_ylim(0, max(missed_vals) * 1.18)

        # Plot B: High-Emitter Recall on Large Stratum
        rec_vals = [
            summary_rows[0]["large_stratum_recall_pct"],
            res_naive["large_stratum_recall"],
            res_abstain["large_stratum_recall"]
        ]
        bars2 = ax2.bar(policies, rec_vals, color=colors, width=0.55, alpha=0.88, edgecolor="black")
        ax2.set_ylabel("Recall on Top 10% Large Emitters (%)", fontsize=10, fontweight="bold")
        ax2.set_title("B. Interception Rate on Strategic Large Emitters", fontsize=11, fontweight="bold", pad=10)
        ax2.axhline(90.0, color="gray", linestyle="--", label="Target 90% Recall")
        for bar in bars2:
            h = bar.get_height()
            ax2.text(bar.get_x() + bar.get_width() / 2., h + 2.0, f"{h:.1f}%", ha="center", va="bottom", fontsize=10, fontweight="bold")
        ax2.set_ylim(0, 115)
        ax2.legend(loc="lower right")

        plt.tight_layout()
        plot_path = os.path.join(self.fig_dir, "mnar_abstention_evaluation.png")
        plt.savefig(plot_path, dpi=300)
        plt.close()
        logger.info(f"Saved MNAR plot to: {plot_path}")

        return {"status": "COMPLETED", "summary": summary_rows}

if __name__ == "__main__":
    engine = MNARSimulationEngine()
    out = engine.run_simulation()
    print("Task 3 MNAR Simulation Completed:", out)
