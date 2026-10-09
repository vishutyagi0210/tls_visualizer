# Lessons and visual storyboards

## Teaching rules

Start with a question, show an action, explain the result, then reveal the technical name. Keep each simple explanation to roughly 15–35 words. Define unfamiliar words on first use. Label where an analogy stops matching the real mechanism.

Three recurring characters: **Browser Bea**, **Bakery Server**, and **Certificate Office**. Keep the certificate card visually distinct from the private key. Private keys stay inside their owner's illustrated boundary.

Use the following storyboards as the minimum content contract. Expand each into 4–8 useful steps; the handshake may use more. A chapter must have a working interaction, a plain-language explanation, and a technical detail panel.

## 1. Who am I talking to?

- **Question:** “How do you know this really is your bakery?”
- **Scene:** Bea asks for `bakery.example` → a lookalike server appears → a public identity card is presented → a trusted issuer and name check distinguish the intended server.
- **Interaction:** Switch between the intended server and an impostor with a different key/certificate. Show exactly which check fails.
- **Teach:** Identity, authenticity, confidentiality, integrity; HTTPS is HTTP carried over TLS. An authenticated connection does not promise that a business is honest.
- **Start from zero:** Explain browser, server, domain, HTTP, and HTTPS before using their acronyms. Explain that people still say “SSL certificate,” while modern secure connections use TLS; the certificate is one ingredient in that connection.
- **Check:** “Does a secure connection mean the website can never trick you?” Answer: no.

## 2. Keys, signatures, and secret messages

- **Scene:** Owner creates a key pair → shares the public key → signs a message → Bea verifies it → a changed message fails verification.
- **Interaction:** Edit a signed message, then restore it. Show “signature matches” or “message/signature mismatch.”
- **Teach:** Public/private keys, signatures, hashes and fingerprints, and symmetric encryption as distinct tools. A fingerprint is an identifier, not proof of trust by itself.
- **Under the hood:** Signing and encryption have different purposes. Algorithms have specific capabilities; do not describe all signatures as “encrypting with a private key.”
- **Check:** “Which key must stay with its owner?” Answer: private key.

## 3. Open the certificate

- **Scene:** Unfold a friendly identity card into labeled fields. Clicking a field explains its role and highlights where a later check uses it.
- **Fields:** Version, serial, subject, issuer, validity dates, subject public key, SAN, basic constraints, key usage, extended key usage, signature algorithm, and signature.
- **Interaction:** Toggle between a server and CA card. Show permitted roles; changing a signed field invalidates the original signature.
- **Under the hood:** X.509 is the certificate format; X.501 supplies directory naming concepts used by distinguished names. Explain subject/CN separately from service identity in SAN. Distinguish the certificate's public-key algorithm from its issuer's signature algorithm.
- **Check:** “Does a certificate contain its owner's private key?” Answer: no.

## 4. The trust chain

- **Scene:** Leaf → intermediate → root. Follow each signature check upward to a locally configured trust anchor.
- **Interaction:** Remove/restore the intermediate or trusted root. The selected scenario assumes no cached intermediate or network retrieval; explain why another client could behave differently.
- **Teach:** The server normally sends its leaf and intermediates. Trust in the root is configured separately. A root's self-signature alone does not establish trust.
- **Under the hood:** Separate chain building/validation from service-name verification. Show validity, CA constraints, intended use, and signature checks. Real clients apply additional policy.
- **Check:** “Will sending an unknown root from the server automatically make Bea trust it?” Answer: no.

## 5. Watch a TLS 1.3 connection

Use a sequence diagram with a highlighted current message and persistent client/server lanes. Scope: a full, certificate-authenticated TLS 1.3 handshake using ephemeral key agreement, without resumption or client authentication.

1. ClientHello proposes capabilities and carries a key share.
2. ServerHello selects parameters and provides its key share.
3. Both derive handshake keys independently; the shared secret is never transmitted.
4. Server sends encrypted EncryptedExtensions and Certificate messages.
5. Client validates identity/trust; CertificateVerify proves possession of the certificate's private key through a transcript signature.
6. Server Finished authenticates the transcript using derived keys; the client verifies it and sends its own Finished.
7. Application traffic uses derived symmetric traffic keys. Show separate directions.

- **Interaction:** Step through the flight; inspect “what an observer sees.” Hide handshake contents after ServerHello while preserving visible packet metadata. Do not imply all metadata is secret.
- **Under the hood:** Differentiate long-term certificate keys, ephemeral key-agreement secrets, and traffic keys. TLS 1.3 does not use RSA key transport. Show a simplified key derivation diagram without pretending to implement TLS.
- **Check:** “Does the server send its private key?” Answer: no.

## 6. Get a certificate: public CA, private CA, or self-signed

