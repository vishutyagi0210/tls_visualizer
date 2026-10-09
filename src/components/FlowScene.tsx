import { useEffect, useState, type CSSProperties } from 'react';
import type { Beat } from '../data/flowScenes';

export function LineIcon({ kind, size = 24 }: { kind: 'key' | 'file' | 'lock' | 'check' | 'play' | 'pause'; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === 'key' && <><circle cx="8" cy="8" r="4"/><path d="m11 11 9 9m-4-4 3-3m-6 0 3-3"/></>}
    {kind === 'file' && <><path d="M14 3H5v18h14V8Z"/><path d="M14 3v5h5M8 12h8m-8 4h6"/></>}
    {kind === 'lock' && <><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/></>}
    {kind === 'check' && <path d="m5 12 4 4 10-10"/>}
    {kind === 'play' && <path d="m8 4 12 8-12 8Z"/>}
    {kind === 'pause' && <path d="M8 5v14m8-14v14"/>}
  </svg>;
}

function Machine({ kind }: { kind: 'ca' | 'server' | 'browser' }) {
  return <svg className="machine" viewBox="0 0 140 105" fill="none" aria-hidden="true">
    <ellipse cx="70" cy="97" rx="48" ry="5" fill="#233d3010"/>
    {kind === 'ca' ? <><path d="m22 34 48-26 48 26Z" fill="#e8ddf1" stroke="#80658f" strokeWidth="2"/><rect x="28" y="34" width="84" height="53" rx="3" fill="#f5eef9" stroke="#80658f" strokeWidth="2"/><path d="M39 42v36m18-36v36m26-36v36m18-36v36" stroke="#beabcd" strokeWidth="6"/><rect x="21" y="87" width="98" height="6" rx="2" fill="#beabcd"/></>
    : kind === 'server' ? <><rect x="39" y="7" width="62" height="86" rx="9" fill="#e6eff4" stroke="#638196" strokeWidth="2"/>{[20,43,66].map(y => <g key={y}><rect x="46" y={y} width="48" height="17" rx="4" fill="#f7fbfc" stroke="#bbd0db"/><path d={`M52 ${y+8}h17`} stroke="#8ca8b8"/><circle className="server-light" cx="85" cy={y+8} r="2.5" fill="#80a989"/></g>)}</>
    : <><rect x="14" y="12" width="112" height="74" rx="8" fill="#e9f0e1" stroke="#64816a" strokeWidth="2"/><path d="M15 30h110" stroke="#a0b69a"/><circle cx="24" cy="22" r="2" fill="#99ac8d"/><rect x="36" y="19" width="78" height="6" rx="3" fill="#fffef9"/><rect x="48" y="44" width="44" height="26" rx="4" fill="#fffef9"/><path d="m66 58 5 5 10-12M55 94h30m-15-8v8" stroke="#64816a" strokeWidth="2"/></>}
  </svg>;
}

function Document({ file, publicCA, signed = false, progress = 0, changed = false }: { file: string; publicCA: boolean; signed?: boolean; progress?: number; changed?: boolean }) {
  const root = file === 'ca.crt' || file === 'Trusted public root';
  return <div className={`identity-document ${signed ? 'document-signed' : ''} ${changed ? 'document-changed' : ''}`}>
    <div className="document-top"><LineIcon kind="file"/><code>{file}</code><span>{root ? 'CA IDENTITY' : file.endsWith('.csr') ? 'REQUEST' : 'SERVER IDENTITY'}</span></div>
    <div className="document-fields"><div><small>{root ? 'Owner' : 'Name / SAN'}</small><strong>{root ? publicCA ? 'Public root CA' : 'Your private CA' : publicCA ? 'www.example.com' : changed ? 'changed.example' : 'server-2.example.internal'}</strong></div><div><small>Contains</small><strong>{root ? 'CA public key' : 'Server public key'}</strong></div><div><small>{root ? 'Trusted because' : 'Private key'}</small><strong>{root ? 'Client policy accepts it' : 'Never included'}</strong></div></div>
    {signed && <div className="signature-stamp" style={{ opacity: progress > .3 ? 1 : 0, transform: `translateY(${progress > .3 ? 0 : -28}px) rotate(-6deg) scale(${progress > .3 ? 1 : 1.3})` }}><LineIcon kind="check"/> CA SIGNED</div>}
  </div>;
}

