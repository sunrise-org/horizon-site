import type { ReactNode } from "react";
import type { Rich } from "@/lib/api-gaps/types";

export const LINK = "ag-link";

export function Ext({ href, children, title, className = LINK }: { href: string; children: ReactNode; title?: string; className?: string }) {
  if (href.startsWith("#")) return <a href={href} title={title} className={className}>{children}</a>;
  return (
    <a href={href} target="_blank" rel="noreferrer" title={title} className={className}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function RichText({ rich }: { rich: Rich }) {
  return rich.map((part, i) => (typeof part === "string" ? part : <Ext key={i} href={part.href}>{part.text}</Ext>));
}
