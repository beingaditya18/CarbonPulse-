"""
Module: run_all_empirical_revisions.py
Path: experimental_workspace/src/empirical_revision/run_all_empirical_revisions.py
Author: Aditya Mandloi, Dr. Ashok Kumar Gupta
Affiliation: School of Data Science and Forecasting, Devi Ahilya Vishwavidyalaya, Indore, India
Description:
    Master orchestration runner for all 5 empirical revision tasks:
    1. Task 1.1: Probabilistic Deep Ensemble with Adversarial Training
    2. Task 1.2: Parsimonious Feature Ablation via TreeSHAP
    3. Task 2: Mathematically Valid Conformal Risk Control with Prespecified Tau
    4. Task 3: Missing Not At Random (MNAR) Simulation and Abstention Policy
    5. Task 4: Rigorous Statistical Multiplicity Corrections
    6. Task 5: Domain Adaptation and Locally Weighted Conformal Calibration for Large Strata
"""

import os
import sys
import json
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("EmpiricalRevisionOrchestrator")

from task1_probabilistic_ensemble import run_probabilistic_ensemble_task
from task1_parsimonious_ablation import run_parsimonious_ablation_task
from task2_prespecified_risk_control import PrespecifiedRiskControl
from task3_mnar_simulation_and_abstention import MNARSimulationEngine
from task4_multiplicity_correction import MultiplicityCorrectedAuditTesting
from task5_domain_adaptation_large_strata import LargeStrataDomainAdaptation

def run_all(skip_slow_ensemble: bool = False):
    start_time = datetime.now()
    logger.info("=" * 80)
    logger.info("STARTING CARBONPULSE AI+ EMPIRICAL REVISION MASTER PIPELINE")
    logger.info(f"Execution Timestamp: {start_time.isoformat()}")
    logger.info("Authors: Aditya Mandloi, Dr. Ashok Kumar Gupta")
    logger.info("=" * 80)

    summary_manifest = {
        "timestamp_start": start_time.isoformat(),
        "tasks": {}
    }

    # Task 1.1: Probabilistic Deep Ensemble
    if not skip_slow_ensemble:
        logger.info("\n>>> [1/6] Running Task 1.1: Probabilistic Deep Ensemble...")
        t1_ens = run_probabilistic_ensemble_task()
        summary_manifest["tasks"]["task1_deep_ensemble"] = t1_ens
    else:
        logger.info("\n>>> [1/6] Skipping Task 1.1 training (using cached results)...")

    # Task 1.2: Parsimonious Ablation
    logger.info("\n>>> [2/6] Running Task 1.2: Parsimonious Feature Ablation...")
    t1_abl = run_parsimonious_ablation_task()
    summary_manifest["tasks"]["task1_parsimonious_ablation"] = t1_abl

    # Task 2: Prespecified Risk Control
    logger.info("\n>>> [3/6] Running Task 2: Prespecified Conformal Risk Control...")
    t2_runner = PrespecifiedRiskControl()
    t2_res = t2_runner.run_all()
    summary_manifest["tasks"]["task2_prespecified_risk_control"] = t2_res

    # Task 3: MNAR Simulation & Abstention
    logger.info("\n>>> [4/6] Running Task 3: MNAR Simulation and Abstention Policy...")
    t3_engine = MNARSimulationEngine()
    t3_res = t3_engine.run_simulation()
    summary_manifest["tasks"]["task3_mnar_simulation"] = t3_res

    # Task 4: Statistical Multiplicity Correction
    logger.info("\n>>> [5/6] Running Task 4: Multiplicity Corrections for Audit Budgets...")
    t4_runner = MultiplicityCorrectedAuditTesting()
    t4_res = t4_runner.run_multiplicity_analysis()
    summary_manifest["tasks"]["task4_multiplicity_correction"] = t4_res

    # Task 5: Domain Adaptation for Large Strata
    logger.info("\n>>> [6/6] Running Task 5: Domain Adaptation and Locally Weighted Conformal...")
    t5_runner = LargeStrataDomainAdaptation()
    t5_res = t5_runner.run_comparison()
    summary_manifest["tasks"]["task5_domain_adaptation"] = t5_res

    end_time = datetime.now()
    summary_manifest["timestamp_end"] = end_time.isoformat()
    summary_manifest["duration_seconds"] = (end_time - start_time).total_seconds()
    summary_manifest["status"] = "ALL_TASKS_COMPLETED_SUCCESSFULLY"

    out_json = "experimental_workspace/results/empirical_revision/master_revision_summary.json"
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(summary_manifest, f, indent=2)

    logger.info("=" * 80)
    logger.info("ALL EMPIRICAL REVISION TASKS COMPLETED SUCCESSFULLY")
    logger.info(f"Total Duration: {summary_manifest['duration_seconds']:.2f} seconds")
    logger.info(f"Summary Manifest: {out_json}")
    logger.info("=" * 80)

if __name__ == "__main__":
    skip = "--skip-ensemble" in sys.argv
    run_all(skip_slow_ensemble=skip)

