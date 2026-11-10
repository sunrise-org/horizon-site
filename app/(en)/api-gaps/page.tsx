import { ApiGapsView } from "@/components/api-gaps-page";
import { pageMetadata } from "@/components/site";
import { getEvidence, getSync } from "@/lib/api-gaps/live";

export const metadata = {
  ...pageMetadata({
    title: "Native mod API gaps · Horizon",
    description: "Which native mod API capabilities are on Horizon's main, which have work in review, and where to start on a gap.",
    path: "/api-gaps",
  }),
  robots: { index: false, follow: false },
};

export default async function ApiGapsPage() {
  const [sync, evidence] = await Promise.all([getSync(), getEvidence()]);
  return <ApiGapsView sync={sync} evidence={evidence} />;
}
