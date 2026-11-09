# CarbonPulse AI+ Core Calculation Methodology

This document details the mathematical framework, reference baselines, emission factors, and predictive algorithms used across the CarbonPulse AI+ PWA. 

---

## 🌍 Reference Carbon Baselines & Targets

CarbonPulse AI+ computes local and regional footprint deviations based on published annual global averages and sets target limits corresponding to the **UN Paris Agreement 1.5°C climate goals**.

### 1. Regional Baselines
Baselines represent the average annual footprint per capita for a resident in each region:

| Region | Per Capita Carbon Baseline ($t\text{ CO}_2\text{e/year}$) | Citation / Database Source |
| :--- | :--- | :--- |
| **United States (US)** | 14.0 | *Our World in Data (2023) / US EPA* |
| **European Union (EU)**| 6.5 | *Our World in Data (2023) / European Environment Agency* |
| **United Kingdom (UK)**| 5.0 | *UK DESNZ / DEFRA (2023) Carbon Indicators* |
| **India (IN)** | 1.9 | *Our World in Data (2023) / Ministry of Power (IN)* |
| **Global Average** | 4.7 | *Our World in Data (2023) / IEA Global Energy Review* |

### 2. The 1.5°C Climate Target
To limit global warming to 1.5°C above pre-industrial levels, the IPCC recommends limiting personal annual carbon footprints to a sustainable threshold:
* **Target Cap**: **$2.3\text{ t CO}_2\text{e/year}$** ($2,300\text{ kg CO}_2\text{e/year}$).
* Users are graded on a sliding scale relative to this target and their selected regional baseline.

---

## 🚗 Core Emission Factors ($EF_i$)

All activities logged manually or parsed via Vision OCR are converted to $\text{kg CO}_2\text{e}$ using the standard equation:
$$\text{Emission Amount } (E) = \text{Activity Data } (AD) \times \text{Emission Factor } (EF)$$

### 1. Transportation & Commuting
Factors reflect average passenger transport emissions per kilometer, sourced from **UK Department for Energy Security and Net Zero (DESNZ) / DEFRA 2023 Guidelines**:

* **Petrol Car**: $0.192\text{ kg CO}_2\text{e/km}$ (Average medium car, DEFRA 2023)
* **Diesel Car**: $0.171\text{ kg CO}_2\text{e/km}$ (Average medium car, DEFRA 2023)
* **Hybrid Car**: $0.111\text{ kg CO}_2\text{e/km}$ (Average medium hybrid, DEFRA 2023)
* **Electric Vehicle (EV)**: $0.053\text{ kg CO}_2\text{e/km}$ (Reflects blended lifecycle battery charging grid factors, DEFRA 2023)
* **Public Transit**: $0.060\text{ kg CO}_2\text{e/passenger-km}$ (Blended bus, light rail, and subway average, DEFRA 2023)
* **Air Travel (Flights)**:
  * Calculated on a per-trip basis including the **Radiative Forcing Index (RFI)** atmospheric uplift factor (multiplier of $1.9\times$):
    * **Short-haul flight (< 1500 km)**: $250\text{ kg CO}_2\text{e}$ per one-way passenger trip (DEFRA 2023)
    * **Long-haul flight (>= 1500 km)**: $1100\text{ kg CO}_2\text{e}$ per one-way passenger trip (DEFRA 2023)

### 2. Electricity & Utilities
Factors reflect the carbon intensity of regional electrical grids, sourced from **IEA / Ember Global Electricity Review 2023**:

* **United States (US)**: $0.370\text{ kg CO}_2\text{e/kWh}$
* **European Union (EU)**: $0.250\text{ kg CO}_2\text{e/kWh}$
* **United Kingdom (UK)**: $0.210\text{ kg CO}_2\text{e/kWh}$
* **India (IN)**: $0.710\text{ kg CO}_2\text{e/kWh}$
* **Global Grid Average**: $0.480\text{ kg CO}_2\text{e/kWh}$

### 3. Food & Diet Profiles
Annualized dietary carbon footprints based on consumption patterns, sourced from **Scarborough et al. (Nature Food 2023)** study analyzing real-world dietary patterns:

* **Vegan**: $1,100\text{ kg CO}_2\text{e/year}$ ($91.7\text{ kg CO}_2\text{e/month}$)
* **Vegetarian**: $1,400\text{ kg CO}_2\text{e/year}$ ($116.7\text{ kg CO}_2\text{e/month}$)
* **Pescatarian**: $1,700\text{ kg CO}_2\text{e/year}$ ($141.7\text{ kg CO}_2\text{e/month}$)
* **Low-Meat (< 50g/day)**: $2,200\text{ kg CO}_2\text{e/year}$ ($183.3\text{ kg CO}_2\text{e/month}$)
* **Medium-Meat (50–99g/day)**: $2,800\text{ kg CO}_2\text{e/year}$ ($233.3\text{ kg CO}_2\text{e/month}$)
* **High-Meat (>= 100g/day)**: $3,600\text{ kg CO}_2\text{e/year}$ ($300.0\text{ kg CO}_2\text{e/month}$)

### 4. Home Heating
Calculated by converting fuel usage volumes or weight to $\text{kg CO}_2\text{e}$, sourced from **UK DESNZ / DEFRA 2023**:

* **Natural Gas**: $2.020\text{ kg CO}_2\text{e/m}^3$
* **Heating Oil (Kerosene)**: $2.520\text{ kg CO}_2\text{e/L}$
* **Liquefied Petroleum Gas (LPG)**: $2.950\text{ kg CO}_2\text{e/kg}$

