"""
Module: benchmark_energy.py
Profiles inference operational energy consumption and computational carbon footprint
for a standardized workload of 10,000 predictions per candidate model architecture.
Implements:
1. Direct hardware energy tracking via CodeCarbon (Windows EMI / RAPL).
2. Explicit software power modeling (TDP baseline) with transparent labeling when hardware counters are unavailable.
3. Rigorous physical and thermodynamic conversion reconciliation between Joules, kWh, and grams CO2e.
"""
import os
import sys
import time
import joblib
import platform
import psutil
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "results")
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "reports")

# Regional average electricity grid emissions factor for computational footprint
# U.S. National average: ~0.370 kg CO2e / kWh
GRID_EMISSIONS_FACTOR_KG_PER_KWH = 0.370
JOULES_PER_KWH = 3600000.0

def benchmark_inference_energy(n_calls: int = 10000):
    os.makedirs(RESULTS_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)
    
    print("Loading test features for energy benchmarking...")
    X_test = pd.read_parquet(os.path.join(PROCESSED_DIR, "test_features.parquet"))
    act_test = pd.read_parquet(os.path.join(PROCESSED_DIR, "test_activity.parquet"))
    X_test_raw = pd.read_parquet(os.path.join(PROCESSED_DIR, "test_features_raw.parquet"))
    
    batch_size = 500
    n_batches = n_calls // batch_size
    
    X_batch = X_test.iloc[:batch_size].values
    act_batch = act_test.iloc[:batch_size]
    raw_batch = X_test_raw.iloc[:batch_size]
    
    model_names = ["accounting", "median", "ridge", "gam", "ebm", "rf", "xgboost", "mlp"]
    energy_records = []
    
    for name in model_names:
        model_path = os.path.join(MODELS_DIR, f"{name}.joblib")
        if not os.path.exists(model_path):
            continue
            
        model = joblib.load(model_path)
        print(f"Benchmarking energy for model '{name}' over {n_calls:,} inferences...")
        
        if name == "accounting":
            b_input = act_batch
        elif name == "median":
            b_input = raw_batch
        else:
            b_input = X_batch
            
        # 1. Warm-up phase (5 batches to prime CPU caches and JIT scaling)
        for _ in range(5):
            _ = model.predict(b_input)
            
        # 2. Hardware tracking attempt via CodeCarbon
        tracker = None
        codecarbon_energy_kwh = None
        cpu_energy_kwh = 0.0
        ram_energy_kwh = 0.0
        gpu_energy_kwh = 0.0
        
        try:
            from codecarbon import OfflineEmissionsTracker
            tracker = OfflineEmissionsTracker(country_iso_code="USA", log_level="error", save_to_file=False)
            tracker.start()
        except Exception:
            tracker = None
            
        t0 = time.perf_counter()
        for _ in range(n_batches):
            _ = model.predict(b_input)
        t1 = time.perf_counter()
        elapsed_sec = t1 - t0
        
        if tracker is not None:
            try:
                tracker.stop()
                if tracker.final_emissions_data and tracker.final_emissions_data.energy_consumed > 0:
                    codecarbon_energy_kwh = float(tracker.final_emissions_data.energy_consumed)
                    cpu_energy_kwh = float(getattr(tracker.final_emissions_data, 'cpu_energy', 0.0) or 0.0)
                    ram_energy_kwh = float(getattr(tracker.final_emissions_data, 'ram_energy', 0.0) or 0.0)
                    gpu_energy_kwh = float(getattr(tracker.final_emissions_data, 'gpu_energy', 0.0) or 0.0)
            except Exception:
                codecarbon_energy_kwh = None
                
        # 3. Determine measurement method and compute strictly reconciled energy
        if codecarbon_energy_kwh is not None and codecarbon_energy_kwh > 0:
            method_used = "Hardware_Tracking_Windows_EMI_CodeCarbon"
            final_kwh = codecarbon_energy_kwh
            # Reconcile Joules strictly from measured kWh
            energy_joules = final_kwh * JOULES_PER_KWH
            mean_power_watts = energy_joules / elapsed_sec if elapsed_sec > 0 else 0.0
            formula_used = "Joules = kWh * 3,600,000; gCO2e = kWh * 0.370 * 1000"
        else:
            # Software active TDP power model
            method_used = "Software_TDP_Model_45W"
            assumed_power_watts = 45.0  # Conservative active TDP baseline in Watts
            energy_joules = assumed_power_watts * elapsed_sec
            final_kwh = energy_joules / JOULES_PER_KWH
            mean_power_watts = assumed_power_watts
            cpu_energy_kwh = final_kwh
            formula_used = "Joules = Watts * Time(s); kWh = Joules / 3,600,000; gCO2e = kWh * 0.370 * 1000"
            
        computational_emissions_g_co2e = (final_kwh * GRID_EMISSIONS_FACTOR_KG_PER_KWH) * 1000.0
        
        energy_records.append({
            "model": name,
            "inference_calls": n_calls,
            "batch_size": batch_size,
            "measurement_method": method_used,
            "duration_seconds": round(elapsed_sec, 6),
            "latency_per_sample_us": round((elapsed_sec / n_calls) * 1e6, 2),
            "energy_joules": round(energy_joules, 6),
            "energy_kwh": float(f"{final_kwh:.12e}"),
            "effective_mean_power_watts": round(mean_power_watts, 4),
            "computational_emissions_g_co2e": round(computational_emissions_g_co2e, 8),
            "grid_intensity_source": "US Average eGRID 0.370 kg CO2e / kWh",
            "energy_conversion_formula": formula_used,
            "cpu_energy_kwh": float(f"{cpu_energy_kwh:.12e}"),
            "ram_energy_kwh": float(f"{ram_energy_kwh:.12e}"),
            "gpu_energy_kwh": float(f"{gpu_energy_kwh:.12e}")
        })
        
    energy_df = pd.DataFrame(energy_records)
    energy_df.to_csv(os.path.join(RESULTS_DIR, "energy_benchmarks.csv"), index=False)
    
    # Merge with latency and memory benchmarks
    merge_computational_benchmarks(energy_df)
    return energy_df

