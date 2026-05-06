# Déploiement Hadar.ma — runbook complet

Ce document décrit les étapes pour déployer Hadar de zéro sur
DigitalOcean + Cloudflare. À conserver et tenir à jour à chaque
modification d'infra.

## 1. Création des ressources DigitalOcean

### a. Container Registry

```bash
doctl registry create hadar
```

Le registry est `registry.digitalocean.com/hadar`. Génère un Personal
Access Token avec les scopes `registry:read,write` et stocke-le dans
un GitHub secret `DO_REGISTRY_TOKEN`.

### b. Postgres managé

Console DO → Databases → Create → PostgreSQL **17**, taille `db-s-1vcpu-1gb`
($15/mo), région `fra1` (Francfort). Active :

- **Daily backups** (7 jours conservés)
- **Standby node** quand tu passes au tier "soft launch" ($95/mo total)

Récupère la connection string. Crée une DB séparée nommée `hadar` :

```sql
CREATE DATABASE hadar;
```

### c. Redis managé

Console DO → Databases → Create → Redis **7**, taille `db-s-1vcpu-1gb`
($15/mo), région `fra1`.

### d. Spaces (S3-compatible) pour les évidences

Console DO → Spaces → Create → région `fra1`, nom `hadar-uploads`.
Crée une clé d'accès (`SPACES_ACCESS_KEY` + `SPACES_SECRET_KEY`).

CORS : autorise `https://hadar.ma` uniquement, méthode PUT (signed
URLs). Désactive le listing public.

### e. Droplet

Console DO → Droplets → Create :

- Image : Ubuntu 24.04 LTS
- Plan : Regular Intel 2 GB / 1 vCPU ($14/mo) — passe à 4 GB après le
  soft launch.
- Région : `fra1`
- SSH : ajouter ta clé publique
- Hostname : `hadar-prod`

Une fois créé, durcis-le :

