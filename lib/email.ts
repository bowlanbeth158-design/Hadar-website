// ─────────────────────────────────────────────────────────────────────────────
// Stub provider email transactionnel.
//
// V1 : on log le contenu des emails dans la console serveur. Suffit
// pour le dev. En prod, on branchera Resend / SendGrid / Mailgun via
// EMAIL_PROVIDER env (cf. .env.example).
//
// Toutes les routes qui envoient des emails (signup, password reset,
// verify, alertes, etc.) doivent passer par sendEmail() ici plutôt
// que d'appeler Resend directement → migration future en 1 endroit.
// ─────────────────────────────────────────────────────────────────────────────

interface SendEmailParams {
  to: string;
  subject: string;
  /// HTML body (optionnel — text suffit pour l'instant).
  html?: string;
  text: string;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const provider = process.env.EMAIL_PROVIDER ?? 'console';

  if (provider === 'console' || !provider) {
    // eslint-disable-next-line no-console
    console.log(
      `\n📧 [email:${provider}] → ${params.to}\n   Sujet : ${params.subject}\n   ${params.text.replace(/\n/g, '\n   ')}\n`,
    );
    return;
  }

  // TODO : implémenter resend / sendgrid / mailgun en prod.
  // Pour l'instant on log + warn pour qu'on n'oublie pas.
  // eslint-disable-next-line no-console
  console.warn(
    `[email] Provider "${provider}" non implémenté, fallback console.`,
  );
  // eslint-disable-next-line no-console
  console.log(
    `[email] → ${params.to}\nSujet : ${params.subject}\n${params.text}`,
  );
}
