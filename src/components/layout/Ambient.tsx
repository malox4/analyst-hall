export function Ambient() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
      <div className="absolute -left-32 top-[-120px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(212,165,116,0.16),transparent_64%)] blur-2xl" />
      <div className="absolute right-[-80px] top-24 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(125,211,192,0.12),transparent_64%)] blur-2xl" />
      <div className="absolute bottom-[-140px] left-1/3 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.12),transparent_64%)] blur-2xl" />
      <div className="noise absolute inset-0 opacity-[0.035] mix-blend-overlay" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
    </div>
  );
}
