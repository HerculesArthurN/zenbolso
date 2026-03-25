# 🧘 ZenBolso — Extreme Privacy Finance Tracker

[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Dexie](https://img.shields.io/badge/Dexie.js-4.0-blue?style=for-the-badge)](https://dexie.org/)
[![Zod](https://img.shields.io/badge/Zod-Data_Validation-3068b7?style=for-the-badge)](https://zod.dev/)

**ZenBolso** is an extremely private, "Offline-First", Progressive Web Application (PWA) built specifically for mobile screens ("Thumb-Driven UI"). It redefines personal finance tracking through zero-latency performance and unbreakable offline encryption, avoiding any reliance on remote servers.

---

## ✨ Features that define the V1 Alpha

### 🛡️ Iron-Clad Privacy (Local-First Architecture)
There is no backend. No cloud. No accounts. All of your financial data lives exclusively inside your browser's IndexedDB engine, strictly queried and managed by **Dexie.js**. What happens on your phone, stays on your phone.

### 📱 "Thumb-Driven" UX / Native-Like Rendering
Crafted under the strict bounds of a `max-w-[430px]` layout. We built Zenbolso to feel exactly like a native iOS/Android application:
- **Fluid Touch Gestures:** Powered by `framer-motion`, manage your transactions simply by swiping left (Delete) or right (Edit) on 60 FPS hardware-accelerated elements.
- **Bottom Navigation Tab:** Eliminates unreachable top-screen menus holding a floating action button (FAB) for seamless transaction entries.

### 🔒 Physical Security (App Lock & Ghost Protocol)
- **Web Crypto API (SHA-256):** ZenBolso locks itself natively. Set a 4-digit PIN that gets irreversibly hashed in the device's hardware.
- **Protocolo Fantasma (Ghost Protocol):** Forgot your password? Since there is no cloud server to email you a link, ZenBolso forces an "Emergency Exit"—completely wiping and destroying all Dexie databases to un-brick the PWA, ensuring 100% data protection against intruders.

### ⚡ Offline-First (PWA Cache Strategy)
A standalone Web App capable of surviving absolute 0 network connectivity.
- Configured with `vite-plugin-pwa` running a localized `CacheFirst` Service Worker strategy.
- Install it to your Home Screen with a stealthy, custom `<InstallPrompt />` intercepting Chrome's engine.

### 🌱 Zero-State (The Aha! Moment)
Don't stare at an empty chart! With our **OnboardingWizard**, users can instantly inject 20 mock transactions staggered perfectly over the current month using `date-fns`, populating interactive Recharts graphs immediately.

---

## 🏗️ Technical Masterclass

This platform wasn't just coded; it was engineered through absolute constraints.

* **Strict Mode & Error-Proofing:** TypeScript 5.0 Strictness, eliminating any implicit `any`. Component props dictate state strictly.
* **TDD (Test-Driven Development):** High-level business logic features like *App Lock*, *Onboarding States*, and *Ghost Protocol* are enclosed in Vitest Unit tests checking execution orders and API interceptions.
* **Separation of Concerns:** Business Logic never bleeds into UI. UI elements are pure *Dumb Components* receiving payloads through specifically crafted strict custom hooks (`useAppLock`, `useGhostProtocol`).
* **Optimistic Updates:** Immediate UI gratification. Deletions and additions reflect in memory before IndexedDB responds. Latency perception is 0.

---

## 🚀 Installation & Build

No databases needed. No Vercel Edge functions. Simply drop it and build it.

### Prerequisites
- Node.js 18+

### Setup

1. **Clone & Install:**
   ```bash
   git clone https://github.com/your-username/zenbolso.git
   cd zenbolso
   npm install
   ```

2. **Run Development (Hot Reloading):**
   ```bash
   npm run dev
   ```

3. **Production Static Build:**
   ```bash
   npm run build
   # Outputs pure localized HTML/JS/CSS mapping directly to /dist
   ```

4. **Testing Suite:**
   ```bash
   npm run test
   ```

---

<p align="center">
  Forged by <b>Hércules</b> with architectural discipline and an unyielding commitment to User Privacy.
</p>