def merge_computational_benchmarks(energy_df: pd.DataFrame):
    lat_path = os.path.join(RESULTS_DIR, "latency_benchmarks.csv")
    mem_path = os.path.join(RESULTS_DIR, "memory_benchmarks.csv")
    
    lat_df = pd.read_csv(lat_path) if os.path.exists(lat_path) else pd.DataFrame()
    mem_df = pd.read_csv(mem_path) if os.path.exists(mem_path) else pd.DataFrame()
    
    merged = energy_df.copy()
    if not lat_df.empty:
        merged = pd.merge(merged, lat_df[["model", "single_latency_mean_ms", "throughput_batch_128"]], on="model", how="left")
    if not mem_df.empty:
        merged = pd.merge(merged, mem_df[["model", "disk_size_kb", "peak_allocated_memory_mb"]], on="model", how="left")
        
    merged.to_csv(os.path.join(RESULTS_DIR, "computational_benchmarks.csv"), index=False)
    create_computational_report(merged)

def create_computational_report(comp_df: pd.DataFrame):
    report_path = os.path.join(REPORTS_DIR, "computational_efficiency.md")
    
    content = f"""# Computational Efficiency & Operational Carbon Footprint Report

**Study:** Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation  
**Hardware Platform:** {platform.processor()} ({psutil.cpu_count(logical=False)} Physical Cores, {psutil.cpu_count(logical=True)} Logical Cores)  
**RAM:** {psutil.virtual_memory().total / (1024**3):.1f} GB  
**Operating System:** {platform.system()} {platform.release()}  
**Workload:** Standardized batch of 10,000 inference queries  
**Date:** October 2026  

---

## 1. Computational Benchmark Results

| Model Architecture | Measurement Method | Duration (s) | Single Latency (ms) | Throughput (batch 128) | Peak RAM (MB) | Disk Size (KB) | Energy (kWh) | Energy (Joules) | Mean Power (W) | Footprint (g $\\text{{CO}}_2\\text{{e}}$) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
"""
    for _, r in comp_df.iterrows():
        method = r.get("measurement_method", "N/A")
        dur = f"{r.get('duration_seconds', 0.0):.4f}"
        lat = f"{r.get('single_latency_mean_ms', 0.0):.3f}"
        tp = f"{r.get('throughput_batch_128', 0.0):,.0f}"
        mem = f"{r.get('peak_allocated_memory_mb', 0.0):.2f}"
        disk = f"{r.get('disk_size_kb', 0.0):.1f}"
        kwh = f"{r.get('energy_kwh', 0.0):.8f}"
        joules = f"{r.get('energy_joules', 0.0):.3f}"
        power = f"{r.get('effective_mean_power_watts', 0.0):.1f}"
        gco2 = f"{r.get('computational_emissions_g_co2e', 0.0):.4f}"
        content += f"| **{r['model'].upper()}** | `{method}` | {dur}s | {lat} ms | {tp} s/s | {mem} MB | {disk} KB | {kwh} | {joules} J | {power} W | {gco2} g |\n"
        
    content += f"""
---

## 2. Measurement Boundary & Conversion Rigor
* **Boundary:** Pure mathematical model forward-pass execution (inference loops) across 10,000 samples in batches of 500, isolating compute operations from disk I/O and preprocessing overhead.
* **Conversion Rigor:** Energy in Joules is strictly reconciled with energy in kilowatt-hours:
  $$\\text{{Energy (Joules)}} = \\text{{Energy (kWh)}} \\times 3,600,000$$
* **Grid Emission Factor:** US National Average grid intensity of $0.370\\text{{ kg CO}}_2\\text{{e/kWh}}$ (EPA eGRID baseline):
  $$\\text{{Footprint (g CO}}_2\\text{{e)}} = \\text{{Energy (kWh)}} \\times 0.370 \\times 1000$$
* **Reporting Honesty:** Direct hardware tracking via Windows EMI / CodeCarbon is labeled as `Hardware_Tracking_Windows_EMI_CodeCarbon`. In fallback conditions, software power models are labeled as `Software_TDP_Model_45W` and are never conflated with hardware energy meter readings.
"""
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Computational efficiency report generated.")

if __name__ == "__main__":
    benchmark_inference_energy()