function Spotlight({ beat, progress, publicCA, changed }: { beat: Beat; progress: number; publicCA: boolean; changed: boolean }) {
  const serverCert = publicCA ? 'server.crt' : 'server-2.crt';
  const verify = beat.kind === 'verify' || beat.kind === 'checks' || beat.kind === 'secure';
  if (verify) return <div className={`verification-lab ${changed ? 'failed' : ''}`}>
    <div className="verification-pair"><div className="verify-source"><LineIcon kind="key"/><strong>{publicCA ? 'Trusted root' : 'Trusted ca.crt'}</strong><small>Public verification key</small></div><div className="signature-beam"><span style={{ width: `${Math.min(100, progress * 180)}%` }}/><small>{changed ? 'Signature fails' : publicCA ? 'Verify chain' : 'Verify signature'}</small></div><div className="verify-source"><LineIcon kind="file"/><strong>{serverCert}</strong><small>{changed ? 'Signed data altered' : 'Signed server identity'}</small></div></div>
    {publicCA && <div className="chain-note">Root verifies intermediate. Intermediate verifies server certificate.</div>}
    <div className="check-stations">{['Trusted signature', 'Server name', 'Dates & purpose', 'Private-key proof'].map((label, i) => <span className={!changed && (beat.kind === 'secure' || (beat.kind === 'verify' ? i === 0 && progress > .55 : progress > i / 4)) ? 'passed' : changed && i === 0 ? 'check-failed' : ''} key={label}><i>{changed && i === 0 ? '×' : '✓'}</i>{label}</span>)}</div>
    {beat.kind === 'secure' && !changed && <div className="secure-banner"><LineIcon kind="lock"/> TLS established · traffic protected with session keys</div>}
    {changed && <div className="failed-banner">Identity rejected. A matching name cannot repair an invalid signature.</div>}
  </div>;
  if (beat.kind === 'keys' || beat.kind === 'prove') return <div className="key-demonstration"><div className="key-vault"><LineIcon kind="lock" size={32}/><code>{beat.focus === 0 ? 'ca.key' : publicCA ? 'server.key' : 'server-2.key'}</code><span>Private key stays here</span></div><div className="key-operation"><div className="operation-line" style={{ '--fill': `${progress * 100}%` } as CSSProperties}/><span>{beat.kind === 'prove' ? 'Signs handshake data' : 'Matching key pair'}</span></div><div className="public-half"><LineIcon kind={beat.kind === 'prove' ? 'file' : 'key'} size={32}/><strong>{beat.kind === 'prove' ? 'Proof of ownership' : 'Public key'}</strong><span>{beat.kind === 'prove' ? 'Client verifies the proof' : 'Safe to include in a certificate'}</span></div></div>;
  if (beat.kind === 'trust') return <div className="trust-install"><div className="trust-copy" style={{ transform: `translateY(${Math.min(progress * 2, 1) * 30 - 30}px)`, opacity: .3 + Math.min(progress * 2, 1) * .7 }}><LineIcon kind="file"/><code>{beat.file}</code></div><div className={`trust-drawer ${progress > .45 ? 'configured' : ''}`}><LineIcon kind="check"/><strong>{progress > .45 ? 'Accepted as a trust anchor' : 'Client’s trusted CA store'}</strong><small>{publicCA ? 'Provided by browser / OS trust policy' : 'Explicitly configured by you'}</small></div></div>;
  if (beat.kind === 'domain') return <div className="dns-proof"><span>DOMAIN CONTROL</span><code>www.example.com</code><div><code>DNS verification record</code><span className={progress > .5 ? 'proof-ready' : ''}>{progress > .5 ? 'Published for the CA to check' : 'Publishing the requested value…'}</span></div></div>;
  if (['request', 'sign', 'certificate', 'approve'].includes(beat.kind)) return <div className="document-workbench"><Document file={beat.file?.includes('Domain') ? 'server.csr' : beat.file || serverCert} publicCA={publicCA} signed={beat.kind === 'sign' || (beat.kind === 'certificate' && beat.file !== 'ca.crt')} progress={beat.kind === 'sign' ? progress : 1}/>{beat.kind === 'sign' && <p className="workbench-note"><LineIcon kind="key"/> Issuer’s private key signs this data. The key does not leave the CA.</p>}{beat.kind === 'approve' && <p className="workbench-note"><LineIcon kind="check"/> Check authorization before issuing a certificate.</p>}</div>;
  if (beat.kind === 'travel') return <div className="travel-explainer"><LineIcon kind="file" size={40}/><code>{beat.file}</code><strong>{progress < .75 ? 'Follow this file along the line below.' : 'A copy has arrived. The sender keeps its copy.'}</strong><span>No private key travels with it.</span></div>;
  return <div className="intro-visual"><Machine kind={beat.focus === 0 ? 'ca' : 'server'}/><div><span>{beat.focus === 0 ? 'THE ISSUER' : beat.focus === 1 ? 'THE SERVER' : 'THE CLIENT'}</span><strong>{beat.label}</strong><p>{beat.focus === 0 ? 'Approves identities and signs certificates.' : beat.focus === 1 ? 'Owns the identity the client will check.' : 'Starts the connection and verifies the server.'}</p></div></div>;
}

