import { useState } from 'react';
import { Actor, Arrow, Choices, Experiment, Seal, Status, Toggle } from '../components/UI';
export type SceneProps = { step: number; onInteract: () => void };

export function Identity({ step, onInteract }: SceneProps) {
  const [real, setReal] = useState(true);
  return <><div className="scene identity-scene">
    <div className="scene-top"><span className="tag">A SMALL STORY ABOUT TRUST</span><span className="doodle" aria-hidden="true">✦</span></div>
    <div className="actor-row"><Actor name="Browser Bea" caption="“One cookie, please!”" active={step === 0}/><Arrow active={step > 0}>{step < 2 ? 'Is this really the bakery?' : 'Show me your certificate'}</Arrow><Actor kind="shop" name={real ? 'The little bakery' : 'A lookalike server'} caption={real ? 'bakery.example' : 'other.example'} active={step > 0} bad={!real}/></div>
    <div className={`mini-certificate ${step < 2 ? 'unrevealed' : ''}`}><div className="cert-mark">▤</div><div><small>SERVER IDENTITY CARD</small><strong>{step < 2 ? 'Every introduction needs a little proof.' : real ? 'bakery.example' : 'other.example'}</strong><span>{step < 2 ? 'Press Next to meet the certificate.' : 'Public key · approved names · issuer signature'}</span></div><Seal small/></div>
    {step >= 2 && <Status ok={real}>{real ? step >= 4 ? 'Identity checked. The protected conversation can begin.' : 'Name matches bakery.example. Next: issuer trust and key proof.' : 'Name mismatch: Bea asked for bakery.example, but this card says other.example.'}</Status>}
    {step >= 3 && <p className="scene-caption">✓ Issuer chain checked against Bea’s trust store <span>•</span> Private key stays with the server</p>}
  </div><Experiment><Choices label="Which server answers?" value={real ? 'The real bakery' : 'The lookalike'} options={['The real bakery', 'The lookalike']} onChange={v => { onInteract(); setReal(v === 'The real bakery'); }}/><p>Could a stranger fool Bea just by copying the bakery’s name? Try the lookalike and reveal its card.</p></Experiment></>;
}

export function Keys({ step, onInteract }: SceneProps) {
  const original = 'One cookie for Bea';
  const [message, setMessage] = useState(original);
  return <><div className="scene"><div className="actor-row"><Actor kind="shop" name="Bakery Server" caption="Private signing key stays here" active={step < 2}/><Arrow>{step < 1 ? 'Public key' : 'Message + signature'}</Arrow><Actor name="Browser Bea" caption="Checks with the public key" active={step >= 2}/></div>
    <div className="key-pair"><div className="key-card secret"><span aria-hidden="true">⚿</span><div><strong>Private signing key</strong><small>Owner only · never sent</small></div></div><div className="key-card public"><span aria-hidden="true">⚿</span><div><strong>Public verification key</strong><small>Safe to share</small></div></div></div>
    {step >= 1 && <div className="signed-note"><span className="eyebrow">THE ORIGINAL SIGNED NOTE</span><q>{original}</q><span className="stamp">Signed by bakery key</span></div>}
    {step >= 2 && <Status ok={message === original}>{message === original ? 'The message matches the original signature.' : 'Mismatch! This message changed after it was signed.'}</Status>}
    <p className="scene-caption">Illustrative signature model · no actual cryptographic signing</p>
  </div><Experiment><label className="field">Message Bea receives<input value={message} maxLength={120} onChange={e => { onInteract(); setMessage(e.target.value); }}/></label><button className="text-button" onClick={() => { onInteract(); setMessage(original); }}>Restore signed message ↺</button><p>Keep the original signature and edit a word. Reveal step 3 to see the verification result.</p></Experiment></>;
}

const fields = [
  ['Version', 'v3', 'The certificate format version. Extensions such as SAN are part of X.509 v3.'],
  ['Serial number', '0xBA001', 'The issuer assigns a serial to distinguish this certificate from others it issues.'],
  ['Subject', 'CN=bakery.example', 'The subject’s distinguished name. This CN is not the modern hostname check.'],
  ['Issuer', 'CN=Meadow Issuing CA', 'The authority that signed the certificate. A name alone is not a verified chain.'],
  ['Validity', '1 Jan – 31 Mar 2030', 'The fictional time window used by these demos, not a provider lifetime recommendation.'],
  ['Public key', 'RSA · demo key A', 'The subject’s public key. The corresponding private key is not in this card.'],
  ['Subject Alternative Name', 'DNS:bakery.example', 'SAN holds the service identities. A DNS SAN does not stand in for an IP-address SAN.'],
  ['Basic constraints', 'CA:FALSE', 'Whether this certificate may act as a CA. A server leaf cannot issue a valid chain just by signing a card.'],
  ['Key usage', 'digitalSignature', 'Permitted cryptographic key operations. Here the key authenticates through a signature.'],
  ['Extended key usage', 'serverAuth', 'The permitted application purpose: TLS server authentication in this example.'],
  ['Signature algorithm', 'ECDSA with SHA-256', 'The issuer signs using its own algorithm. It need not match the subject public-key algorithm.'],
  ['Signature', 'Illustrative issuer signature', 'Covers the encoded certificate details. Changing the signed details invalidates this signature.'],
];
export function Certificate({ step, onInteract }: SceneProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [ca, setCA] = useState(false); const [tamper, setTamper] = useState(false);
  const index = selected ?? [0, 6, 3, 7, 11][step];
  const value = (i: number) => ca ? ({ 2: tamper ? 'CN=Changed CA' : 'CN=Meadow Issuing CA', 3: 'CN=Meadow Root CA', 5: 'ECDSA · demo issuer key', 6: 'Not included in this CA fixture', 7: 'CA:TRUE, pathlen:0', 8: 'keyCertSign, cRLSign', 9: 'Not constrained in this fixture' } as Record<number, string>)[i] ?? fields[i][1] : i === 6 && tamper ? 'DNS:changed.example' : fields[i][1];
  return <><div className="scene"><div className="certificate-inspector"><div className="certificate-sheet"><div className="sheet-title"><div><span className="eyebrow">X.509 · PUBLIC CERTIFICATE</span><h3>{ca ? 'Meadow Issuing CA' : 'The bakery’s identity'}</h3></div><Seal/></div><div className="certificate-fields">{fields.map((f, i) => <button className={index === i ? 'selected' : ''} key={f[0]} onClick={() => { onInteract(); setSelected(i); }}><span>{f[0]}</span><code>{value(i)}</code></button>)}</div></div><aside className="field-explanation"><span className="eyebrow">FOLLOW YOUR CURIOSITY</span><h3>{fields[index][0]}</h3><p>{fields[index][2]}</p><div className="little-note">Click any field on the card to see what it does.</div></aside></div><Status ok={!tamper}>{tamper ? 'Signed details changed. The original signature no longer verifies.' : 'Certificate intact. This is a public card, with no private key inside.'}</Status></div><Experiment><Choices label="Certificate role" options={['Server card', 'CA card']} value={ca ? 'CA card' : 'Server card'} onChange={v => { onInteract(); setCA(v === 'CA card'); setTamper(false); }}/><Toggle label="Change a signed field after issuance" value={tamper} onChange={v => { onInteract(); setTamper(v); setSelected(11); }}/></Experiment></>;
}