Three tabs: **Public CA (ZeroSSL example)**, **Private certificate authority**, and **Self-signed server**. Compare who signs, what the issuer checks, and how the client gets its trust anchor.

### Public CA walkthrough

Use a fictional domain and a simulated ZeroSSL issuance flow, based on its official documentation. Teach the process rather than reproducing a dashboard that may change.

1. Select the domain names the certificate should cover.
2. In this example, generate the server key locally and submit a CSR containing the public key. Keep the private key with the operator; explain that provider-assisted generation is a different workflow.
3. Prove control of the domain using a demo DNS CNAME challenge or HTTP verification file. Show the CA checking the requested evidence. A CSR signature alone does not establish control of the domain.
4. After successful validation and issuance, receive the signed leaf certificate and chain material. Domain validation does not certify that the business is honest.
5. Install the certificate, matching private key, and required intermediates at the TLS endpoint: a web server, ingress, or terminating load balancer. The local-key workflow does not receive a replacement private key from the CA.
6. Connect with a browser. Show how the server's chain reaches a trust anchor already accepted by that browser/OS, then apply name, validity, signature, and usage checks. Do not promise compatibility with every client.
7. Renew and deploy the replacement before expiry. Introduce ACME as an automation protocol; distinguish its challenges from this dashboard/API illustration.

- **Interaction:** Change a DNS challenge from incorrect to correct; issuance becomes possible. After issuance, omit an intermediate or install the wrong private key to reveal why issuance and successful deployment are separate milestones.
- **Check:** “Why can a public certificate work without manually installing our private CA on every visitor's device?” Answer: the client can build a valid chain to a trust anchor it already accepts.

### Private and self-signed walkthroughs

- **Self-signed server:** Generate a symbolic key pair → issue a certificate signed with that key → default client rejects unknown trust → explicitly configure trust in this demo → recheck identity and validity. Explain that client support for direct certificate trust varies.
- **Private CA:** Create CA key/certificate → create distinct server key → create CSR → issuer reviews names/usage and signs → install server identity → distribute the public CA certificate to clients through a trusted channel.
- **Interaction:** “Trust this demo CA” changes only the simulated trust store. Toggle the server name or expiration afterward; trust alone must not fix those errors.
- **Teach:** CSR is a signed request containing a public key, not a private key or finished certificate. Issuers decide what to include. Public and private CAs differ in trust distribution and governance; self-signed does not mean unencrypted.
- **Under the hood:** Contrast a root directly issuing leaves in a small lab with a protected root and issuing intermediate. Never distribute the CA private key to clients or application nodes.
- **Check:** “Which file do clients need to trust the private CA?” Answer: its public CA certificate.

## 7. When both sides show ID

- **Scene:** Server-authenticated TLS → server requests a client certificate → client presents certificate and proof → server checks its configured trust and client purpose.
- **Interaction:** Enable mTLS; choose valid client identity, no certificate, or wrong issuer. Keep authorization as a separate final gate.
- **Teach:** mTLS authenticates both peers. Application permissions and tokens remain separate concerns. A valid identity can still lack permission.
- **Check:** “Does a valid client certificate grant every permission?” Answer: no.

## 8. Certificates have a lifecycle

- **Scene:** Issue → deploy → monitor → renew/rotate → retire. A time slider crosses the validity window.
- **Interaction:** Advance a fixed demo clock; perform an overlapping renewal. In an advanced scene, install a new CA's trust before switching the server chain, then retire old trust.
- **Teach:** Expiration, clock errors, key compromise, replacement, CRLs, OCSP, and revocation-policy differences. A revocation check can be unavailable; it must not silently become “good.”
- **Under the hood:** An issuer can revoke before expiration; clients differ in whether/how they obtain and enforce status. ACME and Certificate Transparency get short conceptual cards with sources before publication; no implementation required.
- **Check:** “Must a stolen-key certificate wait until expiry to be revoked?” Answer: no.

## 9. Files and the command workbench

- **Scene:** Sort public certificates, CSRs, private keys, and bundles into labeled trays. Open only fictional sample contents.
- **Teach:** DER is binary encoding; PEM is textual wrapping of encoded objects. `.pem` can hold keys as well as certificates. `.crt`/`.cer` suffixes do not reliably tell you the encoding. PKCS#12 can contain certificates and private keys.
- **Interaction:** Select key generation → CSR → issuance → inspection → verification. Highlight the input/output file cards and annotate each command's flags.
- **Implementation:** Adapt the local manual TLS guide into clearly labeled, illustrative OpenSSL 3 command cards using `server.example`. Display commands and sample results; do not execute commands or offer real key uploads. Inspect/verify cards must include hostname and server-purpose checks.
- **Check:** “Is every PEM file safe to share?” Answer: no; it may contain a private key.

