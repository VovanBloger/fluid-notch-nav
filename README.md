# Fluid Notch Navigation Studio

<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

<p align="center">
  <strong>A fluid, physics-driven bottom navigation bar with an adaptive SVG notch cutout, floating 3D orb, jelly stretch physics, frosted glassmorphism, and multi-stage tactile haptic feedback.</strong><br />
  <em>Engineered for Next.js, React 19, Tailwind CSS, and Telegram Mini Apps.</em>
</p>

<p align="center">
  <a href="https://ai.studio/apps/2b3afffb-dbfd-4575-afdd-df2c60877d0e"><img src="https://img.shields.io/badge/AI%20Studio-App-blue?style=for-the-badge&logo=google" alt="AI Studio App" /></a>
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/Tailwind-CSS%204-38bdf8?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge" alt="MIT License" />
</p>

---

## 🌟 Key Features

- 🔮 **Adaptive Floating Orb:** Supports both modern Flat (2D) and tactile Glass Sphere (3D) orb styles with dual specular reflections.
- 📐 **Modular SVG Symmetrical Notch Math:** Notch path generation (`lib/notch-math.ts`) dynamically recalculates shoulder and corner radii to prevent pinching, overlapping, or loopbacks when reaching panel borders.
- ⚡ **Non-Linear Flight Mechanics:** Fast initial takeoff impulse, high-speed cruise phase, and gentle magnetic deceleration into the destination pocket.
- 🧪 **Jelly Stretch Physics:** The floating orb organically elongates along the transit vector (`scaleX: 1.15`), cushioned with an elastic bounce on arrival (`scaleX: 0.96`).
- 🪟 **True Hardware-Accelerated Glassmorphism:** SVG `<clipPath>` pairs with native `backdrop-filter: blur(20px)` to maintain frosted transparency across any background.
- 📳 **Synchronized Multi-Stage Haptics:** Instant touch feedback and dynamic landing impact ticks (supports Telegram WebApps `HapticFeedback`, Android `navigator.vibrate`, and desktop Web Audio synthesized clicks).
- 🎨 **12 Curated Signature Themes:** Cyber Emerald, Velvet Dusk, Aurora Glow, Obsidian Void, Frosted Glass, Rose Gold, Neon Cyberpunk, Solar Amber, Royal Amethyst, Arctic Ice, and Sunset Mesh.
- 🏝️ **Floating Island Dock Mode:** Configurable bottom radius transforms the docked bar into an iOS-style floating capsule dock.

---

## 🚀 Quick Start (Studio App)

**Prerequisites:** [Node.js](https://nodejs.org/) (v18+)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/VovanBloger/fluid-notch-nav.git
   cd fluid-notch-nav
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start the local dev server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to test themes, slow-motion physics, backgrounds, and notch geometry sliders in the interactive testbench.

---

## 📦 Using `AdaptiveNotchNav` in Your Own Project

Copy `components/AdaptiveNotchNav.tsx` and `lib/notch-math.ts`, `lib/haptics.ts`, `lib/utils.ts` into your project:

```tsx
'use client';

import React, { useState } from 'react';
import { Home, Compass, PlusCircle, User } from 'lucide-react';
import { AdaptiveNotchNav, NavItem } from '@/components/AdaptiveNotchNav';

const navItems: NavItem[] = [
  { id: 'home', label: 'Главная', icon: Home },
  { id: 'explore', label: 'Обзор', icon: Compass, badge: 'NEW' },
  { id: 'create', label: 'Создать', icon: PlusCircle },
  { id: 'profile', label: 'Профиль', icon: User, badge: 3 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col justify-end">
      <AdaptiveNotchNav
        items={navItems}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id)}
        orbStyle="3d"
        theme="aurora"
      />
    </main>
  );
}
```

---

## 📁 Project Structure

```text
fluid-notch-nav/
├── app/
│   ├── globals.css          # Tailwind CSS 4 theme and impulse keyframes
│   ├── layout.tsx           # Fonts & root layout metadata
│   └── page.tsx             # Interactive testbench studio
├── components/
│   └── AdaptiveNotchNav.tsx # Fluid notch navigation component
├── lib/
│   ├── haptics.ts           # Telegram, Android, and Web Audio haptic engine
│   ├── notch-math.ts        # Modular SVG notch & physics math
│   ├── notch-math.test.ts   # Automated math & continuity tests
│   └── utils.ts             # Tailwind class merging utility
├── metadata.json            # Studio metadata
└── README.md
```

---

## 📄 License

MIT © [Vladimir (VovanBloger)](https://github.com/VovanBloger)
