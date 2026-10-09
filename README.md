# Signed, Explained

Two static React pages that animate certificate issuance and TLS trust, with included English narration.

## Open locally

Node.js 22.12 or newer:

```bash
cd signed-explanation
npm ci
npm run dev
```

Open the URL printed by Vite:

- `/#/private`: your private CA, Server 2, and Server 1 acting as a client.
- `/#/public`: a public CA, a server, and a browser with an accepted public root.

Hash routes work on static hosting without server rewrite rules. These are separate views; they are not two sections on one long page.

## What moves

Select **Play with voice** to follow the entire journey. Each spoken passage drives its own visual moment using the audio playback clock. File movement pauses with narration and follows playback-speed changes.

Both journeys start with two beginner chapters: **Why identity matters** and **What is a CA?** Six narrated illustrations introduce a digital ID, the private key, the certificate issuer, and the client's trust decision before showing the network diagram. The private journey has nine chapters; the public journey has six.

The active machine lifts into a spotlight while the others recede. A close-up shows the current operation, and the focus moves from sender to receiver during file transfers. Illustrated cards reveal their details as each passage plays. Sentence highlighting is approximately paced within each audio clip, not word-level alignment. Nothing starts speaking automatically on page load.

The **What is a CA?** screen now plays miniature action scenes inside the illustration area: a server sends its CSR, the CA signs, and the certificate returns. The trust scene visibly places a CA certificate into the client's trust store, then distinguishes browser/OS-supplied public roots. Later close-ups show key creation and protected storage, CSR assembly, transfers, and signing. These use the existing voice clips and playback clock; pausing freezes their positions, and reduced-motion mode uses discrete states instead of travelling objects. A signing-operation line is not a private-key transfer.

- Key pairs appear locally; private keys stay with their owners.
- CSRs and certificates travel along a visible path between machines.
- The CA signs the server certificate; an illustrative stamp represents the digital signature.
- A public CA certificate is explicitly placed into the private client’s trust store.
- The client checks a signature, identity constraints, and private-key proof.
- Protected traffic moves between the peers after successful TLS establishment.

Use the step buttons or moment buttons to explore silently, pause visuals, or replay. Without audio, moments preview for 8.5 seconds each and stop at the end of the selected step. An optional altered-certificate experiment demonstrates signature failure. Reduced-motion preferences replace travelling-file motion with discrete source/destination states.

The private example follows one connection between two servers; private TLS is not limited to two machines. Server 1 acts as the client. The public example distinguishes server certificate, intermediate chain, and the browser’s already trusted root. No Gitaly-specific context is required.

## Audio

44 bundled MP3 passages, approximately 2.7 MiB total, generated with Piper’s LJ Speech narrator at a slower pace and lower volume. Standard HTML audio; no installed browser voices, backend, API keys, or external speech service.

Page changes, manual moment selection, and hidden tabs stop narration. Playback speed changes preserve playback. Only the optional speed preference is stored locally.

[Voice and model credits](public/audio/CREDITS.md).

## Build and publish

```bash
npm run build
npm run preview
```

Publish all of `dist/`, including `dist/audio/`. No public deployment has been performed. The production build includes TypeScript compilation. Headless Chrome checks cover both journeys at desktop and mobile widths, playback controls, automatic chapter transitions, and the tampering experiment. Screenshots were inspected; subjective narrator quality still deserves a listen on your own speakers before sharing.

## Deploy automatically to tls.tyagi.fun

The workflow [Deploy to GitHub Pages](.github/workflows/deploy-pages.yml) builds this app with Node24, then publishes only `dist/`, including the bundled audio. It runs on pushes to `main`/`master`, or manually from Actions on either branch. Build failure prevents deployment. No AWS credentials or personal access token are needed.

