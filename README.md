# 🍔 Foodie - Modern Indian Street Food & Restaurant Platform

<div align="center">

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed%20Live-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://foodie-teal-beta.vercel.app/)
[![Android APK](https://img.shields.io/badge/Android-APK%20Release-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/Aryan-singh19/Foodie/releases/latest)
[![React](https://img.shields.io/badge/React%2018-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<br/>

**Experience authentic Indian street flavors, rich regional thalis, live order tracking, and quick doorstep delivery.**

[**🌐 Open Live Web App (Vercel)**](https://foodie-teal-beta.vercel.app/) • [**📱 Download Android APK**](https://github.com/Aryan-singh19/Foodie/releases/latest) • [**📦 Releases**](https://github.com/Aryan-singh19/Foodie/releases)

</div>

---

## 🌟 Highlights & Features

- **Iconic Street Food Stalls & Diners**: 13 famous regional vendors from Old Delhi, Mumbai, Kolkata, Amritsar, and Bengaluru.
- **Rich Dish Catalog**: Over 90+ meticulously cataloged dishes with authentic local photography, spicy/veg badges, preparation times, and price points.
- **Instant Dual Deployment (Full-Stack & Static Resilient)**: Runs natively on Express backend with automatic fallback to client-side caching & filtering for seamless hosting on **Vercel**, GitHub Pages, or offline.
- **Dynamic Cuisines Filtering**: Filter by *Street Food*, *North Indian*, *South Indian*, *Mughlai*, *Indo-Chinese*, *Sweets & Chaat*, and *Italian*.
- **Interactive Cart & Multi-Item Ordering**: Add multiple items from stalls, calculate subtotal, packaging, delivery fee, and apply instant checkout.
- **Live Order Tracking Simulation**: Real-time 5-stage delivery pipeline:
  1. `Order Placed`
  2. `Confirmed by Kitchen`
  3. `Preparing Fresh`
  4. `Out for Delivery`
  5. `Delivered`
- **GitHub Sync Modal**: Built-in developer dashboard for inspecting git status, testing GitHub Personal Access Tokens (PAT), and pushing updates directly to `main`.
- **Progressive Web App (PWA) & Android Ready**: Responsive, mobile-first design with fast touch targets, native app styling, and dedicated Android APK release.

---

## 🚀 Live Demo & Links

| Service | Link | Status |
| :--- | :--- | :--- |
| **Vercel Production Deployment** | [https://foodie-teal-beta.vercel.app/](https://foodie-teal-beta.vercel.app/) | ![Production](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square) |
| **GitHub Repository** | [https://github.com/Aryan-singh19/Foodie](https://github.com/Aryan-singh19/Foodie) | ![GitHub](https://img.shields.io/badge/Repo-Public-blue?style=flat-square) |
| **Android APK (v1.0.0)** | [Latest GitHub Releases](https://github.com/Aryan-singh19/Foodie/releases/latest) | ![APK](https://img.shields.io/badge/Package-Download-orange?style=flat-square) |

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Lucide Icons, Vite
- **State & Storage**: Resilient `ApiClient` with local caching & live Express backend API
- **Backend / Serverless**: Express 4 / Vercel Serverless Functions (`/api/*`)
- **Hosting**: Vercel (Edge CDN & Serverless) + Cloud Run
- **Mobile Packaging**: Progressive Web App + Android APK

---

## 📦 Local Development & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or bun

### 1. Clone the repository
```bash
git clone https://github.com/Aryan-singh19/Foodie.git
cd Foodie
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

### 4. Build for production
```bash
npm run build
```
Creates an optimized static bundle in `dist/` and standalone server bundle in `dist/server.cjs`.

---

## 📱 Android APK Installation

1. Navigate to [Releases](https://github.com/Aryan-singh19/Foodie/releases/latest).
2. Download `foodie-v1.0.0.apk`.
3. Open the downloaded file on your Android device and tap **Install** (allow installation from this source if prompted).
4. Launch **Foodie** from your home screen for full-screen street food ordering!

---

## 🏷️ Tags & Topics

`react` • `typescript` • `vite` • `tailwind-css` • `food-delivery` • `street-food` • `foodie` • `indian-food` • `vercel` • `order-tracking` • `pwa` • `android-apk`

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
