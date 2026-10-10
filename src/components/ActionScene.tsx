import { useEffect, useState } from 'react';

type Action = 'keys' | 'request' | 'sign' | 'travel' | 'trust' | 'secure' | 'authority' | 'overview';
type Props = { action: Action; progress: number; owner?: number; from?: number; to?: number; file?: string; publicCA?: boolean; compareTrust?: boolean; createKeys?: boolean };
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };

function Key({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><circle cx="-9" cy="-6" r="9"/><path d="m-2 0 23 23m-7-7 6-6m-13-1 6-6"/></g>;
}

function Actor({ x, kind, label, active }: { x: number; kind: 'ca' | 'server' | 'client'; label: string; active: boolean }) {
  return <g className={`action-actor ${active ? 'action-actor-active' : ''}`} transform={`translate(${x} 80)`}>
    <ellipse cy="38" rx="57" ry="12" className="actor-shadow"/>
    {kind === 'ca' ? <g className="actor-ca"><path d="m-51-15 51-29 51 29Z"/><rect x="-44" y="-15" width="88" height="51" rx="3"/>{[-29, -10, 10, 29].map(n => <path key={n} d={`M${n}-7v32`} strokeWidth="7"/>)}<path d="M-52 39H52" strokeWidth="6"/></g>
      : kind === 'server' ? <g className="actor-server"><rect x="-32" y="-48" width="64" height="87" rx="8"/>{[-35, -10, 15].map(n => <g key={n}><rect x="-24" y={n} width="48" height="16" rx="3"/><path d={`M-16 ${n+8}H4`}/><circle cx="16" cy={n+8} r="2"/></g>)}</g>
      : <g className="actor-client"><rect x="-51" y="-38" width="102" height="66" rx="6"/><path d="M-50-21H50M0 28v12m-23 0h46"/><circle cx="-39" cy="-29" r="2"/><path d="m-12 3 9 9 18-20"/></g>}
    <text y="66" textAnchor="middle" className="actor-label">{label}</text>
  </g>;
}

function Card({ x, y, name, signed = false, opacity = 1, scale = 1 }: { x: number; y: number; name: string; signed?: boolean; opacity?: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} className="action-document">
    <rect x="-66" y="-39" width="132" height="78" rx="9"/>
    <path d="M-49-30h10l5 5v13h-15Zm10 0v5h5M-46-21h8m-8 5h6"/>
    <text y="5" textAnchor="middle">{name}</text>
    <text y="24" textAnchor="middle" className="document-detail">{signed ? 'SIGNED IDENTITY' : name.includes('csr') ? 'NAME + PUBLIC KEY' : 'PUBLIC CERTIFICATE'}</text>
    {signed && <g className="action-seal" transform="translate(47 -25)"><circle r="15"/><path d="m-7 0 5 5 10-11"/></g>}
  </g>;
}

function Drawer({ x, label, keyY = 0, visible = true }: { x: number; label: string; keyY?: number; visible?: boolean }) {
  return <g transform={`translate(${x} 301)`} className="action-drawer">
    <rect x="-79" y="-30" width="158" height="57" rx="8"/>
    <path d="M-72-18H72"/>
    <g opacity={visible ? 1 : .16} transform={`translate(0 ${keyY})`}><Key x={-48} y={-1} scale={.6}/><text x="9" y="3" textAnchor="middle">{label}</text></g>
    <text y="46" textAnchor="middle" className="drawer-caption">PRIVATE · STAYS HERE</text>
  </g>;
}

/** A small theatre controlled only by the passage's playback position, not a looping timer. */
export default function ActionScene(props: Props) {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  let { action, progress: p, owner = 0, from = 1, to = 0, file = '', publicCA = false, compareTrust = false, createKeys = true } = props;
  p = clamp(p);
  const exampleServer = publicCA ? 'server' : 'server-2';
  // The introduction previews the same operations that the later chapters unpack.
  if (action === 'authority') {
    if (p < .32) { action = 'travel'; from = 1; to = 0; file = `${exampleServer}.csr`; p /= .32; }
    else if (p < .72) { action = 'sign'; p = (p - .32) / .4; }
    else { action = 'travel'; from = 0; to = 1; file = `${exampleServer}.crt`; p = (p - .72) / .28; }
  }
  if (action === 'overview') {
    if (p < .16) { action = 'keys'; owner = 1; p /= .16; }
    else if (p < .29) { action = 'travel'; from = 1; to = 0; file = `${exampleServer}.csr`; p = (p - .16) / .13; }
    else if (p < .43) { action = 'sign'; p = (p - .29) / .14; }
    else if (p < .55) { action = 'travel'; from = 0; to = 1; file = `${exampleServer}.crt`; p = (p - .43) / .12; }
    else if (p < .77) { action = 'trust'; p = (p - .55) / .22; }
    else { action = 'secure'; p = (p - .77) / .23; }
  }
  const motion = (n: number) => reduced ? Number(n >= .5) : ease(n);
  const names = [publicCA ? 'Public CA' : 'Your CA', publicCA ? 'Server' : 'Server 2', publicCA ? 'Browser' : 'Server 1'];
  const clientKind = publicCA ? 'client' : 'server';
  const issuerKey = publicCA ? 'issuer.key' : 'ca.key';
  const keyName = publicCA ? 'server.key' : 'server-2.key';
  const certName = file || (publicCA ? 'server.crt' : 'server-2.crt');
  const left = 98, right = 422;
  const signed = action === 'sign' && p > .56;
  const publicTrust = publicCA || (compareTrust && p >= .67);
  const trustProgress = compareTrust ? (p < .67 ? p / .67 : (p - .67) / .33) : p;
  let status = '';
  let detail = '';
  if (action === 'keys') { status = !createKeys ? 'The original private key stays with its owner' : p < .32 ? `${names[owner]} creates its own key pair` : p < .72 ? 'The private key goes into protected storage' : 'The public key can be shared'; detail = 'Two matching keys. The private one never travels.'; }
  if (action === 'request') { status = p < .55 ? 'Pack the server name and public key' : 'The server signs its CSR with its own key'; detail = 'CSR = Certificate Signing Request. Not a certificate yet.'; }
  if (action === 'travel') { status = p < .8 ? `${names[from]} sends ${file} to ${names[to]}` : `${names[to]} receives a public copy`; detail = 'Follow the file. Private keys remain in their drawers.'; }
  if (action === 'sign') { status = signed ? 'The CA signature is now on the server certificate' : 'After approval, the CA signs the certificate data'; detail = 'The signature is not encryption. The CA key stays at the CA.'; }
  if (action === 'trust') { status = publicTrust ? 'Public roots come from browser / OS policy' : trustProgress < .35 ? 'The client needs a trusted starting point' : 'You install the private CA certificate'; detail = 'Receiving a certificate alone does not make it trusted.'; }
  if (action === 'secure') { status = p < .55 ? 'The client verifies the server and its key proof' : 'TLS established · protected traffic can flow'; detail = 'The CA signing key is not part of this connection.'; }
  const sourceX = from === 0 ? left : from === 2 ? right : (to === 2 ? left : right);
  const destinationX = sourceX === left ? right : left;
  const transfer = motion((p - .12) / .68);
  return <div className="action-film" data-action={action} data-phase={p < .5 ? 'before' : 'after'}>
    <div className="action-film-status"><span className="action-status-dot"/><strong>{status}</strong></div>
    <svg viewBox="0 0 520 365" role="img" aria-label={`${status}. ${detail}`}>
      <path className="action-guide" d="M36 365V18h448v347M36 244h448"/>
      {(action === 'keys' || action === 'request') && <>
        <Actor x={left} kind={owner === 0 && action === 'keys' ? 'ca' : 'server'} label={action === 'request' ? names[1] : names[owner]} active/>
        <Drawer x={left} label={owner === 0 && action === 'keys' ? issuerKey : keyName} visible={action === 'request' || !createKeys || p > .64}/>
        {action === 'keys' ? <>
          <g className="action-private-key" opacity={createKeys && p > .12 && p < .7 ? 1 : 0}><Key x={left + 53 * (1 - motion((p - .32) / .32))} y={190 + motion((p - .32) / .32) * 108} scale={1.15}/></g>
          <g opacity={!createKeys || p > .17 ? 1 : .15} transform={`translate(${!createKeys ? 390 : 275 + motion((p - .25) / .4) * 115} 191)`} className="action-public-key"><Key x={0} y={0}/><text y="45" textAnchor="middle">Public key</text></g>
          <path className="action-path" d="M155 168Q220 130 375 168" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - motion(p / .65)}/>
        </> : <>
          <g opacity={1 - motion((p - .27) / .28)} transform={`translate(${left + motion((p - .27) / .28) * 294} ${190 + motion((p - .27) / .28) * 10})`} className="action-public-key"><Key x={-20} y={0} scale={.7}/><text x="12" y="0">Name</text></g>
          <Card x={right - 14} y={200} name={file || 'server.csr'} opacity={.25 + motion((p - .25) / .3) * .75}/>
          <path className="action-path" d="M175 292Q260 292 331 231" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - motion((p - .5) / .28)}/>
          {p > .75 && <text x={right - 14} y="279" textAnchor="middle" className="action-annotation">CSR signed by server</text>}
        </>}
      </>}
      {(action === 'travel' || action === 'sign') && <>
        <Actor x={left} kind={action === 'travel' && from === 1 && to === 2 ? 'server' : 'ca'} label={action === 'travel' && from === 1 && to === 2 ? names[1] : names[0]} active={action === 'sign' || (sourceX === left ? transfer < .6 : transfer >= .6)}/>
        <Actor x={right} kind={to === 2 ? clientKind : 'server'} label={to === 2 ? names[2] : names[1]} active={action === 'travel' && (sourceX === right ? transfer < .6 : transfer >= .6)}/>
        <Drawer x={left} label={from === 1 && to === 2 ? keyName : issuerKey}/>
        {to !== 2 && <Drawer x={right} label={keyName}/>}
        {action === 'travel' ? <>
          <path className="action-path" d={`M${sourceX} 202H${destinationX}`} strokeDasharray="5 7"/>
          <path className="action-path action-path-filled" d={`M${sourceX} 202H${destinationX}`} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - transfer}/>
          <Card x={sourceX + (destinationX - sourceX) * transfer} y={202 - (reduced ? 0 : Math.sin(transfer * Math.PI) * 27)} name={file} signed={file.includes('.crt') && file !== 'ca.crt'}/>
        </> : <>
          <Card x={260} y={207} name={certName} signed={signed}/>
          <path className="action-signing-operation" d="M98 271V207H194" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - motion((p - .18) / .38)}/>
          <text x="260" y="270" textAnchor="middle" className="action-annotation">{signed ? '✓ Issuer signature attached' : 'Signing operation at the CA'}</text>
        </>}
      </>}
      {action === 'trust' && <>
        <Actor x={right} kind={compareTrust ? (publicTrust ? 'client' : 'server') : clientKind} label={compareTrust ? (publicTrust ? 'Browser' : 'Server 1') : names[2]} active/>
        <g className="action-trust-source"><text x={left} y="70" textAnchor="middle">{publicTrust ? 'Browser / OS policy' : 'You / administrator'}</text><text x={left} y="94" textAnchor="middle" className="document-detail">{publicTrust ? 'PUBLIC ROOTS' : 'PRIVATE CA'}</text></g>
        <g className="action-trust-store"><rect x="324" y="229" width="172" height="112" rx="12"/><text x="410" y="250" textAnchor="middle">Trusted CA store</text><text x="410" y="332" textAnchor="middle" className="document-detail">{trustProgress > .8 ? '✓ Explicitly accepted' : 'Trust is a local choice'}</text></g>
        <path className="action-path" d="M98 180Q260 130 411 286" strokeDasharray="5 7"/>
        {(() => { const t = motion((trustProgress - .22) / .55); return <Card x={left + t * 312} y={180 + t * 111 - (reduced ? 0 : Math.sin(t * Math.PI) * 32)} name={publicTrust ? 'Public root' : 'ca.crt'} scale={1 - t * .35}/>; })()}
      </>}
      {action === 'secure' && <>
        <Actor x={left} kind="server" label={names[1]} active={p > .55}/><Actor x={right} kind={clientKind} label={names[2]} active/>
        <path className="action-path" d="M98 220H422"/>
        {p < .55 ? <Card x={left + motion(p / .5) * 324} y={211} name={`${exampleServer}.crt`} signed/> : <>
          <g className="action-protected" transform={`translate(${left + motion((p - .55) / .45) * 324} 220)`}><rect x="-38" y="-22" width="76" height="44" rx="8"/><path d="M-8-3v-7a8 8 0 0 1 16 0v7m-19 0h22v17h-22Z"/></g>
          <text x="260" y="286" textAnchor="middle" className="action-annotation">✓ Identity verified · TLS established</text>
        </>}
        <text x="260" y="340" textAnchor="middle" className="drawer-caption">CA SIGNING KEY NOT INVOLVED</text>
      </>}
    </svg>
    <p className="action-film-detail">{detail}</p>
  </div>;
}
