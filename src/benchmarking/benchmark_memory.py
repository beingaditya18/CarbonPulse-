"""
Module: benchmark_memory.py
Profiles RAM resident set size, heap peak memory allocations (via tracemalloc),
and on-disk serialized artifact sizes across candidate models.
"""
import os
import sys
import psutil
import joblib
import tracemalloc
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "results")

def benchmark_memory_consumption():
    os.makedirs(RESULTS_DIR, exist_ok=True)
    
    print("Loading test features for memory profiling...")
    X_test = pd.read_parquet(os.path.join(PROCESSED_DIR, "test_features.parquet"))
    act_test = pd.read_parquet(os.path.join(PROCESSED_DIR, "test_activity.parquet"))
    X_test_raw = pd.read_parquet(os.path.join(PROCESSED_DIR, "test_features_raw.parquet"))
    
    batch_data = X_test.iloc[:500].values
    batch_act = act_test.iloc[:500]
    batch_raw = X_test_raw.iloc[:500]
    
    model_names = ["accounting", "median", "ridge", "gam", "ebm", "rf", "xgboost", "mlp"]
    memory_records = []
    
    process = psutil.Process(os.getpid())
    
    for name in model_names:
        model_path = os.path.join(MODELS_DIR, f"{name}.joblib")
        if not os.path.exists(model_path):
            continue
            
        disk_size_kb = os.path.getsize(model_path) / 1024.0
        
        # Profile memory during loading and prediction
        tracemalloc.start()
        t_snapshot_before = tracemalloc.take_snapshot()
        rss_before = process.memory_info().rss / (1024.0 * 1024.0) # MB
        
        model = joblib.load(model_path)
        
        if name == "accounting":
            _ = model.predict(batch_act)
        elif name == "median":
            _ = model.predict(batch_raw)
        else:
            _ = model.predict(batch_data)
            
        rss_after = process.memory_info().rss / (1024.0 * 1024.0) # MB
        current_mem, peak_mem = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        
        peak_mb = peak_mem / (1024.0 * 1024.0)
        
        memory_records.append({
            "model": name,
            "disk_size_kb": round(disk_size_kb, 2),
            "peak_allocated_memory_mb": round(peak_mb, 3),
            "process_rss_mb": round(rss_after, 2),
            "benchmark_batch_size": 500
        })
        
    mem_df = pd.DataFrame(memory_records)
    mem_df.to_csv(os.path.join(RESULTS_DIR, "memory_benchmarks.csv"), index=False)
    print("Memory benchmarks complete. Saved to results/memory_benchmarks.csv.")
    return mem_df

if __name__ == "__main__":
    benchmark_memory_consumption()
