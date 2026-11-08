# CarbonPulse AI+ — Experiment Specification Corrections

**Document Status:** Corrected & Formally Specified  
**Date:** 2026-11-08  
**Scope:** Rigorous Statistical and Algorithmic Specifications for Experiments 1 through 8.  

---

## Experiment 1 — Formal Conformal Risk Control & Prespecified Screening Thresholds

### 1.1 Precise Risk Functions
In screening municipal buildings without meter records, an environmental regulator sets an operational decision cutoff $\lambda \in \Lambda$. A facility $j$ is flagged for mandatory compliance inspection if predicted emissions $\hat{Y}_j \ge \lambda$, denoted by the screening decision $A_\lambda(X_j) = \mathbb{I}(\hat{Y}_j \ge \lambda)$.

Two mathematically rigorous loss functions are evaluated:
1. **Excess Unflagged Emissions Risk:**
   $$\ell_{\text{excess}}(A_\lambda(X_j), Y_j) = \frac{Y_j \cdot (1 - A_\lambda(X_j))}{\mu_Y}$$
   where $\mu_Y = \mathbb{E}[Y]$ is the municipal mean emissions. This measures the fraction of total portfolio carbon emissions emitted by buildings that escape screening.
2. **High-Emitter Non-Discovery Rate (FNDR):**
   $$\ell_{\text{FNDR}}(A_\lambda(X_j), Y_j) = \mathbb{I}(Y_j \ge \tau_{\text{statutory}}) \cdot (1 - A_\lambda(X_j))$$
   where $\tau_{\text{statutory}}$ is the statutory threshold defining a major greenhouse gas emitter (e.g. $50 \text{ MT CO}_2\text{e}$ or the 90th percentile).

### 1.2 Statistical Unit & Calibration/Evaluation Separation
* **Independent Unit:** The physical facility (`OSEBuildingID`). Annual filings $t \in T_j$ for facility $j$ are averaged to yield an exchangeable facility loss:
  $$L_j(\lambda) = \frac{1}{|T_j|} \sum_{t \in T_j} \ell(A_\lambda(X_{j,t}), Y_{j,t})$$
* **Calibration Cohort:** $n_{\text{cal}} = 756$ physical buildings ($N = 7,397$ filings) drawn strictly from the development partition via `conformal_calibration_split_seed42.parquet`.
* **Evaluation Cohort:** $n_{\text{test}} = 757$ held-out buildings ($N = 7,366$ filings) evaluated strictly once. Zero overlap with calibration facilities.

### 1.3 Confidence Level & Concentration Bound
* **Confidence Level:** $1 - \delta = 0.90$ ($\delta = 0.10$).
* **Upper Confidence Bound (UCB):** By the empirical Bernstein inequality (Bates, Angelopoulos, Lei, Malik, Jordan, 2021):
  $$\text{UCB}(\lambda) = \hat{R}_{\text{cal}}(\lambda) + \sqrt{\frac{2 \hat{\sigma}_{\text{cal}}^2(\lambda) \log(1/\delta)}{n_{\text{cal}}}} + \frac{7 \log(1/\delta)}{3(n_{\text{cal}} - 1)}$$
  where $\hat{R}_{\text{cal}}(\lambda) = \frac{1}{n_{\text{cal}}} \sum_{j=1}^{n_{\text{cal}}} L_j(\lambda)$ and $\hat{\sigma}_{\text{cal}}^2(\lambda)$ is the sample variance of the facility losses.

### 1.4 Threshold Selection & Multiplicity Control
* **Cutoff Selection:**
  $$\hat{\lambda} = \inf \{ \lambda \in \Lambda : \text{UCB}(\lambda) \le \alpha \}$$
  for target error rate $\alpha \in \{0.05, 0.10, 0.15, 0.20\}$.
* **Multiplicity Handling:** Because the loss $L_j(\lambda)$ is strictly non-increasing in $\lambda$ (as $\lambda$ decreases, more buildings are flagged, reducing unflagged emissions), hypothesis tests $H_0(\lambda): R(\lambda) > \alpha$ are ordered monotonically. We apply **Fixed Sequence Testing**, testing from largest $\lambda$ downward until the first rejection, providing exact family-wise error rate control without conservative Bonferroni penalties.

