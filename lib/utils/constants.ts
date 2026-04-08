export const GAMES = [
  {
    id: "efootball",
    name: "eFootball",
    shortName: "eFootball",
    description: "1v1 Skill Matches",
    color: "#0057FF",
    emoji: "⚽",
  },
  {
    id: "dls",
    name: "Dream League Soccer",
    shortName: "DLS",
    description: "Mobile Football",
    color: "#00C851",
    emoji: "🏆",
  },
  {
    id: "free-fire",
    name: "Free Fire",
    shortName: "Free Fire",
    description: "Battle Royale",
    color: "#FF6B00",
    emoji: "🔥",
  },
  {
    id: "pubg-mobile",
    name: "PUBG Mobile",
    shortName: "PUBG",
    description: "Battle Royale",
    color: "#F2A900",
    emoji: "🍳",
  },
  {
    id: "codm",
    name: "Call of Duty Mobile",
    shortName: "CODM",
    description: "FPS Shooter",
    color: "#1A1A2E",
    emoji: "💀",
  },
  {
    id: "fc25",
    name: "FC 25",
    shortName: "FC25",
    description: "Console Football",
    color: "#FF0039",
    emoji: "🎮",
  },
] as const;

export const MATCH_TYPES = ["1v1", "2v2", "3v3", "Squad"] as const;
export type MatchType = (typeof MATCH_TYPES)[number];

export const PLATFORMS = ["Android", "iOS", "PlayStation", "Xbox", "PC", "Steam"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const POINT_PACKAGES = [
  { points: 500, price: 0.99, label: "Starter Pack", popular: false },
  { points: 1500, price: 2.49, label: "Player Pack", popular: true },
  { points: 5000, price: 7.99, label: "Arena Pack", popular: false },
  { points: 15000, price: 19.99, label: "Champion Pack", popular: false },
] as const;

export const AD_REWARD_POINTS = 100;
export const REFERRAL_REWARD_POINTS = 500;
export const PLATFORM_FEE_PERCENT = 5; // 5% rake
export const MIN_WAGER_POINTS = 50;
export const MAX_WAGER_POINTS = 10000;
