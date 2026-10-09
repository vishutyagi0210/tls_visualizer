import { useEffect, useRef, useState } from 'react';
import FlowScene, { LineIcon } from './components/FlowScene';
import FoundationScene from './components/FoundationScene';
import { ReadButton, SpeakerIcon, useSpeech } from './components/Speech';
import { foundationScenes, internalScenes, publicScenes } from './data/flowScenes';
import { changedCertificate, conclusion } from './data/simpleStories';

const basics = ['Why identity matters', 'What is a CA?'];
const privateSteps = [...basics, 'Create the CA', 'Server’s own key', 'Send a request', 'Sign & return', 'Configure trust', 'Connect', 'Verify & protect'];
const publicSteps = [...basics, 'Key & request', 'Prove domain control', 'Sign & install', 'Browser verifies'];
const privateJourney = [...foundationScenes, ...internalScenes];
const publicJourney = [...foundationScenes, ...publicScenes];

function Story({ publicCA }: { publicCA: boolean }) {
  const scenes = publicCA ? publicJourney : privateJourney;
  const labels = publicCA ? publicSteps : privateSteps;
  const [step, setStep] = useState(0);
  const [frame, setFrame] = useState({ beat: 0, progress: 0 });
  const [mode, setMode] = useState<'preview' | 'audio' | 'still'>('still');
  const [changed, setChanged] = useState(false);
  const previewTime = useRef(0);
  const running = useRef(false);
  const storyRef = useRef<HTMLElement>(null);
  const speech = useSpeech();
  const id = `${publicCA ? 'public' : 'private'}-${step}`;
  const activeAudio = speech.state.id === id && mode === 'audio';
  const beats = scenes[step];
  const beatIndex = activeAudio ? Math.max(0, speech.state.part - 1) : frame.beat;
  const beat = beats[beatIndex] ?? beats[0];
  const progress = frame.beat === beatIndex ? frame.progress : 0;
  const last = step === scenes.length - 1;
  const foundation = step < foundationScenes.length;
  const totalMoments = scenes.reduce((total, scene) => total + scene.length, 0);
  const completedMoments = scenes.slice(0, step).reduce((total, scene) => total + scene.length, 0) + beatIndex + progress;
  const captionSentences = beat.narration.match(/[^.!?]+[.!?]+(?:[”’])?|[^.!?]+$/g)?.map(sentence => sentence.trim()) ?? [beat.narration];
  const captionPosition = progress * beat.narration.length;
  let captionCursor = 0;
  const currentSentence = captionSentences.findIndex((sentence, index) => { captionCursor += sentence.length + 1; return captionPosition < captionCursor || index === captionSentences.length - 1; });
  const moving = mode === 'preview' || (activeAudio && speech.state.status === 'speaking');

  useEffect(() => {
    if (mode === 'still') return;
    let raf = 0;
    let previous = performance.now();
    let paint = 0;
    const tick = (now: number) => {
      const delta = Math.min(now - previous, 100); previous = now;
      if (mode === 'preview') previewTime.current += delta;
      if (now - paint > 40) {
        paint = now;
        if (mode === 'audio' && activeAudio) setFrame({ beat: Math.max(0, speech.state.part - 1), progress: speech.getProgress() });
        if (mode === 'preview') {
          const position = previewTime.current / 8500;
          if (position >= beats.length) { setFrame({ beat: beats.length - 1, progress: 1 }); setMode('still'); return; }
          setFrame({ beat: Math.floor(position), progress: position % 1 });
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, activeAudio, speech.state.part, speech.getProgress, beats.length, step]);

  const finish = () => { running.current = false; setMode('still'); };
  const jump = (next: number, moment = 0) => {
    speech.stop(); running.current = false; setChanged(false);
    setStep(next); setFrame({ beat: moment, progress: 0 }); previewTime.current = moment * 8500; setMode('preview');
  };
  const startAudio = (index: number) => {
    if (!running.current) return;
    setStep(index); setFrame({ beat: 0, progress: 0 }); setMode('audio');
    speech.speak(scenes[index].map(cue => cue.narration), {
      id: `${publicCA ? 'public' : 'private'}-${index}`, label: `${publicCA ? 'Public' : 'Private'} CA · ${labels[index]}`,
      onCancel: finish,
      onEnd: () => {
        if (!running.current) return;
        if (index + 1 < scenes.length) startAudio(index + 1);
        else { setFrame({ beat: scenes[index].length - 1, progress: 1 }); finish(); }
      },
    });
  };
  const listen = () => {
    if (activeAudio) { if (speech.state.status === 'paused') speech.resume(); else speech.pause(); return; }
    speech.stop(); setChanged(false); running.current = true; startAudio(step);
    storyRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  };
  const toggleVisuals = () => {
    if (mode === 'preview') { setMode('still'); return; }
    if (mode === 'audio') { speech.stop(); previewTime.current = (beatIndex + progress) * 8500; }
    if (previewTime.current >= beats.length * 8500) previewTime.current = 0;
    setMode('preview');
  };

  useEffect(() => {
    const selected = storyRef.current?.querySelector<HTMLButtonElement>('.journey-steps button[aria-current]');
    if (selected && selected.parentElement) selected.parentElement.scrollTo({ left: selected.offsetLeft - selected.parentElement.offsetLeft - 16, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [step]);

  return <section ref={storyRef} className={`animated-story ${publicCA ? 'public-story' : ''}`} aria-label={publicCA ? 'Public CA visual story' : 'Private CA visual story'}>
    <div className="film-strip"><span><i/> A GUIDED VISUAL LESSON</span><span>{foundation ? 'START WITH THE BASICS' : 'FOLLOW THE FILES'}</span></div>
    <nav className="journey-steps" aria-label="Choose a step">{labels.map((label, index) => <button key={label} aria-current={step === index ? 'step' : undefined} onClick={() => jump(index)}><span>{String(index + 1).padStart(2, '0')}</span>{label}</button>)}</nav>
    <div className="scene-toolbar"><div><span className="eyebrow">STEP {step + 1} OF {scenes.length}</span><h2>{labels[step]}</h2></div><div className="play-actions"><button className="primary-play" onClick={listen} disabled={!speech.supported || (activeAudio && speech.state.status === 'loading')}><SpeakerIcon/>{activeAudio ? speech.state.status === 'loading' ? 'Loading audio…' : speech.state.status === 'paused' ? 'Resume narration' : 'Pause narration' : 'Play with voice'}</button><button className="visual-toggle" onClick={toggleVisuals}><LineIcon kind={mode === 'preview' ? 'pause' : 'play'} size={16}/>{mode === 'preview' ? 'Pause visuals' : 'Watch without voice'}</button></div></div>
    <div className="moment-track" aria-label="Moments in this step">{beats.map((cue, i) => <button key={cue.label} onClick={() => jump(step, i)} aria-current={i === beatIndex ? 'step' : undefined}><span className="moment-fill" style={{ width: `${i < beatIndex ? 100 : i === beatIndex ? progress * 100 : 0}%` }}/><span>{i + 1}. {cue.label}</span></button>)}</div>
    {foundation ? <FoundationScene beat={beat} progress={progress} moving={moving}/> : <FlowScene beat={beat} beatIndex={beatIndex} progress={progress} step={step - foundationScenes.length} publicCA={publicCA} changed={changed} moving={moving}/>}
    <div className="spoken-caption"><div><span className={`narration-dot ${moving ? 'narration-active' : ''}`}/><strong>{activeAudio ? speech.state.status === 'paused' ? 'NARRATION PAUSED' : 'FOLLOW THE VOICE' : 'READ ALONG'}</strong><span>{beatIndex + 1} / {beats.length}</span></div><p>{changed ? changedCertificate : captionSentences.map((sentence, index) => <span className={index === currentSentence ? 'caption-current' : ''} key={`${beat.label}-${index}`}>{sentence} </span>)}</p></div>
    <div className="whole-journey-progress" role="progressbar" aria-label="Lesson progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(completedMoments / totalMoments * 100)}><span style={{ width: `${completedMoments / totalMoments * 100}%` }}/></div>
    <div className="scene-controls"><button onClick={() => jump(step - 1)} disabled={step === 0}>Previous step</button><button className="replay-control" onClick={() => jump(step)}>Replay this step</button><span>{mode === 'audio' ? 'The voice guides the whole journey.' : 'Explore a moment above, or play with voice.'}</span><button className="next-step" onClick={() => jump(last ? 0 : step + 1)}>{last ? 'Start from the beginning' : 'Next step'}</button></div>
    {last && <div className="experiment-bar"><span>Try changing the signed data.</span><button aria-pressed={changed} onClick={() => { speech.stop(); setChanged(!changed); setMode('still'); setFrame({ beat: publicCA ? 2 : 1, progress: 1 }); }}>{changed ? 'Restore the certificate' : 'Alter the certificate'}</button>{changed && <ReadButton id="changed-certificate" text={changedCertificate} label="Hear why it fails"/>}</div>}
  </section>;
}

function getPage() { return window.location.hash.startsWith('#/public') ? 'public' : 'private'; }
export default function App() {
  const [page, setPage] = useState(getPage);
  const publicCA = page === 'public';
  useEffect(() => {
    const navigate = () => { setPage(getPage()); window.scrollTo({ top: 0, behavior: 'instant' }); };
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  return <div className="flow-page"><a className="skip-link" href="#journey" onClick={e => { e.preventDefault(); document.getElementById('journey')?.focus(); }}>Skip to the visual story</a>
    <header className="flow-header"><a className="wordmark" href="#/private">signed, explained.</a><nav aria-label="Certificate examples"><a href="#/private" aria-current={!publicCA ? 'page' : undefined}>Private CA</a><a href="#/public" aria-current={publicCA ? 'page' : undefined}>Public CA</a></nav></header>
    <main className="flow-main"><header className="flow-hero"><div><span className="eyebrow">A LITTLE LESS MYSTERY. A LOT MORE UNDERSTANDING.</span><h1>{publicCA ? 'That little padlock has a story.' : 'Trust isn’t magic. Let’s watch it happen.'}</h1><p>First, a digital ID. Then, the authority that signs it. Finally, the connection it helps protect. Start from zero—no certificate knowledge needed.</p></div><div className="hero-guide"><span>{publicCA ? 'THE PUBLIC CA EDITION' : 'THE PRIVATE CA EDITION'}</span><strong>One voice.<br/>One idea at a time.</strong><p>Press “Play with voice”.<br/>Follow the spotlight from the basics to the handshake.</p></div></header>
      <div id="journey" tabIndex={-1}><Story key={page} publicCA={publicCA}/></div>
      <section className="lesson-summary"><div><span className="eyebrow">THE IMPORTANT DISTINCTION</span><h2>{publicCA ? 'The browser trusts a root, not every certificate it receives.' : 'The CA certificate is a verification tool, not a guest list.'}</h2><p>{publicCA ? 'The server sends its certificate and intermediate chain. The browser must build a valid path to an accepted root and check the server identity.' : 'ca.crt contains the CA’s public key. The client uses that key to check a signature mathematically. It does not look for server-2.crt inside ca.crt.'}</p></div><div className="role-recap"><div><LineIcon kind="key"/><code>{publicCA ? 'Issuer private key' : 'ca.key'}</code><span>Signs certificates</span></div><div><LineIcon kind="file"/><code>{publicCA ? 'Trusted root' : 'ca.crt'}</code><span>Provides a verification key</span></div><div><LineIcon kind="lock"/><code>{publicCA ? 'server.key' : 'server-2.key'}</code><span>Proves server ownership</span></div></div></section>
      <details className="flow-details"><summary>A little more context</summary><div><p><strong>Private TLS is not limited to two servers.</strong> This is one connection in a larger network. A server acts as a client when it starts a connection to another server. The example shows server authentication; mutual TLS adds a client certificate and verification in the other direction.</p><p><strong>Public trust is a policy choice.</strong> Browsers and operating systems include accepted root CA certificates. They do not automatically accept every CA or every certificate from a familiar brand.</p><p><strong>The CA signing key stays out of the handshake.</strong> The client checks signatures using public keys. Some clients separately retrieve intermediate certificates or revocation information.</p><p><strong>Modern connections use TLS.</strong> “SSL certificate” is the common older phrase. X.509 is the certificate format. Application permissions remain separate from certificate checks.</p><ReadButton id="recap" text={conclusion} label="Listen to the three key roles"/><p className="reference-links"><a href="https://www.rfc-editor.org/rfc/rfc5280">Certificate validation</a><a href="https://www.rfc-editor.org/rfc/rfc8446">TLS 1.3</a></p></div></details>
      <a className="other-page" href={publicCA ? '#/private' : '#/public'}><span>THE OTHER EXAMPLE</span><strong>{publicCA ? 'See a private CA between two servers' : 'See a public CA between server and browser'}</strong><span aria-hidden="true">→</span></a>
      <footer className="flow-footer"><span>Small scenes. One clear connection.</span><a href={`${import.meta.env.BASE_URL}audio/CREDITS.md`}>Narrator credits</a></footer>
    </main>
  </div>;
}
