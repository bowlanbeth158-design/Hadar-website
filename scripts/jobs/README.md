# Jobs Hadar.ma

Tous les jobs lisent `DATABASE_URL` depuis l'env, donc tu peux les
lancer manuellement avec `tsx scripts/jobs/<job>.ts` après avoir
sourcé `.env.local` :

```bash
set -a && source .env.local && set +a
npx tsx scripts/jobs/retention-purge.ts
npx tsx scripts/jobs/contact-aggregate-refresh.ts
```

## Planning recommandé en prod (crontab)

```cron
# Tous les jours à 03h00 — purge de rétention RGPD/CNDP
0 3 * * * cd /opt/hadar && /usr/bin/npx tsx scripts/jobs/retention-purge.ts >> /var/log/hadar/retention.log 2>&1

# Toutes les heures — refresh des agrégats (filet de sécurité ;
# le calcul est aussi fait inline à chaque publish)
0 * * * * cd /opt/hadar && /usr/bin/npx tsx scripts/jobs/contact-aggregate-refresh.ts >> /var/log/hadar/aggregate.log 2>&1
```

## Trace + monitoring

Chaque job écrit une ligne dans `DataRetentionJob` (jobKind,
startedAt, finishedAt, itemsScanned, itemsPurged, itemsErrored,
details JSON). Cela sert à la fois de :

- **Monitoring** : si un job ne tourne pas pendant 25h, alerter
- **Preuve CNDP** : "voilà la liste des purges effectuées les 90
  derniers jours, avec horodatage et compteurs"

## retention-purge.ts

Cinq sous-tâches, chacune tracée séparément :

1. `report.evidences` — supprime les fichiers d'évidences des
   signalements PUBLISHED depuis > 90 jours (Spaces + flag DB)
2. `verification.files` — supprime les CIN/selfie des
   IdentityVerification dont `autoDeleteAt < now()`. Garde le pHash
   pour anti-doublon.
3. `session.expired` — DELETE des sessions expirées ou révoquées
   depuis > 30 jours
4. `login_attempt.old` — DELETE des LoginAttempt > 30 jours
5. `token.expired` — DELETE des ShortLivedToken expirés > 7 jours

## contact-aggregate-refresh.ts

Recalcule entièrement `ContactAggregate` à partir des Reports
PUBLISHED. Le calcul est aussi fait inline à chaque modération
(publish), ce job est un filet de sécurité.
