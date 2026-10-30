"""
Module: run_all.py
Master Orchestration Script for the Explainable AI Carbon Benchmarking Pipeline.
Executes all experimental stages from data validation to report generation.

Usage:
    python src/experiments/run_all.py [--quick] [--skip-train]
"""
import os
import sys
import argparse
import subprocess
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

def run_step(step_name: str, cmd: list[str]):
    print(f"\n{'='*70}")
    print(f"STEP: {step_name}")
    print(f"COMMAND: {' '.join(cmd)}")
    print(f"{'='*70}")
    t0 = time.perf_counter()
    res = subprocess.run(cmd)
    elapsed = time.perf_counter() - t0
    if res.returncode != 0:
        print(f"FAILED: Step '{step_name}' exited with error code {res.returncode}")
        sys.exit(res.returncode)
    print(f"SUCCESS: Step '{step_name}' completed in {elapsed:.2f} seconds.")

def main():
    parser = argparse.ArgumentParser(description="Master Research Pipeline Orchestrator")
    parser.add_argument("--skip-train", action="store_true", help="Skip model training if models/ already populated")
    parser.add_argument("--skip-tests", action="store_true", help="Skip automated pytest suite")
    args = parser.parse_args()
    
    t_start = time.perf_counter()
    print("STARTING COMPLETE REPRODUCIBLE RESEARCH BENCHMARKING PIPELINE...")
    
    # 1. Environment & Data Validation
    run_step("1. Data Ingestion & Quality Validation", [sys.executable, "src/data/validate_data.py"])
    
    # 2. Preprocessing & Partitioning
    run_step("2. Leakage-Free Preprocessing & Group Partitioning", [sys.executable, "src/data/preprocess.py"])
    
    # 3. Create CV Splits & Experimental Protocol
    run_step("3. GroupKFold Cross-Validation Splitting", [sys.executable, "src/experiments/create_splits.py"])
    
    # 4. GroupKFold Cross-Validation Model Evaluation
    if not args.skip_train:
        run_step("4. 5-Fold GroupKFold Cross-Validation Evaluation", [sys.executable, "src/experiments/run_cross_validation.py"])
        run_step("5. Candidate Model Architecture Training", [sys.executable, "src/experiments/run_training.py"])
    else:
        print("\nSkipping Steps 4-5 (Cross-Validation & Training) as requested via --skip-train.")
        
    # 6. Held-Out Evaluation
    run_step("6. Held-Out Test Evaluation & Metrics", [sys.executable, "src/experiments/run_evaluation.py"])
    
    # 6. Explainability Benchmarks
    run_step("6. Explainability & Attribution Benchmarks", [sys.executable, "src/explainability/run_explainers.py"])
    
    # 7. Explanation Stability & Robustness
    run_step("7. Explanation Stability & Perturbation Tests", [sys.executable, "src/explainability/stability_tests.py"])
    
    # 8. Computational Latency Profiling
    run_step("8. Inference Latency & Batch Throughput Benchmarks", [sys.executable, "src/benchmarking/benchmark_latency.py"])
    
    # 9. Memory Benchmarking
    run_step("9. Resident Memory & Tracemalloc Allocation Benchmarks", [sys.executable, "src/benchmarking/benchmark_memory.py"])
    
    # 10. Energy & Operational Footprint
    run_step("10. Inference Energy Consumption & Green AI Footprint", [sys.executable, "src/benchmarking/benchmark_energy.py"])
    
    # 11. Statistical Hypothesis Tests & Pareto Frontier
    run_step("11. Paired Statistical Tests & Confidence Intervals", [sys.executable, "src/statistics/paired_comparisons.py"])
    run_step("12. Multi-Objective Pareto Frontier Analysis", [sys.executable, "src/statistics/pareto_analysis.py"])
    
    # 12. Ablation Analysis
    run_step("13. Empirical Feature & Target Ablations", [sys.executable, "src/experiments/run_ablations.py"])
    
    # 13. Reporting (Tables, Figures, Final Report)
    run_step("14. Publication Figures Generation (15 Plots)", [sys.executable, "src/reporting/generate_figures.py"])
    run_step("15. Publication Tables Generation (8 Tables)", [sys.executable, "src/reporting/generate_tables.py"])
    run_step("16. Master Research Report Generation", [sys.executable, "src/reporting/generate_report.py"])
    
    # 14. Software Test Suite
    if not args.skip_tests:
        run_step("17. Automated Scientific Software Quality Assurance (Pytest)", [sys.executable, "-m", "pytest", "tests/"])
        
    total_elapsed = time.perf_counter() - t_start
    print(f"\n{'='*70}")
    print(f"PIPELINE COMPLETE: All 17 research stages executed successfully in {total_elapsed/60:.2f} minutes.")
    print(f"Results: results/")
    print(f"Figures: figures/")
    print(f"Tables:  tables/")
    print(f"Reports: reports/")
    print(f"Manuscript: manuscript/")
    print(f"{'='*70}")

if __name__ == "__main__":
    main()
