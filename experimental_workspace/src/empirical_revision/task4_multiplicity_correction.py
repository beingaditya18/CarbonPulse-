"""
Module: task4_multiplicity_correction.py
Path: experimental_workspace/src/empirical_revision/task4_multiplicity_correction.py
Author: Aditya Mandloi, Dr. Ashok Kumar Gupta
Affiliation: School of Data Science and Forecasting, Devi Ahilya Vishwavidyalaya, Indore, India
Description:
    Task 4: Rigorous Statistical Multiplicity Corrections for Paired Audit-Budget Permutation Tests.
    Passes raw permutation p-values through statsmodels.stats.multitest.multipletests(method='holm'),
    calculates exact cluster sign-flip distributions (B=10,000) and bootstrap 95% confidence intervals
    on n=757 independent facilities across statutory audit budgets (1%, 5%, 10%, 20%).
"""

import os
import sys
import json
import logging
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
from statsmodels.stats.multitest import multipletests
from scipy import stats
import matplotlib.pyplot as plt

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("Task4Multiplicity")

class MultiplicityCorrectedAuditTesting:
    def __init__(
        self,
        budgets: List[float] = [0.01, 0.05, 0.10, 0.20],
        n_permutations: int = 10000,
        n_bootstrap: int = 5000,
        seed: int = 42,
        output_dir: str = "experimental_workspace/results/empirical_revision"
    ):
        self.budgets = budgets
        self.n_permutations = n_permutations
        self.n_bootstrap = n_bootstrap
        self.seed = seed
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        self.fig_dir = os.path.join(output_dir, "figures")
        os.makedirs(self.fig_dir, exist_ok=True)

    def load_facility_data(self) -> pd.DataFrame:
        """Loads predictions and aggregates across years to facility level (OSEBuildingID, n=757)."""
        preds_df = pd.read_csv("results/test_predictions.csv")
        models = ["xgboost", "rf", "ridge", "ebm", "median"]
        bldg_df = preds_df.groupby("OSEBuildingID")[["Actual"] + models].mean().reset_index()
        logger.info(f"Aggregated {len(preds_df)} test filings into {len(bldg_df)} independent facility units.")
        return bldg_df

    def compute_audit_selection(self, bldg_df: pd.DataFrame) -> Tuple[Dict[str, Dict[float, np.ndarray]], float]:
        """Calculates binary selection indicator per model and budget tier."""
        n_bldgs = len(bldg_df)
        tot_emissions = float(bldg_df["Actual"].sum())
        models = ["xgboost", "rf", "ridge", "ebm", "median"]

        selected = {m: {} for m in models + ["oracle"]}
        oracle_idx = np.argsort(-bldg_df["Actual"].values)

        for m in models:
            pred_vals = bldg_df[m].values
            sorted_idx = np.argsort(-pred_vals)
            for f in self.budgets:
                k = max(1, int(np.floor(f * n_bldgs)))
                mask = np.zeros(n_bldgs, dtype=bool)
                mask[sorted_idx[:k]] = True
                selected[m][f] = mask

        for f in self.budgets:
            k = max(1, int(np.floor(f * n_bldgs)))
            o_mask = np.zeros(n_bldgs, dtype=bool)
            o_mask[oracle_idx[:k]] = True
            selected["oracle"][f] = o_mask

        return selected, tot_emissions

    def run_permutation_and_bootstrap_tests(
        self,
        bldg_df: pd.DataFrame,
        selected_sets: Dict[str, Dict[float, np.ndarray]],
        tot_emissions: float
    ) -> pd.DataFrame:
        """
        Runs sign-flip permutation tests (B=10,000) and bootstrap CIs (B=5,000)
        for XGBoost vs all baseline models across all budget fractions.
        """
        rng = np.random.RandomState(self.seed)
        n = len(bldg_df)
        actuals = bldg_df["Actual"].values
        comparators = ["rf", "ridge", "ebm", "median"]

        records = []
        for f in self.budgets:
            k = max(1, int(np.floor(f * n)))
            mask_xgb = selected_sets["xgboost"][f]
            xgb_captured = float(actuals[mask_xgb].sum())

            for comp in comparators:
                mask_comp = selected_sets[comp][f]
                comp_captured = float(actuals[mask_comp].sum())

                # Building-level paired differences: D_j = Y_j * (I_xgb,j - I_comp,j)
                D = actuals * (mask_xgb.astype(float) - mask_comp.astype(float))
                obs_diff = float(np.sum(D))
                obs_gain_pct = (obs_diff / tot_emissions) * 100.0

                # 1. Sign-Flip Permutation Test (B=10,000)
                # Under H0, signs of differences are exchangeable with -1 / +1
                signs = rng.choice([-1.0, 1.0], size=(self.n_permutations, n))
                perm_diffs = np.dot(signs, D)
                raw_p_perm = float(np.mean(np.abs(perm_diffs) >= np.abs(obs_diff)))
                raw_p_perm = max(1.0 / (self.n_permutations + 1), raw_p_perm)

                # 2. Bootstrap 95% Confidence Interval (B=5,000)
                boot_idx = rng.choice(n, size=(self.n_bootstrap, n), replace=True)
                boot_diffs = np.sum(D[boot_idx], axis=1)
                ci_lo = float(np.percentile(boot_diffs, 2.5))
                ci_hi = float(np.percentile(boot_diffs, 97.5))

                # Wilcoxon signed-rank test
                nz_diffs = D[D != 0]
                if len(nz_diffs) > 0:
                    try:
                        w_stat, w_pval = stats.wilcoxon(nz_diffs, alternative="two-sided")
                    except Exception:
                        w_stat, w_pval = np.nan, 1.0
                else:
                    w_stat, w_pval = 0.0, 1.0

                records.append({
                    "budget_fraction": f,
                    "budget_pct": f * 100.0,
                    "audited_count": k,
                    "comparison": f"XGBoost vs {comp.upper()}",
                    "comparator": comp.upper(),
                    "xgb_captured_mt": xgb_captured,
                    "comp_captured_mt": comp_captured,
                    "diff_captured_mt": obs_diff,
                    "portfolio_gain_pct": obs_gain_pct,
                    "ci_95_lower_mt": ci_lo,
                    "ci_95_upper_mt": ci_hi,
                    "raw_perm_p_value": raw_p_perm,
                    "wilcoxon_stat": float(w_stat),
                    "wilcoxon_p_value": float(w_pval)
                })

        df_tests = pd.DataFrame(records)

        # 3. Formal Multiplicity Corrections via statsmodels
        raw_pvals = df_tests["raw_perm_p_value"].values

        # Holm-Bonferroni (FWER control)
        reject_holm, pvals_holm, _, _ = multipletests(raw_pvals, alpha=0.05, method="holm")
        # Benjamini-Hochberg (FDR control)
        reject_fdr, pvals_fdr, _, _ = multipletests(raw_pvals, alpha=0.05, method="fdr_bh")

        df_tests["holm_adjusted_p_value"] = pvals_holm
        df_tests["holm_reject_h0"] = reject_holm
        df_tests["bh_fdr_adjusted_p_value"] = pvals_fdr
        df_tests["bh_fdr_reject_h0"] = reject_fdr

        return df_tests

    def run_multiplicity_analysis(self) -> Dict[str, Any]:
        logger.info("Executing Task 4: Multiplicity-Corrected Statistical Testing...")
        bldg_df = self.load_facility_data()
        selected_sets, tot_emissions = self.compute_audit_selection(bldg_df)

        df_tests = self.run_permutation_and_bootstrap_tests(bldg_df, selected_sets, tot_emissions)

        # Save structured results
        csv_path = os.path.join(self.output_dir, "multiplicity_corrected_audit_tests.csv")
        df_tests.to_csv(csv_path, index=False)
        logger.info(f"Saved multiplicity-corrected statistical tests to: {csv_path}")

        # Summary JSON
        summary_data = {
            "status": "COMPLETED",
            "statistical_unit": "OSEBuildingID (n=757)",
            "n_permutations": self.n_permutations,
            "n_bootstrap": self.n_bootstrap,
            "total_hypotheses_tested": len(df_tests),
            "holm_significant_count": int(df_tests["holm_reject_h0"].sum()),
            "tests": df_tests.to_dict(orient="records")
        }
        json_path = os.path.join(self.output_dir, "multiplicity_corrected_summary.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(summary_data, f, indent=2)

        # Visualization: P-value adjustment and Emissions Gains with 95% CIs
        plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5.5), dpi=300)

        # Plot A: Emissions Gain (Diff MT) with 95% Bootstrap CIs across budgets
        rf_subset = df_tests[df_tests["comparator"] == "RF"].sort_values("budget_fraction")
        med_subset = df_tests[df_tests["comparator"] == "MEDIAN"].sort_values("budget_fraction")

        x = np.arange(len(self.budgets))
        w = 0.35

        ax1.bar(x - w/2, med_subset["diff_captured_mt"], width=w, label="XGBoost vs Median Baseline", color="#2ca02c", alpha=0.85, edgecolor="black")
        ax1.errorbar(x - w/2, med_subset["diff_captured_mt"],
                     yerr=[med_subset["diff_captured_mt"] - med_subset["ci_95_lower_mt"], med_subset["ci_95_upper_mt"] - med_subset["diff_captured_mt"]],
                     fmt='none', ecolor='black', capsize=4, lw=1.5)

        ax1.bar(x + w/2, rf_subset["diff_captured_mt"], width=w, label="XGBoost vs Random Forest", color="#1f77b4", alpha=0.85, edgecolor="black")
        ax1.errorbar(x + w/2, rf_subset["diff_captured_mt"],
                     yerr=[rf_subset["diff_captured_mt"] - rf_subset["ci_95_lower_mt"], rf_subset["ci_95_upper_mt"] - rf_subset["diff_captured_mt"]],
                     fmt='none', ecolor='black', capsize=4, lw=1.5)

        ax1.set_xticks(x)
        ax1.set_xticklabels([f"{int(b*100)}% Budget\n(k={max(1, int(np.floor(b*757)))})" for b in self.budgets], fontsize=10)
        ax1.set_ylabel("Emissions Gain (MT CO2e) [95% Bootstrap CI]", fontsize=10, fontweight="bold")
        ax1.set_title("A. Paired Audit Emissions Advantage Over Baselines", fontsize=11, fontweight="bold", pad=10)
        ax1.legend(loc="upper left")

        # Plot B: P-value Multiplicity Adjustment: Raw vs Holm vs BH
        # Sort by raw p-value
        sorted_df = df_tests.sort_values("raw_perm_p_value").reset_index(drop=True)
        idx_tests = np.arange(1, len(sorted_df) + 1)

        ax2.plot(idx_tests, sorted_df["raw_perm_p_value"], marker="o", color="#d62728", lw=1.8, label="Raw Permutation $p$-value")
        ax2.plot(idx_tests, sorted_df["holm_adjusted_p_value"], marker="s", color="#1f77b4", lw=1.8, label="Holm-Bonferroni Adjusted $p$-value")
        ax2.plot(idx_tests, sorted_df["bh_fdr_adjusted_p_value"], marker="^", color="#2ca02c", lw=1.8, linestyle="--", label="Benjamini-Hochberg FDR $p$-value")
        ax2.axhline(0.05, color="black", linestyle=":", lw=1.5, label=r"Significance Level $\alpha = 0.05$")

        ax2.set_xlabel("Ranked Hypothesis Test Index", fontsize=10, fontweight="bold")
        ax2.set_ylabel("$p$-value", fontsize=10, fontweight="bold")
        ax2.set_title("B. Multiplicity Corrections Across All 16 Paired Tests", fontsize=11, fontweight="bold", pad=10)
        ax2.legend(loc="upper left")

        plt.tight_layout()
        plot_path = os.path.join(self.fig_dir, "audit_budget_multiplicity_analysis.png")
        plt.savefig(plot_path, dpi=300)
        plt.close()
        logger.info(f"Saved multiplicity correction plot to: {plot_path}")

        return summary_data

if __name__ == "__main__":
    runner = MultiplicityCorrectedAuditTesting()
    res = runner.run_multiplicity_analysis()
    print("Task 4 Multiplicity Correction Completed.")

