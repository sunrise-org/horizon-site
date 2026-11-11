// login is the GitHub account; members without one are shown by name only.
export type TeamMember = { login?: string; name: string; role?: string };

export const TEAM: readonly TeamMember[] = [
  { login: "UMCEKO", name: "Umut" },
  { login: "Xmilon", name: "Xmilon" },
  { login: "JuanLuci", name: "Juan Luci" },
  { login: "arismoko", name: "Ari" },
  { login: "levzzz5154", name: "levzzz" },
  { login: "reservedbytes", name: "Isloka" },
  { login: "Qwerner88880", name: "Qwerner88880" },
  { name: "5oscow" },
  { login: "Sylviromi", name: "Sylviromi" },
];

// The people who make this site, shown apart from the game's contributors.
export const SITE_MAKERS = ["Xmilon", "UMCEKO"] as const;
export const SITE_REPO = "sunrise-org/horizon-site";
// Made the Horizon site this one grew out of.
export const ORIGINAL_SITE_MAKER = { name: "Anthony S", avatar: "/media/anthony-s.webp", url: "https://dezerx.com" };

export const profileUrl = (login: string) => `https://github.com/${login}`;
export const avatarUrl = (login: string) => `https://avatars.githubusercontent.com/${login}?size=128`;
export const memberOf = (login: string) => TEAM.find((m) => m.login?.toLowerCase() === login.toLowerCase());
