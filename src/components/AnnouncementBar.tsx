"use client";

import { useState, useEffect } from "react";
import { Megaphone, X } from "lucide-react";
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
  const [data, setData] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/announcement")
      .then((r) => r.json())
      .then((d) => { if (d.active && d.text) setData(d); });
  }, []);

  if (!data || dismissed) return null;

  const colors = COLOR_MAP[data.color] ?? COLOR_MAP["green"];

  const content = (
    <div
      className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-sans font-medium relative"
      style={{ background: colors.bg, color: colors.text }}
    >
      <Megaphone className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{data.text}</span>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDismissed(true); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
        style={{ color: colors.text }}
        aria-label="Cerrar"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  if (data.link) {
    const isExternal = data.link.startsWith("http");
    if (isExternal) {
      return <a href={data.link} target="_blank" rel="noopener noreferrer" className="block w-full hover:opacity-90 transition-opacity">{content}</a>;
    }
    return <Link href={data.link} className="block w-full hover:opacity-90 transition-opacity">{content}</Link>;
  }

  return <div className="w-full">{content}</div>;
}
