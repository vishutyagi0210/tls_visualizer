export type SceneKind = 'foundation' | 'intro' | 'keys' | 'request' | 'travel' | 'approve' | 'sign' | 'certificate' | 'trust' | 'prove' | 'verify' | 'checks' | 'secure' | 'domain';
export type Beat = { label: string; narration: string; kind: SceneKind; focus: number; file?: string; from?: number; to?: number };
const b = (label: string, narration: string, kind: SceneKind, focus: number, file?: string, from?: number, to?: number): Beat => ({ label, narration, kind, focus, file, from, to });

// Short, separately narrated scenes give beginners one idea at a time.
export const foundationScenes: Beat[][] = [
  [
    b('Before we connect, who are you?', 'Before we talk about certificates, imagine opening your bank’s website. You have reached a computer. But how do you know it is the computer you intended to reach? That is an identity question. Let’s answer it, one small piece at a time.', 'foundation', 1, 'identity'),
    b('A certificate is a digital ID card', 'A certificate is like a digital ID card for a server. It carries the server’s name, its public key, and an expiry date. It does not contain the private key. And an ID card is only useful if you can check who issued it.', 'foundation', 1, 'id-card'),
    b('The private key proves ownership', 'The server also keeps a private key. Think of it as a secret way to prove, this identity belongs to me. A public certificate can be copied. The private key must stay protected. During the connection, the server proves it has that key without sending the key itself.', 'foundation', 1, 'ownership'),
  ],
  [
    b('CA means Certificate Authority', 'Meet the Certificate Authority, or CA. Think of an office that checks a request and signs an ID card. Its digital signature lets a client detect changes to the certificate. The picture of a stamp is just an analogy. The real signature is mathematical.', 'foundation', 0, 'authority'),
    b('Trust is a decision by the client', 'Now look at the client, the computer starting the connection. It needs a trusted starting point. With a private CA, you install the CA certificate into the client’s trust configuration. For public websites, browsers already accept selected public roots. A certificate is not trusted just because someone sends it.', 'foundation', 2, 'trust-choice'),
    b('Identity first. Encryption next.', 'Here is the whole story. Create a key and request a certificate. Have an authorized issuer sign it. Configure what the client trusts. Then the client checks the server, and the TLS handshake establishes encryption. Let’s slow that down and watch the actual files move.', 'foundation', 2, 'roadmap'),
  ],
];

export const internalScenes: Beat[][] = [
  [
    b('You operate the CA', 'Start here. You are the person operating your own Certificate Authority. Think of this as an office that approves and signs server identity cards. This example follows two servers, but a private CA can serve many machines.', 'intro', 0),
    b('Create the secret signing key', 'First, create ca.key. This is your CA’s private signing key. Watch it go into the CA’s locked drawer. It stays protected here.', 'keys', 0, 'ca.key'),
    b('Create the public CA certificate', 'Next, create ca.crt. It contains the matching public key. This public key lets other computers check your CA’s signatures. The root certificate is self-signed. Creating it does not make everyone trust it.', 'certificate', 0, 'ca.crt'),
  ],
  [
    b('A different owner, a different key', 'Now look at Server 2. This server needs its own key pair. This is separate from the CA’s key pair.', 'intro', 1),
    b('Keep the server’s private key', 'The server’s private key is server-2.key. It stays protected with this server. Later, the server uses it to prove its identity during a connection.', 'keys', 1, 'server-2.key'),
    b('The public half can be shared', 'The matching public key can be shared. Keep the two owners separate in your mind. The CA signs certificates with ca.key. Server 2 proves its own identity with server-2.key.', 'keys', 1, 'Server 2 public key'),
  ],
  [
    b('Pack the request', 'Server 2 creates a CSR, a Certificate Signing Request. Look inside: its public key and the server name it wants certified. Server 2 signs the request with its own private key.', 'request', 1, 'server-2.csr'),
    b('Send only the CSR', 'Now follow the request as it travels from Server 2 to your CA. The public key is already inside. There is no need to send it separately.', 'travel', 0, 'server-2.csr', 1, 0),
    b('The private key stays behind', 'Notice the locked drawer at Server 2. The server’s private key did not travel. The CA receives a request, not the server’s private key.', 'keys', 1, 'server-2.key'),
  ],
  [
    b('Approve the requested name', 'At your CA, first check that this server is allowed to use the requested name. A request by itself is not approval.', 'approve', 0, 'server-2.csr'),
    b('Sign a new server certificate', 'Your CA creates a server certificate and signs its data with ca.key. Watch the signature appear on server-2.crt. The stamp is a picture for a digital signature, not encryption.', 'sign', 0, 'server-2.crt'),
    b('Return server-2.crt', 'Follow the signed certificate back to Server 2. This file is server-2.crt. It is the server’s identity certificate. It is not ca.crt.', 'travel', 1, 'server-2.crt', 0, 1),
    b('Keep the original server key', 'Server 2 now has its own private key and its signed certificate. Inside the certificate are its public key, approved name, dates, and the CA’s signature. The CA did not give Server 2 a replacement private key.', 'certificate', 1, 'server-2.crt'),
  ],
  [
    b('Give the client a public copy', 'Now a separate job: client trust. Server 1 acts as the client when it connects to Server 2. You give Server 1 a copy of ca.crt. Follow this public file from your CA to the client.', 'travel', 2, 'ca.crt', 0, 2),
    b('Explicitly configure trust', 'Receiving the file is not enough. You configure the client to trust this CA certificate. Watch it enter the trusted CA store. The client can now use its public key to verify your CA’s signatures.', 'trust', 2, 'ca.crt'),
    b('Two separate jobs are done', 'Pause and compare. The server has its signed identity, server-2.crt. The client trusts the issuer through ca.crt. Issuing a certificate and distributing trust are two separate jobs.', 'certificate', 2, 'ca.crt'),
  ],
  [
    b('The client starts a connection', 'Server 1 now connects to Server 2. The CA’s signing key takes no part in this connection. Watch just Server 1 and Server 2.', 'intro', 2),
    b('The server presents its identity', 'Server 2 sends its server certificate to Server 1. The file travelling now is server-2.crt. The client already has ca.crt in its trust configuration.', 'travel', 2, 'server-2.crt', 1, 2),
    b('Prove ownership without sending the key', 'During a modern TLS handshake, Server 2 signs handshake data with its own private key. The client checks that proof using the public key in the server certificate. The private key stays locked at the server.', 'prove', 1, 'server-2.key'),
  ],
  [
    b('Take the trusted CA public key', 'Look inside the client’s trusted ca.crt. It contains the CA’s public key. It does not contain a list of server certificates. No search through a list happens here.', 'certificate', 2, 'ca.crt'),
    b('Mathematically verify the signature', 'The client uses that trusted CA public key to verify the signature on server-2.crt. These are two different certificates. One gives the verification key. The other carries the signed server identity.', 'verify', 2, 'server-2.crt'),
    b('Check the rest of the identity', 'The client must also check the server name, certificate dates, and allowed purpose. The handshake must prove possession of the matching server private key. A valid signature alone is not enough.', 'checks', 2),
    b('Establish protected communication', 'Once verification and the TLS handshake succeed, the peers use negotiated session keys to protect their traffic. The CA signing key stays at the CA. Remember: ca.key signs, ca.crt helps verify, and the server’s own key proves ownership.', 'secure', 2),
  ],
];

