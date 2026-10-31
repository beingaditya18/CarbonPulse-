"""
Master Reproducibility Script: run_all.py
Author: CarbonPulse Research Engineering Team
Description:
    One-command master pipeline executing all required tasks (T1-T8)
    for the Journal of Building Engineering research paper:
    - T1: Data audit & reconciliation (exclusion_log.csv, feature_dictionary.csv, split check)
    - T2: Baseline reproduction on held-out test (predictions.csv)
    - T3: Grouped cross-validation (5-fold GroupKFold with numerical overflow fix)
    - T4: Paired statistical comparisons (sign-flip permutation, cluster bootstrap, Wilcoxon, Holm)
    - T5: Explanation stability benchmark (50 real bootstrap refits, Kendall tau, Spearman rho)
    - T6: +5% GFA perturbation sensitivity diagnostic (results/rf_sensitivity_diagnosis.md)
    - T7: Facility-level conformal prediction & CQR (results/conformal_metrics.csv)
    - T8: Applicability domain assessment (results/applicability_domain_metrics.csv)
    - Rule 7: Reproducibility configuration & package versions logging (/results/config.json)
    - Software Quality Assurance: Complete pytest test suite execution

Usage:
    python run_all.py [--quick] [--skip-bootstrap]
"""
import os
import sys
import time
import argparse
import subprocess

def run_stage(stage_name: str, cmd: list[str]):
    print(f"\n{'='*80}")
    print(f"STAGE: {stage_name}")
    print(f"COMMAND: {' '.join(cmd)}")
    print(f"{'='*80}")
    t0 = time.perf_counter()
    res = subprocess.run(cmd)
    elapsed = time.perf_counter() - t0
    if res.returncode != 0:
        print(f"\n[ERROR] Stage '{stage_name}' failed with exit code {res.returncode}")
        sys.exit(res.returncode)
    print(f"[SUCCESS] Stage '{stage_name}' completed in {elapsed:.2f}s.")

def main():
    parser = argparse.ArgumentParser(description="CarbonPulse Master Reproducibility Orchestrator")
    parser.add_argument("--skip-bootstrap", action="store_true", help="Skip 50-bootstrap refit stage to save time")
    parser.add_argument("--skip-tests", action="store_true", help="Skip pytest test suite")
    args = parser.parse_args()

    t_start = time.perf_counter()
    print("=" * 80)
    print("STARTING COMPLETE CARBONPULSE SCIENTIFIC RESEARCH PIPELINE")
    print("=" * 80)

    # Stage 1: Data Audit & Split Confirmation (T1)
    run_stage("T1. Data Audit & Reconciliation", [sys.executable, "-m", "src.data.audit_data"])

    # Stage 2: Baseline Model Reproduction & Predictions Generation (T2)
    run_stage("T2. Baseline Model Evaluation on Held-Out Test", [sys.executable, "-m", "src.experiments.run_evaluation"])

    # Stage 3: Grouped Cross-Validation (T3)
    run_stage("T3. 5-Fold GroupKFold Cross-Validation on Dev", [sys.executable, "-m", "src.experiments.run_grouped_cv"])

    # Stage 4: Paired Statistical Tests & Weighting Comparisons (T4)
    run_stage("T4. Paired Hypothesis Tests & Cluster Inference", [sys.executable, "-m", "src.statistics.paired_comparisons"])

    # Stage 5: Explanation Stability Benchmark (T5)
    if not args.skip_bootstrap:
        run_stage("T5. Explanation Stability Benchmark (50 Bootstrap Refits)", [sys.executable, "-m", "src.explainability.stability_50_bootstrap"])
    else:
        print("\n[INFO] Skipping Stage T5 (50 Bootstrap Refits) via --skip-bootstrap flag.")

    # Stage 6: RF Perturbation Sensitivity Diagnostic (T6)
    run_stage("T6. Random Forest +5% GFA Perturbation Diagnostic", [sys.executable, "-m", "src.diagnostics.rf_perturbation_diagnostic"])

    # Stage 7: Applicability Domain Assessment (T8)
    run_stage("T8. Applicability Domain References & Evaluation", [sys.executable, "-m", "src.experiments.run_applicability_domain"])

    # Stage 8: Facility-Level Conformal Prediction & CQR (T7)
    run_stage("T7. Facility-Level Conformal Prediction & CQR", [sys.executable, "-m", "src.experiments.run_conformal"])

    # Stage 9: Generate Config & Log Package Versions (Hard Rule 7)
    run_stage("Rule 7. Generate Reproducibility Config & Metadata", [sys.executable, "src/reporting/generate_config.py"])

    # Stage 10: Scientific Quality Assurance Test Suite
    if not args.skip_tests:
        run_stage("QA. Automated Software & Scientific Test Suite", [sys.executable, "-m", "pytest", "tests/"])

    total_time = time.perf_counter() - t_start
    print("\n" + "=" * 80)
    print(f"ALL RESEARCH STAGES COMPLETED SUCCESSFULLY IN {total_time/60:.2f} MINUTES")
    print("Outputs generated:")
    print("  - /results/exclusion_log.csv")
    print("  - /results/feature_dictionary.csv")
    print("  - /results/predictions.csv")
    print("  - /results/model_weighting_comparison.csv")
    print("  - /results/paired_model_comparisons.csv")
    print("  - /results/explanation_stability_50_summary.csv")
    print("  - /results/rf_sensitivity_diagnosis.md")
    print("  - /results/applicability_domain_metrics.csv")
    print("  - /results/conformal_metrics.csv")
    print("  - /results/config.json")
    print("=" * 80)

if __name__ == "__main__":
    main()

