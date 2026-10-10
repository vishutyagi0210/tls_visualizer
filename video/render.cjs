// Dependencies stay outside the website. Pass the encoder and Playwright module paths.
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const out = path.join(__dirname, 'exports');
const timeline = JSON.parse(fs.readFileSync(path.join(out, 'timeline.json')));
const fps = timeline.fps;
const ffmpeg = process.env.FFMPEG_BINARY || 'ffmpeg';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--font-render-hinting=none'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/video/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => typeof window.renderVideoFrame === 'function');
  await page.evaluate(() => document.fonts.ready);
  // Produce representative stills before the full encode for layout inspection.
  for (const shot of timeline.shots) {
    await page.evaluate(s => window.renderVideoFrame(s.index, .78, s.start + s.duration * .78), shot);
    await page.screenshot({ path: path.join(out, `preview-${shot.index + 1}.png`) });
  }
  console.log('Preview stills ready.');
  if (process.argv.includes('--preview')) { await browser.close(); return; }
  const output = path.join(out, 'tls-explained-linkedin.mp4');
  const encoder = spawn(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'warning', '-f', 'image2pipe', '-framerate', String(fps), '-vcodec', 'png', '-i', 'pipe:0', '-i', path.join(out, 'teaser-audio.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps), '-c:a', 'aac', '-b:a', '192k', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=9', '-movflags', '+faststart', '-t', String(timeline.duration), output], { stdio: ['pipe', 'ignore', 'pipe'] });
  let encoderLog = '';
  encoder.stderr.on('data', chunk => { encoderLog += chunk.toString(); });
  const ended = new Promise((resolve, reject) => { encoder.on('error', reject); encoder.on('close', code => code === 0 ? resolve() : reject(new Error(`Encoder ${code}: ${encoderLog}`))); });
  let index = 0;
  const frames = Math.round(timeline.duration * fps);
  for (let frame = 0; frame < frames; frame++) {
    const seconds = frame / fps;
    while (index < timeline.shots.length - 1 && seconds >= timeline.shots[index + 1].start - .00001) index++;
    const shot = timeline.shots[index];
    const p = Math.max(0, Math.min(1, (seconds - shot.start) / shot.duration));
    await page.evaluate(([i, progress, time]) => window.renderVideoFrame(i, progress, time), [index, p, seconds]);
    const png = await page.screenshot({ type: 'png' });
    if (!encoder.stdin.write(png)) await once(encoder.stdin, 'drain');
    if (frame % 90 === 0) console.log(`Rendered ${frame}/${frames} frames`);
  }
  encoder.stdin.end();
  await ended;
  assert.deepEqual(errors, []);
  await page.evaluate(() => window.renderVideoFrame(5, .6, 0));
  await page.screenshot({ path: path.join(out, 'tls-explained-cover.png') });
  await browser.close();
  console.log(`Ready: ${output} (${(fs.statSync(output).size / 1048576).toFixed(1)} MiB), ${timeline.duration.toFixed(2)} seconds, ${frames} frames.`);
})().catch(error => { console.error(error); process.exit(1); });
