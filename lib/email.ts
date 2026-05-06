// ─────────────────────────────────────────────────────────────────────────────
// Provider email transactionnel.
//
// Trois implémentations, sélectionnées via EMAIL_PROVIDER :
//   - resend     : Resend.com (recommandé, RGPD-friendly, free tier 3k/mo)
//   - console    : log dans la console (dev, valeur par défaut)
//   - n'importe quoi d'autre → fallback console + warning
// ─────────────────────────────────────────────────────────────────────────────

interface SendEmailParams {
  to: string;
  subject: string;
  html?: string;
  text: string;
  /// Reply-To pour les emails de support / contestation. Optionnel.
  replyTo?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const provider = process.env.EMAIL_PROVIDER ?? 'console';

  if (provider === 'resend') {
    await sendViaResend(params);
    return;
  }

  if (provider === 'console') {
    // eslint-disable-next-line no-console
    console.log(
      `\n📧 [email:console] → ${params.to}\n   Sujet : ${params.subject}\n   ${params.text.replace(/\n/g, '\n   ')}\n`,
    );
    return;
  }

  // eslint-disable-next-line no-console
  console.warn(
    `[email] Provider "${provider}" non implémenté, fallback console.`,
  );
  // eslint-disable-next-line no-console
  console.log(
    `[email] → ${params.to}\nSujet : ${params.subject}\n${params.text}`,
  );
}

// ── Resend ─────────────────────────────────────────────────────────────────

async function sendViaResend(params: SendEmailParams) {
  const apiKey = process.env.EMAIL_API_KEY;
  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.warn('[email:resend] EMAIL_API_KEY absent, fallback console.');
    // eslint-disable-next-line no-console
    console.log(
      `📧 ${params.to} | ${params.subject}\n${params.text}`,
    );
    return;
  }

  const from =
    process.env.EMAIL_FROM_ADDRESS ?? 'Hadar.ma <no-reply@hadar.ma>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: params.subject,
        text: params.text,
        ...(params.html ? { html: params.html } : {}),
        ...(params.replyTo ? { reply_to: params.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      // eslint-disable-next-line no-console
      console.error(
        `[email:resend] HTTP ${res.status} for ${params.to}: ${body.slice(0, 500)}`,
      );
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[email:resend] Network error:', err);
  }
}
