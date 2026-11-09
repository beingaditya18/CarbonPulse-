# Computational Efficiency & Operational Carbon Footprint Report

> **Disclaimer:** These exploratory computational-energy outputs were measured on one Windows host with CodeCarbon, have no validated measurement protocol, and are NOT used in the accompanying chapter.

**Study:** Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation  
**Hardware Platform:** AMD64 Family 25 Model 80 Stepping 0, AuthenticAMD (8 Physical Cores, 16 Logical Cores)  
**RAM:** 15.3 GB  
**Operating System:** Windows 11  
**Workload:** Standardized batch of 10,000 inference queries  
**Date:** October 2026  

---

## 1. Computational Benchmark Results

| Model Architecture | Measurement Method | Duration (s) | Single Latency (ms) | Throughput (batch 128) | Peak RAM (MB) | Disk Size (KB) | Energy (kWh) | Energy (Joules) | Mean Power (W) | Footprint (g $\text{CO}_2\text{e}$) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ACCOUNTING** | `Hardware_Tracking_Windows_EMI_CodeCarbon` | 0.0143s | 0.222 ms | 475,148 s/s | 40.28 MB | 0.2 KB | 0.00000001 | 0.051 J | 3.6 W | 0.0000 g |
| **MEDIAN** | `Hardware_Tracking_Windows_EMI_CodeCarbon` | 0.0514s | 0.320 ms | 29,307 s/s | 0.38 MB | 0.4 KB | 0.00001913 | 68.886 J | 1339.6 W | 0.0071 g |
| **RIDGE** | `Hardware_Tracking_Windows_EMI_CodeCarbon` | 0.0182s | 0.225 ms | 437,435 s/s | 11.17 MB | 5.2 KB | 0.00000002 | 0.060 J | 3.3 W | 0.0000 g |
| **GAM** | `Hardware_Tracking_Windows_EMI_CodeCarbon` | 0.4155s | 3.190 ms | 30,651 s/s | 10.66 MB | 44.9 KB | 0.00000285 | 10.253 J | 24.7 W | 0.0011 g |
| **EBM** | `Hardware_Tracking_Windows_EMI_CodeCarbon` | 0.0459s | 0.764 ms | 179,803 s/s | 0.80 MB | 423.8 KB | 0.00000001 | 0.051 J | 1.1 W | 0.0000 g |
| **RF** | `Hardware_Tracking_Windows_EMI_CodeCarbon` | 3.7713s | 30.184 ms | 4,017 s/s | 62.78 MB | 63520.9 KB | 0.00002253 | 81.113 J | 21.5 W | 0.0083 g |
| **XGBOOST** | `Hardware_Tracking_Windows_EMI_CodeCarbon` | 0.0565s | 0.671 ms | 101,727 s/s | 1.54 MB | 772.9 KB | 0.00000034 | 1.238 J | 21.9 W | 0.0001 g |
| **MLP** | `Hardware_Tracking_Windows_EMI_CodeCarbon` | 0.0542s | 0.398 ms | 133,260 s/s | 1.13 MB | 389.9 KB | 0.00000031 | 1.126 J | 20.8 W | 0.0001 g |

---

## 2. Measurement Boundary & Conversion Rigor
* **Boundary:** Pure mathematical model forward-pass execution (inference loops) across 10,000 samples in batches of 500, isolating compute operations from disk I/O and preprocessing overhead.
* **Conversion Rigor:** Energy in Joules is strictly reconciled with energy in kilowatt-hours:
  $$\text{Energy (Joules)} = \text{Energy (kWh)} \times 3,600,000$$
* **Grid Emission Factor:** US National Average grid intensity of $0.370\text{ kg CO}_2\text{e/kWh}$ (EPA eGRID baseline):
  $$\text{Footprint (g CO}_2\text{e)} = \text{Energy (kWh)} \times 0.370 \times 1000$$
* **Reporting Honesty:** Direct hardware tracking via Windows EMI / CodeCarbon is labeled as `Hardware_Tracking_Windows_EMI_CodeCarbon`. In fallback conditions, software power models are labeled as `Software_TDP_Model_45W` and are never conflated with hardware energy meter readings.
