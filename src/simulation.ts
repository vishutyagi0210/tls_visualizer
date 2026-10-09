export type Scenario = {
  trusted: boolean; intermediate: boolean; hostname: string; ipSAN: boolean;
  time: 'valid' | 'expired' | 'early'; signature: boolean; matchingKey: boolean;
  serverUsage: boolean; issuerCA: boolean; revocation: 'good' | 'revoked' | 'unknown';
  mtls: boolean; client: 'valid' | 'absent' | 'untrusted'; permitted: boolean;
};
export const baseline: Scenario = { trusted: true, intermediate: true, hostname: 'bakery.example', ipSAN: false, time: 'valid', signature: true, matchingKey: true, serverUsage: true, issuerCA: true, revocation: 'good', mtls: false, client: 'valid', permitted: true };
export type Result = { id: string; label: string; status: 'pass' | 'fail' | 'unknown' | 'not-applicable'; reason: string; fix: string };
export function evaluateScenario(s: Scenario): Result[] {
  const check = (id: string, label: string, ok: boolean, reason: string, fix: string): Result => ({ id, label, status: ok ? 'pass' : 'fail', reason, fix: ok ? '' : fix });
  const nameOK = s.hostname === 'bakery.example' || (s.hostname === '192.0.2.10' && s.ipSAN);
  const results = [
    check('trust', 'Trusted issuer', s.trusted, s.trusted ? 'The demo root is in Bea’s trust store.' : 'The issuing root is unknown to this client.', 'Configure the intended public root certificate through a trusted process.'),
    check('chain', 'Complete chain', s.intermediate, s.intermediate ? 'The server sends its leaf and issuing intermediate.' : 'The issuing intermediate is missing; this client has no cache or fetch fallback.', 'Deliver the required intermediate with the leaf certificate.'),
    check('name', 'Service identity', nameOK, nameOK ? 'The requested identity matches a SAN of the correct type.' : `The requested identity ${s.hostname || '(empty)'} has no matching SAN.`, 'Use the correct service name or issue a certificate with the required DNS/IP SAN.'),
    check('time', 'Validity window', s.time === 'valid', s.time === 'valid' ? 'The fixed demo clock is inside the validity window.' : s.time === 'expired' ? 'The certificate has expired.' : 'The certificate is not valid yet.', 'Check the client clock and deploy a certificate valid for that time.'),
    check('signature', 'Certificate signature', s.signature, s.signature ? 'The signed details match the issuer’s signature.' : 'The certificate was changed after signing.', 'Use an intact, correctly issued certificate; editing its fields invalidates its signature.'),
    check('issuer', 'Issuer constraints', s.issuerCA, s.issuerCA ? 'The intermediate is permitted to issue certificates.' : 'The proposed issuer is a leaf, not an authorized CA.', 'Use a chain with appropriate CA constraints and signing usage.'),
    check('purpose', 'Server purpose', s.serverUsage, s.serverUsage ? 'The fixture permits TLS server authentication.' : 'This certificate does not permit server authentication.', 'Issue a certificate with appropriate key usage and extended key usage.'),
    check('key', 'Proof of possession', s.matchingKey, s.matchingKey ? 'The server can prove possession of the matching private key.' : 'The installed private key does not match the certificate.', 'Install the corresponding key securely, or reissue for the correct public key.'),
    { id: 'revocation', label: 'Revocation status', status: s.revocation === 'good' ? 'pass' : s.revocation === 'revoked' ? 'fail' : 'unknown', reason: s.revocation === 'good' ? 'The simulated status source reports good.' : s.revocation === 'revoked' ? 'The issuer has revoked this certificate.' : 'Status is unavailable. The demo’s strict policy blocks acceptance.', fix: s.revocation === 'good' ? '' : s.revocation === 'revoked' ? 'Investigate the cause and replace the revoked identity.' : 'Restore status availability or investigate the client’s policy; unknown is not proof of good status.' } as Result,
    { id: 'client', label: 'Client authentication', status: !s.mtls ? 'not-applicable' : s.client === 'valid' ? 'pass' : 'fail', reason: !s.mtls ? 'This connection does not require a client certificate.' : s.client === 'valid' ? 'Client identity, purpose, and key proof satisfy this server’s policy.' : s.client === 'absent' ? 'The required client certificate was not provided.' : 'The client certificate has an untrusted issuer.', fix: s.mtls && s.client !== 'valid' ? 'Configure an acceptable client certificate and its matching key.' : '' } as Result,
  ];
  const tlsOK = results.every(r => r.status === 'pass' || r.status === 'not-applicable');
  results.push({ id: 'authorization', label: 'Application permission', status: !tlsOK ? 'not-applicable' : s.permitted ? 'pass' : 'fail', reason: !tlsOK ? 'The application request is blocked until TLS checks succeed.' : s.permitted ? 'The authenticated caller is permitted to perform this demo operation.' : 'TLS succeeded, but the application denied the operation.', fix: tlsOK && !s.permitted ? 'Grant the appropriate application permission only if the caller should have access.' : '' });
  return results;
}
export const presets: { label: string; patch: Partial<Scenario> }[] = [
  { label: 'Everything in place', patch: {} }, { label: 'Unknown issuer', patch: { trusted: false } },
  { label: 'Missing intermediate', patch: { intermediate: false } }, { label: 'Wrong DNS name', patch: { hostname: 'other.example' } },
  { label: 'Missing IP SAN', patch: { hostname: '192.0.2.10' } }, { label: 'Expired certificate', patch: { time: 'expired' } },
  { label: 'Not valid yet', patch: { time: 'early' } }, { label: 'Tampered certificate', patch: { signature: false } },
  { label: 'Wrong private key', patch: { matchingKey: false } }, { label: 'Wrong purpose', patch: { serverUsage: false } },
  { label: 'Issuer is not a CA', patch: { issuerCA: false } }, { label: 'Revoked certificate', patch: { revocation: 'revoked' } },
  { label: 'Status unavailable', patch: { revocation: 'unknown' } }, { label: 'mTLS: no client card', patch: { mtls: true, client: 'absent' } },
  { label: 'mTLS: wrong issuer', patch: { mtls: true, client: 'untrusted' } }, { label: 'Permission denied', patch: { permitted: false } },
];
