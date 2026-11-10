import { ApiGapsView } from "@/components/api-gaps-page";
import { pageMetadata } from "@/components/site";
import { getEvidence, getSync } from "@/lib/api-gaps/live";
import { getTeamPulls } from "@/lib/api-gaps/team-prs";

export const metadata = {
  ...pageMetadata({
    title: "Native mod API gaps · Sunrise",
    description: "Which native mod API capabilities are on the arismoko/horizon main, which have work in review, and where to start on a gap.",
    path: "/api-gaps",
  }),
  robots: { index: false, follow: false },
};

export default async function ApiGapsPage() {
  const [sync, evidence, teamPulls] = await Promise.all([getSync(), getEvidence(), getTeamPulls()]);
  return <ApiGapsView sync={sync} evidence={evidence} teamPulls={teamPulls} />;
}
