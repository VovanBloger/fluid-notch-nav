'use client';

import React, { useState } from 'react';
import {
  Home,
  Compass,
  PlusCircle,
  User,
  Sparkles,
  Volume2,
  VolumeX,
  Check,
  Copy,
  Wallet,
  Heart,
} from 'lucide-react';
import {
  AdaptiveNotchNav,
  NavItem,
  NavThemePreset,
  OrbStyle,
  BadgeBehavior,
  NavIconRenderContext,
  THEME_PRESETS,
} from '../components/AdaptiveNotchNav';
import { HapticProfile } from '../lib/haptics';

type ScreenBgId =
  | 'aurora-mesh'
  | 'architectural-grid'
  | 'deep-ocean'
  | 'velvet-dusk'
  | 'obsidian-void'
  | 'alabaster-day';

interface ScreenBgPreset {
  id: ScreenBgId;
  label: string;
  isLight: boolean;
  swatch: string;
  containerStyle: React.CSSProperties;
}

const SCREEN_BACKGROUNDS: ScreenBgPreset[] = [
  {
    id: 'aurora-mesh',
    label: 'Aurora Glow',
    isLight: false,
    swatch: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
    containerStyle: {
      background:
        'radial-gradient(circle at 22% 18%, rgba(124, 58, 237, 0.52) 0%, transparent 55%), radial-gradient(circle at 82% 72%, rgba(6, 182, 212, 0.46) 0%, transparent 56%), radial-gradient(circle at 50% 92%, rgba(99, 102, 241, 0.45) 0%, transparent 62%), #060711',
    },
  },
  {
    id: 'architectural-grid',
    label: 'Chromatic',
    isLight: false,
    swatch: 'linear-gradient(135deg, #4338CA 0%, #EC4899 100%)',
    containerStyle: {
      backgroundColor: '#0A0914',
      backgroundImage:
        'linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px), radial-gradient(circle at 50% 86%, rgba(168, 85, 247, 0.44) 0%, rgba(6, 182, 212, 0.32) 48%, transparent 76%)',
      backgroundSize: '24px 24px, 24px 24px, 100% 100%',
    },
  },
  {
    id: 'deep-ocean',
    label: 'Sapphire',
    isLight: false,
    swatch: 'linear-gradient(135deg, #0284C7 0%, #1E3A8A 100%)',
    containerStyle: {
      background:
        'radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.4) 0%, transparent 52%), radial-gradient(circle at 20% 85%, rgba(37, 99, 235, 0.5) 0%, transparent 55%), #040D1F',
    },
  },
  {
    id: 'velvet-dusk',
    label: 'Velvet Dusk',
    isLight: false,
    swatch: 'linear-gradient(135deg, #9F1239 0%, #D97706 100%)',
    containerStyle: {
      background:
        'radial-gradient(circle at 25% 22%, rgba(225, 29, 72, 0.44) 0%, transparent 55%), radial-gradient(circle at 80% 82%, rgba(217, 119, 6, 0.45) 0%, transparent 55%), #12070D',
    },
  },
  {
    id: 'obsidian-void',
    label: 'Carbon',
    isLight: false,
    swatch: 'linear-gradient(135deg, #27272A 0%, #09090B 100%)',
    containerStyle: {
      background:
        'radial-gradient(circle at 50% 88%, rgba(161, 161, 170, 0.2) 0%, transparent 60%), #08080B',
    },
  },
  {
    id: 'alabaster-day',
    label: 'Alabaster',
    isLight: true,
    swatch: 'linear-gradient(135deg, #F8FAFC 0%, #CBD5E1 100%)',
    containerStyle: {
      background:
        'radial-gradient(circle at 18% 15%, rgba(99, 102, 241, 0.16) 0%, transparent 50%), radial-gradient(circle at 82% 85%, rgba(14, 165, 233, 0.18) 0%, transparent 55%), linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)',
    },
  },
];

const SIGNATURE_THEME_KEYS: NavThemePreset[] = [
  'obsidian-titanium',
  'rose-quartz',
  'aurora-borealis',
  'nordic-frost',
  'solar-champagne',
  'deep-ocean-pearl',
];

const CLASSIC_THEME_KEYS: NavThemePreset[] = [
  'purple-neon',
  'cyber-emerald',
  'sunset-amber',
  'electric-cyan',
  'clean-light',
  'mono-dark',
];

