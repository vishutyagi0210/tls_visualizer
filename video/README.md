# Signed, Explained — LinkedIn teaser

## Ready to upload

- **Video:** [exports/tls-explained-linkedin.mp4](exports/tls-explained-linkedin.mp4)
- **Cover:** [exports/tls-explained-cover.png](exports/tls-explained-cover.png)
- Duration: 19.43 seconds; 1080 × 1350 (4:5); 30 fps; H.264 video and AAC audio.
- Includes narration, burned-in captions, close-up motion, animated certificate operations, original quiet synthesized sound design, and a URL end card.

Upload the MP4 as a native LinkedIn video. Put **https://tls.tyagi.fun** in the post text: the URL drawn inside a video is not a clickable link. Use the cover image if LinkedIn offers a thumbnail selection. Captions are already visible in the video. Preview once with sound before posting.

Suggested post:

> Certificates made more sense when I could see the process.
>
> I built a narrated TLS explainer showing private keys, certificate requests, CA signing, and client trust—one step at a time.
>
> Explore it: https://tls.tyagi.fun
>
> #DevOps #TLS #LearningInPublic

## What this is

An edited teaser built from this website's actual React animation component, framed for a portrait feed. It is not an unedited recording of a browsing session. The public website was opened and checked before production. No deployment or social-media posting was performed.

The narration uses the same local Piper LJ Speech voice as the site, with a new short script. See [voice credits](../public/audio/CREDITS.md). The background tones and interface chimes are synthesized locally; no commercial music track is included.

## Editable source

- `trailer.tsx` / `trailer.css`: six-shot composition, camera motion, captions and end card.
- `make-audio.py`: narration and original sound design; writes the timing plan.
- `render.cjs`: deterministic frame capture and MP4 encoding.
- `exports/timeline.json`: shot timings and spoken text.

These files are separate from the public app entry point; normal `npm run build` does not publish the video or change the website.

To reproduce, install Piper + SoundFile using the site's existing audio requirements, plus `imageio-ffmpeg` in an isolated environment, and provide the LJ Speech model. Start Vite on port 4173, then:

```bash
python video/make-audio.py /PATH/TO/en_US-ljspeech-high.onnx
PLAYWRIGHT_MODULE=/PATH/TO/node_modules/playwright \
FFMPEG_BINARY=/PATH/TO/ffmpeg \
node video/render.cjs
```

The renderer uses `/usr/bin/google-chrome`; adjust its launch configuration if Chrome is elsewhere. `node video/render.cjs --preview` produces only inspection stills. Keep encoder/model tooling outside the website's deployed assets.