## 10. Connect it to GitLab

Based on [the local manual TLS guide](../gitaly/MANUAL-TLS-README.md). This relative link is for implementers; ship a self-contained explanation in the app.

```text
GitLab client -- TLS through HAProxy --> Praefect -- separate TLS --> Gitaly
                                          |
                                          +-- database TLS --> RDS
```

- **Scene:** Highlight one connection at a time. HAProxy uses TCP passthrough in this example; the first TLS connection terminates at Praefect. Label other load-balancer configurations as different designs.
- **Interaction:** Pick a hop and reveal client, server identity, matching SAN, trusted issuer, and application authentication. Use fictional hosts such as `praefect.example` and `gitaly-1.example`.
- **Teach:** The private CA signs Praefect/Gitaly identities; the RDS connection uses the AWS trust bundle. Tokens provide separate application authentication/authorization. Include Gitaly peer connections in the expanded view.
- **Check:** “Does HAProxy decrypt this passthrough connection?” Answer: no.

## Troubleshooting playground

Use explicit presets and toggles. Every result contains **what failed**, **why**, and **what would fix it**, with the affected diagram element highlighted. Permit multiple simultaneous failures; report each relevant check independently.

| Scenario | Expected lesson/result |
| --- | --- |
| Valid private CA setup | Identity and trust checks pass |
| Unknown issuer | Configure the intended public trust anchor through a trusted process |
| Missing intermediate | Restore intermediate delivery; fixture has no cache/fetch fallback |
| Wrong DNS name / IP SAN | Match the requested identity; an IP needs the appropriate SAN type |
| Expired / not yet valid | Inspect certificate lifetime and client time |
| Tampered certificate | Signature verification fails |
| Wrong server private key | TLS proof fails despite an otherwise valid certificate |
| Wrong EKU / non-CA issuer | Purpose/issuer constraints fail |
| Revoked / unknown status | Apply the displayed demo policy; unknown stays visibly unknown |
| mTLS client absent or untrusted | Server's client-authentication check fails |
| Valid identity, denied operation | TLS succeeds; application authorization denies the request |

Use a fixed simulated date, visible to the learner, so examples never expire with the wall clock. Provide “Reset scenario.” No “disable verification” fix button.

## Glossary

Include searchable, one-paragraph entries for: X.509, X.501, PKI, TLS, HTTPS, public key, private key, symmetric key, signature, hash, fingerprint, certificate, CA, root, intermediate, leaf, trust store, chain, CSR, subject, issuer, CN, SAN, serial, validity, key usage, EKU, basic constraints, PEM, DER, PKCS#12, mTLS, SNI, CRL, OCSP, renewal, rotation, ACME, and Certificate Transparency. Link each term to its relevant chapter. SNI helps select a service; it does not itself prove identity.

## Final understanding check

Ask the learner to explain a public-CA, private-CA, and self-signed example using four questions: Who signed this certificate? Why does this client trust it? Where is the private key? What could still make the connection fail? Provide visual hints and explanations for wrong answers. Completing animations alone is not evidence of understanding.

## Technical references

Link references from the relevant lesson detail panel. These sources informed the plan; implementation should check additional details against primary documentation before expanding them.

- [RFC 5280: certificates, extensions, and path validation](https://www.rfc-editor.org/rfc/rfc5280) — chapters 3–4 and lifecycle basics.
- [ITU X.501: directory models](https://www.itu.int/rec/T-REC-X.501) — naming context in chapter 3.
- [RFC 9525: service identity](https://www.rfc-editor.org/rfc/rfc9525) — SAN-based identity checks; do not teach CN fallback as modern practice.
- [RFC 8446: TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446) — chapters 5 and 7; use sections 2 and 4 for message flow.
- [OpenSSL certificate requests](https://docs.openssl.org/3.0/man1/openssl-req/) — chapter 6 and command cards.
- [OpenSSL verification options](https://docs.openssl.org/3.0/man1/openssl-verification-options/) — trust, constraints, and failure scenarios.
- [OpenSSL formats](https://docs.openssl.org/3.0/man1/openssl-format-options/) — chapter 9.
- [AWS RDS TLS documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html) — chapter 10.
- [ZeroSSL domain verification](https://help.zerossl.com/hc/en-us/articles/360058295354-Verify-Domains-for-an-SSL-Certificate) and [certificate creation](https://help.zerossl.com/hc/en-us/articles/360060119373-Creating-an-SSL-Certificate) — public-CA issuance in chapter 6.
- [ZeroSSL installation example](https://help.zerossl.com/hc/en-us/articles/360060119773-Installing-SSL-Certificate-on-cPanel) and [automation documentation](https://zerossl.com/documentation) — deployment and renewal context; actual installation depends on the server.
