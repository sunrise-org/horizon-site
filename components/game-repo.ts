// The game's repository and the branch the site reads its README, docs, roadmap, links and tokens from.
export const GAME_REPO = process.env.GAME_REPO?.trim() || "sunrise-org/horizon";
export const GAME_REF = process.env.GAME_REF?.trim() || "release/sunrise";
export const GAME_URL = `https://github.com/${GAME_REPO}`;
export const gameBlob = (path: string) => `${GAME_URL}/blob/${GAME_REF}/${path}`;
