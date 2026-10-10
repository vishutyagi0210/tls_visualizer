import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import ActionScene from '../src/components/ActionScene';
import '../src/action-scene.css';
import './trailer.css';

declare global { interface Window { renderVideoFrame: (shot: number, progress: number, seconds: number) => void } }
const shots = [
  { number: 'THE QUESTION', title: <>Who’s really<br/>on the other side?</>, copy: 'What makes a server trustworthy?', tag: 'TLS, WITHOUT THE MYSTERY' },
  { number: '01 / THE KEY', title: <>An identity starts<br/>with a secret.</>, copy: 'It creates its own private key.', tag: 'THE PRIVATE KEY STAYS HERE' },
  { number: '02 / THE REQUEST', title: <>A request.<br/>Not a private key.</>, copy: 'A request goes to the certificate authority.', tag: 'CSR → CERTIFICATE AUTHORITY' },
  { number: '03 / THE SIGNATURE', title: <>An issuer signs.<br/>An identity takes shape.</>, copy: 'The authority signs the server’s certificate.', tag: 'SIGNED DOES NOT MEAN ENCRYPTED' },
  { number: '04 / THE TRUST', title: <>Trust is checked.<br/>Not assumed.</>, copy: 'The client checks it against a trusted issuer.', tag: 'TRUSTED ISSUER + IDENTITY CHECKS' },
  { number: 'NOW IT MAKES SENSE', title: <>Don’t just read TLS.<br/><em>See it happen.</em></>, copy: 'See trust happen. Explore the full story.', tag: 'AN INTERACTIVE, NARRATED EXPLAINER' },
];
function Trailer() {
  const [frame, setFrame] = useState({ shot: 0, p: 0, seconds: 0 });
  window.renderVideoFrame = (shot, p, seconds) => flushSync(() => setFrame({ shot, p, seconds }));
  const { shot, p } = frame;
  const s = shots[shot];
  const enter = Math.min(1, p * 9);
  const exit = shot === 5 ? 1 : Math.min(1, (1 - p) * 12);
  const smooth = enter * enter * (3 - 2 * enter);
  const scale = 1.005 + p * .035;
  return <main className={`video-canvas shot-${shot}`}>
    <div className="ambient a"/><div className="ambient b"/>
    <header><span className="brand">signed, explained.</span><span className="edition">A VISUAL TLS STORY</span></header>
    <div className="video-body" style={{ opacity: Math.min(enter, exit), transform: `translateY(${(1 - smooth) * 26}px)` }}>
      <div className="kicker"><span/>{s.number}</div>
      <h1>{s.title}</h1>
      {shot === 0 ? <div className="hook-art" style={{ transform: `scale(${1 + p * .045})` }}>
        <div className="address"><span className="address-dot"/> https://your-server.example</div>
        <div className="hook-server"><i/><i/><i/><span className="server-foot"/></div>
        <div className="identity-bubble" style={{ transform: `translateY(${(1 - smooth) * 40}px) rotate(-5deg)` }}>Prove it.</div>
        <div className="hook-caption">An address is not proof of identity.</div>
      </div> : shot === 5 ? <div className="end-art">
        <div className="end-path"><span>KEYS</span><i>→</i><span>CERTIFICATES</span><i>→</i><span>TRUST</span></div>
        <div className="url-card" style={{ transform: `scale(${.97 + smooth * .03})` }}><span>EXPLORE THE FULL STORY</span><strong>tls.tyagi.fun</strong><div>Free to explore <i>·</i> Play with voice <i>·</i> Learn visually</div></div>
        <p className="end-note">Start from zero. Follow every connection.</p>
      </div> : <div className="demo-window" style={{ transform: `scale(${scale})` }}>
        <div className="demo-chrome"><span/><span/><span/><strong>THE STORY, IN MOTION</strong></div>
        <div className="video-scene">
          {shot === 1 && <ActionScene action="keys" owner={1} progress={Math.min(1, p * 1.13)}/>}
          {shot === 2 && <ActionScene action="travel" from={1} to={0} file="server-2.csr" progress={p}/>}
          {shot === 3 && <ActionScene action="sign" file="server-2.crt" progress={p}/>}
          {shot === 4 && <div className="trust-check-scene"><ActionScene action="travel" from={1} to={2} file="server-2.crt" progress={Math.min(1, p * 1.6)}/><div className="trusted-proof" style={{ opacity: Math.min(1, Math.max(0, p - .4) * 5), transform: `translateY(${Math.max(0, .65 - p) * 65}px)` }}><span>✓</span><div><strong>Checked against a trusted issuer</strong><small>Signature · name · validity · key proof</small></div></div></div>}
        </div>
      </div>}
      <div className="video-tag"><span/>{s.tag}</div>
    </div>
    <div className="subtitle"><span>{s.copy}</span></div>
    <footer><span>UNDERSTAND THE CONNECTION.</span><strong>tls.tyagi.fun <span>↗</span></strong></footer>
    <div className="video-progress"><span style={{ width: `${(shot + p) / 6 * 100}%` }}/></div>
  </main>;
}
createRoot(document.getElementById('root')!).render(<Trailer/>);
