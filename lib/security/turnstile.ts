// ─────────────────────────────────────────────────────────────────────────────
// Cloudflare Turnstile — CAPTCHA léger, RGPD-friendly, gratuit.
//
// À activer sur les routes "high-friction" (signup, password reset,
// public contestation). Si TURNSTILE_SECRET n'est pas configuré
// (dev local), on fail-open (skip la vérif).
//
// Côté front : <Turnstile sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
// envoie un token dans le body. Cette fonction le valide auprès de
// l'API Cloudflare.
// ─────────────────────────────────────────────────────────────────────────────

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(
  token: string | undefined | null,
  remoteIp?: string,
): Promise<{ ok: boolean; reason?: string }> {
  const secret = process.env.TURNSTILE_SECRET;
  // Fail-open en dev — pas de Turnstile config → on laisse passer.
  if (!secret) return { ok: true };

  if (!token) return { ok: false, reason: 'missing-token' };

  try {
    const body = new URLSearchParams({
      secret,
      response: token,
      ...(remoteIp ? { remoteip: remoteIp } : {}),
    });
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (!res.ok) return { ok: false, reason: 'http-' + res.status };
    const data = (await res.json()) as {
      success: boolean;
      'error-codes'?: string[];
    };
    if (!data.success) {
      return { ok: false, reason: (data['error-codes'] ?? []).join(',') };
    }
    return { ok: true };
  } catch {
    // Cloudflare down ? Fail-open avec warning. La défense en profondeur
    // (rate limit + Origin check + Postgres unique constraints) reste.
    // eslint-disable-next-line no-console
    console.warn('[turnstile] verify failed, fail-open');
    return { ok: true };
  }
}
