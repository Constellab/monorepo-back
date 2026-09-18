# Wildcard TLS certificates on CapRover (Let's Encrypt + OVH DNS)

This document explains how the wildcard certificates for `constellab.space` (prod)
and `preconstellab.com` (pre-prod) are issued and renewed automatically, and how to
debug the setup when something goes wrong.

## Why this exists

The web app is served on `*.constellab.space` — every subdomain is a workspace.
CapRover's built-in HTTPS uses the HTTP-01 challenge, which cannot validate a
wildcard domain. Wildcard certificates require the DNS-01 challenge, so these
certificates are managed outside of CapRover.

Previously this was done by hand every ~3 months: run `certbot certonly --manual`,
copy the TXT records into the OVH DNS zone, wait for propagation, confirm. The
`certbot/dns-ovh` image removes the manual step entirely — it creates and deletes
the TXT records through the OVH API.

**Important:** certificates issued by CapRover itself (the `captain.*` dashboard,
standard apps with "Enable HTTPS") are _not_ handled here. CapRover renews those on
its own. Only the lineages listed in the script below are managed manually.

## Components

| Piece               | Location                       | Role                                  |
| ------------------- | ------------------------------ | ------------------------------------- |
| Renewal script      | `/home/ubuntu/renew-certs.sh`  | Runs certbot, reloads nginx if needed |
| OVH API credentials | `/home/ubuntu/ovh.ini`         | Lets certbot write TXT records        |
| Certificate store   | `/captain/data/letencrypt/etc` | Shared with CapRover's nginx          |
| Cron entry          | root's crontab                 | Triggers the script twice a day       |

Note the path: CapRover writes `letencrypt` **without the `s`**. This is a typo in
CapRover's own source, but it is the real path on disk. Using `letsencrypt` will
silently create an empty directory and certbot will report no certificates.

## OVH API credentials

Created at https://api.ovh.com/createToken/ (endpoint `ovh-eu`), scoped to the zone
and set to unlimited validity:

```
GET    /domain/zone/<zone>/*
POST   /domain/zone/<zone>/*
PUT    /domain/zone/<zone>/*
DELETE /domain/zone/<zone>/*
GET    /domain/zone/
```

The `DELETE` and `POST` rights matter as much as the others: `POST` creates the
challenge record _and_ refreshes the zone, `DELETE` cleans the record up afterwards.
A token missing either one will still issue certificates but will leave stale
`_acme-challenge` records behind — see the DNS section below for why that breaks
things.

`/home/ubuntu/ovh.ini`:

```ini
dns_ovh_endpoint = ovh-eu
dns_ovh_application_key = XXXX
dns_ovh_application_secret = YYYY
dns_ovh_consumer_key = ZZZZ
```

Owned by root, mode `600`.

## Issuing a certificate for the first time

Run once per domain. The `--cert-name` fixes the directory name under `live/`, which
is what the nginx config references — don't let certbot pick it.

```bash
docker run --rm \
  -v /captain/data/letencrypt/etc:/etc/letsencrypt \
  -v /captain/data/letencrypt/lib:/var/lib/letsencrypt \
  -v /home/ubuntu/ovh.ini:/ovh.ini:ro \
  certbot/dns-ovh certonly \
    --dns-ovh \
    --dns-ovh-credentials /ovh.ini \
    --dns-ovh-propagation-seconds 120 \
    --cert-name constellab.space \
    -d constellab.space -d '*.constellab.space'
```

A single wildcard certificate covers every direct subdomain, including `api.`. Do
**not** create a separate lineage for `api.<domain>` — see "Stale ACME challenge
records" for the failure mode that causes.

If a certificate was previously issued with `--manual`, reissue it with this command
once. The renewal config file keeps whichever authenticator was used at issue time,
so a `manual` lineage can never renew unattended.

## Automatic renewal

`/home/ubuntu/renew-certs.sh` loops over the lineages in `CERT_NAMES` and runs
`certbot renew --cert-name <name>` for each. certbot does nothing unless the
certificate has fewer than 30 days left, so running it often is free.

Reloading nginx is done through a deploy hook, but indirectly. The hook runs _inside_
the certbot container, which has no Docker CLI and no access to the Docker socket, so
it cannot restart the nginx service itself. Instead the hook touches a flag file in
the shared volume; the host part of the script checks for that flag afterwards and
only then runs `docker service update --force captain-nginx`. Net effect: nginx is
reloaded when a certificate actually changed, and left alone otherwise.

