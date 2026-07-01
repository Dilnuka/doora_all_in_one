import { AVATAR_PRESETS, AVATAR_STYLE } from "./avatars";

export function getAvatarUrl(avatarId: string | null | undefined) {
  if (!avatarId) return null;
  const preset = AVATAR_PRESETS.find((p) => p.id === avatarId) ?? AVATAR_PRESETS[0];
  const params = new URLSearchParams({
    seed: preset.seed,
    backgroundColor: preset.background,
  });
  return `https://api.dicebear.com/9.x/${AVATAR_STYLE}/svg?${params}`;
}
