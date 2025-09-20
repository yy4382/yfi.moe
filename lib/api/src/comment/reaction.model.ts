import { z } from "zod";

export const commentReactionReqBody = z.object({
  emoji: z.string().min(1).max(10), // max 10 chars to avoid abuse
});

export type CommentReactionReqBody = z.infer<typeof commentReactionReqBody>;

/**
 * Remove only Fitzpatrick skin-tone modifiers from an emoji string.
 * Preserves ZWJ sequences, Variation Selector-16 (U+FE0F), gender signs, flags… everything else.
 *
 * Examples:
 *  "👍🏽"  -> "👍"
 *  "👋🏻"  -> "👋"
 *  "👨🏾‍💻"  -> "👨‍💻"
 *  "🧑🏿‍🤝‍🧑🏻"  -> "🧑‍🤝‍🧑"
 *  "☺️"  -> "☺️"      (unchanged)
 */
export function canonicalizeEmoji(emojiRaw: string): string {
  // U+1F3FB..U+1F3FF = light..dark skin tones.
  // The /u flag makes the regex operate on code points (not UTF-16 code units).
  const SKIN_TONES = /[\u{1F3FB}-\u{1F3FF}]/gu;
  return emojiRaw.replace(SKIN_TONES, "");
}
