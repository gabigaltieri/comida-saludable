"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, Megaphone } from "lucide-react";
import Link from "next/link";

type Announcement = { text: string; color: string; link: string | null; active: boolean };

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  green:  { bg: "#2d6a4f", text: "#fff" },
  sage:   { bg: "#547d54", text: "#fff" },
  gold:   { bg: "#b8860b", text: "#fff" },
  red:    { bg: "#c0392b", text: "#fff" },
  orange: { bg: "#e05d00", text: "#fff" },
  blue:   { bg: "#1d4ed8", text: "#fff" },
  black:  { bg: "#1a1a1a", text: "#fff" },
  cream:  { bg: "#f5f0e8", text: "#3a3a2a" },
};

export default function AnnouncementBar() {
  const pathname = usePathname();
  const [data, setData] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/announcement")
      .then((r) => r.json())
      .then((d) => { if (d.active && d.text) setData(d); });
  }, []);

  if (pathname?.startsWith("/admin")) return null;
  if (!data || dismissed) return null;

  const colors = COLOR_MAP[data.color] ?? COLOR_MAP["green"];
  const segments = data.text.split("|").map((s) => s.trim()).filter(Boolean);

  const ticker = (
    <div
      className="flex animate-marquee whitespace-nowrap"
      style={{ animationDuration: "20s" }}
    >
      {[0, 1].map((i) => (
        <div key={i} className="flex items-center flex-shrink-0">
          {segments.map((seg, j) => (
            <span
              key={j}
              className="flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.18em] px-10"
            >
              <Megaphone className="w-3 h-3 flex-shrink-0 opacity-60" />
              {seg}
            </span>
          ))}
        </div>
      ))}
    </div>
  );

  const dismissBtn = (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDismissed(true); }}
      className="absolute right-0 top-0 bottom-0 flex items-center px-4 opacity-50 hover:opacity-100 transition-opacity z-10"
      style={{ color: colors.text, background: `linear-gradient(to right, transparent, ${colors.bg} 40%)` }}
      aria-label="Cerrar"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  );

  const containerClass = "sticky top-0 left-0 right-0 z-[60] w-full overflow-hidden";

  const inner = (
    <div className="relative py-2" style={{ background: colors.bg, color: colors.text }}>
      {ticker}
      {dismissBtn}
    </div>
  );

  if (data.link) {
    const isExternal = data.link.startsWith("http");
    if (isExternal) {
      return (
        <a href={data.link} target="_blank" rel="noopener noreferrer" className={`${containerClass} block`}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={data.link} className={`${containerClass} block`}>
        {inner}
      </Link>
    );
  }

  return <div className={containerClass}>{inner}</div>;
}
