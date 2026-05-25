/** Theme-aware static background with layered gradient mesh (no animations). */
export default function PageBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      {/* Base */}
      <div className="absolute inset-0 bg-[#f7fbff] dark:bg-[#040816]" />

      {/* Directional atmosphere */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(186,230,253,0.45)_0%,rgba(247,250,252,0.86)_42%,rgba(241,245,249,0.96)_100%)] dark:bg-[linear-gradient(180deg,rgba(37,99,235,0.22)_0%,rgba(6,11,30,0.88)_38%,rgba(2,6,23,0.98)_100%)]" />

      {/* Mesh glows */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[min(1100px,96vw)] h-[480px] rounded-full bg-cyan-300/34 dark:bg-cyan-500/16 blur-3xl" />
      <div className="absolute top-[18%] -left-20 w-[420px] h-[420px] rounded-full bg-blue-300/28 dark:bg-blue-500/15 blur-3xl" />
      <div className="absolute top-[34%] -right-24 w-[460px] h-[460px] rounded-full bg-indigo-300/25 dark:bg-indigo-500/13 blur-3xl" />

      {/* Subtle grid texture */}
      <div className="landing-grid absolute inset-0 opacity-35 dark:opacity-20" />

      {/* Soft vignette for content focus */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_78%_60%_at_50%_18%,transparent_0%,transparent_52%,rgba(15,23,42,0.06)_100%)] dark:bg-[radial-gradient(ellipse_78%_60%_at_50%_20%,transparent_0%,transparent_55%,rgba(2,6,23,0.42)_100%)]" />
    </div>
  );
}
