# Computational Efficiency & Operational Carbon Footprint Report

**Study:** Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation  
**Hardware Platform:** AMD64 Family 25 Model 80 Stepping 0, AuthenticAMD (8 Physical Cores, 16 Logical Cores)  
**RAM:** 15.3 GB  
**Operating System:** Windows 11  
**Workload:** Standardized batch of 10,000 inference queries  
**Date:** October 2026  

---

## 1. Master Computational Benchmarks Table

| Model Architecture | Latency (ms/sample) | Throughput (samples/s) | Peak Memory (MB) | Disk Size (KB) | Energy / 10k Inferences (kWh) | Carbon Footprint (g $\text{CO}_2\text{e}$) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ACCOUNTING** | 0.222 ms | 475,148 | 40.28 MB | 0.2 KB | 0.000000 | 0.0000 g |
| **MEDIAN** | 0.320 ms | 29,307 | 0.38 MB | 0.4 KB | 0.000020 | 0.0074 g |
| **RIDGE** | 0.225 ms | 437,435 | 11.17 MB | 5.2 KB | 0.000015 | 0.0056 g |
| **GAM** | 3.190 ms | 30,651 | 10.66 MB | 44.9 KB | 0.000016 | 0.0058 g |
| **EBM** | 0.764 ms | 179,803 | 0.80 MB | 423.8 KB | 0.000000 | 0.0000 g |
| **RF** | 30.184 ms | 4,017 | 62.78 MB | 63520.9 KB | 0.000029 | 0.0108 g |
| **XGBOOST** | 0.671 ms | 101,727 | 1.54 MB | 772.9 KB | 0.000000 | 0.0000 g |
| **MLP** | 0.398 ms | 133,260 | 1.13 MB | 389.9 KB | 0.000000 | 0.0000 g |

---

## 2. Green AI & Environmental Net Impact Analysis

### 2.1 Operational Footprint vs. Mitigated Real-World Emissions
* **Computational Footprint Scale:** The computational energy required to evaluate 10,000 building filings ranges from micro-watt-hours to a few milli-watt-hours, corresponding to less than $1\text{ g } \text{CO}_2\text{e}$.
* **Real-World Target Scale:** In contrast, a typical commercial building in Seattle emits between $30\text{ and } 500\text{ Metric Tons } \text{CO}_2\text{e}$ annually ($30,000,000\text{ to } 500,000,000\text{ g } \text{CO}_2\text{e}$).
* **Net Value Proposition:** Even a marginal $0.5\%$ optimization in heating schedule or retrofit identification enabled by an accurate explainable model offsets its lifetime computational inference footprint by several orders of magnitude within minutes of deployment.
