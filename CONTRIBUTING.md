# CarbonPulse AI+ Developer Contribution Guidelines

Welcome to the CarbonPulse AI+ codebase! To maintain production-grade quality, strict security standards, and WCAG AA accessibility compliance, please adhere to the following rules.

---

## 1. Local Development Quickstart

1. Clone the repository and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the Turbopack development environment:
   ```bash
   npm run dev
   ```
4. Verify the production compilation:
   ```bash
   npm run build
   ```

---

## 2. File Length & Function Limits

To prevent spaghetti components and support fast bundler compilation times, we enforce strict line limit boundaries:
* **File Limit**: Preferred under 200 lines (300 lines absolute maximum).
* **Function Limit**: Preferred under 30 lines (50 lines absolute maximum).
* **Remedy**: If a component or file exceeds these limits, extract layout blocks to sub-components under `src/features/[feature]/components/`, utility formulas to `src/utils/`, and state tracking to `src/hooks/` or `src/store/`.

---

## 3. TypeScript & Lint Strictness

We maintain strict type verification parameters:
* **Strict mode enabled**: `"strict": true` is enforced in `tsconfig.json`.
* **No `any` keywords**: All arrays, functions, and variables must be explicitly typed. Do not bypass the compiler using `as any` castings.
* **ESLint checks**: Ensure zero warnings before creating a PR:
   ```bash
   npm run lint
   ```

---

## 4. Writing & Running Tests

We target **95%+ test coverage** for all calculations, utility scripts, and Edge services:
* **Test Stack**: We use **Vitest** + **jsdom** + **React Testing Library**.
* **Test Location**: Put all testing scripts in `src/tests/` using the extension `.test.ts` or `.test.tsx`.
* **Execution**: Run the suite using:
   ```bash
   npm test
   ```
* **CI/CD Integration**: PRs will be automatically compiled and tested. Compilation failures or failed test files block deployments.

---

## 5. Security & Accessibility Coding Practices

* **HTML Semantics**: Do not use generic `<div>` tags for interactive elements. Leverage `<button>`, `<select>`, `<main>`, `<nav>`, `<aside>`, and `<section>`.
* **ARIA labels**: Include descriptive labels (`aria-label`, `aria-describedby`) for custom toggles, sliders, and form dialog elements.
* **Input Validation**: Validate body payloads in edge API routes using **Zod** schemas.
* **XSS Shielding**: Filter dynamically parsed strings using `sanitizeInput(...)` from `src/utils/sanitize.ts` before placing them in the DOM.