### 5. Shopping & Consumer Goods
Annualized lifecycle emissions mapping consumer habits, sourced from **US EPA & Our World in Data**:

* **Minimalist** (Buys only essentials, recycles heavily): $600\text{ kg CO}_2\text{e/year}$
* **Average Shopper** (Standard retail habits): $1,500\text{ kg CO}_2\text{e/year}$
* **Frequent Shopper** (High fast-fashion/electronics purchasing): $3,000\text{ kg CO}_2\text{e/year}$

---

## 🧠 Explainable AI: SHAP Engine Mathematical Formulation

To avoid black-box scores, CarbonPulse AI+ computes **Shapley Additive exPlanations (SHAP)**. This game-theoretic method calculates the fair, additive contribution of each emission category to the total deviation from the regional baseline.

### 1. The Shapley Value Formula
The Shapley value $\phi_i(v)$ for category $i$ under characteristic function $v$ is calculated as:

$$\phi_i(v) = \sum_{S \subseteq N \setminus \{i\}} \frac{|S|!(|N| - |S| - 1)!}{|N|!} \left[ v(S \cup \{i\}) - v(S) \right]$$

### 2. Variable Explanations in Plain English
* **$N$**: The set of all categories (features) included in the carbon tracker (e.g., $N = \{\text{transportation, food, electricity, shopping, waste}\}$).
* **$S$**: A sub-coalition (subset) of categories that does *not* contain the category of interest $i$.
* **$|S|$**: The number of categories currently in subset $S$.
* **$|N|$**: The total number of categories in the model (here, $|N| = 5$).
* **$\frac{|S|!(|N| - |S| - 1)!}{|N|!}$**: The probability of the subset $S$ appearing in a random permutation of features. It represents the weights assigned to the marginal contributions.
* **$v(S)$**: The predicted carbon output using only the subset of categories $S$. 
* **$v(S \cup \{i\}) - v(S)$**: The marginal carbon increase (or decrease) caused by adding category $i$ to the active subset $S$.
* **$\phi_i(v)$**: The final Shapley contribution value for category $i$. When summed together, the contributions of all categories equal the total deviation from the baseline model:
$$\sum_{i \in N} \phi_i(v) = f(x) - \text{Expected Baseline}$$

### 3. Baseline Interaction Model
The underlying carbon model ($v$) uses a non-linear interaction term to capture synergistic impacts (such as high transport coupled with high shopping):

$$v(T, F, E, S, W) = 1.2 T + 0.9 F + 1.5 E + S + W + 0.01 (T \times S)$$

Where $T = \text{Transport}$, $F = \text{Food}$, $E = \text{Electricity}$, $S = \text{Shopping}$, and $W = \text{Waste}$.
* The expected baseline value at normal distribution is **$283\text{ kg CO}_2\text{e/month}$**.

---

## 📊 Digital Carbon Twin Forecasting: Ordinary Least Squares (OLS)

The scenario simulator fits an **Ordinary Least Squares (OLS) Linear Regression** trendline over the user's historical daily carbon data.

### 1. Regression Equation
The model forecasts future trajectories using:
$$y = m \cdot x + c$$

Where:
* **$y$**: The cumulative or daily projected carbon emissions ($\text{kg CO}_2\text{e}$).
* **$x$**: The day index (independent time step variable, e.g., $0, 1, 2, \ldots, D$).
* **$m$ (Slope)**: The daily change rate in emissions ($\text{kg CO}_2\text{e/day}$).
  * $m > 0$: Footprint is trending upward.
  * $m < 0$: Footprint is improving (decreasing trend).
* **$c$ (Intercept)**: The baseline emissions representing day index $0$.

### 2. OLS Coefficient Fitting Formulas
The parameters $m$ and $c$ are determined by minimizing the sum of squared errors:

$$m = \frac{N \sum (xy) - \sum x \sum y}{N \sum (x^2) - \left( \sum x \right)^2}$$

$$c = \frac{\sum y - m \sum x}{N}$$

Where $N$ is the number of historical data logging points.

### 3. Forecasting Window
* Future values are projected across three preset windows: **30 days, 60 days, and 90 days**.
* **Simulated Trajectories** apply proportional category reductions directly to the regression forecast:
$$\text{Simulated } y = y \times (1 - \text{Reduction Factor})$$
$$\text{Reduction Factor} = \frac{\text{Target Category Emissions}}{\text{Total Emissions}} \times \frac{\text{Target Reduction Percentage}}{100}$$

---

## ⚠️ Limitations & Analytical Caveats

1. **Approximate Emission Factors**: Emitted values represent standard regional averages. Micro-level variations (e.g., specific vehicle efficiency, local electricity fuel mix) are approximated.
2. **Embodied Carbon Approximations**: Indirect lifecycle emissions (e.g., the manufacturing footprint of purchased clothing or electronics) are estimated using broad consumer index baselines rather than deep supply-chain audits.
3. **Linearity of OLS Models**: Linear regression assumes a consistent linear trend in historical logs. If tracking is sparse or includes large episodic outliers (such as an occasional flight), the baseline slope $m$ can be skewed. The application alerts users when dataset points are too few (<3 unique tracking days) and falls back to a static proportional seed model.
4. **Untrusted Client Storage**: PWA offline persistence relies on `localStorage`. While Zustand simplifies client states, local storage is untrusted. CarbonPulse AI+ mitigates this by re-validating all reads against schema definitions at runtime.
