import { getDocs, getDocsNav, searchIndex } from "@/components/docs-data";
import { DocsNav, type DocsNavItem } from "@/components/docs-nav";
import "./docs.css";

export default async function DocsLayout({ children }: LayoutProps<"/docs">) {
  const [nav, docs] = await Promise.all([getDocsNav(), getDocs()]);
  const groups = nav.map(({ group, section, pages, parents = {}, book }) => {
    const items: DocsNavItem[] = [];
    const bySlug = new Map<string, DocsNavItem>();
    for (const slug of pages) {
      const doc = docs.find((d) => d.slug === slug);
      if (!doc) continue;
      const item = { path: doc.path, title: doc.title, children: [] };
      bySlug.set(slug, item);
      (bySlug.get(parents[slug])?.children ?? items).push(item);
    }
    return { group, section, items, book };
  });

  return (
    <main className="mx-auto w-full max-w-[100rem] flex-1 px-5 pt-24 pb-24 sm:px-8 lg:px-10 lg:pt-28 2xl:px-12">
      <div className="docs-progress" aria-hidden />
      <div className="lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[17.5rem_minmax(0,1fr)] xl:gap-14">
        <DocsNav groups={groups} index={searchIndex(docs)} />
        <div className="mt-8 min-w-0 lg:mt-0">{children}</div>
      </div>
    </main>
  );
}
