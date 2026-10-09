import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import manifest from '../data/audio-manifest.json';
import { audioKey, type NarrationText } from '../data/narration';

type SpeechState = { status: 'idle' | 'loading' | 'speaking' | 'paused' | 'error'; id: string; label: string; part: number; total: number; error: string };
type Request = { id: string; label: string; onEnd?: () => void; onCancel?: () => void };
type Narrator = {
  supported: boolean; rate: number; state: SpeechState;
  speak: (text: NarrationText, request: Request) => void; stop: () => void;
  pause: () => void; resume: () => void; setRate: (rate: number) => void;
  getProgress: () => number;
};
const initial: SpeechState = { status: 'idle', id: '', label: '', part: 0, total: 0, error: '' };
const SpeechContext = createContext<Narrator | null>(null);
const audioFiles: Record<string, string> = manifest;
const preferencesKey = 'signed-explained-simple-voice-v3';
function savedRate() {
  try { const rate = Number(localStorage.getItem(preferencesKey)); return [0.75, 0.9, 1, 1.15, 1.3].includes(rate) ? rate : 1; }
  catch { return 1; }
}

export function SpeechProvider({ children }: { children: ReactNode }) {
  const supported = typeof window !== 'undefined' && typeof window.Audio !== 'undefined';
  const [rate, updateRate] = useState(savedRate);
  const [state, setState] = useState<SpeechState>(initial);
  const generation = useRef(0);
  const audio = useRef<HTMLAudioElement | null>(null);
  const requestRef = useRef<Request | null>(null);
  const rateRef = useRef(rate);
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelEngine = useCallback(() => {
    generation.current++;
    if (startTimer.current) clearTimeout(startTimer.current);
    startTimer.current = null;
    if (audio.current) {
      const player = audio.current;
      player.onended = null; player.onerror = null; player.onplaying = null;
      player.onpause = null; player.onwaiting = null;
      player.pause(); player.removeAttribute('src'); player.load();
    }
    const previous = requestRef.current; requestRef.current = null;
    previous?.onCancel?.();
  }, []);
  const stop = useCallback(() => { cancelEngine(); setState(initial); }, [cancelEngine]);
  useEffect(() => {
    const hide = () => { if (document.hidden) stop(); };
    window.addEventListener('hashchange', stop); window.addEventListener('pagehide', stop);
    document.addEventListener('visibilitychange', hide);
    return () => {
      window.removeEventListener('hashchange', stop); window.removeEventListener('pagehide', stop);
      document.removeEventListener('visibilitychange', hide); cancelEngine();
    };
  }, [stop, cancelEngine]);
  useEffect(() => { try { localStorage.setItem(preferencesKey, String(rate)); } catch { /* Optional preference. */ } }, [rate]);

  const speak = useCallback((text: NarrationText, request: Request) => {
    cancelEngine();
    const parts = (Array.isArray(text) ? text : [text]).map(part => part.trim()).filter(Boolean);
    const paths = parts.map(part => audioFiles[audioKey(part)]);
    if (!supported || !parts.length || paths.some(path => !path)) {
      setState({ ...initial, status: 'error', label: request.label, error: !supported ? 'This browser cannot play audio.' : 'This passage’s audio is missing. Refresh the page after the latest site update.' });
      request.onCancel?.(); return;
    }
    // Reuse the element initially unlocked by the listener's click for subsequent passages.
    const player = audio.current ?? new Audio(); audio.current = player;
    player.preload = 'auto'; player.preservesPitch = true;
    const token = generation.current; requestRef.current = request;
    const fail = (message: string) => {
      if (token !== generation.current) return;
      cancelEngine(); setState({ ...initial, status: 'error', label: request.label, error: message });
    };
    const play = () => {
      player.play().catch(error => {
        if (token !== generation.current) return;
        fail(error?.name === 'NotAllowedError' ? 'Playback was blocked. Press Listen again and allow this site to play sound.' : 'The audio file could not play. Refresh the page and try Listen again.');
      });
    };
    const read = (index: number) => {
      if (token !== generation.current) return;
      setState({ status: 'loading', id: request.id, label: request.label, part: index + 1, total: paths.length, error: '' });
      player.onplaying = () => {
        if (token !== generation.current) return;
        if (startTimer.current) clearTimeout(startTimer.current);
        setState(s => ({ ...s, status: 'speaking' }));
      };
      player.onpause = () => { if (token === generation.current && !player.ended) setState(s => ({ ...s, status: 'paused' })); };
      player.onwaiting = () => { if (token === generation.current) setState(s => ({ ...s, status: 'loading' })); };
      player.onerror = () => fail('The narration file could not load. Refresh the page; a hosted copy must include the audio folder.');
      player.onended = () => {
        if (token !== generation.current) return;
        if (startTimer.current) clearTimeout(startTimer.current);
        if (index + 1 < paths.length) { read(index + 1); return; }
        requestRef.current = null; setState(initial); request.onEnd?.();
      };
      player.src = `${import.meta.env.BASE_URL}${paths[index]}`;
      player.playbackRate = rateRef.current;
      startTimer.current = setTimeout(() => fail('The audio download took too long. Check the connection to this site and press Listen again.'), 20000);
      play();
    };
    read(0);
  }, [supported, cancelEngine]);
  const getProgress = useCallback(() => {
    const player = audio.current;
    return player && Number.isFinite(player.duration) && player.duration > 0 ? Math.min(1, player.currentTime / player.duration) : 0;
  }, []);
  const pause = () => audio.current?.pause();
  const resume = () => {
    const token = generation.current;
    audio.current?.play().catch(() => {
      if (token !== generation.current) return;
      cancelEngine(); setState({ ...initial, status: 'error', error: 'Resume was blocked. Press Listen to restart this passage.' });
    });
  };
  return <SpeechContext.Provider value={{ supported, rate, state, speak, stop, pause, resume, getProgress, setRate: value => { rateRef.current = value; if (audio.current) audio.current.playbackRate = value; updateRate(value); } }}>{children}<SpeechPlayer/></SpeechContext.Provider>;
}