export default function FluidNotchShowcasePage() {
  const [activeTab, setActiveTab] = useState<string>('create');
  const [selectedTheme, setSelectedTheme] = useState<NavThemePreset>('purple-neon');
  const [themeCategoryTab, setThemeCategoryTab] = useState<'signature' | 'classic'>('classic');
  const [screenBgId, setScreenBgId] = useState<ScreenBgId>('aurora-mesh');
  const [isIslandMode, setIsIslandMode] = useState<boolean>(true);
  const [orbStyle, setOrbStyle] = useState<OrbStyle>('flat');
  const [tabCount, setTabCount] = useState<3 | 4 | 5>(5);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [hapticProfile, setHapticProfile] = useState<HapticProfile>('mechanical');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [badgeBehavior, setBadgeBehavior] = useState<BadgeBehavior>('orb-satellite');
  const [walletBadge, setWalletBadge] = useState<number>(3);
  const [iconSourceMode, setIconSourceMode] = useState<'lucide' | 'custom-nodes'>('lucide');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const currentScreenBg =
    SCREEN_BACKGROUNDS.find((b) => b.id === screenBgId) || SCREEN_BACKGROUNDS[0];

  const allTabsWithDynamicBadge: NavItem[] = React.useMemo(
    () => [
      { id: 'home', label: 'Главная', icon: Home },
      { id: 'explore', label: 'Каталог', icon: Compass },
      { id: 'create', label: 'Студия', icon: PlusCircle },
      {
        id: 'wallet',
        label: 'Кошелёк',
        icon: Wallet,
        badge: walletBadge > 0 ? (walletBadge > 99 ? '99+' : walletBadge) : undefined,
        badgeColor: '#6366F1',
      },
      { id: 'profile', label: 'Профиль', icon: User },
    ],
    [walletBadge]
  );

  const visibleTabs = React.useMemo(() => {
    if (tabCount === 3) {
      return [allTabsWithDynamicBadge[0], allTabsWithDynamicBadge[2], allTabsWithDynamicBadge[3]];
    }
    if (tabCount === 4) {
      return [
        allTabsWithDynamicBadge[0],
        allTabsWithDynamicBadge[1],
        allTabsWithDynamicBadge[2],
        allTabsWithDynamicBadge[3],
      ];
    }
    return allTabsWithDynamicBadge;
  }, [tabCount, allTabsWithDynamicBadge]);

  const safeActiveTab = React.useMemo(() => {
    return visibleTabs.some((t) => t.id === activeTab) ? activeTab : visibleTabs[0].id;
  }, [visibleTabs, activeTab]);

  const customIconsMap = React.useMemo<
    Partial<Record<string, React.ReactNode | ((ctx: NavIconRenderContext) => React.ReactNode)>> | undefined
  >(() => {
    if (iconSourceMode !== 'custom-nodes') return undefined;
    return {
      home: ({ isActive }: NavIconRenderContext) => (
        <Home
          size={21}
          strokeWidth={isActive ? 2.5 : 1.8}
          className={isActive ? 'fill-white/25 drop-shadow-[0_0_6px_rgba(255,255,255,0.45)]' : ''}
        />
      ),
      explore: ({ isActive }: NavIconRenderContext) => (
        <Compass
          size={21}
          strokeWidth={isActive ? 2.5 : 1.8}
          className={isActive ? 'fill-white/25 rotate-45 transition-transform duration-300' : ''}
        />
      ),
      create: ({ isActive }: NavIconRenderContext) => (
        <Sparkles
          size={21}
          strokeWidth={isActive ? 2.4 : 1.8}
          className={isActive ? 'fill-white/30' : ''}
        />
      ),
      wallet: ({ isActive }: NavIconRenderContext) => (
        <Wallet
          size={21}
          strokeWidth={isActive ? 2.4 : 1.8}
          className={isActive ? 'fill-white/25' : ''}
        />
      ),
      profile: ({ isActive }: NavIconRenderContext) => (
        <Heart
          size={21}
          strokeWidth={isActive ? 2.4 : 1.8}
          className={isActive ? 'fill-white/30' : ''}
        />
      ),
    };
  }, [iconSourceMode]);

  const generatedJSX = `<AdaptiveNotchNav
  items={TABS}
  activeTab="${safeActiveTab}"
  onSelectTab={setActiveTab}
  theme="${selectedTheme}"
  orbStyle="${orbStyle}"
  badgeBehavior="${badgeBehavior}"${
    iconSourceMode === 'custom-nodes'
      ? `\n  customIcons={{\n    wallet: <svg viewBox="0 0 24 24">...</svg>,\n    home: ({ isActive }) => isActive ? <HomeFilledSvg /> : <HomeOutlineSvg />\n  }}`
      : ''
  }
  bottomCornerRadius={${isIslandMode ? 24 : 0}}
  showLabels={${showLabels}}
  hapticProfile="${hapticProfile}"
  speedMultiplier={${speedMultiplier}}
  enableAudioTicks={${audioEnabled}}
/>`;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(generatedJSX).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#050508] text-zinc-100 selection:bg-indigo-500/30">
      {/* Dark Luxury Ambient Canvas with Subtle Grid & Localized Stage Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {/* Faint Architectural Grid */}
        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        {/* Soft Violet & Cyan Stage Glow behind the Phone */}
        <div
          className="animate-aurora-slow absolute top-[12%] left-[12%] h-[580px] w-[580px] rounded-full opacity-25 blur-[150px]"
          style={{
            background:
              'radial-gradient(circle, rgba(124, 58, 237, 0.55) 0%, rgba(6, 182, 212, 0.28) 55%, transparent 100%)',
          }}
        />
        <div
          className="animate-aurora-reverse absolute bottom-[8%] left-[22%] h-[460px] w-[520px] rounded-full opacity-20 blur-[140px]"
          style={{
            background:
              'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, rgba(99, 102, 241, 0.2) 60%, transparent 100%)',
          }}
        />
      </div>

      {/* Main Showcase Canvas (No Top Header or Site Title) */}
      <main className="relative z-10 mx-auto w-full max-w-[1360px] px-6 sm:px-8 py-5 lg:py-6">
        {/* Apple/Vercel Showcase Composition: Phone Hero + Floating Inspector (moderated gap) */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-10 xl:gap-14">
          {/* LEFT / CENTER STAGE: Realistic iPhone Mockup */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative flex items-center justify-center w-full">
              {/* Subtle Localized Backlight Halo directly behind the Phone */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-6 rounded-[72px] opacity-55 blur-3xl transition-all duration-700"
                style={{
                  background:
                    'radial-gradient(circle at 50% 78%, rgba(139, 92, 246, 0.28) 0%, rgba(6, 182, 212, 0.16) 45%, transparent 72%)',
                }}
              />

              {/* Realistic iPhone 17 Pro Max Hardware Frame */}
              <div className="relative w-[360px] sm:w-[410px] h-[700px] rounded-[56px] p-[11px] bg-gradient-to-b from-zinc-700/45 via-zinc-900 to-black shadow-[0_40px_100px_-15px_rgba(0,0,0,0.92),0_0_0_1px_rgba(255,255,255,0.12)] flex flex-col justify-between shrink-0">
                {/* Inner Titanium Bezel */}
                <div className="relative w-full h-full rounded-[46px] bg-[#08080E] p-[3px] shadow-inner overflow-hidden flex flex-col justify-between">
                  {/* Dynamic Island Cutout */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[116px] h-[28px] bg-black rounded-full z-40 flex items-center justify-between px-3.5 border border-white/[0.08] shadow-md">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-white/5" />
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-950/90 border border-indigo-400/25" />
                  </div>

                  {/* Phone Screen Surface */}
                  <div
                    style={currentScreenBg.containerStyle}
                    className="relative w-full h-full rounded-[43px] overflow-hidden flex flex-col justify-between transition-all duration-500"
                  >
                    {/* Status Bar */}
                    <div className="px-7 pt-5 relative z-10">
                      <div
                        className={`flex items-center justify-between text-xs font-medium tracking-tight ${
                          currentScreenBg.isLight ? 'text-slate-700' : 'text-white/80'
                        }`}
                      >
                        <span className="font-mono tabular-nums pl-1">09:41</span>
                        <span className="text-[11px] opacity-75 pr-1">{currentScreenBg.label}</span>
                      </div>
                    </div>

                    {/* Raised Title & Single-line Subtitle */}
                    <div className="px-6 pt-4 flex flex-col items-center text-center relative z-10 select-none">
                      <h1
                        className={`font-display text-[28px] sm:text-[30px] font-bold tracking-tight leading-tight ${
                          currentScreenBg.isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        Fluid Notch Nav
                      </h1>
                      <p
                        className={`mt-1 text-xs font-medium tracking-wide whitespace-nowrap opacity-85 ${
                          currentScreenBg.isLight ? 'text-slate-600' : 'text-zinc-300'
                        }`}
                      >
                        панель навигации с парящей сферой
                      </p>
                    </div>

                    {/* JSX-КОД: Directly on the phone wallpaper without any black background box */}
                    <div className="px-8 my-auto relative z-10 w-full flex flex-col items-center">
                      <div className="w-full max-w-[310px] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-mono uppercase tracking-[0.14em] font-semibold ${
                              currentScreenBg.isLight ? 'text-slate-600' : 'text-white/60'
                            }`}
                          >
                            JSX-КОД
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyCode}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                              currentScreenBg.isLight
                                ? 'bg-slate-900/10 text-slate-900 hover:bg-slate-900/20'
                                : 'bg-white/15 text-white hover:bg-white/25'
                            }`}
                          >
                            {copiedCode ? <Check size={11} /> : <Copy size={11} />}
                            <span>{copiedCode ? 'Скопировано' : 'Скопировать JSX'}</span>
                          </button>
                        </div>
                        <pre
                          className={`font-mono text-[11px] leading-relaxed overflow-x-auto select-all ${
                            currentScreenBg.isLight ? 'text-slate-800' : 'text-white/90'
                          }`}
                        >
                          <code>{generatedJSX}</code>
                        </pre>
                      </div>
                    </div>

                    {/* Subtle Ambient Light Reflection above the Navigation Bar */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-44 opacity-60"
                      style={{
                        background:
                          'radial-gradient(circle at 50% 100%, rgba(139, 92, 246, 0.22) 0%, transparent 70%)',
                      }}
                    />

                    {/* HERO ELEMENT: Bottom Fluid Notch Navigation Bar */}
                    <div
                      className={`relative w-full z-30 transition-all duration-300 ${
                        isIslandMode ? 'px-3.5 pb-3.5' : 'px-0 pb-0'
                      }`}
                    >
                      <AdaptiveNotchNav
                        items={visibleTabs}
                        customIcons={customIconsMap}
                        activeTab={safeActiveTab}
                        onSelectTab={setActiveTab}
                        theme={selectedTheme}
                        orbStyle={orbStyle}
                        bottomCornerRadius={isIslandMode ? 24 : 0}
                        showLabels={showLabels}
                        hapticProfile={hapticProfile}
                        speedMultiplier={speedMultiplier}
                        enableAudioTicks={audioEnabled}
                        badgeBehavior={badgeBehavior}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Compact Borderless Floating Inspector */}
          <aside className="w-full max-w-[390px] space-y-4 lg:pt-[64px]">
            {/* 1. Темы */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  Темы
                </h2>

                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setThemeCategoryTab('signature')}
                    className={`px-2.5 py-0.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      themeCategoryTab === 'signature'
                        ? 'bg-white text-zinc-950 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Новые
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeCategoryTab('classic')}
                    className={`px-2.5 py-0.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      themeCategoryTab === 'classic'
                        ? 'bg-white text-zinc-950 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Классика
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1">
                {(themeCategoryTab === 'signature'
                  ? SIGNATURE_THEME_KEYS
                  : CLASSIC_THEME_KEYS
                ).map((themeKey) => {
                  const tConfig = THEME_PRESETS[themeKey];
                  const isSelected = selectedTheme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      type="button"
                      onClick={() => {
                        setSelectedTheme(themeKey);
                        if (themeKey === 'nordic-frost' || themeKey === 'clean-light') {
                          setScreenBgId('alabaster-day');
                        } else if (screenBgId === 'alabaster-day') {
                          setScreenBgId('aurora-mesh');
                        }
                      }}
                      className={`group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/[0.09] text-white ring-1 ring-white/25'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          style={{
                            background:
                              orbStyle === 'flat'
                                ? tConfig.orbFlatGradient || tConfig.orbGradient
                                : tConfig.orbGradient,
                          }}
                          className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white/25"
                        />
                        <span className="text-xs font-medium truncate">
                          {tConfig.name || themeKey}
                        </span>
                      </div>
                      {isSelected && <Check size={12} className="text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2. Фон экрана */}
            <section className="space-y-2 border-t border-white/[0.06] pt-3.5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Фон экрана
              </h2>

              <div className="grid grid-cols-3 gap-1">
                {SCREEN_BACKGROUNDS.map((bg) => {
                  const active = screenBgId === bg.id;
                  return (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setScreenBgId(bg.id)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                        active
                          ? 'bg-white/[0.09] text-white ring-1 ring-white/25'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                      }`}
                    >
                      <span
                        style={{ background: bg.swatch }}
                        className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white/20"
                      />
                      <span className="text-xs font-medium truncate">{bg.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 3. Поведение (Форма панели + Стиль круга) */}
            <section className="space-y-2 border-t border-white/[0.06] pt-3.5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Поведение
              </h2>

              <div className="space-y-1.5">
                {/* Форма панели */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-300">Панель</span>
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsIslandMode(false)}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        !isIslandMode
                          ? 'bg-white text-zinc-950 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-100'
                      }`}
                    >
                      Прижата
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsIslandMode(true)}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        isIslandMode
                          ? 'bg-white text-zinc-950 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-100'
                      }`}
                    >
                      Остров
                    </button>
                  </div>
                </div>

                {/* Стиль круга */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-300">Шар</span>
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setOrbStyle('flat')}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        orbStyle === 'flat'
                          ? 'bg-white text-zinc-950 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-100'
                      }`}
                    >
                      Плоский
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrbStyle('3d')}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        orbStyle === '3d'
                          ? 'bg-white text-zinc-950 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-100'
                      }`}
                    >
                      Сфера
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Счётчик */}
            <section className="space-y-2 border-t border-white/[0.06] pt-3.5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  Счётчик
                </h2>

                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setWalletBadge((c) => Math.max(0, c - 1))}
                    className="px-2 py-0.5 rounded text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    −1
                  </button>
                  <span className="px-1.5 text-xs font-mono font-semibold text-indigo-400 tabular-nums">
                    {walletBadge}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWalletBadge((c) => c + 1)}
                    className="px-2 py-0.5 rounded text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletBadge(3)}
                    className="px-2 py-0.5 rounded text-xs text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    Сброс
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-zinc-300">Позиция</span>
                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setBadgeBehavior('orb-satellite');
                      if (walletBadge === 0) setWalletBadge(3);
                      setActiveTab('wallet');
                    }}
                    className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      badgeBehavior === 'orb-satellite'
                        ? 'bg-white text-zinc-950 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    На шаре
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBadgeBehavior('label-inline');
                      if (walletBadge === 0) setWalletBadge(3);
                      setActiveTab('wallet');
                    }}
                    className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      badgeBehavior === 'label-inline'
                        ? 'bg-white text-zinc-950 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    У подписи
                  </button>
                </div>
              </div>
            </section>

            {/* 5. Параметры (Вкладки, Иконки, Отклик, Скорость, Подписи) */}
            <section className="space-y-2 border-t border-white/[0.06] pt-3.5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Параметры
              </h2>

              <div className="space-y-1.5">
                {/* Вкладки */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-300">Вкладки</span>
                  <div className="inline-flex items-center gap-1">
                    {([3, 4, 5] as const).map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setTabCount(cnt)}
                        className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          tabCount === cnt
                            ? 'bg-white text-zinc-950 font-semibold'
                            : 'text-zinc-400 hover:text-zinc-100'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Иконки */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-300">Иконки</span>
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIconSourceMode('lucide')}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        iconSourceMode === 'lucide'
                          ? 'bg-white text-zinc-950 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-100'
                      }`}
                    >
                      Lucide
                    </button>
                    <button
                      type="button"
                      onClick={() => setIconSourceMode('custom-nodes')}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        iconSourceMode === 'custom-nodes'
                          ? 'bg-white text-zinc-950 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-100'
                      }`}
                    >
                      Кастомные SVG
                    </button>
                  </div>
                </div>

                {/* Подписи */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-300">Подписи</span>
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowLabels(true)}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        showLabels
                          ? 'bg-white text-zinc-950 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-100'
                      }`}
                    >
                      ВКЛ
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLabels(false)}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        !showLabels
                          ? 'bg-white text-zinc-950 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-100'
                      }`}
                    >
                      ВЫКЛ
                    </button>
                  </div>
                </div>

                {/* Отклик и звук */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-300">Отклик</span>
                    <button
                      type="button"
                      onClick={() => setAudioEnabled(!audioEnabled)}
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                        audioEnabled
                          ? 'text-emerald-400 hover:text-emerald-300'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                      title="Звуковой отклик"
                    >
                      {audioEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                    </button>
                  </div>
                  <div className="inline-flex items-center gap-1">
                    {(['mechanical', 'crisp', 'soft', 'none'] as const).map((prof) => (
                      <button
                        key={prof}
                        type="button"
                        onClick={() => setHapticProfile(prof)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium capitalize transition-colors cursor-pointer ${
                          hapticProfile === prof
                            ? 'bg-white text-zinc-950 font-semibold'
                            : 'text-zinc-400 hover:text-zinc-100'
                        }`}
                      >
                        {prof}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Скорость */}
                <div className="pt-0.5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="speed-slider" className="text-zinc-300">
                      Скорость
                    </label>
                    <span className="font-mono text-zinc-400 tabular-nums">
                      {speedMultiplier.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    id="speed-slider"
                    type="range"
                    min={0.25}
                    max={2.0}
                    step={0.25}
                    value={speedMultiplier}
                    onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                    className="w-full accent-white cursor-pointer h-1 bg-white/15 rounded-lg"
                  />
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
