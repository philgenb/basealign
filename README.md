# BaselineChecker

BaselineChecker is a web application built for the [Baseline Tooling Hackathon](https://baseline.devpost.com/?ref_feature=challenge&ref_medium=discover&_gl=1*bl61xr*_ga*MjMyNjQ1MzE5LjE3NTc5MjQwNTI.), organized by Google Chrome Developers and Devpost.  

Its goal is to help developers instantly know whether their HTML, CSS, and JavaScript code uses **Baseline-supported web features**, making modern code safe to use across browsers.

## Features
- Paste your code into an editor (like CodePen)
- Detects used web platform features
- Checks Baseline status (widely available, newly available, limited)
- Shows browser compatibility and links to MDN
- Export results as a report (planned)

## How It Works
1. Parse the input code (HTML, CSS, JavaScript)
2. Match detected features with the [`web-features`](https://www.npmjs.com/package/web-features) dataset
3. Display Baseline status and compatibility information

## Tech Stack
- **React** + **TailwindCSS** (UI)
- **web-features** & **compute-baseline** (feature data and Baseline status)
- **CSSTree**, **parse5**, **Acorn** (code parsing)

## Getting Started
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