# Literature Gap Analysis: Explainable AI in Environmental Carbon Estimation

**Manuscript Title:** Explainable AI for Carbon Emissions Estimation: A Comparative Evaluation of Predictive Accuracy, Interpretability, and Computational Efficiency  
**Date:** October 2026  

---

## 1. Overview of the State of the Art

Machine learning has been widely proposed as a transformative tool for building decarbonization, urban energy modeling, and greenhouse gas compliance monitoring. However, a systematic audit of the recent peer-reviewed literature reveals four critical methodological gaps that undermine scientific defensibility:

---

## 2. Gap 1: Conflation of Accounting Identities with Statistical Learning

* **The Prevailing Flaw in Literature:** Numerous published studies train regression models (Random Forests, Gradient Boosting, Deep Neural Networks) using metered electricity (kWh) and fossil fuel consumption (therms) as input features to predict annual greenhouse gas emissions (`TotalGHGEmissions`). These studies frequently report near-perfect coefficients of determination ($R^2 > 0.98$) and herald this as a machine learning breakthrough.
* **The Methodological Reality:** Regulatory emissions accounting (e.g., U.S. EPA ENERGY STAR Portfolio Manager) calculates emissions algebraically:
  $$\text{Emissions} = \text{Electricity} \times EF_{\text{elec}} + \text{NaturalGas} \times EF_{\text{gas}} + \text{Steam} \times EF_{\text{steam}}$$
  A machine learning model fed these exact utility inputs is merely solving a trivial 3-variable linear regression to recover static regulatory coefficients. In operational practice, if utility billing data is available, machine learning is redundant—direct accounting multiplication should be executed.
* **Our Contribution:** We formally delineate the boundary between **Conventional Activity Accounting** and **Unmetered Structural Prediction**. We demonstrate that ML is only scientifically justified when utility meter data is unavailable (pre-construction planning, unmetered retrofit screening), where models must infer emissions strictly from physical, architectural, spatial, and vintage characteristics.

---

## 3. Gap 2: The Glassbox vs. Post-Hoc Explainability Dichotomy

* **The Prevailing Flaw:** Recent literature often treats Explainable AI as a binary choice: either deploy a black-box ensemble with post-hoc SHAP or revert to a simple linear model. Emerging glassbox architectures—specifically **Explainable Boosting Machines (EBM)** and **Spline Generalized Additive Models (SplineGAM)**—are rarely benchmarked side-by-side with TreeSHAP on large statutory urban datasets.
* **Our Contribution:** We execute an empirical head-to-head comparison between intrinsic glassbox models ($f(x) = \sum f_i(x_i) + \sum f_{ij}(x_i, x_j)$) and post-hoc TreeSHAP attributions across identical cross-validation folds. We demonstrate that while EBM provides exact algebraic additivity, it incurs significant computational overhead (780s training) and higher out-of-sample error on heterogeneous building portfolios compared to tree ensembles.

---

## 4. Gap 3: Absence of Empirical Explanation Stability Testing

* **The Prevailing Flaw:** Most papers evaluate interpretability qualitatively by displaying a single SHAP summary plot for a single random split, assuming without verification that the explanations are robust and reproducible.
* **Our Contribution:** We implement a rigorous mathematical stability protocol, calculating **Kendall's $\tau$** and **Spearman's $\rho$** rank correlations across repeated training resamples and evaluating local Lipschitz perturbation invariance under physical input jitter. We prove that Random Forest achieves the highest global rank stability ($\tau = 0.9418$), while SplineGAM achieves the highest local smoothness (0.9835 invariance).

---

## 5. Gap 4: Neglect of Green AI & Multi-Objective Pareto Trade-Offs

* **The Prevailing Flaw:** Environmental machine learning papers paradoxically ignore the computational energy and carbon footprint of their own algorithms, rarely measuring hardware-level inference latency, peak RAM, or kilowatt-hours consumed.
* **Our Contribution:** We profile single-sample latency, batch throughput, memory consumption, and measured/modeled inference energy across 10,000 queries per model. We establish a multi-objective **Pareto Frontier** mapping predictive accuracy against inference latency, providing actionable operational recommendations for resource-constrained deployments.
