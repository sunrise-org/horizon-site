import { ModdingTeamPage } from "@/components/modding-team";
import { pageMetadata } from "@/components/site";

export const metadata = pageMetadata({
  title: "The modding team",
  description: "Ari, Xmilon and levzzz build Sunrise's typed mod API, the single-file .hmod and the modding guides, with every modding contributor.",
  path: "/modding-team",
});

export default function ModdingTeam() {
  return <ModdingTeamPage />;
}