export function Chain({ step, onInteract }: SceneProps) {
  const [intermediate, setIntermediate] = useState(true); const [trusted, setTrusted] = useState(true);
  return <><div className="scene"><div className="chain-map">
    <div className={`chain-card ${step === 0 ? 'highlight' : ''}`}><span className="chain-icon peach">▤</span><small>LEAF CERTIFICATE</small><h3>bakery.example</h3><p>“Here is my public key.”</p></div>
    <Arrow active={intermediate}>signed by</Arrow>
    <div className={`chain-card ${!intermediate ? 'missing' : ''} ${step === 1 ? 'highlight' : ''}`}><span className="chain-icon lavender">⌂</span><small>INTERMEDIATE CA</small><h3>{intermediate ? 'Meadow Issuing CA' : 'Missing certificate'}</h3><p>{intermediate ? 'Authorized to issue cards' : 'No cached copy in this demo'}</p></div>
    <Arrow active={trusted && intermediate}>signed by</Arrow>
    <div className={`chain-card ${!trusted ? 'missing' : ''} ${step >= 2 ? 'highlight' : ''}`}><span className="chain-icon mint">♧</span><small>ROOT TRUST ANCHOR</small><h3>Meadow Root CA</h3><p>{trusted ? 'Accepted in Bea’s trust store' : 'Not in Bea’s trust store'}</p></div>
    </div><div className="trust-boundary">Bea’s trust store <span>{trusted ? '✓ Meadow Root CA' : 'Empty for this chain'}</span></div><Status ok={intermediate && trusted}>{!intermediate ? 'Chain incomplete: restore the issuing intermediate.' : !trusted ? 'Unknown root: the client has not accepted this trust anchor.' : 'A complete path reaches a trusted root. Name, dates, purpose, and key proof must still pass.'}</Status></div><Experiment><Toggle label="Server sends the intermediate" value={intermediate} onChange={v => { onInteract(); setIntermediate(v); }}/><Toggle label="Bea trusts the demo root" value={trusted} onChange={v => { onInteract(); setTrusted(v); }}/><p>The server supplies chain material. Bea independently decides which root to trust.</p></Experiment></>;
}

const flights = [
  ['ClientHello + key share', 'right'], ['ServerHello + key share', 'left'], ['Derive handshake keys locally', 'local'], ['EncryptedExtensions + Certificate', 'left'], ['CertificateVerify', 'left'], ['Server Finished → Client Finished', 'both'], ['Protected application data', 'both'],
];
export function Handshake({ step, onInteract }: SceneProps) {
  const [observer, setObserver] = useState(false);
  return <><div className="scene"><div className="handshake-head"><span>▣ Browser Bea</span><span className="tag">TLS 1.3</span><span>Bakery Server ⌂</span></div><div className="sequence">{flights.map(([label, direction], i) => <div key={label} className={`flight ${i === step ? 'current' : ''} ${i > step ? 'future' : ''}`}><span className="flight-index">{i + 1}</span><div className={`flight-wire ${direction}`}><span>{observer && i >= 3 ? 'Encrypted records · contents hidden' : label}{i >= 3 && !observer && <small>protected</small>}</span></div></div>)}</div><div className="key-pair"><div className="key-card"><strong>{step < 2 ? 'Ephemeral secret: local' : step < 6 ? 'Handshake keys: local' : 'Traffic keys: send / receive'}</strong></div><div className="key-card secret"><strong>Server signing key: always local</strong></div></div><p className="scene-caption">{observer ? 'An observer may still see addresses, timing, sizes, and unprotected handshake metadata.' : 'Simplified message sequence · no resumption or client certificate in this scene'}</p></div><Experiment><Toggle label="See what a network observer sees" value={observer} onChange={v => { onInteract(); setObserver(v); }}/><p>Use Next or Play to follow the highlighted message. Public shares travel; private secrets do not.</p></Experiment></>;
}
