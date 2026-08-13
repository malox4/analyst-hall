import type { CompareBlock } from "@/types/content";

export function CompareView({ block }: { block: CompareBlock }) {
  return (
    <section className="glass overflow-hidden rounded-3xl">
      <div className="p-6 pb-3">
        <h3 className="font-display text-2xl">{block.title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-widest text-muted">
            <tr>
              <th className="px-6 py-3 font-medium"> </th>
              <th className="px-6 py-3 font-medium text-gold">{block.leftTitle}</th>
              <th className="px-6 py-3 font-medium text-mint">{block.rightTitle}</th>
            </tr>
          </thead>
          <tbody>
            {block.rows.map((r) => (
              <tr key={r.label} className="border-t border-white/6">
                <td className="px-6 py-3 font-medium text-paper/80">{r.label}</td>
                <td className="px-6 py-3 text-muted">{r.left}</td>
                <td className="px-6 py-3 text-muted">{r.right}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
