# Monitoring Hadar.ma

## 1. Glitchtip self-hosted (Sentry-compatible)

Glitchtip remplace Sentry pour l'error tracking, sans envoyer aucune
donnée vers les US. Installation sur le même droplet (lightweight) :

```bash
ssh deploy@<droplet>
mkdir -p /opt/glitchtip && cd /opt/glitchtip
cat > docker-compose.yml <<'EOF'
version: '3.9'
services:
  postgres:
    image: postgres:17-alpine
    restart: always
    environment:
      POSTGRES_USER: glitchtip
      POSTGRES_PASSWORD: ${GLITCHTIP_PG_PASSWORD}
      POSTGRES_DB: glitchtip
    volumes:
      - pg-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: always

  web:
    image: glitchtip/glitchtip:latest
    depends_on: [postgres, redis]
    restart: always
    environment:
      DATABASE_URL: postgres://glitchtip:${GLITCHTIP_PG_PASSWORD}@postgres:5432/glitchtip
      SECRET_KEY: ${GLITCHTIP_SECRET_KEY}
      DEFAULT_FROM_EMAIL: monitoring@hadar.ma
      EMAIL_URL: ${EMAIL_URL}
    ports:
      - '127.0.0.1:8000:8000'

  worker:
    image: glitchtip/glitchtip:latest
    depends_on: [postgres, redis]
    restart: always
    command: ./bin/run-celery-with-beat.sh
    environment:
      DATABASE_URL: postgres://glitchtip:${GLITCHTIP_PG_PASSWORD}@postgres:5432/glitchtip
      SECRET_KEY: ${GLITCHTIP_SECRET_KEY}

volumes:
  pg-data:
EOF

# Génère les secrets :
echo "GLITCHTIP_PG_PASSWORD=$(openssl rand -base64 24)" > .env
echo "GLITCHTIP_SECRET_KEY=$(openssl rand -base64 64)" >> .env
echo "EMAIL_URL=smtp://resend:re_xxx@smtp.resend.com:587" >> .env

docker compose up -d
```

Cloudflare Tunnel pour l'exposer sur `https://monitoring.hadar.ma` :

```bash
cloudflared tunnel route dns hadar monitoring.hadar.ma
# Configure le tunnel pour pointer vers http://localhost:8000
```

Ajoute Glitchtip côté Hadar (futur ajout) :

```ts
// app/instrumentation.ts (Next.js standard)
import * as Sentry from '@sentry/nextjs';
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Glitchtip est compatible avec le SDK Sentry standard.
  // Crée un projet sur monitoring.hadar.ma → copie le DSN ici.
});
```

## 2. Uptime monitoring — Uptimerobot

Compte gratuit sur uptimerobot.com (50 monitors gratuits).

Configure :

| Monitor | URL | Interval | Alert |
|---|---|---|---|
| Hadar home | https://hadar.ma/ | 5 min | Email ossama@hadar.ma |
| Hadar API | https://hadar.ma/api/me | 5 min | Email + SMS si > 5 min down |
| Hadar admin | https://hadar.ma/admin | 5 min | Email |
| Hadar database | (custom HTTP avec auth) | 15 min | Email |

Pour l'API, configure status code 401 attendu (pas de session = 401, c'est OK).

## 3. Status page publique

`https://status.hadar.ma` — page publique transparente sur les
incidents.

Options :

- **Gratuit** : Cronitor Free (5 monitors), Better Stack Free.
- **Auto-hébergé** : [Statping-ng](https://github.com/statping-ng/statping-ng)
  sur le droplet (Docker, 0€).

## 4. Logs centralisés (post-launch)

Pour le launch, les logs Docker JSON suffisent (`docker compose logs`).
Quand ça grandit :

- Better Stack (anciennement Logtail) — free tier 1GB/mo
- Auto-hébergé : Loki + Grafana sur droplet séparé

## 5. Métriques business — KPI à suivre quotidiennement

Sur le dashboard `/admin/statistiques` :

- Nombre de signalements soumis dans les dernières 24h
- File de modération (signalements UNDER_REVIEW depuis > 48h = SLA breach)
- Taux de signup → email_verified (entonnoir)
- Distinct contacts flagués / semaine
- Top 5 problemTypes
- Satisfaction moyenne (rating widget)

## 6. Alertes Slack/Telegram

À brancher quand l'équipe grandit. Webhook Slack #hadar-incidents :

```bash
# Cron toutes les 10 min
0,10,20,30,40,50 * * * * /opt/hadar/scripts/check-sla.sh
```

`check-sla.sh` :

```bash
#!/usr/bin/env bash
COUNT=$(curl -s https://hadar.ma/api/admin/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | jq '.data.reports.pending')
if [ "$COUNT" -gt 50 ]; then
  curl -X POST $SLACK_WEBHOOK -d "{\"text\":\"⚠ $COUNT signalements en attente\"}"
fi
```
