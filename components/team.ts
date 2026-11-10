export type TeamMember = { login: string; name: string; role?: string };

export const TEAM: readonly TeamMember[] = [
  { login: "UMCEKO", name: "Umut" },
  { login: "Xmilon", name: "Xmilon" },
  { login: "JuanLuci", name: "Juan Luci" },
  { login: "arismoko", name: "Ari" },
];

export const profileUrl = (login: string) => `https://github.com/${login}`;
export const avatarUrl = (login: string) => `https://avatars.githubusercontent.com/${login}?size=128`;
export const memberOf = (login: string) => TEAM.find((m) => m.login.toLowerCase() === login.toLowerCase());