### 1.5 Theoretical Guarantees & Assumptions
* **Guarantee:** $\mathbb{P}(R(\hat{\lambda}) \le \alpha) \ge 1 - \delta$ over the random draw of the calibration set.
* **Underlying Assumption:** Facility-level exchangeability between the calibration cohort and the test cohort within the municipal jurisdiction.

---

## Experiment 2 — TabNet Deep Tabular Baseline

### 2.1 Inputs, Targets, and Transformations
* **Input Features:** 59 engineered structural features (`train_features.parquet`), normalized with standard z-score scaling.
* **Training Targets:** `TotalGHGEmissions` (`train_target.parquet`).
* **Target Transformation:** Variance-stabilizing logarithmic transform:
  $$z = \log(1 + y) \quad (\texttt{np.log1p})$$
* **Inverse Transformation:**
  $$\hat{y} = \text{clip}(\exp(\hat{z}) - 1, \, 0.0, \, 100000.0) \quad (\texttt{np.expm1})$$
  bounded by zero and the physical maximum statutory ceiling.

### 2.2 Validation Strategy & Early Stopping
* **Validation Split:** 15% building-isolated validation split ($n_{\text{val}} = 454$ buildings) drawn from the 3,024 development facilities.
* **Loss Function:** Mean Squared Error on transformed scale $z$.
* **Early Stopping:** `patience = 15` epochs monitoring validation log-scale MAE. Maximum epochs = 100.
* **Architecture Configuration:** `n_d = 16`, `n_a = 16`, `n_steps = 4`, `gamma = 1.3`, `mask_type = "sparsemax"`, `lambda_sparse = 1e-4`, Adam optimizer ($\text{lr} = 0.02$, decay step = 10, $\gamma_{\text{decay}} = 0.95$).

### 2.3 Evaluation on Held-Out Test
* **Evaluation Target:** Evaluated strictly on held-out test features (`test_features.parquet`) against test target (`test_target.parquet`, 7,366 filings across 757 buildings).
* **Direct Benchmark Comparators:** XGBoost, Random Forest, Ridge, EBM.

---

## Experiment 3 — Full 757-Building Systematic Perturbation Analysis

### 3.1 GFA Perturbation and Physical Constraint Propagation
A building's total gross floor area satisfies the physical identity:
$$\text{PropertyGFATotal} = \text{PropertyGFABuildings} + \text{PropertyGFAParking}$$

When `PropertyGFATotal` undergoes a physical perturbation $\Delta \in \{+1\%, +5\%, +10\%, -5\%\}$:
$$\text{PropertyGFATotal}' = \text{PropertyGFATotal} \times (1 + \Delta)$$

To preserve simplex area constraints and prevent synthetic feature contradictions, the change is propagated proportionally across conditioned space and parking:
$$\text{PropertyGFABuildings}' = \text{PropertyGFABuildings} \times (1 + \Delta)$$
$$\text{PropertyGFAParking}' = \text{PropertyGFAParking} \times (1 + \Delta)$$

### 3.2 Synchronous Derived Feature Updates
All derived geometric and logarithmic features must be updated simultaneously:
1. **Floor Area per Floor:**
   $$\text{FloorAreaPerFloor}' = \frac{\text{PropertyGFABuildings}'}{\text{NumberofFloors}} = \text{FloorAreaPerFloor} \times (1 + \Delta)$$
2. **Parking Ratio:**
   $$\text{ParkingRatio}' = \frac{\text{PropertyGFAParking}'}{\text{PropertyGFATotal}'} = \text{ParkingRatio} \quad (\text{invariant})$$
3. **Logarithmic Floor Area Transforms:**
   $$\text{LogGFATotal}' = \log(1 + \text{PropertyGFATotal}')$$
   $$\text{LogGFABuildings}' = \log(1 + \text{PropertyGFABuildings}')$$