function inventory(publicCA: boolean, step: number, beat: number, progress: number): string[][] {
  const reached = (s: number, b: number, p = .6) => step > s || (step === s && (beat > b || (beat === b && progress >= p)));
  if (publicCA) return [
    ['Issuer private key', ...(reached(0, 2) ? ['server.csr'] : [])],
    ['server.key', ...(reached(0, 1) && !reached(2, 1) ? ['server.csr'] : []), ...(reached(2, 1) ? ['server.crt', 'Intermediate chain'] : [])],
    ['Trusted public root', ...(reached(3, 1) ? ['server.crt + chain'] : [])],
  ];
  return [
    [...(reached(0, 1) ? ['ca.key'] : []), ...(reached(0, 2) ? ['ca.crt'] : []), ...(reached(2, 1) ? ['server-2.csr'] : [])],
    [...(reached(1, 1) ? ['server-2.key'] : []), ...(reached(2, 0) && !reached(3, 2) ? ['server-2.csr'] : []), ...(reached(3, 2) ? ['server-2.crt'] : [])],
    [...(reached(4, 0) ? [reached(4, 1) ? 'ca.crt · trusted' : 'ca.crt · copy only'] : []), ...(reached(5, 1) ? ['server-2.crt'] : [])],
  ];
}

export default function FlowScene({ beat, beatIndex, progress, step, publicCA, changed, moving }: { beat: Beat; beatIndex: number; progress: number; step: number; publicCA: boolean; changed: boolean; moving: boolean }) {
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  const names = [publicCA ? 'Public CA' : 'Your CA', publicCA ? 'Server' : 'Server 2', publicCA ? 'Browser' : 'Server 1'];
  const files = inventory(publicCA, step, beatIndex, progress);
  const start = 16.667 + (beat.from ?? beat.focus) * 33.333;
  const end = 16.667 + (beat.to ?? beat.focus) * 33.333;
  const travel = reducedMotion ? (progress >= .67 ? 1 : 0) : Math.max(0, Math.min(1, (progress - .12) / .55));
  const isTravel = beat.kind === 'travel';
  const isSecure = beat.kind === 'secure' && !changed;
  const focus = isTravel ? (travel < .65 ? beat.from! : beat.to!) : beat.focus;
  const subject = names[focus];
  const focusNotes = ['The issuer · signs identities', 'The server · owns this identity', 'The client · decides what to trust'];
  return <div className={`flow-scene ${moving ? 'is-moving' : 'is-paused'}`}>
    <div className="director-cue"><span className="focus-orbit"/><span>LOOK AT <strong>{subject}</strong></span><span>{isTravel ? travel < .65 ? 'Sending a public file' : 'Receiving a copy' : focusNotes[focus]}</span></div>
    <div className="scene-spotlight" key={beat.label}><div className="spotlight-heading"><span>CLOSE-UP</span><strong>{beat.label}</strong></div><div className="spotlight-content"><Spotlight beat={beat} progress={progress} publicCA={publicCA} changed={changed}/></div></div>
    <div className="machine-world">
      <div className="machine-row">{names.map((name, i) => <div className={`machine-station ${i === focus ? 'station-active' : 'station-background'} ${!publicCA && step >= 5 && i === 0 ? 'station-offline' : ''}`} key={name}><span className="station-focus-label" aria-hidden="true">{i === focus ? 'IN THE SPOTLIGHT' : '\u00a0'}</span><Machine kind={i === 0 ? 'ca' : i === 2 && publicCA ? 'browser' : 'server'}/><strong>{name}</strong><small>{i === 0 ? step >= (publicCA ? 3 : 5) ? 'Signing key not involved' : 'Certificate issuer' : i === 1 ? 'Presents its identity' : 'Client · checks the identity'}</small><span className="station-floor"/></div>)}</div>
      <div className={`file-highway ${isSecure ? 'highway-secure' : ''}`}>
        {(isTravel || isSecure) && <><div className="highway-line" style={{ left: `${isSecure ? 50 : Math.min(start, end)}%`, width: `${isSecure ? 33.333 : Math.abs(start - end)}%` }}/>{isTravel ? <div className="travelling-file" style={{ left: `${start + (end - start) * travel}%` }}><LineIcon kind="file"/><code>{beat.file}</code><small>{travel === 1 ? 'Delivered' : travel === 0 ? 'Ready to send' : 'Travelling'}</small></div> : <div className="encrypted-packet"><LineIcon kind="lock" size={17}/><span>Encrypted data</span></div>}</>}
        {!isTravel && !isSecure && <div className="local-action" style={{ left: `${16.667 + beat.focus * 33.333}%` }}><LineIcon kind={beat.kind === 'keys' || beat.kind === 'prove' ? 'lock' : beat.kind === 'verify' || beat.kind === 'checks' ? 'check' : 'file'} size={18}/><span>{beat.kind === 'keys' || beat.kind === 'prove' ? 'Private key stays here' : 'Happening here'}</span></div>}
      </div>
      <div className="inventory-row">{files.map((items, i) => <div className={`machine-inventory ${i === focus ? 'inventory-active' : ''}`} key={names[i]}><span className="inventory-label">FILES AT {names[i].toUpperCase()}</span>{items.length ? items.map(file => { const secret = file.endsWith('.key') || file.includes('private'); return <div key={file} className={`inventory-file ${secret ? 'secret-file' : ''} ${i === focus && beat.file && file.startsWith(beat.file) ? 'file-featured' : ''}`} title={secret ? 'Private key: stays protected with its owner' : file}><LineIcon kind={secret ? 'lock' : 'file'} size={16}/><code>{file}</code></div>; }) : <span className="no-files">Not created yet</span>}</div>)}</div>
    </div>
    <p className="diagram-caption">{isTravel ? `${names[beat.from!]} sends ${beat.file} to ${names[beat.to!]}.` : isSecure ? `${names[2]} and ${names[1]} now exchange protected traffic.` : 'Watch the highlighted machine. Its files stay visible below.'} <span>Illustration of the flow; no real keys are generated.</span></p>
  </div>;
}
