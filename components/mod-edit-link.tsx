"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** "Edit project", for a signed-in account the index lists among the owners (the service decides by GitHub ID). */
export function ModEditLink({ id, owners }: { id: string; owners: string[] }) {
  const [mine, setMine] = useState(false);
  useEffect(() => {
    if (!owners.length) return;
    fetch("/api/mods/me", { credentials: "same-origin", cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) return;
        const { login } = (await r.json()) as { login?: string };
        setMine(typeof login === "string" && owners.some((o) => o.toLowerCase() === login.toLowerCase()));
      })
      .catch(() => {});
  }, [owners]);
  if (!mine) return null;
  return (
    <Link
      href={`/mods/${encodeURIComponent(id)}/edit`}
      className="inline-flex h-9 items-center rounded-lg bg-lavender px-3.5 text-sm font-medium text-foreground transition-colors outline-none hover:bg-sky-surface focus-visible:ring-2 focus-visible:ring-accent"
    >
      Edit project
    </Link>
  );
}
