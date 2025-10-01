# BaselineChecker

BaselineChecker is a web application built for the [Baseline Tooling Hackathon](https://baseline.devpost.com/?ref_feature=challenge&ref_medium=discover&_gl=1*bl61xr*_ga*MjMyNjQ1MzE5LjE3NTc5MjQwNTI.), organized by Google Chrome Developers and Devpost.  

Its goal is to help developers instantly know whether their **HTML, CSS, JavaScript, and JSX** code uses **Baseline-supported web features**, making modern code safe to use across browsers.

## ✨ Features
- Paste your code into an editor (like CodePen)
- Detects used web platform features across **HTML, CSS, JS, and JSX**
- Handles **mixed snippets** (e.g. `<style>` / `<script>` inside HTML, inline styles in JSX)
- Checks Baseline status (widely available, newly available, limited)
- Shows browser compatibility and links to MDN
- Accessibility scoring (planned)
- Export results as a report (planned)

## ⚙️ How It Works
1. Parse the input code with language-specific analyzers  
   - **CSSTree** → CSS  
   - **parse5** → HTML (+ extract `<style>` / `<script>`)  
   - **Acorn** → JavaScript  
   - **Babel parser** → JSX/TSX with inline styles & styled-components  
2. Match detected features with the [`web-features`](https://www.npmjs.com/package/web-features) dataset  
3. Use [`compute-baseline`](https://www.npmjs.com/package/compute-baseline) to get Baseline status & browser support  
4. Display results in a developer-friendly UI with compatibility badges  

## 🛠 Tech Stack
- **React** + **TailwindCSS** – Frontend UI  
- **web-features** & **compute-baseline** – Feature data and Baseline status  
- **CSSTree**, **parse5**, **Acorn**, **Babel parser** – Code parsing  
- **Vite** – Build tooling  

## 🚀 Getting Started
```bash
# Clone the repo
git clone https://github.com/philgenb/basealign.git
cd basealign

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Contributors
- [Phil Gengenbach](https://www.linkedin.com/in/phil-gengenbach) – Developer & Project Lead  
- [Johannes Specht](https://www.linkedin.com/in/johannes-specht-187223271/) – Design / UX Lead

## 📄 License
MIT License  
