import { useState } from 'react';
import { Status } from './UI';
import { ReadButton, useSpeech } from './Speech';
import { quizNarration } from '../data/narration';
export function Quiz({ question, answers, correct, explanation, onCorrect }: { question: string; answers: string[]; correct: number; explanation: string; onCorrect?: () => void }) {
  const speech = useSpeech();
  const [choice, setChoice] = useState<number | null>(null);
  return <section className="quiz"><span className="eyebrow">A LITTLE CHECK-IN</span><h3>{question}</h3><ReadButton id={`quiz-${question}-${answers.join('|')}`} text={quizNarration(question, answers)} label="Listen to the question"/><div className="quiz-options">{answers.map((answer, i) => <button key={answer} aria-pressed={choice === i} className={choice === i ? i === correct ? 'correct' : 'incorrect' : ''} onClick={() => { speech.stop(); setChoice(i); if (i === correct) onCorrect?.(); }}><span>{String.fromCharCode(65 + i)}</span>{answer}</button>)}</div>{choice !== null && <div aria-live="polite"><Status ok={choice === correct}><strong>{choice === correct ? 'You’ve got it. ' : 'Let’s untangle that. '}</strong>{explanation}{choice !== correct && ' Try another answer.'}</Status><ReadButton id={`feedback-${question}`} text={explanation} label="Hear why"/></div>}</section>;
}
