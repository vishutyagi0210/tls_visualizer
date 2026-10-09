# Narration credits

The English narration in Signed, Explained is synthetic speech generated locally from the app's original teaching text.

- Generation tool: [Piper](https://github.com/OHF-Voice/piper1-gpl), piper-tts 1.8.0. Piper is licensed under GPL-3.0. The generator and model are not distributed with the web app; only the generated MP3 files are served.
- Voice model: [en_US-ljspeech-high](https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/ljspeech/high).
- [Voice model card](https://huggingface.co/rhasspy/piper-voices/raw/main/en/en_US/ljspeech/high/MODEL_CARD), retrieved October 9, 2026. It identifies the training dataset as public domain.
- Dataset: [LJ Speech](https://keithito.com/LJ-Speech-Dataset/).
- Encoding: SoundFile/libsndfile, MP3, mono, 22,050 Hz.

The voice is used for educational narration. It does not represent a live speaker or endorsement. No learner text is sent to a speech service during playback.