Cron entry (root's crontab, via `sudo crontab -e`):

```
17 3,15 * * * /home/ubuntu/renew-certs.sh >> /var/log/renew-certs.log 2>&1
```

It must be root's crontab, not `ubuntu`'s: the script needs `/captain/data`, the
Docker socket, and write access to `/var/log`.

Adding a domain later means adding its name to `CERT_NAMES` — nothing else in the
script or the cron entry changes.

### Testing

```bash
/home/ubuntu/renew-certs.sh --dry-run
```

This hits Let's Encrypt's staging server. Deploy hooks don't fire in dry-run mode, so
nginx is never touched. Use it freely — Let's Encrypt rate-limits failed validations
to 5 per hour on the production endpoint.

Never interrupt a running certbot with Ctrl+C. Cleanup of the DNS challenge record
happens on exit; killing the process leaves the record in the zone.

---

# Debugging

## Listing certificates

The first thing to check. Reads local state only, no API calls, no credentials
needed:

```bash
docker run --rm \
  -v /captain/data/letencrypt/etc:/etc/letsencrypt \
  -v /captain/data/letencrypt/lib:/var/lib/letsencrypt \
  certbot/dns-ovh certificates
```

Expected output per certificate:

```
  Certificate Name: constellab.space
    Domains: constellab.space *.constellab.space
    Expiry Date: 2026-11-14 08:22:31+00:00 (VALID: 66 days)
    Certificate Path: /etc/letsencrypt/live/constellab.space/fullchain.pem
    Private Key Path: /etc/letsencrypt/live/constellab.space/privkey.pem
```

What to look for:

**Empty output / "No certificates found"** — almost always the volume path. Confirm
you used `letencrypt` (no `s`) and that the directory is not empty:

```bash
ls /captain/data/letencrypt/etc/live/
```

If a `/captain/data/letsencrypt` directory exists, Docker created it from a typo'd
mount; delete it so it doesn't confuse the next person.

**A duplicated lineage** (`constellab.space` _and_ `constellab.space-0001`) — a
reissue created a new lineage instead of replacing the old one. nginx may still be
reading the stale one. Check which path the nginx config references and delete the
unused lineage with `certbot delete --cert-name <name>`.

**`Domains:` missing an expected name** — the certificate is fine but doesn't cover
what you think. Reissue with the full `-d` list.

**Expiry in the past, or fewer than 30 days with cron supposedly running** — the cron
job isn't firing or is failing. Check `/var/log/renew-certs.log`, then
`sudo crontab -l`, then `journalctl -u cron --since today`.

## Confirming the renewal config

A certificate can be valid and still be unable to renew itself. The authenticator is
recorded per lineage at issue time:

```bash
docker run --rm \
  -v /captain/data/letencrypt/etc:/etc/letsencrypt \
  certbot/dns-ovh sh -c 'grep -H -E "authenticator" /etc/letsencrypt/renewal/*.conf'
```

Manually managed lineages must show `authenticator = dns-ovh`. If one still says
`manual`, it will fail at renewal time — reissue it with the `certonly` command above.

CapRover's own certificates will show `authenticator = webroot`. That's correct;
leave them alone. They are excluded from the script on purpose, because the
`/captain-webroot` volume isn't mounted and they would fail here.

## Checking for stale ACME challenge records

**This is the failure mode most likely to bite you, and the least obvious.**

Symptom: a subdomain that used to work stops resolving, while the certificate is
valid, nginx logs show no errors, and no requests for that hostname appear in the
access log at all.

```bash
curl -vI https://api.preconstellab.com
# curl: (6) Could not resolve host: api.preconstellab.com
```

Cause: a DNS wildcard (`*.preconstellab.com  A  51.91.134.143`) only applies to names
that **do not exist** in the zone (RFC 4592). A DNS-01 challenge for
`api.preconstellab.com` creates a TXT record at `_acme-challenge.api.preconstellab.com`.
From that moment `api.preconstellab.com` exists in the zone as an intermediate node —
an "empty non-terminal" — even with no A record of its own. The wildcard stops
covering it, and A queries return NODATA instead of the wildcard's address.

certbot normally deletes the TXT record on exit, restoring the wildcard. When cleanup
doesn't happen — interrupted run, a token without `DELETE` rights, a zone refresh
that didn't go through — the subdomain stays invisible indefinitely.

Diagnosis:

```bash
dig TXT _acme-challenge.api.<domain> @8.8.8.8
dig A api.<domain> @8.8.8.8
```

A TXT answer on the first query is your culprit. On the second, read the header:
`status: NOERROR` with `ANSWER: 0` confirms the empty non-terminal — a genuinely
non-existent name would return `NXDOMAIN`, which the wildcard would cover.

Fix: delete every leftover `_acme-challenge.*` record in the OVH DNS zone, then click
"Apply configuration". Resolution returns once the TTL expires.

Prevention, in order of preference:

1. Use one wildcard certificate per domain (`<domain>` + `*.<domain>`). The challenge
   record then lives at `_acme-challenge.<domain>`, at the zone root, where a leftover
   record breaks nothing. This is why prod was never affected.
2. Add an explicit A record for any production subdomain instead of relying on the
   wildcard. Once the name really exists, a temporary TXT record beneath it is
   harmless.

After any manual issuance, glance at the DNS zone to confirm no `_acme-challenge`
records remain.

## Keeping certbot logs

certbot's own log lives inside the container at `/var/log/letsencrypt` and is lost
when the container exits. It contains the exact trace of TXT record creation and
cleanup, which is what you need when diagnosing a stale challenge record. To keep it,
add to the `docker run` invocations:

```bash
-v /var/log/letsencrypt-ovh:/var/log/letsencrypt
```

## Other checks

```bash
# What certificate is actually being served
echo | openssl s_client -connect <domain>:443 -servername <domain> 2>/dev/null \
  | openssl x509 -noout -subject -dates

# Does the front-end point where you think it does
curl -s https://<domain>/assets/environment.json

# nginx health after a reload
docker service ps captain-nginx --no-trunc | head -5
docker service logs captain-nginx --tail 50 2>&1 | grep -i -E "error|emerg|certificate"
```

One thing worth ruling out early: verify that the nginx config references
`/etc/letsencrypt/live/<name>/fullchain.pem` and `privkey.pem` — the symlinks — and
not a numbered file under `archive/`. Pointing at `archive/` means renewals succeed
while nginx keeps serving the old certificate.