### 3.3 Evaluation Cohort
Evaluates all 757 physical buildings in the held-out test partition across Random Forest, XGBoost, and Ridge to determine whether the anomalous $+49.92\%$ shift observed in Random Forest is an isolated threshold-crossing phenomenon or a systemic model property.

---

## Experiment 4 — Locally Weighted Conformal Prediction Under Heteroscedasticity

### 4.1 Theoretical Limitations of Conditional Conformal Prediction
* **Impossibility Theorem:** In finite samples with continuous features, exact conditional validity:
  $$\mathbb{P}(Y \in C(X) \mid X = x) \ge 1 - \alpha \quad \forall x$$
  cannot be guaranteed without distribution assumptions (Vovk 2012, Barber et al. 2019).
* **Correct Theoretical Claim:** The procedure provides **exact marginal coverage** $\mathbb{P}(Y \in C(X)) \ge 1 - \alpha$ under exchangeability, while providing **empirical adaptivity** to heteroscedastic noise.

### 4.2 Weighting Methodology
1. **Residual Scale Estimator:** A secondary regression estimator $\hat{\sigma}(X)$ (Random Forest or Ridge) is fitted on calibration residuals $|e_i| = |Y_i - \hat{Y}_i|$.
2. **Normalized Conformity Score:**
   $$S_i = \frac{|Y_i - \hat{Y}_i|}{\hat{\sigma}(X_i)}$$
3. **Conformal Quantile:** Compute the $\lceil (n_{\text{cal}} + 1)(1 - \alpha) \rceil / n_{\text{cal}}$ empirical quantile $\hat{q}$ of $\{S_i\}_{i \in \text{cal}}$.
4. **Adaptive Interval:**
   $$C(X) = \left[ \hat{Y}(X) - \hat{q} \cdot \hat{\sigma}(X), \; \hat{Y}(X) + \hat{q} \cdot \hat{\sigma}(X) \right]$$

### 4.3 Subgroup Evaluation Design
Evaluates empirical coverage $\hat{\alpha}_g$ across building size classes (Small, Medium, Large) and property types to verify that adaptive intervals prevent the severe undercoverage of large buildings observed under standard constant-width conformal intervals.

---

## Experiment 5 — Formal Paired Audit-Budget Statistical Hypothesis Testing

### 5.1 Independent Statistical Unit & Aggregation
* **Statistical Unit:** Physical building ($j \in \{1, \dots, 757\}$).
* **Emissions Aggregation:** Annual repeated filings within each facility are averaged:
  $$\bar{Y}_j = \frac{1}{|T_j|} \sum_{t \in T_j} Y_{j,t}, \quad \hat{\bar{Y}}_j^{(m)} = \frac{1}{|T_j|} \sum_{t \in T_j} \hat{Y}_{j,t}^{(m)}$$

### 5.2 Audit Screening Selection
Under budget fraction $f \in \{0.01, 0.05, 0.10, 0.20\}$, rank all 757 facilities in descending order of predicted emissions $\hat{\bar{Y}}_j^{(m)}$. The top $K = \lfloor f \cdot 757 \rfloor$ facilities form the audited set $A_K^{(m)}$.

### 5.3 Paired Statistical Hypothesis Tests
Between Model $A$ (XGBoost) and Model $B$ (e.g. Property Median or Ridge):
* **Paired Difference in Captured Emissions:**
  $$D_j = \bar{Y}_j \cdot \left( \mathbb{I}(j \in A_K^{(A)}) - \mathbb{I}(j \in A_K^{(B)}) \right)$$
* **Sign-Flip Permutation Test:** Generate $B = 2,000$ permutations where sign $S_j \in \{-1, +1\}$ is assigned independently with probability $0.5$ to $D_j$. Compute empirical $p$-value:
  $$p_{\text{perm}} = \frac{1}{B} \sum_{b=1}^B \mathbb{I}\left( \left| \sum_{j=1}^{757} S_{j,b} D_j \right| \ge \left| \sum_{j=1}^{757} D_j \right| \right)$$
