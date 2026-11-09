"""
Module: benchmark_latency.py
Measures micro-inference latency and batch inference throughput across candidate architectures:
- Single-sample latency (ms / sample) across 100 repetitions with warmup.
- Batch throughput (samples / sec) for batch sizes [1, 32, 128, 512].
Saves detailed latency distributions to results/.
"""
import os
import sys
import time
import joblib
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "results")

def benchmark_inference_latency(n_reps: int = 100, n_warmup: int = 10):
    os.makedirs(RESULTS_DIR, exist_ok=True)
    
    print("Loading test features for latency profiling...")
    X_test = pd.read_parquet(os.path.join(PROCESSED_DIR, "test_features.parquet"))
    act_test = pd.read_parquet(os.path.join(PROCESSED_DIR, "test_activity.parquet"))
    X_test_raw = pd.read_parquet(os.path.join(PROCESSED_DIR, "test_features_raw.parquet"))
    
    single_sample = X_test.iloc[[0]].values
    single_act = act_test.iloc[[0]]
    single_raw = X_test_raw.iloc[[0]]
    
    model_names = ["accounting", "median", "ridge", "gam", "ebm", "rf", "xgboost", "mlp"]
    batch_sizes = [1, 32, 128, 512]
    
    latency_records = []
    
    for name in model_names:
        model_path = os.path.join(MODELS_DIR, f"{name}.joblib")
        if not os.path.exists(model_path):
            print(f"Skipping latency test for {name}: model file not found.")
            continue
            
        print(f"Profiling inference latency for {name}...")
        model = joblib.load(model_path)
        
        # Select appropriate input type
        if name == "accounting":
            s_input = single_act
            b_pool = act_test
        elif name == "median":
            s_input = single_raw
            b_pool = X_test_raw
        else:
            s_input = single_sample
            b_pool = X_test
            
        # 1. Warm-up
        for _ in range(n_warmup):
            if name in ["accounting", "median"]:
                _ = model.predict(s_input)
            else:
                _ = model.predict(s_input)
                
        # 2. Single-sample latency (repeated 100 times)
        single_times = []
        for _ in range(n_reps):
            t0 = time.perf_counter()
            _ = model.predict(s_input)
            t1 = time.perf_counter()
            single_times.append((t1 - t0) * 1000.0) # ms
            
        mean_single_ms = float(np.mean(single_times))
        median_single_ms = float(np.median(single_times))
        p95_single_ms = float(np.percentile(single_times, 95))
        std_single_ms = float(np.std(single_times))
        
        # 3. Batch throughput
        batch_throughputs = {}
        for b_size in batch_sizes:
            b_data = b_pool.iloc[:b_size] if len(b_pool) >= b_size else b_pool
            if name not in ["accounting", "median"]:
                b_data = b_data.values
                
            # Warm-up batch
            for _ in range(3):
                _ = model.predict(b_data)
                
            t0 = time.perf_counter()
            for _ in range(20):
                _ = model.predict(b_data)
            t1 = time.perf_counter()
            
            elapsed = t1 - t0
            throughput = (len(b_data) * 20) / elapsed # samples per second
            batch_throughputs[f"throughput_batch_{b_size}"] = round(throughput, 1)
            
        record = {
            "model": name,
            "single_latency_mean_ms": round(mean_single_ms, 4),
            "single_latency_median_ms": round(median_single_ms, 4),
            "single_latency_p95_ms": round(p95_single_ms, 4),
            "single_latency_std_ms": round(std_single_ms, 4),
            "repetitions": n_reps,
            **batch_throughputs
        }
        latency_records.append(record)
        
    lat_df = pd.DataFrame(latency_records)
    lat_df.to_csv(os.path.join(RESULTS_DIR, "latency_benchmarks.csv"), index=False)
    print("Latency benchmarks complete. Saved to results/latency_benchmarks.csv.")
    return lat_df

if __name__ == "__main__":
    benchmark_inference_latency()
