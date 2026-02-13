# 🧘 ZenBolso — Finance Without Friction

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.io/)
[![Dexie](https://img.shields.io/badge/Dexie.js-blue?style=for-the-badge)](https://dexie.org/)

**ZenBolso** is a personal finance PWA (Progressive Web App) designed to bring peace of mind to financial tracking. By combining a "Local-First" approach with efficient tools, it eliminates the friction of traditional balance sheets.

---

## ✨ Key Features

### 🚀 Hybrid Architecture (Local-First)
Experience zero latency. ZenBolso prioritizes your local data using **Dexie.js (IndexedDB)** for Guest Mode, ensuring full functionality offline. When you're ready, connect with **Supabase** for encrypted cloud sync across all your devices.

### ⏳ "Time = Money" Logic (Zen Insights)
Stop looking at just numbers. Our custom algorithm translates your monthly expenses into "Minutes of Life." Based on your financial profile, the app calculates how many work hours each purchase truly cost you.

### 📄 Professional PDF Exports
Generate detailed financial reports with one click. Export your monthly balance, category distribution, and flow charts into a clean, professional PDF document ready for filing or review.

### 🛡️ Enterprise-Grade Resilience
- **Route-based Code Splitting:** Optimized initial load using `React.lazy` and `Suspense`.
- **Fault Tolerance:** Implemented `React Error Boundaries` to prevent global crashes and ensure user data is never lost.
- **Navigation Safety:** Protected routes for both Guests and Registered users.

### 🎨 Premium UX/UI
- **Glassmorphism Design:** Modern, sleek interface with blur effects and vibrant gradients.
- **Adaptive Theming:** Native support for Dark and Light modes using a semantic token system.
- **Accessibility (A11y):** Built with ARIA standards and high-contrast semantic palettes.

---

## 🏗️ Architecture & Data Strategy

ZenBolso follows a **Guest-First Progressive Auth** strategy:
1.  **Stage 1 (Guest):** Data is stored locally in the browser's IndexedDB. No login required.
2.  **Stage 2 (Authenticated):** Upon Login (Magic Link), the system creates a cloud profile. The app manages a hybrid state, allowing the user to switch between "Visitor Data" and "Cloud Sync" with clear separation and integrity.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm / yarn
- A Supabase Project (for cloud features)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/zenbolso.git
   cd zenbolso
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

---

## 📸 Screenshots

| Dashboard | Zen Insights | Mobile View |
| :---: | :---: | :---: |
| ![Dashboard Placeholder] | ![Insights Placeholder] | ![Mobile Placeholder] |

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ for a more mindful financial life.
</p>