```bash
ssh root@<IP>

# Update système
apt update && apt upgrade -y

# Crée un user déploiement non-root
adduser deploy --disabled-password --gecos ""
usermod -aG sudo,docker deploy
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys

# Désactive SSH password + root login
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl reload ssh

# Firewall : SSH + Cloudflare Tunnel uniquement
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw enable

# fail2ban
apt install -y fail2ban
systemctl enable --now fail2ban

# Docker
apt install -y docker.io docker-compose-plugin
systemctl enable --now docker

# Unattended security upgrades
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

## 2. Cloudflare

### a. DNS

Cloudflare → ajoute le domaine `hadar.ma`. Dans les nameservers chez
ton registrar marocain (Genious / AlGenious / Marocain hosting),
remplace par les NS Cloudflare.

### b. Tunnel

Le droplet **n'expose pas son IP**. Cloudflare Tunnel se connecte au
droplet et route le trafic.

```bash
# Sur ta machine locale
cloudflared tunnel login
cloudflared tunnel create hadar
cloudflared tunnel route dns hadar hadar.ma
cloudflared tunnel route dns hadar www.hadar.ma
cloudflared tunnel token hadar  # → CLOUDFLARED_TUNNEL_TOKEN
```

Stocke le token dans `.env.production` sur le droplet.

### c. Règles de sécurité

- **SSL/TLS mode** : Full (strict).
- **Always Use HTTPS** : on.
- **HSTS** : on (max-age 12 mois, includeSubDomains, preload).
- **Bot Fight Mode** : on.
- **Rate limiting** : 50 req/10s par IP sur `/api/*` (free plan limité
  à 10k req/mo).
- **Page Rules** : cache `/_next/static/*` agressivement (1 mois).

### d. WAF

Active les règles managées OWASP Core. Pour le free plan c'est limité
mais déjà efficace. Passe à Pro ($20/mo) au moment du launch public.

## 3. Configuration des secrets

Sur le droplet :

```bash
ssh deploy@<IP>
mkdir -p /opt/hadar
cd /opt/hadar
```

Crée `/opt/hadar/.env.production` :

```ini
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://hadar.ma

# Postgres managé (depuis console DO → connection string)
DATABASE_URL=postgresql://doadmin:xxx@hadar-do-user-xxxx.b.db.ondigitalocean.com:25060/hadar?sslmode=require
DIRECT_URL=postgresql://doadmin:xxx@hadar-do-user-xxxx.b.db.ondigitalocean.com:25060/hadar?sslmode=require

# Redis managé
REDIS_URL=rediss://default:xxx@hadar-redis-xxx.b.db.ondigitalocean.com:25061

# Auth — generated avec `openssl rand -base64 64`
AUTH_JWT_SECRET=...
AUTH_REFRESH_SECRET=...

# Crypto — generated avec `node scripts/generate-secrets.mjs`
ENCRYPTION_KEY=...
CONTACT_HASH_PEPPER=...
IP_HASH_PEPPER=...

# Spaces
SPACES_ENDPOINT=https://fra1.digitaloceanspaces.com
SPACES_REGION=fra1
SPACES_BUCKET=hadar-uploads
SPACES_ACCESS_KEY=...
SPACES_SECRET_KEY=...

# Email (Resend recommandé)
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_...
EMAIL_FROM_ADDRESS=Hadar.ma <no-reply@hadar.ma>

# Cloudflare Tunnel
CLOUDFLARED_TUNNEL_TOKEN=eyJh...
```

Permissions : `chmod 600 .env.production` (lisible par le user
deploy seulement).

## 4. Premier déploiement

### a. Login docker registry sur le droplet

```bash
ssh deploy@<IP>
docker login registry.digitalocean.com
# Username + password = ton DO PAT
```

### b. Compose

Copie `docker-compose.prod.yml` dans `/opt/hadar/`.

### c. Migration initiale

```bash
docker pull registry.digitalocean.com/hadar/hadar:latest
docker run --rm --env-file /opt/hadar/.env.production \
  registry.digitalocean.com/hadar/hadar:latest \
  sh -c "cd /app && npx prisma migrate deploy"
```

### d. Démarrer l'app

```bash
cd /opt/hadar
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml logs -f app
```

Vérifie que Cloudflare Tunnel se connecte :

```bash
docker compose -f docker-compose.prod.yml logs cloudflared
```

Tu dois voir `Connection registered` × 4.

### e. Test

Ouvre `https://hadar.ma` dans un navigateur. Tu dois voir le site.

### f. Création du super-admin

```bash
ssh deploy@<IP>
docker exec -it $(docker ps -qf name=hadar) sh
# Dans le container :
SEED_SUPERADMIN_EMAIL=ossama@hadar.ma SEED_SUPERADMIN_PASSWORD='un-mot-de-passe-fort' npm run db:seed
```

Connecte-toi sur `/connexion`, puis `/admin/utilisateurs` pour
enrôler ton 2FA TOTP.

## 5. Cron jobs

Sur le droplet, ajoute aux crons :

```bash
sudo crontab -e
```

```cron
# Purge de rétention RGPD/CNDP — tous les jours à 03h00
0 3 * * * cd /opt/hadar && docker run --rm --env-file .env.production registry.digitalocean.com/hadar/hadar:latest sh -c "cd /app && npx tsx scripts/jobs/retention-purge.ts" >> /var/log/hadar/retention.log 2>&1

# Refresh des agrégats — toutes les heures
0 * * * * cd /opt/hadar && docker run --rm --env-file .env.production registry.digitalocean.com/hadar/hadar:latest sh -c "cd /app && npx tsx scripts/jobs/contact-aggregate-refresh.ts" >> /var/log/hadar/aggregate.log 2>&1
```

## 6. Monitoring

### a. Glitchtip self-hosted (Sentry-compatible)

Sur le même droplet, ajoute Glitchtip via Docker Compose dans un
projet séparé `/opt/glitchtip/`. Configure ensuite le SDK Sentry dans
Hadar (futur ajout).

### b. Uptime

[Uptimerobot](https://uptimerobot.com) (gratuit jusqu'à 50 monitors).
Configure :

- HTTPS check sur `https://hadar.ma/` (toutes les 5 min)
- HTTPS check sur `https://hadar.ma/api/me` (200/401 attendu)

### c. Logs

Logs Docker : `docker compose logs --tail=100 -f app`. Pour la prod,
brancher logrotate ou ship vers Logtail / Better Stack.

## 7. Backups

Postgres managé fait des backups quotidiens 7j conservés (DO).
Pour aller plus loin :

- **Backups off-site** vers Backblaze B2 ($5/mo) :
  ```bash
  pg_dump $DATABASE_URL | gzip | rclone rcat b2:hadar-backups/$(date +%F).sql.gz
  ```
- Tester un restore tous les trimestres.

## 8. Mise à jour (zero-downtime)

```bash
# Local
git tag v1.0.5
git push --tags
```

GitHub Actions (`deploy.yml`) :

1. Build l'image
2. Push sur DO Registry
3. SSH sur droplet → `prisma migrate deploy` → `docker compose pull && up -d`

L'image redémarre en ~10s. Les sessions actives ne sont pas perdues
(les JWT restent valides + refresh token rotation continue).

## 9. Rollback

Si v1.0.5 a un bug grave :

```bash
ssh deploy@<IP>
cd /opt/hadar
docker pull registry.digitalocean.com/hadar/hadar:v1.0.4
# Édite docker-compose.prod.yml pour pinner l'image à v1.0.4
docker compose -f docker-compose.prod.yml up -d
```

⚠ Si la v1.0.5 a appliqué des migrations DB non backward-compatibles,
le rollback DB est manuel (restore d'un backup). C'est pour ça qu'on
préfère toujours des migrations backward-compatibles.

## 10. Coûts récap (au launch)

| Poste | $/mois |
|---|---|
| Droplet 2 GB | 14 |
| Postgres managé basic | 15 |
| Redis managé basic | 15 |
| Spaces 250 GB | 5 |
| Resend free | 0 |
| Cloudflare free | 0 |
| Total | **49** |

Crédit DO de $200 → ~4 mois de prod gratuite.
