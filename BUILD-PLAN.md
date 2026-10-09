# Design and implementation plan

## 1. Visual direction

An illustrated science book: warm cream background, white paper cards, peach and lavender accents, mint success highlights, rounded corners, subtle shadows, and small expressive SVG characters. Use dark ink for readable text; light pastels are surfaces, not body-text colors.

Suggested tokens: background `#FFF9F0`, surface `#FFFFFF`, ink `#263447`, accent `#6750A4`, peach `#FFE1D2`, mint `#DDF4E7`, error ink `#9B2638`. Check contrast during requested visual verification. Use a system rounded font stack and a system monospace stack for technical labels; no external font service is required.

### Layout

```text
Signed, Explained                         Chapters | Playground | Glossary
Chapter 4 / 10          The trust chain
+----------------------+-----------------------------------------------+
| Chapter navigation   | Visual stage: cards, actors, message arrows    |
|                      |                                               |
| Progress             | One step's explanation + experiment controls |
+----------------------+-----------------------------------------------+
                       Previous   Play/Pause   Next   Replay   3 / 6
                       [ Under the hood ]       [ Try this question ]
```

On mobile, use a chapter selector and stack stage, explanation, and controls. Use HTML for paragraphs and labels; SVG for shapes and connectors. Anchor connectors to consistent node positions. Reserve label space, wrap long names, and use a vertical sequence layout on narrow screens. Never shrink a desktop diagram until labels become unreadable.

### Accessibility and motion

- Semantic buttons, keyboard access, visible focus, accessible names, and touch targets of at least 44 CSS pixels.
- No interaction available only by dragging, hovering, or color. Pair status color with text and icons.
- Playback starts only on request. Pause at questions and the final step. Reset and chapter changes stop playback.
- Reduced-motion mode uses immediate state changes; all explanations remain available.
- Provide a text transcript for each scene and polite announcements for manually selected steps. Avoid continuous autoplay announcements.
- Focus stays predictable during step changes; navigation identifies the active chapter.

## 2. Architecture

Use a single Vite React TypeScript app with CSS and reusable SVG components. Hash navigation such as `#/learn/trust-chain` and `#/playground` allows static hosting and refreshes without rewrite configuration. A small route map is sufficient.

```text
signed-explanation/
  README.md, LESSONS.md, BUILD-PLAN.md, IMPLEMENTATION-PROMPT.md
  package.json, package-lock.json, index.html, vite.config.ts
  tsconfig*.json
  public/                     original favicon/social preview if supplied
  src/
    main.tsx, App.tsx
    styles/                   tokens.css, global.css, scenes.css
    components/               Shell, LessonPlayer, Controls, DetailPanel, Quiz
    scenes/                   Identity, Keys, Certificate, Chain, Handshake,
                              Issuance, MutualTLS, Lifecycle, Formats, GitLab
    data/                     lessons, glossary, demoFixtures, sources
    simulation/               types, reducer, evaluateScenario
    pages/                    Learn, Playground, Glossary, About
```

Keep narration/content in data files and scene rendering in components. Avoid building a generic diagram engine, custom cryptography, global state framework, or plugin system.

### Data and state contract

- `Lesson`: stable `id`, title, objective, scene type, ordered steps, quiz, source links.
- `Step`: stable `id`, simple narration, technical detail, visual state, optional experiment controls.
- `DemoCertificate`: id, subject, issuer id, typed SANs, public-key id, validity, CA flag, usage, and illustrative signature-valid flag. These are simulated fields, not parsed X.509 objects.
- `Scenario`: presented chain, trust anchors, requested identity, simulated time, server key id, revocation status/policy, client-auth settings, and application permission.
- `CheckResult`: id, `pass | fail | unknown | not-applicable`, short reason, suggested correction, affected actor/field.
- Player state: lesson id, step index, playing, speed, scenario, explanation disclosure. Derive visuals from state; do not mutate DOM elements directly.

Reducer events: select lesson, previous/next, play/pause, reset, change speed, change scenario. Clear timers on unmount, route/lesson change, and pause. Clamp step indexes. Changing an experiment pauses playback and recomputes checks immediately.

`evaluateScenario` is a pure educational rules function. Return individual check results, then derive an overall result without converting unknown status to success. Label the chosen revocation policy. Browser/OS trust stores are never read or changed.

Use localStorage only for optional progress/settings, with a versioned key, error handling, and a reset control. Do not persist fictional or real key material. Missing storage must not prevent use.

## 3. Build order

| Phase | Implement | Completion checkpoint |
| --- | --- | --- |
| 1 | Vite scaffold, visual tokens, shell, player, chapter 1 | A complete responsive lesson with controls and quiz |
| 2 | Chapters 2–4; certificate card and trust-chain components | Clickable fields and working trust/missing-chain experiments |
| 3 | Chapters 5–7; handshake, issuance, mTLS | Accurate sequencing and working public-CA, private-CA, and self-signed paths |
| 4 | Chapters 8–10; lifecycle, formats/workbench, GitLab | Time/rotation interactions, annotated commands, selectable TLS hops |
| 5 | Playground, glossary, sources, final content/layout pass | Every promised topic is reachable; publication instructions are complete |

Each phase should leave usable content. Finish all phases when asked for the full app. Keep a brief progress note with completed files, remaining chapters, and decisions so another coding session can resume cheaply.

## 4. Completion criteria

This is a checklist for a later requested verification pass; this planning task runs no tests.

- All ten chapters have functional visuals, both explanation levels, an experiment, and quiz feedback; no placeholder chapters or inert buttons.
- A beginner can trace the ZeroSSL example from domain-control verification through installation and browser trust; the final understanding check covers all three issuance/trust models.
- Previous/Next/Replay and playback behave consistently. Replay restores the chapter's baseline experiment. Navigation cancels active timers.
- Playground presets produce the LESSONS.md outcomes, including combined errors and unknown status.
- A copied public certificate without the matching private key fails the proof-of-possession scenario.
- No private key crosses a network arrow; trust changes never override name, time, or signature failures.
- Diagrams remain readable at 360, 768, and 1440 CSS pixels. Keyboard-only use and reduced motion preserve every learning interaction.
- Hash links survive refresh and invalid routes show a useful fallback. Optional storage failure does not break rendering.
- Public assets and text contain only fictional examples; the production output excludes infrastructure files.
- When verification is requested, run the production build/type checks and manually walk the scenarios. Report only checks actually performed; add automated tests only if requested.

## 5. Run and publish after implementation

Add scripts for `npm run dev`, `npm run build` (TypeScript check then Vite build), and `npm run preview`. Commit the lockfile and document the Node version compatible with the selected Vite version; do not guess version requirements during scaffolding.

Use Vite `base: './'` for relative assets and hash routes for chapter URLs. Keep assets imported through Vite or referenced using its base URL. Publish `dist/` to a static host. For a dedicated GitHub Pages project, a workflow can build this standalone directory and upload only its output. For an existing monorepo host, set the project root to `signed-explanation` and output directory to `dist`.

Use the [official Vite deployment guide](https://vite.dev/guide/static-deploy.html) when configuring the chosen host. Update README with actual installation, build, hosting, and content-editing steps once code exists. Include page title, description, favicon, source credits, and a repository license chosen by the owner. Deployment is a later action; this plan does not publish anything.