* **Multiplicity Adjustment:** Holm-Bonferroni correction applied across all budget thresholds and model pairs.
* **Confidence Intervals:** 95% bootstrap confidence intervals constructed by resampling facilities with replacement ($B = 2,000$).

---

## Experiment 6 — Size-Class-Specific SHAP Attribution Stability

### 6.1 Strata Definitions
* **Small:** $\text{PropertyGFATotal} < 50,000 \text{ sq ft}$
* **Medium:** $50,000 \le \text{PropertyGFATotal} \le 200,000 \text{ sq ft}$
* **Large:** $\text{PropertyGFATotal} > 200,000 \text{ sq ft}$

### 6.2 Facility-Level Bootstrap & Refitting
* **Resampling Unit:** Resample 3,024 physical facilities with replacement from the development partition ($B = 50$ iterations).
* **Model Refitting:** Refit XGBoost and Ridge on each bootstrap sample using `train_target.parquet`.
* **TreeSHAP Background:** 100 stratified representative instances from development data.

### 6.3 Stability Statistics & Computational Feasibility
* **Metrics:** Kendall's $\tau$ and Spearman's $\rho$ computed across all $\binom{50}{2} = 1,225$ pairwise feature attribution rankings within each stratum.
* **Feasibility:** 50 XGBoost refits (200 trees, depth 6) require $\approx 75 \text{ seconds}$ on 8 CPU cores. TreeSHAP requires $\approx 100 \text{ seconds}$. Total runtime is $3\text{--}5 \text{ minutes}$.

---

## Experiment 7 — Regularized Mahalanobis Applicability Domain Recalculation

### 7.1 Feature Selection & Scaling
* **Feature Dimensions:** Strictly continuous physical and spatial features ($p = 12$ dimensions):
  `BuildingAge`, `NumberofFloors`, `NumberofBuildings`, `PropertyGFATotal`, `PropertyGFABuildings`, `PropertyGFAParking`, `FloorAreaPerFloor`, `ParkingRatio`, `LogGFATotal`, `LogGFABuildings`, `Latitude`, `Longitude`.
* **Exclusion:** Categorical one-hot flags are excluded to prevent singular covariance matrices.
* **Scaling:** Standard z-score standardization $(\mathbf{x} - \hat{\boldsymbol{\mu}}) / \hat{\boldsymbol{\sigma}}$ fitted strictly on the development partition.

### 7.2 Ledoit-Wolf Analytical Shrinkage Covariance
The sample covariance matrix $S$ is regularized via analytical shrinkage toward a diagonal target:
$$\hat{\Sigma}_{\text{shrink}} = (1 - \hat{\beta}) S + \hat{\beta} \left( \frac{\text{tr}(S)}{p} \right) I_p$$
where $\hat{\beta} \in [0, 1]$ is the optimal shrinkage intensity minimizing expected quadratic loss. This guarantees positive definiteness and invertible conditioning.

### 7.3 Distance & Threshold Selection
* **Mahalanobis Distance:**
  $$D_M(\mathbf{x}) = \sqrt{(\mathbf{x} - \hat{\boldsymbol{\mu}})^T \hat{\Sigma}_{\text{shrink}}^{-1} (\mathbf{x} - \hat{\boldsymbol{\mu}})}$$
* **Thresholds:** Empirical 95th and 99th percentiles of development set distances ($\tau_{95}, \tau_{99}$), avoiding Gaussian chi-squared assumptions in heavy-tailed distributions.

---

## Experiment 8 — External Municipal Validation Readiness

### 8.1 Current Status: Interface Staged (Zero External Data Integrated)
* **Status:** `INTERFACE_STAGED_AWAITING_DATA`.
* **Guardrail:** No claim of cross-municipal validation is made until external datasets (NYC LL84 or Boston BERDO) are placed in `experimental_workspace/data/external/`, audited against `harmonization_checklist.md`, and evaluated.
* **Isolation Rule:** External records must remain strictly isolated in holdout partitions and never merged into Seattle training matrices.