export function useSpeech() {
  const speech = useContext(SpeechContext);
  if (!speech) throw new Error('SpeechProvider is required.');
  return speech;
}
export function SpeakerIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4 6 8H3v8h3l5 4Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>;
}
export function ReadButton({ id, text, label = 'Listen', beforeRead }: { id: string; text: NarrationText; label?: string; beforeRead?: () => void }) {
  const speech = useSpeech();
  const active = speech.state.id === id && ['loading', 'speaking', 'paused'].includes(speech.state.status);
  return <button className={`read-button ${active ? 'listening' : ''}`} disabled={!speech.supported} aria-label={active ? `Stop reading: ${label}` : label} aria-pressed={active} title={speech.supported ? undefined : 'Audio playback is unavailable in this browser'} onClick={() => { if (active) speech.stop(); else { beforeRead?.(); speech.speak(text, { id, label }); } }}><SpeakerIcon/>{active ? 'Stop listening' : label}</button>;
}
export function VoiceSettings() {
  const speech = useSpeech();
  return <details className="voice-settings"><summary>Narrator & speed</summary><div className="voice-fields"><div className="recorded-voice"><strong>Included English narrator</strong><span>Ready to play · no browser voice setup</span></div><label>Speaking speed<select value={speech.rate} onChange={e => speech.setRate(Number(e.target.value))}>{[0.75, 0.9, 1, 1.15, 1.3].map(rate => <option key={rate} value={rate}>{rate}×{rate === 1 ? ' · natural' : ''}</option>)}</select></label></div><p>Narration is included with the website as audio files. No speech service or installed system voice is needed. Changing speed keeps the narration and diagram together.</p></details>;
}

function SpeechPlayer() {
  const speech = useSpeech(); const { state } = speech;
  if (state.status === 'idle') return null;
  return <aside className={`speech-dock ${state.status === 'error' ? 'speech-error' : ''}`} aria-label="Narration controls"><div className="speech-dock-heading"><SpeakerIcon/><div><strong>{state.status === 'error' ? 'Audio could not play' : state.status === 'paused' ? 'Paused' : 'Your gentle narrator'}</strong><span>{state.label}</span></div><button onClick={speech.stop} aria-label="Stop narration">×</button></div>{state.status === 'error' ? <p role="status">{state.error}</p> : <div className="speech-dock-controls"><button onClick={state.status === 'paused' ? speech.resume : speech.pause} disabled={state.status === 'loading'}>{state.status === 'paused' ? 'Resume' : 'Pause'}</button><button onClick={speech.stop}>Stop</button><label><span className="sr-only">Speaking speed</span><select value={speech.rate} onChange={e => speech.setRate(Number(e.target.value))}><option value={0.9}>Slower</option><option value={1}>Gentle</option><option value={1.15}>Faster</option></select></label></div>}</aside>;
}
