---
name: motion-brief
description: Interview the user relentlessly about an animation before any of it gets built — one decision at a time, each with a recommended answer — until a motion brief has no blanks. Use when motion needs to be decided or stress-tested before it's implemented, when the user says "grill me" / "write a motion brief" / "help me decide how this should animate", when an animation has been rebuilt several times and still feels wrong, or when another skill needs the motion specified before it writes code. Produces a brief, not an implementation.
metadata:
  short-description: Interview the user into a motion brief before any animation gets built
---

# Motion Brief

A motion designer settles every movement, its timing, and its relationship to every other movement before a single frame gets made. Do that for the interface: interview the user down the decision tree of one animation until a **motion brief** has no blanks, then stop.

Animations get rebuilt three times not because the code was wrong but because nobody decided what the motion was for. This skill front-loads that decision. **It does not write the animation.** The brief is the deliverable; implementation is a separate act, taken only after the user confirms.

## The three rules

1. **One question at a time.** Ask, then wait for the answer before forming the next question — later questions genuinely depend on earlier ones. A batch of questions gets a batch of shrugs.
2. **Facts you look up. Decisions you ask.** Anything discoverable in the filesystem — the component, its trigger, the animation stack, the existing easing tokens — you find yourself. Asking the user something you could have read wastes the interview's credibility and their patience.
3. **Never ask for a number the user can't feel.** "What duration?" and "which cubic-bezier?" are unanswerable. Ask for the _sensation_ or a _reference product_, then propose the number yourself and let them react to it. People can't author 240ms; they can tell you 240ms feels slow.

Every question ships with **your recommended answer**, so the user can agree in one word and the interview stays cheap.

## Step 1 — Recon

Before the first question, read the code. Establish:

- The component and the **two states** the motion moves between.
- What **triggers** the change — click, hover, keyboard, route change, data arriving, drag.
- The **stack** available: `motion/react` in `package.json`, Tailwind, plain CSS, WAAPI.
- Existing **motion tokens** — custom `cubic-bezier` values, duration variables, `--ease-*` in the theme, and what sibling components already do.
- Whether **`prefers-reduced-motion`** is handled anywhere globally.

Done when you can state all five, or state plainly that one doesn't exist in this codebase. Report the recon in three or four lines, then go straight to the first question — no preamble, no plan announcement.

From here on, every question is grounded in what you found: _"The drawer currently uses `@keyframes` — what should happen if the user swipes it back down mid-open?"_ beats _"should it be interruptible?"_ every time.

## Step 2 — The two questions that can end the interview

Ask these first. Both can end in a **cut**, and a cut is a successful outcome — it's the answer an agent never volunteers on its own.

1. **Frequency.** "How many times a day does one user see this?" A keyboard-initiated action or anything at 100+/day gets **no animation, ever** — motion makes a repeated action feel slow and disconnected. Raycast has no open/close animation, correctly.
2. **Purpose.** "What does the motion tell the user that the static change doesn't?" Valid answers: feedback, spatial consistency, state indication, explanation, preventing a jarring change, or — for something seen rarely — delight. "It looks cool" on a frequently-seen element is not one.

If either lands on a cut, write the brief as a cut with the reasoning and stop. Do not soften it into "a very subtle version."

## Step 3 — Choreograph the movement

3. **Which properties actually differ** between state A and state B. Force the user to name both states out loud; this is where `transition: all` dies and where an animation of four properties turns out to need two.
4. **Where it comes from and where it goes.** Is it anchored to a trigger, or centered? Does the exit mirror the entry? Which direction is "forward"? Motion that enters one way and leaves another breaks the sense of a single coherent space.
5. **What happens mid-flight.** "If they trigger it again — or reverse it — halfway through, what should it do?" This is the one question that decides `@keyframes` vs transitions vs springs, and skipping it is how toasts end up jumping.

## Step 4 — Set the feel

6. **Personality, by reference.** "Name a product whose version of this feels right to you." A reference is worth ten adjectives, and you can go study it frame by frame. Fall back to a two-way choice — crisp and serious, or playful with some bounce — rather than an open question.
7. **Easing and duration together.** These are one decision, not two: a steep curve can afford a longer duration, a weak one can't. Propose both as a pair, in that order — curve first, duration tuned to it.

