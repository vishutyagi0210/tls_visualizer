import { useEffect, useReducer, useState } from 'react';
import { lessons, sources, type Lesson } from './data/lessons';
import { Seal } from './components/UI';
import { Quiz } from './components/Quiz';
import LessonAudio from './components/LessonAudio';
import { stepNarration } from './data/narration';
import { ReadButton, useSpeech } from './components/Speech';
import { Certificate, Chain, Handshake, Identity, Keys } from './scenes/Foundations';
import { Issuance, Lifecycle, MutualTLS } from './scenes/Practice';
import { Files, GitLab } from './scenes/Workbench';
import Playground from './pages/Playground';
import { About, FinalCheck, Glossary } from './pages/Reference';

const storageKey = 'signed-explained-progress-v1';
const sceneComponents = [Identity, Keys, Certificate, Chain, Handshake, Issuance, MutualTLS, Lifecycle, Files, GitLab];
function readProgress(): string[] {
  try { const value: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]'); return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && lessons.some(l => l.id === id)))] : []; } catch { return []; }
}
type Player = { step: number; playing: boolean; speed: number; replay: number };
type PlayerAction = { type: 'step'; value: number } | { type: 'play'; value: boolean } | { type: 'speed'; value: number } | { type: 'tick'; last: number } | { type: 'reset' };
function playerReducer(s: Player, action: PlayerAction): Player {
  switch (action.type) {
    case 'step': return { ...s, step: action.value, playing: false };
    case 'play': return { ...s, playing: action.value };
    case 'speed': return { ...s, speed: action.value };
    case 'tick': return { ...s, step: Math.min(s.step + 1, action.last), playing: s.step + 1 < action.last };
    case 'reset': return { ...s, step: 0, playing: false, replay: s.replay + 1 };
  }
}
function LessonPlayer({ lesson, number, completed, onComplete }: { lesson: Lesson; number: number; completed: boolean; onComplete: () => void }) {
  const [player, dispatch] = useReducer(playerReducer, { step: 0, playing: false, speed: 1, replay: 0 });
  const [announcement, setAnnouncement] = useState('');
  const speech = useSpeech();
  const pauseEverything = () => { speech.stop(); dispatch({ type: 'play', value: false }); };
  const last = lesson.steps.length - 1; const current = lesson.steps[player.step];
  const Scene = sceneComponents[number];
  useEffect(() => {
    if (!player.playing) return;
    const timer = window.setTimeout(() => dispatch({ type: 'tick', last }), 7000 / player.speed);
    return () => window.clearTimeout(timer);
  }, [player.playing, player.step, player.speed, last]);
  useEffect(() => {
    const pauseHidden = () => { if (document.hidden) dispatch({ type: 'play', value: false }); };
    document.addEventListener('visibilitychange', pauseHidden);
    return () => document.removeEventListener('visibilitychange', pauseHidden);
  }, []);
  const go = (step: number) => { speech.stop(); const next = Math.max(0, Math.min(last, step)); dispatch({ type: 'step', value: next }); setAnnouncement(`Step ${next + 1}. ${lesson.steps[next].title} ${lesson.steps[next].story}`); };
  return <>
    <header className="page-heading lesson-heading"><div className="chapter-eyebrow"><span className="eyebrow">CHAPTER {lesson.icon} <span className="eyebrow-line"/> {number < 5 ? 'THE FOUNDATIONS' : 'TRUST IN PRACTICE'}</span><span className="reading-tag">{lesson.steps.length} small steps</span></div><h1>{number === 0 ? <>How do computers<br/><em>know who to trust?</em></> : lesson.title}</h1><p>{lesson.intro}</p></header>
    <section className={`lesson-card ${player.playing || speech.state.status === 'speaking' ? 'is-playing' : ''}`} aria-label={`${lesson.title} interactive lesson`}>
      <div className="lesson-toolbar"><span><span className="live-dot"/> THE INTERACTIVE STORY</span><span>Explore at your own pace</span></div>
      <Scene step={player.step} key={player.replay} onInteract={pauseEverything}/>
      <div className="narration" key={`${player.step}-narration`}><span className="step-medallion">{String(player.step + 1).padStart(2, '0')}</span><div><h2>{current.title}</h2><p>{current.story}</p></div></div>
      <LessonAudio lesson={lesson} step={player.step} onStep={step => dispatch({ type: 'step', value: step })} pauseVisuals={() => dispatch({ type: 'play', value: false })}/>
      <div className="player-controls"><div className="playback"><button className="icon-button" aria-label="Previous step" disabled={player.step === 0} onClick={() => go(player.step - 1)}>←</button><button className="play-button" disabled={player.step === last && !player.playing} onClick={() => { speech.stop(); dispatch({ type: 'play', value: !player.playing }); }}><span aria-hidden="true">{player.playing ? 'Ⅱ' : '▶'}</span> {player.playing ? 'Pause visuals' : 'Play visuals'}</button><button className="icon-button" aria-label="Next step" disabled={player.step === last} onClick={() => go(player.step + 1)}>→</button></div><div className="step-dots" role="group" aria-label="Jump to step">{lesson.steps.map((s, i) => <button className={i === player.step ? 'current' : i < player.step ? 'visited' : ''} key={s.title} aria-label={`Step ${i + 1}: ${s.title}`} aria-current={i === player.step ? 'step' : undefined} onClick={() => go(i)}><span/></button>)}</div><div className="player-extras"><span>{player.step + 1} / {lesson.steps.length}</span><label className="speed-label"><span className="sr-only">Playback speed</span><select value={player.speed} onChange={e => dispatch({ type: 'speed', value: Number(e.target.value) })}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={1.5}>1.5×</option></select></label><button className="text-button" onClick={() => { speech.stop(); dispatch({ type: 'reset' }); setAnnouncement('Story and experiment reset to the beginning.'); }}>↺ Replay</button></div></div>
    </section>
    <div className="sr-only" aria-live="polite">{announcement}</div>
    <details className="technical-panel" onToggle={e => { if (e.currentTarget.open) pauseEverything(); }}><summary><span><span aria-hidden="true">⌘</span> Under the hood <small>The real names behind the story</small></span><span className="expand-icon" aria-hidden="true">+</span></summary><div><h3>{current.title}</h3><p>{current.detail}</p><ReadButton id={`detail-${lesson.id}-${player.step}`} text={current.detail} label="Listen to the technical explanation" beforeRead={pauseEverything}/><nav className="inline-sources" aria-label="Lesson references">{lesson.sources.map(id => <a href={sources[id].url} key={id} target="_blank" rel="noreferrer">{sources[id].title} ↗</a>)}</nav></div></details>
    <details className="transcript" onToggle={e => { if (e.currentTarget.open) pauseEverything(); }}><summary>Prefer reading? Open the complete lesson transcript.</summary><ReadButton id={`transcript-${lesson.id}`} text={lesson.steps.flatMap(s => stepNarration(s, true))} label="Read the complete transcript" beforeRead={pauseEverything}/><ol>{lesson.steps.map(s => <li key={s.title}><h3>{s.title}</h3><p>{s.story}</p><p className="muted">{s.detail}</p></li>)}</ol></details>
    {player.step === last && <Quiz key={`quiz-${player.replay}`} question={lesson.question} answers={lesson.answers} correct={lesson.correct} explanation={lesson.explanation} onCorrect={onComplete}/>}
    <div className="chapter-navigation"><span>{completed ? '✓ Chapter check-in completed' : 'Reach the final step for your little check-in.'}</span><a className="next-chapter" href={number < lessons.length - 1 ? `#/learn/${lessons[number + 1].id}` : '#/check'}>{number < lessons.length - 1 ? <>Next: {lessons[number + 1].short}</> : 'Try the final understanding check'} <span aria-hidden="true">→</span></a></div>
  </>;
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash || '#/learn/hello-trust');
  const [completed, setCompleted] = useState<string[]>(readProgress);
  useEffect(() => { const listener = () => { setHash(window.location.hash || '#/learn/hello-trust'); window.scrollTo({ top: 0 }); }; window.addEventListener('hashchange', listener); return () => window.removeEventListener('hashchange', listener); }, []);
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(completed)); } catch { /* Optional storage: keep the lesson usable. */ } }, [completed]);
  const lessonIndex = lessons.findIndex(l => hash === `#/learn/${l.id}`); const lesson = lessons[lessonIndex];
  const title = lesson?.title || ({ '#/playground': 'The trust lab', '#/glossary': 'Glossary', '#/about': 'About & sources', '#/check': 'Understanding check' } as Record<string, string>)[hash] || 'Page not found';
  useEffect(() => { document.title = `${title} · Signed, Explained`; }, [title]);
  const markComplete = (id: string) => setCompleted(old => old.includes(id) ? old : [...old, id]);
  return <><a href="#main" className="skip-link" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to content</a><header className="site-header"><a className="brand" href="#/learn/hello-trust" aria-label="Signed, Explained home"><span className="brand-mark"><Seal small/></span><span>signed<span className="brand-comma">,</span> explained<span className="brand-period">.</span></span></a><nav aria-label="Main navigation"><a className={lesson ? 'active' : ''} href="#/learn/hello-trust" aria-current={lesson ? 'page' : undefined}>The story</a><a className={hash === '#/playground' ? 'active' : ''} href="#/playground" aria-current={hash === '#/playground' ? 'page' : undefined}>Playground</a><a className={hash === '#/glossary' ? 'active' : ''} href="#/glossary" aria-current={hash === '#/glossary' ? 'page' : undefined}>Glossary</a></nav><a href="#/about" className="header-about" aria-label="About and sources">A little guide to a safer internet <span aria-hidden="true">↗</span></a></header><div className="app-layout"><aside className="sidebar"><div className="sidebar-intro"><span className="eyebrow">LEARN A LITTLE. TRUST A LITTLE.</span><h2>Your field guide</h2><p>Big ideas, one small step at a time.</p></div><nav aria-label="Chapters"><span className="section-label">01 — THE FOUNDATIONS</span>{lessons.map((l, i) => <div key={l.id}>{i === 5 && <span className="section-label">02 — TRUST IN PRACTICE</span>}<a className={`chapter-link ${lessonIndex === i ? 'active' : ''}`} href={`#/learn/${l.id}`} aria-current={lessonIndex === i ? 'page' : undefined}><span className={`chapter-number ${completed.includes(l.id) ? 'complete' : ''}`}>{completed.includes(l.id) ? '✓' : l.icon}</span><span>{l.short}</span>{lessonIndex === i && <span className="chapter-arrow" aria-hidden="true">↗</span>}</a></div>)}</nav><a className="challenge-link" href="#/check">✧ Put it all together <span>→</span></a><div className="progress-card"><div><span>Your little journey</span><strong>{completed.length}/10</strong></div><progress value={completed.length} max={10} aria-label="Completed chapter check-ins"/><small>{completed.length === 10 ? 'Every chapter connected. Lovely work.' : 'No rush. Curiosity is the only prerequisite.'}</small></div><a className="sidebar-about" href="#/about">About this guide & sources ↗</a></aside><main id="main" tabIndex={-1}><div className="mobile-chapter-select"><label>Jump to a chapter<select value={lesson?.id || ''} onChange={e => { if (e.target.value) window.location.hash = `/learn/${e.target.value}`; }}><option value="" disabled>Choose a chapter</option>{lessons.map(l => <option key={l.id} value={l.id}>{l.icon}. {l.short}</option>)}</select></label></div>
    {lesson ? <LessonPlayer key={lesson.id} lesson={lesson} number={lessonIndex} completed={completed.includes(lesson.id)} onComplete={() => markComplete(lesson.id)}/> : hash === '#/playground' ? <Playground/> : hash === '#/glossary' ? <Glossary/> : hash === '#/about' ? <About resetProgress={() => setCompleted([])}/> : hash === '#/check' ? <FinalCheck/> : <div className="empty-state"><h1>This page wandered off.</h1><p>The story is still right here.</p><a className="primary" href="#/learn/hello-trust">Back to chapter one →</a></div>}
    <footer className="page-footer"><span><span aria-hidden="true">✧</span> A little less mystery. A little more understanding.</span><a href="#/about">Educational simulations · Sources ↗</a></footer></main></div></>;
}
