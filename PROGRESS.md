# Current implementation

## Narrated animated pages

- Private CA: seven steps, with generic Server 1 (client) and Server 2 (server).
- Public CA: four steps, with a server, browser, and public issuer.
- Separate hash routes `/#/private` and `/#/public` for static hosting.
- No decorative stars, flower symbols, or emoji in the active interface.
- Sub-scenes show file movement, signing, trust-store configuration, signature verification and protected traffic.
- 36 scene passages plus two recap/experiment passages: 38 bundled MP3s, approximately 2.2 MiB.
- Narration part and playback position drive the visuals. Pause and playback-speed changes keep them together.
- Silent preview, step and moment selection, replay, tampering example, mobile layout and reduced-motion handling.
- The private example explicitly explains the client role and that a network may contain more than two machines.

## Source and preservation

Active entry point: `src/App.tsx`; animated diagrams: `src/components/FlowScene.tsx`; scene scripts: `src/data/flowScenes.ts`.

Historical page implementations, lesson data, plans and audio remain in the repository. Unused audio is stored outside `public/` and is not deployed.

## Delivery

Production build includes TypeScript compilation. No automated tests or browser visual/audio checks were run for this revision. Public deployment is not part of this change.
