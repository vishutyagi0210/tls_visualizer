export function assessmentQuestions(mode: string) {
  const publicMode = mode === 'Public CA'; const privateMode = mode === 'Private CA';
  const questions = [
    { question: 'Who signed this server certificate?', answers: ['An issuing public CA', 'Your organization’s private CA', 'The server using its own corresponding key'], correct: publicMode ? 0 : privateMode ? 1 : 2, explanation: publicMode ? 'An issuing CA signs the public server certificate after its required validation.' : privateMode ? 'Your private CA signs the server’s public-key identity under your issuance policy.' : 'A self-signed certificate is signed with the private key corresponding to the public key it contains.' },
    { question: 'Why does this demo client accept its trust?', answers: ['The chain reaches a root it already accepts', 'You deliberately installed your CA’s public trust certificate', 'You explicitly configured this leaf as trusted in a supporting client'], correct: publicMode ? 0 : privateMode ? 1 : 2, explanation: 'Trust comes from the client’s configured policy. A signature by itself does not command the client to trust an issuer or leaf.' },
    { question: 'Where is the server’s private key?', answers: ['Inside the public certificate', 'With the authorized TLS endpoint, protected from others', 'In every visitor’s trust store'], correct: 1, explanation: 'Only public information travels in the certificate. The matching private key stays under the server operator’s control.' },
    { question: 'What could still make the connection fail?', answers: ['Nothing, once the issuer is trusted', 'A wrong name, expired certificate, or mismatched private key'], correct: 1, explanation: 'Accepted trust is one requirement. Identity, time, usage, signatures, key proof, and applicable policy still need to pass.' },
  ];
  return questions;
}