export const publicScenes: Beat[][] = [
  [
    b('Your website owns its key', 'The same idea works for a public website. Your website creates its own private key. It stays protected with the website operator.', 'keys', 1, 'server.key'),
    b('Pack the name and public key', 'Create a CSR containing the website’s public key and requested domain name. The private key is not inside this request.', 'request', 1, 'server.csr'),
    b('Send the request to a public CA', 'Follow server.csr to a public certificate service, such as ZeroSSL. You are asking an external issuer to certify your website identity.', 'travel', 0, 'server.csr', 1, 0),
  ],
  [
    b('The CA asks for proof', 'The public CA needs evidence that you control the requested domain name. Simply writing a name in a request does not prove that.', 'approve', 0, 'Domain-control check'),
    b('Publish the requested proof', 'For example, you publish the verification record the CA requests in DNS, or place its verification file on your website. This picture uses a DNS record.', 'domain', 1, 'DNS verification record'),
    b('The CA checks the proof', 'The CA checks the published proof. Only after its required checks pass can it approve issuing the certificate. This validates domain control, not whether a website is honest.', 'approve', 0, 'Domain control verified'),
  ],
  [
    b('An issuing CA signs', 'The issuing CA signs your website certificate. Public certificate services commonly use an intermediate CA, whose certificate leads to a trusted root.', 'sign', 0, 'server.crt'),
    b('Return the certificate and chain', 'Follow the server certificate and intermediate certificates back to your website. Your original private key stays with you.', 'travel', 1, 'server.crt + chain', 0, 1),
    b('Install at the TLS endpoint', 'Install the server certificate, the required intermediate chain, and your matching private key where TLS ends. The certificate and key must match.', 'certificate', 1, 'server.crt'),
  ],
  [
    b('The browser already has trusted roots', 'The visitor’s browser or operating system already accepts some public roots. That is how it starts with trust, instead of you installing your private CA on every visitor’s device.', 'trust', 2, 'Trusted public root'),
    b('Send the server certificate and chain', 'Your website presents its certificate and intermediate chain to the browser. Sending these files does not automatically make them trusted.', 'travel', 2, 'server.crt + chain', 1, 2),
    b('Verify a path to an accepted root', 'The browser verifies the chain to a root it already trusts. It also checks the server name, dates, purpose, and private-key proof. Public trust does not skip these checks.', 'verify', 2, 'server.crt'),
    b('The same protected connection', 'After verification and the TLS handshake, protected communication can begin. The main difference is where trust came from. For your internal CA, you configure it. For a public CA, the client may already accept a root in its chain.', 'secure', 2),
  ],
];
