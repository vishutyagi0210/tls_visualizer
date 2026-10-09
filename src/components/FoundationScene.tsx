import type { Beat } from '../data/flowScenes';
import { LineIcon } from './FlowScene';

const lessons: Record<string, { eyebrow: string; title: string; note: string; takeaway: string }> = {
  identity: { eyebrow: 'THE QUESTION', title: 'Am I talking to the right server?', note: 'Reaching an address is not the same as verifying an identity.', takeaway: 'A connection needs a trustworthy identity.' },
  'id-card': { eyebrow: 'ONE SIMPLE IDEA', title: 'A certificate is a digital ID.', note: 'Public information, signed by an issuer. Not a secret password.', takeaway: 'Name + public key + dates + issuer’s signature.' },
  ownership: { eyebrow: 'TWO DIFFERENT FILES', title: 'The ID is public. The key is private.', note: 'The server proves possession of its key. It never sends the key.', takeaway: 'Copying a certificate does not give you its private key.' },
  authority: { eyebrow: 'MEET THE ISSUER', title: 'CA = Certificate Authority.', note: 'An issuer that checks requests and signs certificates.', takeaway: 'The stamp represents a digital signature—not encryption.' },
  'trust-choice': { eyebrow: 'WHO DO YOU ACCEPT?', title: 'The client chooses what to trust.', note: 'A certificate arriving over the network cannot appoint its own trusted issuer.', takeaway: 'Private CA: you configure trust. Public CA: accepted browser roots.' },
  roadmap: { eyebrow: 'NOW WATCH IT HAPPEN', title: 'From an identity to a protected connection.', note: 'We’ll follow the issuer, the server, and the client—one action at a time.', takeaway: 'Issuance and a TLS connection are two different stages.' },
};

export default function FoundationScene({ beat, progress, moving }: { beat: Beat; progress: number; moving: boolean }) {
  const topic = beat.file ?? 'identity';
  const lesson = lessons[topic];
  const revealed = (threshold: number) => progress >= threshold ? 'revealed' : '';
  return <section className={`foundation-stage ${moving ? 'is-moving' : 'is-paused'}`} aria-label={beat.label}>
    <div className="foundation-copy"><span className="eyebrow">{lesson.eyebrow}</span><h3>{lesson.title}</h3><p>{lesson.note}</p><div className="foundation-takeaway"><span>REMEMBER THIS</span><strong>{lesson.takeaway}</strong></div></div>
    <div className={`foundation-art topic-${topic}`} key={topic}>
      {topic === 'identity' && <><div className="intro-browser"><div className="browser-address"><LineIcon kind="lock" size={16}/> bank.example</div><div className="identity-question">Hello.<br/>Who are you?</div><div className={`answer-ticket ${revealed(.35)}`}><LineIcon kind="file"/><span>Show me a verifiable identity.</span></div></div><span className="art-caption">An illustrative website—not a real bank.</span></>}
      {topic === 'id-card' && <div className="large-id"><div className="id-ribbon">SERVER IDENTITY <LineIcon kind="file"/></div><h4>bank.example</h4>{[['Name', 'bank.example'], ['Public key', 'Safe to share'], ['Valid until', 'A specific expiry date'], ['Signed by', 'Certificate issuer']].map(([label, value], i) => <div className={`id-line ${revealed(i * .15)}`} key={label}><span>{label}</span><strong>{value}</strong></div>)}<div className={`id-seal ${revealed(.62)}`}>SIGNED ID</div></div>}
      {topic === 'ownership' && <div className="ownership-pair"><div className="ownership-public"><LineIcon kind="file" size={44}/><strong>Certificate</strong><code>server.crt</code><span>Can be presented to a client</span></div><div className={`ownership-private ${revealed(.2)}`}><LineIcon kind="lock" size={44}/><strong>Private key</strong><code>server.key</code><span>Stays with its owner</span></div><p className={`ownership-proof ${revealed(.55)}`}>Prove ownership without revealing the key.</p></div>}
      {topic === 'authority' && <div className="issuer-demo"><div className="issuer-office"><span className="office-roof"/><strong>CA</strong><span>CERTIFICATE AUTHORITY</span><div className="office-pillars"><i/><i/><i/></div></div><div className={`issuer-card ${revealed(.32)}`}><LineIcon kind="file"/><span>Server identity</span><strong className={revealed(.62)}>✓ Signed by the issuer</strong></div></div>}
      {topic === 'trust-choice' && <div className="trust-choice"><div><span>PRIVATE CA</span><LineIcon kind="file" size={34}/><strong>You install ca.crt</strong><p>Your client explicitly accepts your issuer.</p></div><div className={revealed(.4)}><span>PUBLIC CA</span><LineIcon kind="check" size={34}/><strong>Accepted public roots</strong><p>Your browser / OS supplies its trust policy.</p></div></div>}
      {topic === 'roadmap' && <div className="lesson-roadmap">{['Create a key + request', 'Issuer signs the certificate', 'Client knows a trusted issuer', 'Verify identity + establish TLS'].map((label, i) => <div key={label} className={revealed(i * .19)}><span>0{i + 1}</span><strong>{label}</strong>{i < 3 && <i aria-hidden="true">↓</i>}</div>)}</div>}
    </div>
  </section>;
}
