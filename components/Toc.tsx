import type { TocItem } from "@/lib/toc";

export default function Toc({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;
  return (
    <details className="mb-10 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3">
      <summary className="cursor-pointer select-none text-sm font-medium text-[var(--muted)]">
        목차
      </summary>
      <ul className="mt-3 space-y-1.5 text-sm">
        {items.map((item, i) => (
          <li
            key={`${item.id}-${i}`}
            style={{ paddingLeft: (item.depth - 2) * 14 }}
          >
            <a
              href={`#${item.id}`}
              className="text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
