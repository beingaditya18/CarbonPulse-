# Table 5: Computational Latency, Memory Footprint, and Operational Energy Consumption

| Architecture | Single Latency (ms) | Throughput (batch 128) | Peak Heap RAM (MB) | Serialized Disk (KB) | Energy / 10k Inferences (kWh) | Operational $\text{CO}_2\text{e}$ Footprint (g) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ACCOUNTING** | 0.222 ms | 475,148 samples/s | 40.28 MB | 0.2 KB | 0.0000000 kWh | 0.0000 g |
| **MEDIAN** | 0.320 ms | 29,307 samples/s | 0.38 MB | 0.4 KB | 0.0000199 kWh | 0.0074 g |
| **RIDGE** | 0.225 ms | 437,435 samples/s | 11.17 MB | 5.2 KB | 0.0000150 kWh | 0.0056 g |
| **GAM** | 3.190 ms | 30,651 samples/s | 10.66 MB | 44.9 KB | 0.0000158 kWh | 0.0058 g |
| **EBM** | 0.764 ms | 179,803 samples/s | 0.80 MB | 423.8 KB | 0.0000000 kWh | 0.0000 g |
| **RF** | 30.184 ms | 4,017 samples/s | 62.78 MB | 63520.9 KB | 0.0000292 kWh | 0.0108 g |
| **XGBOOST** | 0.671 ms | 101,727 samples/s | 1.54 MB | 772.9 KB | 0.0000000 kWh | 0.0000 g |
| **MLP** | 0.398 ms | 133,260 samples/s | 1.13 MB | 389.9 KB | 0.0000000 kWh | 0.0000 g |
