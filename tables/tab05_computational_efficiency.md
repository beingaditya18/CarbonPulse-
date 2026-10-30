# Table 5: Computational Latency, Memory Footprint, and Operational Energy Consumption

| Architecture | Measurement Method | Single Latency (ms) | Throughput (batch 128) | Peak Heap RAM (MB) | Serialized Disk (KB) | Energy / 10k Inferences (kWh) | Operational $\text{CO}_2\text{e}$ Footprint (g) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ACCOUNTING** | `Hardware_Tracking_Windows_EMI_CodeCarbon` | 0.222 ms | 475,148 samples/s | 40.28 MB | 0.2 KB | 0.00000001 kWh | 0.0000 g |
| **MEDIAN** | `Hardware_Tracking_Windows_EMI_CodeCarbon` | 0.320 ms | 29,307 samples/s | 0.38 MB | 0.4 KB | 0.00001913 kWh | 0.0071 g |
| **RIDGE** | `Hardware_Tracking_Windows_EMI_CodeCarbon` | 0.225 ms | 437,435 samples/s | 11.17 MB | 5.2 KB | 0.00000002 kWh | 0.0000 g |
| **GAM** | `Hardware_Tracking_Windows_EMI_CodeCarbon` | 3.190 ms | 30,651 samples/s | 10.66 MB | 44.9 KB | 0.00000285 kWh | 0.0011 g |
| **EBM** | `Hardware_Tracking_Windows_EMI_CodeCarbon` | 0.764 ms | 179,803 samples/s | 0.80 MB | 423.8 KB | 0.00000001 kWh | 0.0000 g |
| **RF** | `Hardware_Tracking_Windows_EMI_CodeCarbon` | 30.184 ms | 4,017 samples/s | 62.78 MB | 63520.9 KB | 0.00002253 kWh | 0.0083 g |
| **XGBOOST** | `Hardware_Tracking_Windows_EMI_CodeCarbon` | 0.671 ms | 101,727 samples/s | 1.54 MB | 772.9 KB | 0.00000034 kWh | 0.0001 g |
| **MLP** | `Hardware_Tracking_Windows_EMI_CodeCarbon` | 0.398 ms | 133,260 samples/s | 1.13 MB | 389.9 KB | 0.00000031 kWh | 0.0001 g |
