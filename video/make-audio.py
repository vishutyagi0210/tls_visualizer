"""Create original teaser narration + a quiet, synthesized sound bed. No hosted TTS."""
import io
import json
from pathlib import Path
import sys
import wave
import numpy as np
import soundfile as sf
import onnxruntime
from piper import PiperVoice, SynthesisConfig

onnxruntime.disable_telemetry_events()
root = Path(__file__).resolve().parent
out = root / 'exports'
out.mkdir(exist_ok=True)
voice = PiperVoice.load(sys.argv[1])
config = SynthesisConfig(length_scale=1.04, noise_scale=.4, noise_w_scale=.55, volume=.85)
texts = ["What makes a server trustworthy?", "It creates its own private key.", "A request goes to the certificate authority.", "The authority signs the server's certificate.", "The client checks it against a trusted issuer.", "See trust happen. Explore the full story."]
rate = 48000
shots, parts = [], []
position = 0
for i, text in enumerate(texts):
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as w:
        voice.synthesize_wav(text, w, syn_config=config)
    buf.seek(0)
    samples, sr = sf.read(buf, dtype='float32')
    # Trim only near-silence at the ends; preserve the narrator's internal pacing.
    indices = np.flatnonzero(np.abs(samples) > .004)
    samples = samples[max(0, indices[0] - int(sr * .06)):min(len(samples), indices[-1] + int(sr * .1))]
    samples = np.interp(np.arange(round(len(samples) * rate / sr)) * sr / rate, np.arange(len(samples)), samples)
    samples = samples / max(float(np.max(np.abs(samples))), .01) * .62
    lead = .22
    duration = max(3.0 if i != 5 else 3.8, len(samples) / rate + lead + .33)
    duration = np.ceil(duration * 30) / 30
    clip = np.zeros(round(duration * rate))
    offset = round(lead * rate)
    clip[offset:offset + len(samples)] = samples
    parts.append(clip)
    shots.append(dict(index=i, start=position, duration=duration, narration=text))
    position += duration
audio = np.concatenate(parts)
t = np.arange(len(audio)) / rate
# Original low-level harmonic bed, with a soft envelope and no borrowed music.
bed = sum(np.sin(2 * np.pi * f * t + k * .7) / (k + 2) for k, f in enumerate([130.81, 196, 261.63, 329.63])) * .006
bed *= np.minimum(1, t / .8) * np.minimum(1, (position - t) / 1.1)
audio += bed
# Restrained interface chimes at the signature and final invitation.
for moment in [shots[3]['start'] + shots[3]['duration'] * .57, shots[5]['start'] + .25]:
    n = int(.6 * rate)
    tt = np.arange(n) / rate
    chime = .015 * (np.sin(2 * np.pi * 660 * tt) + .45 * np.sin(2 * np.pi * 990 * tt)) * np.exp(-tt * 8) * np.minimum(1, tt / .012)
    at = round(moment * rate)
    audio[at:at + n] += chime[:len(audio[at:at+n])]
audio[-int(.25 * rate):] *= np.linspace(1, 0, int(.25 * rate))
sf.write(out / 'teaser-audio.wav', audio, rate, subtype='PCM_16')
(out / 'timeline.json').write_text(json.dumps({'duration': position, 'fps':30, 'shots':shots}, indent=2) + '\n')
print(f'Created {position:.2f}s of narration and original sound design.', flush=True)