Use **`signed-explanation/` itself as your GitHub repository root**: `.github/`, `package.json`, `package-lock.json`, `src/`, and `public/` should appear directly at the top level on GitHub. Commit the workflow, app sources, bundled audio, and lockfile. Do not commit `node_modules`, `dist`, private keys, or secrets. Running `git add` inside a subfolder does not change an existing parent repository's root; make sure this app is its own repository before pushing it separately. This workflow belongs in `.github`, not `.gitlab`, because it runs on GitHub Actions.

### One-time GitHub and DNS setup

1. In the repository, open **Settings → Pages → Build and deployment → Source → GitHub Actions**. Check your GitHub plan supports Pages for that repository's visibility; do not make infrastructure/secrets public just to enable Pages.
2. Under **Settings → Environments → github-pages**, allow the branch you will deploy. If both `main` and `master` exist, either can replace the same site; normally keep only your actual deployment branch in the workflow.
3. Prefer verifying `tyagi.fun` ownership under your GitHub account/organization's Pages settings using the TXT record GitHub supplies.
4. In the repository's **Settings → Pages → Custom domain**, enter `tls.tyagi.fun` and Save **before** pointing DNS at GitHub.
5. At the authoritative DNS provider for `tyagi.fun` (Route53 if that is where your domain is delegated), create:

   | Type | Name | Value | TTL |
   |---|---|---|---|
   | CNAME | `tls` | `YOUR_GITHUB_USERNAME_OR_ORG.github.io` | 300 |

   Replace the owner placeholder with the actual repository owner. No `https://`, repository name, or path in the target. Inspect any existing `tls` record first; replace only a record you intend to move. Do not change your other GitLab/Praefect DNS records.
6. Push the files or run **Actions → Deploy to GitHub Pages → Run workflow**, choosing `main` or `master`.
7. Wait for the DNS check and GitHub's certificate provisioning, then enable **Enforce HTTPS** in Pages settings. Test `https://tls.tyagi.fun/#/private` and `https://tls.tyagi.fun/#/public`, including narration playback.

GitHub manages this public website's HTTPS certificate. Do **not** upload your lab CA/private keys. With a custom Actions deployment, a repository `CNAME` file does not configure the domain; the Pages setting above is required. [GitHub custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

This workflow is prepared locally; it has not changed your GitHub settings, DNS, or deployed the site. The app's existing relative asset paths and hash routes work with this custom domain.

## Source map

| File | Purpose |
| --- | --- |
| `src/App.tsx` | Separate page views, scene playback, controls and captions |
| `src/components/FlowScene.tsx` | Animated file transfers, signing, trust and verification |
| `src/components/FoundationScene.tsx` | Beginner-first illustrated introduction |
| `src/components/ActionScene.tsx`, `src/action-scene.css` | Playback-driven key creation, requests, signing, transfers and trust-store scenes |
| `src/data/flowScenes.ts` | Spoken passages and the visual action for each passage |
| `src/base.css`, `src/flow.css`, `src/cinema.css` | Shared controls, responsive layout, close-ups and spotlight animation |
| `src/components/Speech.tsx` | MP3 playback and narration clock |
| `src/data/audio-manifest.json` | Narration text hashes mapped to local files |
| `public/audio/` | Published narration and credits |

Earlier source and planning documents remain as historical material. Previous audio is archived outside `public/`; it is not published.

## Regenerate narration

For maintainers only; normal users do not need Python or a speech model:

1. With Node 24+, run `npm run audio:catalog`.
2. Install `scripts/requirements-audio.txt` in an isolated Python environment.
3. Download the Piper `en_US-ljspeech-high` model and companion `.onnx.json` linked in the credits.
4. Run `python3 scripts/generate-narration.py /path/to/en_US-ljspeech-high.onnx`.
5. Run `npm run build` and publish the complete output.

The generator reuses unchanged passages. After editing narration, regenerate the catalog and audio before building. Move unused MP3s out of `public/audio/` so they do not inflate the download.

These are educational diagrams. They do not generate keys, modify trust settings, contact CAs, or perform real cryptography.
