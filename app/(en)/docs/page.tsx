import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocView } from "@/components/doc-view";
import { getDoc } from "@/components/docs-data";
import { DocJsonLd, docMetadata } from "@/components/docs-seo";
import { getMessages } from "@/components/i18n";
import { MOD_API_REPO_URL } from "@/components/links";
import { SunriseTeam } from "@/components/sunrise-team";

export async function generateMetadata(): Promise<Metadata> {
  const found = await getDoc("index");
  if (!found) return { title: "Sunrise docs" };
  return docMetadata(found.doc);
}

export default async function DocsIndexPage() {
  const found = await getDoc("index");
  if (!found) notFound();
  return (
    <>
      <DocJsonLd doc={found.doc} />
      <DocView {...found}>
        <section className="mt-14" aria-labelledby="docs-team">
          <h2 id="docs-team" className="scroll-mt-28 font-display text-2xl font-semibold text-foreground">Meet the Sunrise team</h2>
          <p className="mt-2 text-muted">
            The modding guides follow <a href={MOD_API_REPO_URL} className="text-accent-ink underline underline-offset-4">Ari’s mod API work</a>.
          </p>
          <SunriseTeam newTab={getMessages("en").common.newTab} />
        </section>
      </DocView>
    </>
  );
}
