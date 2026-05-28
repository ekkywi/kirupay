/** Theme-aware background with a subtle animated payment-flow layer. */
export default function PageBackground() {
  const flowPaths = [
    "M -80 210 C 180 60 320 320 560 168 S 940 70 1180 260 S 1460 430 1680 180",
    "M -120 520 C 160 350 340 650 620 470 S 1040 310 1290 560 S 1510 760 1720 520",
    "M 80 760 C 260 610 500 720 720 585 S 1040 420 1280 640 S 1510 850 1700 700",
  ];

  const flowDots = [
    { path: flowPaths[0], className: "[--flow-duration:16s] [--flow-delay:-3s]" },
    { path: flowPaths[0], className: "[--flow-duration:19s] [--flow-delay:-11s]" },
    { path: flowPaths[1], className: "[--flow-duration:21s] [--flow-delay:-6s]" },
    { path: flowPaths[1], className: "[--flow-duration:18s] [--flow-delay:-14s]" },
    { path: flowPaths[2], className: "[--flow-duration:22s] [--flow-delay:-9s]" },
  ];

  const flowRibbons = [
    { path: flowPaths[0], className: "[--ribbon-duration:15s] [--ribbon-delay:-2s]" },
    { path: flowPaths[1], className: "[--ribbon-duration:18s] [--ribbon-delay:-9s]" },
    { path: flowPaths[2], className: "[--ribbon-duration:20s] [--ribbon-delay:-14s]" },
  ];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-[#f6f4ee] dark:bg-[#040807]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(255,255,255,0.95),transparent_36%),linear-gradient(180deg,rgba(226,250,240,0.82)_0%,rgba(246,244,238,0.92)_42%,rgba(239,235,225,0.98)_100%)] dark:bg-[radial-gradient(circle_at_50%_-10%,rgba(34,197,94,0.2),transparent_36%),linear-gradient(180deg,rgba(6,36,28,0.86)_0%,rgba(4,8,7,0.96)_48%,rgba(2,6,23,0.98)_100%)]" />
      <div className="absolute -top-32 left-1/2 h-[520px] w-[min(1180px,96vw)] -translate-x-1/2 rounded-full bg-emerald-200/55 blur-3xl dark:bg-emerald-400/13" />
      <div className="absolute top-[14%] -left-24 h-[420px] w-[420px] rounded-full bg-cyan-200/45 blur-3xl dark:bg-cyan-400/10" />
      <div className="absolute top-[36%] -right-28 h-[460px] w-[460px] rounded-full bg-lime-200/34 blur-3xl dark:bg-lime-400/8" />
      <div className="landing-grid absolute inset-0 opacity-35 dark:opacity-16" />

      <div className="landing-flow-layer absolute inset-0 overflow-hidden">
        <svg
          className="absolute left-1/2 top-0 h-full min-h-[920px] w-[1680px] max-w-none -translate-x-1/2"
          viewBox="0 0 1680 920"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="landing-flow-gradient" x1="0" y1="0" x2="1680" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#10b981" stopOpacity="0" />
              <stop offset="0.24" stopColor="#10b981" stopOpacity="0.42" />
              <stop offset="0.58" stopColor="#22d3ee" stopOpacity="0.36" />
              <stop offset="1" stopColor="#84cc16" stopOpacity="0" />
            </linearGradient>
            <filter id="landing-flow-glow" x="-20%" y="-80%" width="140%" height="260%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {flowPaths.map((path) => (
            <path key={path} d={path} className="landing-flow-line" stroke="url(#landing-flow-gradient)" />
          ))}
          {flowRibbons.map((ribbon, index) => (
            <path
              key={`${ribbon.path}-ribbon-${index}`}
              d={ribbon.path}
              className={`landing-flow-ribbon ${ribbon.className}`}
              stroke="url(#landing-flow-gradient)"
            />
          ))}
        </svg>

        {flowDots.map((dot, index) => (
          <span
            key={`${dot.path}-${index}`}
            className={`landing-flow-dot ${dot.className}`}
            style={{ offsetPath: `path("${dot.path}")` }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_18%,transparent_0%,transparent_58%,rgba(56,45,28,0.08)_100%)] dark:bg-[radial-gradient(ellipse_80%_55%_at_50%_18%,transparent_0%,transparent_58%,rgba(0,0,0,0.46)_100%)]" />
    </div>
  );
}
