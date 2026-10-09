# Current implementation

## Narrated animated pages

- Private CA: nine steps, including two beginner chapters before the generic Server 1 (client) / Server 2 diagram.
- Public CA: six steps, including the same introduction before the server, browser, and public issuer.
- New illustrated introduction explains digital identity, certificates, private keys, the CA, and the client's trust choice.
- The narrated subject lifts forward while other machines fade back; desktop close-ups sit beside the network diagram.
- Separate hash routes `/#/private` and `/#/public` for static hosting.
- No decorative stars, flower symbols, or emoji in the active interface.
- Sub-scenes show file movement, signing, trust-store configuration, signature verification and protected traffic.
- 42 unique scene passages plus two recap/experiment passages: 44 bundled MP3s, approximately 2.7 MiB.
- Narration part and playback position drive the visuals. Pause and playback-speed changes keep them together.
- Silent preview, step and moment selection, replay, tampering example, mobile layout and reduced-motion handling.
- The private example explicitly explains the client role and that a network may contain more than two machines.

## Source and preservation

Active entry point: `src/App.tsx`; animated diagrams: `src/components/FlowScene.tsx`; scene scripts: `src/data/flowScenes.ts`.

Historical page implementations, lesson data, plans and audio remain in the repository. Unused audio is stored outside `public/` and is not deployed.

## Delivery

TypeScript and the production build pass. All 44 narration assets were checked against the text catalog. Headless Chrome exercised every chapter and moment on both routes at 1440, 390, and 320px without horizontal page overflow or browser exceptions. Real MP3 playback, pause/resume, speed changes, automatic beat/chapter progression, altered-certificate failure/restore, and reduced-motion transforms passed. Desktop and mobile screenshots were inspected. Subjective listening quality was not assessed; public deployment is not part of this change.