## Step 5 — The edges

8. **Reduced motion.** "With movement removed, what should survive?" Gentler, not zero — keep the opacity or color change that aids comprehension; drop the travel. Purely decorative motion goes away entirely.
9. **Scale and load.** What this does with 200 items instead of 3, on a mid-range phone, while data is still loading. Ask only where the recon showed a list, a drag, a filter, or a blur — otherwise it's a question about nothing.

## Step 6 — The brief

The interview ends when the brief has **no blanks** — not when the user seems satisfied, and not when you feel ready to code. If a field is still empty, there's another question to ask.

```markdown
## Motion brief — <component>

**Verdict:** animate | cut
**Trigger:** <what starts it>
**Frequency:** <seen how often> → <why that permits motion>
**Purpose:** <one sentence — what the motion communicates>

**Enter:** <properties, from → to>
**Exit:** <properties, from → to, or "mirrors enter">
**Origin:** <transform-origin / direction>
**Easing:** <curve> · **Duration:** <ms>
**Interrupt:** <what happens when re-triggered or reversed>
**Reduced motion:** <what survives>
**Stack:** <CSS transition / @starting-style / spring / layout animation>

**Open risk:** <what we're least sure of, and how we'd check it>
```

Then stop and ask for confirmation. Do not write code, propose a diff, or start editing until the user confirms the brief — the whole point is that the decision is settled before the implementation exists.

## Defaults you bring to each question

Recommend these unless the interview gives you a reason to depart. Never present a question without one.

| Decision            | Recommend                                                                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Should it animate   | Cut it if keyboard-triggered or seen 100+/day; reduce it at tens/day; standard for occasional (modals, drawers, toasts); delight only for rare or first-run                                                              |
| Which properties    | `transform` and `opacity` only — they're the ones that stay on the GPU                                                                                                                                                   |
| Entrance            | `scale(0.95)` + `opacity: 0`, never `scale(0)` — nothing appears from nothing                                                                                                                                            |
| Press / hover       | `scale(0.97)` on press (felt, not seen); 1–2% on hover, gated behind `(hover: hover) and (pointer: fine)`                                                                                                                |
| Origin              | Trigger-anchored for popovers, dropdowns, menus (`var(--radix-popover-content-transform-origin)`); centered for modals                                                                                                   |
| Easing              | `ease-out` entering/exiting, `ease-in-out` moving on screen, `ease` for hover/color, `linear` only for constant motion. Never `ease-in` on UI. A custom curve over a built-in — built-ins are almost never strong enough |
| Curve to start from | `cubic-bezier(0.19, 1, 0.22, 1)` reveals · `cubic-bezier(0.32, 0.72, 0, 1)` sheets · `cubic-bezier(0.645, 0.045, 0.355, 1)` on-screen moves                                                                              |
| Duration            | Under 300ms unless the element is large or travels far: press ~150ms, tooltip 125–200ms, dropdown 150–250ms, modal or drawer 200–500ms. Exits shorter than entries                                                       |
| Interrupt           | CSS transitions or springs, which retarget from the current state — not `@keyframes`, which restart from zero                                                                                                            |
| Spring              | `{ type: "spring", duration: 0.3, bounce: 0 }`. Bounce stays at 0 unless the user asked for personality; smaller elements need more bounce to read the same                                                              |
| Reduced motion      | Keep opacity and color, drop movement; disable decorative motion outright                                                                                                                                                |
| Stagger             | 30–80ms, varied by importance — uniform stagger kills hierarchy. One entrance per container                                                                                                                              |

## When the user stalls

"Just make it nice" is not an answer — it's a decision handed back to you. Convert it into a concrete choice: two named options with your recommendation first, and what each would feel like in one clause. _"Snap in at 180ms like a Linear menu, or ease in over 300ms with a slight settle like a Notion panel? I'd take the first — you said this opens on every row hover."_

If they still can't say, take the default, record it in the brief as **assumed**, and move on. An assumption written down is worth more than a question left open.

## Companion skills

If installed: `animate` implements the brief, `review-animations` audits what came out, `animation-vocabulary` names an effect the user is describing loosely.
