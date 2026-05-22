# Contributing to the Static CDN & Admin Portal

First off, thank you for considering contributing to this project! It's because of people like you that open source remains a fantastic resource.

---

## 🛠️ Code of Conduct

By participating, you are expected to uphold our high standards of professional, polite, and inclusive interaction. Please report any unacceptable behavior to the maintainer.

---

## 🚀 Getting Started

1. **Fork the Repository:** Create a personal copy of the repository on GitHub.
2. **Clone Locally:**
   ```bash
   git clone https://github.com/mreshank/static.git
   cd static
   ```
3. **Configure Environment Variables:**
   ```bash
   cp .env.local.example .env.local
   # Fill in local development keys for Clerk, Vercel Blob, and Vercel KV.
   ```
4. **Install Dependencies:**
   ```bash
   npm install
   ```
5. **Run Dev Server:**
   ```bash
   npm run dev
   ```

---

## ✍️ Contribution Workflow

1. **Create a Branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. **Write Clean Code:**
   - Keep components modular and readable.
   - Do not install third-party UI libraries (maintain our zero-dependency design system).
   - Adhere to the strict Edge runtime limits for CDN serving routes.
3. **Run Quality Verifications:**
   Before pushing, ensure that all validation checks pass successfully:

   ```bash
   # Type check
   npx tsc --noEmit

   # Run Linter
   npm run lint

   # Build test
   npm run build
   ```

4. **Commit Changes:** Use clear, descriptive, conventional commit messages:
   ```bash
   git commit -m "feat: add keyboard shortcuts for file grid view"
   ```
5. **Push and Open PR:** Push to your fork and submit a Pull Request to the `main` branch.

---

## 💡 Code Guidelines

- **Edge Runtime Compatible:** The CDN engine (`/[...path]/route.ts`) runs on Vercel's Edge network. Do not import Node.js core libraries (like `fs`, `path`, `crypto` direct imports) in files consumed by the Edge runtime. Use Edge-native Web APIs (e.g. `crypto.subtle`).
- **Design Consistency:** All CSS variables are defined in `app/globals.css`. Ensure new styles use Tailwind classes bound to these variables for dark/light mode consistency.
- **Security First:** Keep CORS, caching, sanitization, and auth protection intact on all paths.

Thank you for building with us!
