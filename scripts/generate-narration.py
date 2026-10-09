"""Generate the shipped MP3 narration with Piper. No speech service is used.

Requires piper-tts and soundfile (with MP3 encoding support).
Usage: python generate-narration.py /path/to/en_US-ljspeech-high.onnx
First refresh the text catalog with: node scripts/create-audio-catalog.mjs
"""
import io
import json
from pathlib import Path
import re
import sys
import time
import wave

import soundfile as sf
import onnxruntime
from piper import PiperVoice, SynthesisConfig

onnxruntime.disable_telemetry_events()
root = Path(__file__).resolve().parents[1]
catalog = json.loads((root / 'scripts/narration-catalog.json').read_text())
output = root / 'public/audio'
output.mkdir(parents=True, exist_ok=True)
voice = PiperVoice.load(sys.argv[1])
config = SynthesisConfig(length_scale=1.14, noise_scale=0.4, noise_w_scale=0.55, volume=0.85)
manifest = {}
started = time.monotonic()

def pronounce(text):
    text = text.replace('X.509', 'X five oh nine').replace('X.501', 'X five oh one')
    text = re.sub(r'\bmTLS\b', 'mutual T L S', text)
    text = text.replace('PKCS#12', 'P K C S twelve')
    text = re.sub(r'\b(TLS|SSL|CSR|CA|SAN|CN|EKU|DNS|HTTP|HTTPS|PKI|RSA|RDS|CRL|OCSP|SNI|DER)\b', lambda m: ' '.join(m[0]), text)
    text = re.sub(r'\bBea\b', 'Bee', text)
    return text.replace('→', ' to ').replace('↔', ' to ').replace('✓', '').replace('·', '. ')

for index, (key, text) in enumerate(catalog.items(), 1):
    destination = output / f'{key}.mp3'
    if not destination.exists():
        wav = io.BytesIO()
        with wave.open(wav, 'wb') as handle:
            voice.synthesize_wav(pronounce(text), handle, syn_config=config)
        wav.seek(0)
        samples, sample_rate = sf.read(wav, dtype='float32')
        if len(samples) == 0:
            raise RuntimeError(f'No audio generated for {key}')
        temporary = output / f'{key}.part'
        sf.write(temporary, samples, sample_rate, format='MP3', bitrate_mode='CONSTANT', compression_level=0.8)
        temporary.replace(destination)
    manifest[key] = f'audio/{key}.mp3'
    if index % 10 == 0 or index == len(catalog):
        print(f'{index}/{len(catalog)} passages generated ({time.monotonic() - started:.0f}s)', flush=True)

(root / 'src/data/audio-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(f'Ready: {len(manifest)} MP3 files, {sum((output / Path(p).name).stat().st_size for p in manifest.values()) / 1024 / 1024:.1f} MiB.', flush=True)
