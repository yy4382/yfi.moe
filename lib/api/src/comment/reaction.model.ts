import { z } from "zod";

export const commentReactionReqBody = z.object({
  emoji: z.string().min(1).max(10), // max 10 chars to avoid abuse
});

export type CommentReactionReqBody = z.infer<typeof commentReactionReqBody>;

/**
 * Remove Fitzpatrick skin-tone modifiers and Variation Selector-16 (U+FE0F) from an emoji string.
 * Preserves ZWJ sequences, gender signs, flags… everything else.
 *
 * Examples:
 *  "👍🏽"  -> "👍"
 *  "👋🏻"  -> "👋"
 *  "👨🏾‍💻"  -> "👨‍💻"
 *  "🧑🏿‍🤝‍🧑🏻"  -> "🧑‍🤝‍🧑"
 */
export function canonicalizeEmoji(input: string): string {
  const SKIN_TONES = /\p{Emoji_Modifier}/gu; // U+1F3FB–U+1F3FF
  const VS16 = /\uFE0F/gu;

  return input
    .normalize("NFC") // canonical normalization
    .replace(VS16, "") // strip VS16
    .replace(SKIN_TONES, ""); // strip skin-tone modifiers
}
