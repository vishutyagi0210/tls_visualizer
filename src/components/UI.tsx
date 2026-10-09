import type { ReactNode } from 'react';
export function Seal({ small = false }: { small?: boolean }) {
  return <svg className={small ? 'seal small' : 'seal'} viewBox="0 0 64 64" aria-hidden="true"><path d="m32 4 7 5 9 1 3 8 7 6-2 9 2 9-7 6-3 8-9 1-7 5-7-5-9-1-3-8-7-6 2-9-2-9 7-6 3-8 9-1Z" fill="currentColor"/><path d="m21 32 7 7 15-16" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
export function Actor({ kind = 'browser', name, caption, active = false, bad = false }: { kind?: 'browser' | 'shop' | 'office' | 'server'; name: string; caption?: string; active?: boolean; bad?: boolean }) {
  return <div className={`actor ${active ? 'active' : ''} ${bad ? 'bad' : ''}`}>
    <svg viewBox="0 0 180 150" aria-hidden="true" className="character">
      <ellipse cx="90" cy="139" rx="59" ry="7" fill="#263d3510" />
      {kind === 'browser' ? <><rect x="22" y="22" width="136" height="101" rx="13" fill="#edf4e7" stroke="#43624c" strokeWidth="2.5"/><path d="M23 46h134" stroke="#43624c" strokeWidth="2"/><circle cx="35" cy="35" r="3" fill="#e9ad94"/><circle cx="45" cy="35" r="3" fill="#dbc16d"/><circle cx="55" cy="35" r="3" fill="#8aaa89"/><rect x="71" y="29" width="71" height="12" rx="6" fill="#fff"/><path d="m58 123-5 11m69-11 5 11" stroke="#43624c" strokeWidth="3" strokeLinecap="round"/></> : kind === 'shop' ? <><rect x="33" y="53" width="114" height="77" rx="4" fill="#fbe0cb" stroke="#93684e" strokeWidth="2.5"/><path d="m28 52 13-28h98l13 28Z" fill="#f8eee0" stroke="#93684e" strokeWidth="2.5"/><path d="M49 25 44 52m23-27-2 27m23-27v27m23-27 3 27m18-27 5 27" stroke="#d89483" strokeWidth="12"/><path d="M28 52q10 17 21 0 10 17 21 0 10 17 21 0 10 17 21 0 10 17 20 0 10 17 20 0" fill="#f8eee0" stroke="#93684e" strokeWidth="2"/><path d="M82 130v-24q0-10 10-10h11q10 0 10 10v24" fill="#fff6e9" stroke="#93684e" strokeWidth="2"/></> : kind === 'office' ? <><path d="m25 49 65-34 65 34Z" fill="#dacff0" stroke="#766488" strokeWidth="2.5"/><rect x="34" y="50" width="112" height="73" rx="3" fill="#f0eaf8" stroke="#766488" strokeWidth="2.5"/><path d="M48 56v60m84-60v60" stroke="#c3b2d8" strokeWidth="11"/><rect x="27" y="123" width="126" height="10" rx="3" fill="#dacff0" stroke="#766488" strokeWidth="2"/><circle cx="90" cy="37" r="7" fill="#fff"/></> : <><rect x="40" y="20" width="100" height="108" rx="13" fill="#e2edf5" stroke="#5d788c" strokeWidth="2.5"/><path d="M48 52h84m-84 34h84" stroke="#9eb8c9" strokeWidth="2"/><circle cx="124" cy="36" r="4" fill="#8cb690"/><circle cx="124" cy="69" r="4" fill="#8cb690"/></>}
      <circle cx="77" cy="77" r="3.3" fill="#38473f"/><circle cx="103" cy="77" r="3.3" fill="#38473f"/>
      <path d={bad ? 'M82 94q8-8 16 0' : 'M82 89q8 9 16 0'} stroke="#38473f" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="67" cy="85" rx="6" ry="3" fill="#e6a9a1" opacity=".65"/><ellipse cx="113" cy="85" rx="6" ry="3" fill="#e6a9a1" opacity=".65"/>
    </svg><strong>{name}</strong>{caption && <small>{caption}</small>}
  </div>;
}
export function Arrow({ children, reverse = false, active = true }: { children: ReactNode; reverse?: boolean; active?: boolean }) {
  return <div className={`connection ${active ? 'lit' : ''}`}><span>{children}</span><div className={reverse ? 'arrow reverse' : 'arrow'}><i /></div></div>;
}
export function Status({ ok, children }: { ok: boolean | 'unknown'; children: ReactNode }) {
  return <div className={`status ${ok === true ? 'good' : ok === 'unknown' ? 'uncertain' : 'error'}`}><span aria-hidden="true">{ok === true ? '✓' : ok === 'unknown' ? '?' : '!'}</span><div>{children}</div></div>;
}
export function Toggle({ label, value, onChange, disabled = false }: { label: string; value: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return <label className={`toggle ${disabled ? 'disabled' : ''}`}><input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} disabled={disabled}/><span className="switch" aria-hidden="true"/><span>{label}</span></label>;
}
export function Experiment({ children }: { children: ReactNode }) { return <div className="experiment"><div className="eyebrow"><span aria-hidden="true">✧</span> YOUR TURN · CHANGE SOMETHING</div>{children}</div>; }
export function Choices<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return <div className="choice-group" role="group" aria-label={label}>{options.map(option => <button key={option} className={value === option ? 'selected' : ''} aria-pressed={value === option} onClick={() => onChange(option)}>{option}</button>)}</div>;
}
