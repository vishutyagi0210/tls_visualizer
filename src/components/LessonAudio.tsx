import { useRef, useState } from 'react';
import type { Lesson } from '../data/lessons';
import { stepNarration } from '../data/narration';
import { ReadButton, SpeakerIcon, useSpeech, VoiceSettings } from './Speech';

export default function LessonAudio({ lesson, step, onStep, pauseVisuals }: { lesson: Lesson; step: number; onStep: (step: number) => void; pauseVisuals: () => void }) {
  const speech = useSpeech();
  const [journey, setJourney] = useState(false); const [details, setDetails] = useState(false);
  const active = useRef(false);
  const finish = () => { active.current = false; setJourney(false); };
  const textFor = (index: number) => stepNarration(lesson.steps[index], details);
  const startJourney = () => {
    pauseVisuals(); speech.stop(); active.current = true; setJourney(true);
    const readStep = (index: number) => {
      if (!active.current) return;
      onStep(index);
      speech.speak(textFor(index), {
        id: `chapter-${lesson.id}-${index}`, label: `${lesson.short} · step ${index + 1}`,
        onCancel: finish,
        onEnd: () => {
          if (!active.current) return;
          if (index + 1 < lesson.steps.length) readStep(index + 1);
          else finish();
        },
      });
    };
    readStep(step);
  };
  return <section className="lesson-audio" aria-label="Listen to this lesson"><div className="audio-intro"><span className="audio-symbol"><SpeakerIcon/></span><div><h3>Let the story come to you.</h3><p>Listen while you follow the picture. Take it one step at a time.</p></div></div><div className="audio-actions"><ReadButton id={`step-${lesson.id}-${step}`} text={textFor(step)} label="Listen to this step" beforeRead={pauseVisuals}/><button className={journey ? 'read-button listening' : 'read-button'} disabled={!speech.supported} onClick={journey ? speech.stop : startJourney}><span aria-hidden="true">{journey ? '■' : '▶'}</span>{journey ? 'Stop chapter audio' : 'Listen through the chapter'}</button></div><label className="audio-detail-toggle"><input type="checkbox" checked={details} onChange={e => { speech.stop(); setDetails(e.target.checked); }}/>Include the “Under the hood” explanation</label><VoiceSettings/><p className="audio-hint">Chapter audio begins at this step and advances after each explanation. Changing the experiment stops narration so you can explore.</p></section>;
}
