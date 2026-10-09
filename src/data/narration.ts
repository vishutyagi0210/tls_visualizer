import type { Step } from './lessons';
import type { Result } from '../simulation';

export type NarrationText = string | string[];
export function audioKey(text: string) {
  let hash = 2166136261;
  const value = text.trim();
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return `n-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}
export function stepNarration(step: Step, detail = false): string[] {
  return [`${step.title} ${step.story}`, ...(detail ? [step.detail] : [])];
}
export function quizNarration(question: string, answers: string[]) {
  return `${question} ${answers.map((answer, i) => `Option ${i + 1}. ${answer}`).join(' ')}`;
}
export function resultNarration(r: Result) {
  return `${r.label}. ${r.status === 'not-applicable' ? 'Not reached or not required' : r.status}. ${r.reason} ${r.fix ? `Try this: ${r.fix}` : ''}`.trim();
}
