import { pageMetadata } from "@/components/site";
import { TeamPage } from "@/components/team-page";

export const metadata = pageMetadata({
  title: "The team",
  description: "The people who make Sunrise, the community fork of Horizon, and the makers of this site: Xmilon and Umut.",
  path: "/team",
});

export default function Team() {
  return <TeamPage />;
}
