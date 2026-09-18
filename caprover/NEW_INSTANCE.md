# Deploying a dedicated Constellab instance on CapRover

How to build a complete control plane (Space + Community) on a new machine: a dedicated
customer instance or an on-premise cloud deployment, isolated from Gencovery's pre-prod
and prod.

This document covers the **control plane only**. Data labs are provisioned afterwards by
the Space itself — see the `lab-configurer` repository.

Cross-repository context: `docs/architecture/platform-map.md`.
Wildcard certificates: `CAPROVER_CERTIFICATES.md`, in this folder.

---

## 0. What the instance contains

Eight CapRover apps. The first four are infrastructure, the last four are the product.

| App               | Image                                | Port | Served at                   | Volume                             |
| ----------------- | ------------------------------------ | ---- | --------------------------- | ---------------------------------- |
| `redis-queue`     | `redis:7.2.4`                        | —    | internal only               | `redis-queue-redis-data:/data`     |
| `space-db`        | `mariadb:10`                         | —    | internal only               | `space-db-data:/var/lib/mysql`     |
| `community-db`    | `mariadb:10`                         | —    | internal only               | `community-db-data:/var/lib/mysql` |
| `adminer`         | `adminer:5.2.1`                      | 8080 | `adminer.infra.<DOMAIN>`    | —                                  |
| `space-api`       | `ghcr.io/constellab/space-api`       | 3001 | `api.<DOMAIN>`              | binds `/space-api-volume`, `/logs` |
| `community-api`   | `ghcr.io/constellab/community-api`   | 3333 | `community-api.<DOMAIN>`    | bind `/logs`                       |
| `space-front`     | `ghcr.io/constellab/space-front`     | 80   | `<DOMAIN>` and `*.<DOMAIN>` | —                                  |
| `community-front` | `ghcr.io/constellab/community-front` | 4000 | `community.<DOMAIN>`        | —                                  |

One Redis for both APIs. It is how the Space and the Community keep their users, spaces
and brick versions in sync, so the two apps cannot be deployed independently.

Two separate databases. They share no data except through the Redis queues.

Everything lives under **one registered domain**, `<DOMAIN>`. CapRover itself is kept on
its own `infra.<DOMAIN>` label — see [1.3](#13-domains-and-dns) for why that separation
matters.

---

## 1. Prerequisites

### 1.1 Machine

|      | Minimum                                  | Recommended  |
| ---- | ---------------------------------------- | ------------ |
| vCPU | 2                                        | 4            |
| RAM  | 4 GB                                     | 8 GB         |
| Disk | 40 GB SSD                                | 80 GB SSD    |
| OS   | Ubuntu Server LTS 22.04 or 24.04, 64-bit | Ubuntu 24.04 |

The minimum runs the stack but leaves little room: two Node processes, two MariaDB, one
Redis, nginx and the CapRover daemon share the machine. Add 2 GB of swap on a 4 GB box.

**Ubuntu only.** `prepare-machine.sh` refuses to run on anything else, and deliberately: the
Docker repository path, the unattended-upgrades origins and the ESM suites it configures are
all Ubuntu-specific. Debian works with Docker but needs a different set of all three, and
guessing fails late rather than at the start.

Hard requirements:

- **A fixed public IP.** The wildcard DNS records point at it, and changing the IP breaks
  everything, certificates included.
- **Reverse DNS** set on that IP, or mail sent from the instance lands in spam.
- A non-root user with `sudo`. Its home holds the bind mounts `space-api-volume` and
  `logs/`, and its path goes into `HOST_HOME` in the configuration file of step 5. This
  document writes `/home/ubuntu`; if you log in as someone else, that is the value to
  change, and `prepare-machine.sh` prints the right one at the end of step 2.
- No Docker pre-installed by the hosting provider. Docker is a prerequisite of CapRover,
  not something it installs — `prepare-machine.sh` installs Docker CE itself.

### 1.2 Ports to open

In the provider's firewall **and** on the machine. This is a single-node install, which
needs fewer ports than most CapRover write-ups suggest.

| Port | Protocol | Purpose                                          |
| ---- | -------- | ------------------------------------------------ |
| 22   | tcp      | SSH                                              |
| 80   | tcp      | HTTP and the ACME HTTP-01 challenge              |
| 443  | tcp      | HTTPS                                            |
| 443  | udp      | HTTP/3                                           |
| 3000 | tcp      | CapRover setup — **close it again after step 3** |

**On a cloud provider, the host firewall is not the one that blocks.** GCP, AWS and Azure
filter at the network level, before the packet reaches the machine, and `ufw` is usually
inactive on their images. Opening the ports with `ufw` alone therefore changes nothing, and
the CapRover installer fails in step 3 with `Port timed out: 3000`.

Open them where the provider filters, first. **Port 3000 gets its own rule**, so that
closing it after step 3 is a deletion rather than an edit:

```bash
# GCP — two rules on the network, then tag the instance with them
gcloud compute firewall-rules create caprover-web \
  --direction=INGRESS --action=allow \
  --rules=tcp:80,tcp:443,udp:443 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=caprover

gcloud compute firewall-rules create caprover-setup \
  --direction=INGRESS --action=allow \
  --rules=tcp:3000 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=caprover

gcloud compute instances add-tags <INSTANCE> --zone <ZONE> --tags=caprover

# AWS: the same two, as inbound rules on the instance's security group
# Azure: the same two, as inbound rules on the network security group
# OVH bare metal / VPS: nothing at the network level, ufw below is the whole firewall
```

Then on the machine — **only if `ufw` is installed and active**. Cloud images frequently
ship without it, and on GCP the VPC rules above are the entire firewall:

```bash
command -v ufw > /dev/null && sudo ufw status   # not installed? nothing to do here

sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw allow 3000/tcp
```

**Do not open 996, 2377, 7946 or 4789.** Those carry the Docker registry and the Swarm
control and overlay traffic, and they are only needed _between nodes of a multi-node
cluster_. On one machine Swarm talks to itself without going through the firewall, and
CapRover's own documentation is explicit that exposing 4789/udp makes the overlay network
vulnerable. Many guides list all eight ports because they assume a cluster.

Source: <https://caprover.com/docs/firewall.html>

### 1.3 Domains and DNS

**One registered domain.** Everything is a subdomain of it, and the configuration file
derives every other name from a single `DOMAIN` value.

| Name                     | Example                             | Serves                                      |
| ------------------------ | ----------------------------------- | ------------------------------------------- |
| `<DOMAIN>`               | `acme-constellab.com`               | `space-front` — the landing and login page  |
| `*.<DOMAIN>`             | `<uuid>.acme-constellab.com`        | `space-front` — one workspace per subdomain |
| `api.<DOMAIN>`           | `api.acme-constellab.com`           | `space-api`                                 |
| `community.<DOMAIN>`     | `community.acme-constellab.com`     | `community-front`                           |
| `community-api.<DOMAIN>` | `community-api.acme-constellab.com` | `community-api`                             |
| `captain.infra.<DOMAIN>` | `captain.infra.acme-constellab.com` | the CapRover dashboard                      |
| `<app>.infra.<DOMAIN>`   | `adminer.infra.acme-constellab.com` | anything else CapRover serves               |

CapRover gets its own label, `infra.<DOMAIN>`, rather than the domain itself. That is
what keeps the two certificate schemes from overlapping: a wildcard covers exactly one
label, so `*.<DOMAIN>` does not cover `space-api.infra.<DOMAIN>`. The public names live
under the hand-issued wildcard, CapRover's own names stay on certificates CapRover issues
and renews by itself, and `space-front` ends up being the only app with a hand-written
nginx config.

A workspace subdomain cannot collide with a CapRover app name: a new space gets a
generated UUID v4 as its subdomain (`cn-space.entity.ts:67`), and the front URL is
literally `https://<space.domain>.<DOMAIN>` (`cn-front.service.ts:104`).

Records to create, all A records pointing at the fixed IP:

```text
<DOMAIN>                    A   <IP>
*.<DOMAIN>                  A   <IP>     # one workspace per subdomain
api.<DOMAIN>                A   <IP>     # explicit, not only through the wildcard
community.<DOMAIN>          A   <IP>
community-api.<DOMAIN>      A   <IP>
infra.<DOMAIN>              A   <IP>
*.infra.<DOMAIN>            A   <IP>     # required by CapRover
```

The explicit records for `api.`, `community.` and `community-api.` are not redundant with
the wildcard. They protect against the failure described in `CAPROVER_CERTIFICATES.md`,
section _Stale ACME challenge records_: a DNS wildcard only covers names that **do not
exist** in the zone, so one leftover `_acme-challenge.api.<DOMAIN>` TXT record would be
enough to make `api.<DOMAIN>` stop resolving.

One consequence worth knowing: because `*.<DOMAIN>` resolves, a mistyped subdomain reaches
the Space front instead of failing to resolve. This is already how `constellab.space`
behaves.

Check propagation before step 3, and that `<DOMAIN>` itself answers — on a base subdomain
that answer is what keeps a parent wildcard out of the way:

```bash
dig +short <DOMAIN> @8.8.8.8
dig +short infra.<DOMAIN> @8.8.8.8
dig +short anything.<DOMAIN> @8.8.8.8
dig CAA <DOMAIN> @8.8.8.8 +short          # and the parent zone, see below
```

#### The labs live on their own domain, not on `<DOMAIN>`

Nothing above covers the data labs. Their hostnames come from a separate variable on
`space-api`, `LAB_ALLOWED_DOMAINS` — a comma-separated list, whose **first entry** is the
domain given to a lab created without one being chosen. Gencovery's own value is
`constellab.app,gencovery.io`; until this release that list was an enum compiled into the
image, which is why it is worth a decision here rather than a value to copy.

A lab gets a generated UUID as its sub-domain, and the Space writes two records into the
**zone of that domain** as it provisions one:

```text
*.<uuid>                    A     <lab server IP>     # glab., lab., lab-manager., codelab.
_acme-challenge.<uuid>      TXT   <token>             # only while a certificate is issued
```

Both go through the **OVH API** (`cn-cloud-provider-ovh.service.ts:302` and `:354`),
whatever cloud provider the lab itself runs on — an Azure or GCP lab still has its DNS at
OVH. So every entry in `LAB_ALLOWED_DOMAINS` must be a zone hosted at OVH that this
instance's token (`OVH_APP_KEY` / `OVH_APP_SECRET` / `OVH_CONSUMER_KEY`) has the same four
rights on as the certificate token (`CAPROVER_CERTIFICATES.md`). A domain the token cannot
write to fails at lab creation, not at startup, and the lab is left with a server and no
name.

Three ways to set it, in decreasing order of what they ask of the customer:

- **A domain of the customer's, delegated to OVH.** The instance drives its own zone and
  nothing of Gencovery's is involved. This is the one to aim for on a dedicated instance.
- **`<DOMAIN>` itself**, giving labs at `<uuid>.<DOMAIN>`. Works, and keeps everything in
  one zone — but that zone is then written to automatically by the Space, alongside the
  records of step 1.3 that you maintain by hand. Note that a lab's `*.<uuid>` record makes
  `<uuid>.<DOMAIN>` an empty node: that one name stops falling back to `*.<DOMAIN>` and
  returns no answer instead of the Space front. Harmless — no workspace carries a lab's
  UUID — but it looks like a DNS failure when you happen to query it.
- **Gencovery's `constellab.app`**, which means Gencovery's OVH token and Gencovery's zone.
  Acceptable for a trial instance operated by Gencovery, and only then: the customer's labs
  then depend on a zone they do not own.

The API reads the list at startup and **refuses to boot when it is unset or blank**, so
there is no half-configured state where labs quietly land on the wrong domain. Changing it
later does not rewrite the labs already created: they keep the hostname stored on them.

#### `<DOMAIN>` may itself be a subdomain

Nothing above requires `<DOMAIN>` to be a registered domain. `test.constellab.com` works,
giving `*.test.constellab.com`, `api.test.constellab.com` and
`captain.infra.test.constellab.com`. Set `DOMAIN` to it in the configuration file and
every other name derives from there, unchanged.

Four things to settle, and only the first two need a decision:

- **The DNS-01 token covers the whole parent zone.** OVH scopes API tokens per zone, not
  per subtree, so issuing the wildcard for `*.test.constellab.com` needs rights on
  `/domain/zone/constellab.com/*` — write access to every record in `constellab.com`,
  Gencovery's own included. Delegate `test.constellab.com` to its own zone with NS records
  and the token scopes to that zone alone. Do this when the instance is operated by anyone
  who should not hold the parent zone.
- **The Community's `DOMAIN` variable must stay exactly `test.constellab.com`.** It is a
  cookie domain (`hn-auth.controller.ts:170`). Setting it to the parent `constellab.com`
  would send the Community session cookie to every host under that domain. The template
  derives it from `DOMAIN`, so it is right by default — the risk is in "fixing" it by hand.
- **`*.test.constellab.com` has to exist as its own record.** A parent `*.constellab.com`,
  if there is one, does not cover it. The DNS list above already spells it out.
- **Check the parent zone for a CAA record.** CAA is inherited up the tree (RFC 8659), so a
  CAA on `constellab.com` restricting issuance to one CA or one account applies to
  `test.constellab.com` until a CAA is set on `test.constellab.com` itself. Let's Encrypt
  will simply refuse to issue, with no hint about where the restriction came from.

A parent wildcard pointing somewhere else is not a problem, and it is worth knowing why:
resolution picks the longest **existing** ancestor of the queried name — the closest
encloser (RFC 4592) — and only the wildcard directly under it is consulted. Because
`test.constellab.com` has its own A record, it is that ancestor, and `*.constellab.com` is
never reached for anything below it.

The two ways that can break are not symmetric, and only one of them is loud:

- Drop `*.test.constellab.com` and the workspace subdomains return NXDOMAIN. They do
  **not** fall back to `*.constellab.com`. Obvious, and quick to diagnose.
- Drop the A record on `test.constellab.com` and the name stops existing as a node, the
  closest encloser moves up to `constellab.com`, and every name of the instance silently
  resolves to whatever `*.constellab.com` points at. DNS looks healthy throughout. This is
  the same mechanism as the stale ACME challenge failure in `CAPROVER_CERTIFICATES.md`,
  seen from the other end.

What does _not_ change is the certificate safety: a leftover `_acme-challenge` TXT is
harmless as long as the name above it has its own A record, which `test.constellab.com`
does. That is the same property the zone apex gives on a registered domain.

#### Why one domain, and not two

Three things in the code make this the right shape rather than merely a possible one:

- The Space's session cookies are `sameSite: 'strict'` with **no** `domain`
  (`cn-auth.controller.ts`). The front and the API must therefore sit under the same
  registrable domain — `api.<DOMAIN>` and `<uuid>.<DOMAIN>` do.
- The Community's cookies are `sameSite: 'lax'` with an explicit `domain`, read from its
  `DOMAIN` environment variable (`hn-auth.controller.ts:170`). That variable must name a
  parent of both the Community front and the Community API, which is why the template
  sets it to `<DOMAIN>` and not to `community.<DOMAIN>`.
- Browser traffic between the Space and the Community becomes same-site, which it is not
  in Gencovery's own environments.

### 1.4 Accounts and secrets to gather first

Collect these **before** filling the configuration file. The ones marked required stop the
application from starting or working when missing.

| Item                                                               | Required                     | Notes                                                                                                                          |
| ------------------------------------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| A dedicated S3 tenant (OVH or compatible) + access key/secret      | yes                          | **must belong to the customer** — see pitfall #2                                                                               |
| The Community's S3 buckets (12 names, listed in the template)      | yes                          | create them in that tenant                                                                                                     |
| SMTP account and sender address                                    | yes                          | Gencovery uses `ssl0.ovh.net:465` over TLS                                                                                     |
| OVH API token for DNS (4 rights on `/domain/zone/<zone>/*`)        | yes, if the domain is at OVH | issues the wildcard certificates, see `CAPROVER_CERTIFICATES.md`                                                               |
| A domain for the labs, hosted at OVH                               | yes                          | `LAB_ALLOWED_DOMAINS`, written to by the Space itself — see [the lab domain](#the-labs-live-on-their-own-domain-not-on-domain) |
| SSH private key for lab provisioning                               | if labs run in the cloud     | dropped into `$HOST_HOME/space-api-volume/`                                                                                    |
| Cloud provider credentials for labs (OVH / Azure / Outscale / GCP) | if labs run in the cloud     | the variables are required by the code even when unused — set them to `unused`                                                 |
| reCAPTCHA key                                                      | no                           | leaving it empty disables the captcha                                                                                          |
| OpenAI, Algolia, RAGFlow, YouTube keys                             | no                           | set them to `unused`; the code reads them with `getConfigString`                                                               |
| A GitHub classic PAT with `read:packages`                          | yes                          | CapRover pulls the four private images with it — see step 7                                                                    |

Generate these on the machine. Do not reuse them from another environment:

```bash
openssl rand -base64 24                  # MariaDB and Redis passwords
openssl rand -base64 48                  # JWT_SECRET, OTHER_JWT_SECRET
openssl rand -hex 32                     # shared Space <-> Community key
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 | base64 -w0   # MCP_JWT_PRIVATE_KEY_BASE64
```

### 1.5 Workstation

```bash
# CapRover CLI, used by the deploy scripts of both monorepos
bun add -g caprover

# needed by apply-apps.sh and export-apps.sh
jq --version && curl --version
```

You also need `monorepo-back` and `monorepo-front` cloned, and the images already
published on GHCR (a `cn_*` / `hn_*` / `ca_*` / `ha_*` tag pushed, with a green CI run).
The deploy script uploads nothing from your machine — it only tells CapRover which image
to pull.

---

## 2. Prepare the machine

`prepare-machine.sh`, in this folder, does the whole step. Copy it over and run it as the
normal user — it calls `sudo` itself, and running it as root would put the bind-mount
directories under `/root`.

```bash
scp caprover/prepare-machine.sh ubuntu@<IP>:~
ssh ubuntu@<IP> 'bash ~/prepare-machine.sh'
```

It updates the system, sets the clock to UTC, adds 2 GB of swap if the machine has none,
turns on automatic security upgrades, and creates the three directories the apps
bind-mount (`~/space-api-volume`, `~/logs/space-api`, `~/logs/community-api` — the paths
`caprover-apps.template.json` declares as `hostPath`). It is safe to re-run: every step
checks its own state first.

Two choices it makes, both deliberate:

- **It installs Docker CE from Docker's own repository.** Docker is a prerequisite of
  CapRover, not something CapRover installs, and its documentation asks for Docker 25+ and
  warns against the snap package — the script refuses to continue if it finds one.
- **Automatic reboot is off.** A reboot drops every container at once, the two databases
  included, so it is scheduled by hand. The script prints how to check
  `/var/run/reboot-required`.

---

## 3. Install CapRover

CapRover ships as a container. Step 2 installed the Docker it needs; this starts it.

```bash
ssh ubuntu@<IP>

sudo docker run -p 80:80 -p 443:443 -p 3000:3000 -e ACCEPTED_TERMS=true \
  -v /var/run/docker.sock:/var/run/docker.sock -v /captain:/captain \
  caprover/caprover
```

It takes a minute or two to initialise Swarm and come up. The dashboard then answers on
`http://<IP>:3000`, password `captain42`.

Do **not** run the `dev-scripts/install.sh` found in the CapRover repository — that one is
for developing CapRover itself, not for installing it.

Two things the installer prints that are worth reading correctly:

- **`Installation failed. Error: Port timed out: 3000`** means the installer could not
  reach its own port 3000 from outside. Nine times out of ten the provider's network
  firewall is still closed — go back to [1.2](#12-ports-to-open) and open it there, not
  just in `ufw`. A failed run leaves a half-built Swarm behind, so clean up before
  retrying:

  ```bash
  sudo docker service rm $(sudo docker service ls -q) 2>/dev/null || true
  sudo rm -rf /captain
  sudo docker swarm leave --force 2>/dev/null || true
  sudo docker system prune --all --force
  ```

  On a machine with no public IP at all, add `-e MAIN_NODE_IP_ADDRESS='127.0.0.1'` instead.

- **`Warning: Non-generic kernel detected`** on a cloud image (`-gcp`, `-aws`, `-azure`
  kernels) is expected and harmless. It is not the cause of a failed install.

The installer also suggests opening `996,7946,4789,2377`. Ignore that part — see
[1.2](#12-ports-to-open); those are cluster ports and CapRover's own firewall page says not
to expose them.

Then, from your workstation:

```bash
caprover serversetup
```

Answer with: the public IP, the default password `captain42`, a new password (store it in
the team's secret manager), `infra.<DOMAIN>` as the CapRover root domain, and an email for
Let's Encrypt. Enable forced HTTPS on the dashboard when offered.

Then:

1. Check that `https://captain.infra.<DOMAIN>` loads.
2. **Close port 3000.** It is only needed until the root domain is attached. Close it
   wherever you opened it — on GCP that is the rule, not the machine:

   ```bash
   gcloud compute firewall-rules delete caprover-setup       # GCP
   command -v ufw > /dev/null && sudo ufw delete allow 3000/tcp   # only if ufw is in use
   ```

3. In _Settings_ → _Nginx Configuration_, raise `client_max_body_size` to `500m` — the
   Space uploads files.

---

## 5. Fill in and apply the configuration file

```bash
cd monorepo-back/caprover
cp caprover-apps.template.json caprover-apps.acme.json
$EDITOR caprover-apps.acme.json   # fill the "vars" block, top to bottom
```

Everything lives in `vars`. Leave the app definitions below it alone: they contain only
`${REFERENCES}`, CapRover-internal values (`srv-captain--space-db`, ports, volumes) and
the environment variables the code actually reads.

One value in there is not a domain and not a secret, and is easy to skim past:
**`HOST_HOME`**, the home directory of the user that ran step 2. It defaults to
`/home/ubuntu` and it has to match the machine, because the two APIs bind-mount
directories under it. Get it wrong and every deploy of both APIs is rejected by Swarm and
rolled back in silence — see the end of step 7.

No value may stay at `FILL_ME` — the script refuses to run otherwise.

### Filling it with Claude Code

The `vars` block is about forty values, some of which have to be generated and two of
which only exist after step 6. Rather than working down it alone, run Claude Code from the
repository root and paste:

> Help me fill in `caprover/caprover-apps.acme.json`, copied from
> `caprover/caprover-apps.template.json`. Read `caprover/NEW_INSTANCE.md` first, then walk
> me through the `vars` block section by section: ask me for the values only I can know,
> generate the secrets yourself with the commands the template gives, and tell me which
> ones have to wait until step 6. Do not fill anything in silently, and show me the
> `apply-apps.sh` dry-run at the end.

Rename `acme` to the customer. It reads the same document you are reading, so it knows the
domain layout of [1.3](#13-domains-and-dns), which values are derived rather than typed,
and that `FOLDER_ID_TO_COPY_ON_SIGNUP` and `GENCOVERY_SPACE_ID` come back in
[6.3](#63-two-variables-to-fill-in-afterwards).

One thing to decide before you do this: anything Claude generates or is shown passes
through the model's context. Generated secrets — the database and Redis passwords, the JWT
secrets, the MCP signing key — are created on the spot and only ever live in this file, so
that is a small exposure. The credentials you already hold, the S3 keys, the SMTP password,
the OVH token, are a different matter: have Claude leave those at `FILL_ME` and paste them
in with an editor afterwards. The dry-run truncates every value it prints, which keeps them
out of the transcript at that end.

```bash
./apply-apps.sh caprover-apps.acme.json           # shows what would be written
./apply-apps.sh caprover-apps.acme.json --apply   # writes it
```

The script creates missing apps, then writes each one's environment variables, volumes,
port, CapRover subdomain SSL and extra domains. It also **deploys the four pinned
infrastructure images** — Redis, the two MariaDB and Adminer — because those versions are
constants. The four product images are left alone; their version is a decision, taken in
step 7. It is safe to re-run: fix a value and run it again.

The filled file holds plaintext secrets. It is covered by `.gitignore`; keep it in the
team's secret manager, not in the repository.

To read back what is really deployed:

```bash
./export-apps.sh https://captain.infra.<DOMAIN> --env space-api
```

---

## 6. Schema and data

**Nothing creates the schema automatically.** `synchronize` is wired to `false`
(`cn-app.module.ts:105`, `hn-app.module.ts:132`) and there are no TypeORM migrations. An
empty database stays empty, and the application still starts, which makes it look fine.

Four SQL files, imported through Adminer, in this order: the two schemas, then the two
seeds. All four live in the repository.

### 6.1 Schema — imported through Adminer

The schema lives in the repository, as two Adminer dumps taken from a current instance:

| File                                     | Tables | Goes into                       |
| ---------------------------------------- | ------ | ------------------------------- |
| `apps/cn-space-api/cn-db-schema.sql`     | 50     | `spaceDb` on `space-db`         |
| `apps/hn-community-api/hn-db-schema.sql` | 57     | `communityDb` on `community-db` |

Both are structure only — `CREATE TABLE` statements, no `CREATE DATABASE` and no `USE`.
So the database has to be selected in Adminer _before_ importing, or the tables land
nowhere.

Adminer was deployed in step 5 and answers at **`https://adminer.infra.<DOMAIN>`**. Log in
with:

| Field    | Space                    | Community                    |
| -------- | ------------------------ | ---------------------------- |
| System   | MySQL                    | MySQL                        |
| Server   | `srv-captain--space-db`  | `srv-captain--community-db`  |
| Username | `root`                   | `root`                       |
| Password | `SPACE_DB_ROOT_PASSWORD` | `COMMUNITY_DB_ROOT_PASSWORD` |
| Database | `spaceDb`                | `communityDb`                |

The two passwords are the ones in `caprover-apps.<customer>.json`. If you do not have the
file at hand, CapRover holds them too: _Apps_ → `space-db` → _App Configs_ →
`MYSQL_ROOT_PASSWORD`.

The server names are CapRover's internal DNS. The databases are not published, so
`srv-captain--space-db` only resolves from inside the cluster — which is where Adminer
runs, and the reason it is deployed at all.

Then, per database: _Import_ → select the `.sql` file → _Execute_. The dumps start with
`SET foreign_key_checks = 0`, so table order does not matter.

Two things that can go wrong:

- **The database does not appear in the list.** `MYSQL_DATABASE` only creates it on a
  first boot with an empty data directory (see [4](#4-infrastructure-apps--nothing-to-do)).
  Create it from Adminer's SQL console, then reconnect:

  ```sql
  CREATE DATABASE spaceDb CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
  CREATE USER 'spaceUser'@'%' IDENTIFIED BY '<SPACE_DB_PASSWORD>';
  GRANT ALL PRIVILEGES ON spaceDb.* TO 'spaceUser'@'%';
  ```

  The name, user and password must match `DATABASE`, `DATABASE_USER` and
  `DATABASE_PASSWORD` in the configuration file exactly.

- **The dumps are older than the image you are about to deploy.** They are refreshed by
  hand, not generated at build time. Apply the sections of
  `apps/cn-space-api/cn-migration.sql` and `apps/hn-community-api/hn-migration.sql` that
  came after them — that file is the log of DDL applied by hand, marked
  `######## <version> ########`, and its last sections also carry the release notes on
  environment variables.

### 6.2 Seed data — the init scripts

Same route, same two Adminer sessions, two more files:

| File                                    | Goes into     |
| --------------------------------------- | ------------- |
| `apps/cn-space-api/cn-dev-init.sql`     | `spaceDb`     |
| `apps/hn-community-api/hn-dev-init.sql` | `communityDb` |

Import them **after** the schema, and import both. They are meant to run together: they
share the same UUIDs at the top of each file (robot user, admin, spaces), and that is
exactly what lets the two databases recognise each other.

Every statement is an `INSERT IGNORE`, so re-running one duplicates nothing.

What `cn-dev-init.sql` puts in the Space: the robot user and its group, an admin
(`test@gencovery.com` / `test1234`), two test users, four spaces, folders, one example
lab, the `gws_core` and `gws_academy` bricks, the cloud reference data (countries, cities,
providers, regions, price tables) and the `settings` row (server decision tree, Constellab
suite, free lab config). `hn-dev-init.sql` puts the same users and spaces in the
Community, plus the bricks and their documentation.

**On a customer instance, clean up afterwards** — these scripts were written for a
development environment:

1. Change the admin's password, or delete the account once the real one exists.
2. Delete the two test users and their personal spaces.
3. Keep the robot user. `CnUsersService.onModuleInit` loads it at startup by
   `ROBOT_USER_MAIL`. The method returns `null` without throwing, so a missing robot user
   is invisible at boot — it shows up later, on every operation done on behalf of the
   system.
4. Review the cloud reference data (providers, regions, prices): keep what the customer's
   labs will be provisioned on, delete the rest.

### 6.3 Two variables to fill in afterwards

Two values in the configuration file point at rows that only exist after this step:

| Variable                      | App             | Must point at                                       |
| ----------------------------- | --------------- | --------------------------------------------------- |
| `FOLDER_ID_TO_COPY_ON_SIGNUP` | `space-api`     | a `folder` in the Space, or an empty string         |
| `GENCOVERY_SPACE_ID`          | `community-api` | a `space` that exists **in the Community database** |

Read them in adminer, put them back into `caprover-apps.acme.json`, then re-run:

```bash
./apply-apps.sh caprover-apps.acme.json --apply space-api community-api
```

---

## 7. Deploy the four images

Deploying is separate from configuring, and nothing is uploaded from your machine: the
command only tells CapRover which tag to pull from GHCR.

### The GHCR registry, first

The four images are private on GHCR, so CapRover needs credentials before it can pull any
of them. Do this once, before the first deploy.

In the dashboard: _Cluster_ → _Add Remote Registry_.

| Field    | Value                                                                         |
| -------- | ----------------------------------------------------------------------------- |
| Domain   | `ghcr.io`                                                                     |
| Username | the GitHub account that can read the Constellab packages, e.g. `bmaisonneuve` |
| Password | a personal access token, see below                                            |

**The token has to be a _classic_ one, scoped to `read:packages` and nothing else.**
Fine-grained tokens do not work against the container registry, and the failure is
unhelpful: the deploy command succeeds, because all it does is tell CapRover which tag to
pull, and the app then fails to start with `denied` or `manifest unknown` in its logs.

On GitHub: _Settings_ → _Developer Settings_ → _Personal access tokens_ → **Tokens
(classic)** → _Generate new token (classic)_, then tick `read:packages` only. Not
`write:packages`, not `repo`.

This is the opposite of the advice for the private-brick tokens in the platform map, and
deliberately so. Those are `git clone` over HTTPS, where a fine-grained token scoped to
`Contents: Read-only` is both sufficient and tighter. The container registry leaves no such
choice.

### Deploying

The existing package scripts are hardwired to Gencovery's hosts. For a dedicated instance,
call `deploy.mjs` directly:

```bash
# monorepo-back
cd monorepo-back
node deploy.mjs https://captain.infra.<DOMAIN> space-api     ghcr.io/constellab/space-api     cn_ <version>
node deploy.mjs https://captain.infra.<DOMAIN> community-api ghcr.io/constellab/community-api hn_ <version>

# monorepo-front
cd ../monorepo-front
node deploy.mjs https://captain.infra.<DOMAIN> space-front     ghcr.io/constellab/space-front     ca_ <version>
node deploy.mjs https://captain.infra.<DOMAIN> community-front ghcr.io/constellab/community-front ha_ <version>
```

Without the last argument the script guesses the version from your latest local git tag
with that prefix. On a customer instance, always pass the version explicitly.

Deploy the two APIs first, then the two fronts. A front that starts against a missing API
serves a blank page with no readable error.

### When the deploy succeeds but the app does not start

The _Deployment_ tab showing `ghcr.io/constellab/space-api:2.10.16` only means CapRover
recorded the tag. It does not mean the container is running that image. When Swarm refuses
the new task it rolls back, and the app keeps serving **whatever it served before** —
which, on a fresh instance, is CapRover's placeholder. Its only log line is `/`, so the app
looks deployed and empty at the same time.

The dashboard will not tell you this. Ask Docker directly, on the server:

```bash
# 1. the history of the task. The ERROR column is the answer, and the IMAGE column of the
#    Running line is what is actually serving.
sudo docker service ps space-api --no-trunc

# 2. the raw logs
sudo docker service logs space-api --tail 100
```

The Swarm service is named after the app, plainly: `space-api`, not
`srv-captain--space-api`. That second form is the app's **network alias**, the name the
other containers resolve — which is why the configuration file uses
`srv-captain--space-db` for `DATABASE_HOST`. Two names for the same app, and the `docker
service` commands want the short one.

| What `service ps` says                       | What it means                                              |
| -------------------------------------------- | ---------------------------------------------------------- |
| `bind source path does not exist: /home/...` | step 2 ran under a different user than `HOST_HOME` names   |
| `No such image` / `denied` / `unauthorized`  | the GHCR registry is missing, or the token is fine-grained |
| `manifest unknown`                           | that tag was never built — check the CI run for the tag    |
| `task: non-zero exit`                        | the image is there and the application itself crashes      |
| `starting` looping, no exit                  | the healthcheck never passes; read the logs                |

**The bind mount is the one that bites.** Docker Swarm never creates a missing bind source;
it rejects the task. `space-api` mounts `${HOST_HOME}/space-api-volume` and
`${HOST_HOME}/logs/space-api`, `community-api` mounts `${HOST_HOME}/logs/community-api`, and
`prepare-machine.sh` creates all three in the home of the user that ran it. If that user is
not the one `HOST_HOME` names, every deploy of both APIs is rejected and rolled back, with
no message anywhere in CapRover. Fix `HOST_HOME` in the configuration file, re-run
`apply-apps.sh`, then deploy again.

To test the registry credentials alone, without CapRover in the way:

```bash
echo '<the classic token>' | sudo docker login ghcr.io -u <github-user> --password-stdin
sudo docker pull ghcr.io/constellab/space-api:2.10.16
```

That says `unauthorized`, `denied` or `manifest unknown` in plain words. Note that this
login is separate from CapRover's own: fixing it here does not fix CapRover, the registry
still has to be registered in _Cluster_ → _Add Remote Registry_.

---

## 8. Public domains and certificates

Two schemes, and only one of them needs you.

**CapRover handles everything except the wildcard.** It already issued, in step 5, an
HTTP-01 certificate for every app on `<app>.infra.<DOMAIN>`, and one for each public
subdomain `apply-apps.sh` attached: `api.<DOMAIN>`, `community.<DOMAIN>` and
`community-api.<DOMAIN>`. HTTP-01 validates all of those, and CapRover renews them on its
own. If DNS had not propagated when the script ran, one of them may have failed — redo it
in the UI: _Apps_ → the app → _HTTP Settings_ → _Enable HTTPS_ on the domain.

**Only `space-front` needs a wildcard, and it is issued by hand.** That is the whole
reason CapRover lives on its own `infra.` label: a wildcard covers exactly one label, so
`*.<DOMAIN>` and CapRover's own names never describe the same host, and exactly one app
ends up with a hand-written nginx config.

### 8.1 space-front: a wildcard, issued by hand

A workspace lives on its own subdomain, any subdomain, so `space-front` needs a
certificate for `*.<DOMAIN>`. CapRover cannot issue that one: its HTTP-01 challenge does
not validate wildcards. So this single certificate is issued outside CapRover, with
certbot against the OVH DNS API.

Five steps. `CAPROVER_CERTIFICATES.md`, in this folder, has the long version of each one
plus a debugging chapter — read it when a step misbehaves, not before.

> **Do this after step 5, never before.** Until `apply-apps.sh` has attached `api.`,
> `community.` and `community-api.` to their apps, those names fall through to
> `space-front`, and CapRover's HTTP-01 challenge is answered by the Angular application
> instead of the token. The three certificates would never be issued.

**1. Create an OVH API token** at https://api.ovh.com/createToken/, endpoint `ovh-eu`,
unlimited validity, with `GET`/`POST`/`PUT`/`DELETE` on `/domain/zone/<zone>/*` and `GET`
on `/domain/zone/`. `DELETE` is not optional — without it certbot leaves its challenge
records behind, which breaks DNS later. Write the four values into `~/ovh.ini`, then
`sudo chown root:root ~/ovh.ini && sudo chmod 600 ~/ovh.ini`:

```ini
dns_ovh_endpoint = ovh-eu
dns_ovh_application_key = XXXX
dns_ovh_application_secret = YYYY
dns_ovh_consumer_key = ZZZZ
```

**2. Issue the certificate.** One command, run once. It creates **one** certificate
covering both `<DOMAIN>` and everything one level under it:

```bash
sudo docker run --rm \
  -v /captain/data/letencrypt/etc:/etc/letsencrypt \
  -v /captain/data/letencrypt/lib:/var/lib/letsencrypt \
  -v $HOME/ovh.ini:/ovh.ini:ro \
  certbot/dns-ovh certonly \
    --dns-ovh \
    --dns-ovh-credentials /ovh.ini \
    --dns-ovh-propagation-seconds 120 \
    --cert-name <DOMAIN> \
    -d <DOMAIN> -d '*.<DOMAIN>'
```

`--cert-name` fixes the directory name under `live/`, which the nginx config of step 4
references — don't let certbot pick it.

**3. Set up renewal.** Copy `renew-certs.sh` next to `ovh.ini` and change the two values
at the top that still carry pre-prod's:

```bash
OVH_CREDENTIALS="<HOST_HOME>/ovh.ini"   # line 25, hardcoded — must match your HOST_HOME
CERT_NAMES=(                            # lines 33-36, the lineages to renew here
    "<DOMAIN>"
)
```

`CERT_NAMES` holds the `--cert-name` of step 2, and only that one. Adding
`api.<DOMAIN>` there makes the run fail: CapRover issues that certificate over HTTP-01 and
the script does not mount `/captain-webroot`.

**`crontab: command not found`** means cron is not installed — minimal cloud images, GCP's
among them, ship without it, and `prepare-machine.sh` does not add it. Install it and make
sure the daemon is actually running, not just present:

```bash
sudo apt-get update && sudo apt-get install -y cron
sudo systemctl enable --now cron
sudo systemctl status cron       # "active (running)"
```

Then make the script executable and add the entry to **root's** crontab — the script needs
`/captain/data`, the Docker socket, `/var/log`, and `ovh.ini`, which is `root:root 600`:

```bash
chmod +x <HOST_HOME>/renew-certs.sh
sudo chown root:root <HOST_HOME>/ovh.ini && sudo chmod 600 <HOST_HOME>/ovh.ini
sudo crontab -e          # opens an editor; the line below goes in the file
```

```
17 3,15 * * * <HOST_HOME>/renew-certs.sh >> /var/log/renew-certs.log 2>&1
```

That line is the **content of the crontab file**, not a shell command. Typed at a prompt it
makes bash try to run a program called `17`, and appending `sudo` in front of it — or
anywhere in it — only moves the failure: `>> sudo` creates a file named `sudo` in the
current directory and `2>&1` sends the error message into it, so the terminal stays silent
and it looks like it worked.

No `sudo` inside the line either. The job already runs as root, because the crontab is
root's. In a user crontab it would not: cron has no tty, so `sudo` fails with
`sudo: a terminal is required to authenticate`.

**The path must be absolute.** Cron sets `HOME` from the `/etc/passwd` entry of the
crontab's owner, so in root's crontab `~` and `$HOME` both expand to `/root` — the job then
fails twice a day with `No such file or directory` until the certificate expires.

Check it landed in the right crontab, then run it once by hand against Let's Encrypt's
staging server:

```bash
sudo crontab -l                       # must show the line
crontab -l                            # must say "no crontab for <user>"

sudo <HOST_HOME>/renew-certs.sh --dry-run

# the lineage names, as certbot knows them: CERT_NAMES must match these exactly
sudo docker run --rm -v /captain/data/letencrypt/etc:/etc/letsencrypt \
  certbot/dns-ovh certificates
```

The dry run exercises the OVH token, the credentials path and the certbot image without
touching the real certificate or Let's Encrypt's rate limits. It is the only check that
tells you the renewal works before it has to.

After the first real renewal, the log says which lineages were processed:

```bash
sudo tail -30 /var/log/renew-certs.log
```

**4. Point `space-front` at the certificate.** _Apps_ → `space-front` → _Nginx
Configuration_.

Use `space-front-nginx-example.conf`, in this folder, as the reference. It is CapRover's
own template with three edits, each one wrapped in a pair of comments:

```nginx
###################### START MODIFICATIONS ######################
...
####################### END MODIFICATIONS ######################
```

Apply those three blocks to the template CapRover shows you, and replace
`test.preconstellab.com` with your `<DOMAIN>` everywhere it appears. Do not paste the
example file wholesale: the rest of it is CapRover's template as it stood when the example
was taken, and yours may differ by version.

**5. Check the zone for a leftover challenge record** — see 8.2 just below.

Optionally, do the same on `space-api` if its nginx needs long timeouts and
`client_max_body_size 0`; pre-prod does, for slow uploads. That app keeps its CapRover
certificate, only the timeouts and the body size change.

### 8.2 After any manual issuance

```bash
dig TXT _acme-challenge.<DOMAIN> @8.8.8.8
dig TXT _acme-challenge.api.<DOMAIN> @8.8.8.8
```

A TXT answer on the second query means a challenge record was left under a subdomain.
Delete it in the DNS zone, or `api.<DOMAIN>` will stop resolving. A leftover on the first
query is harmless — that is the point of keeping to one lineage at the zone root.

---

## 9. Files in the space-api volume

The paths declared in the configuration point inside the `/space-api-volume` bind mount.
Put whatever is used there, with the right permissions:

```bash
cd ~/space-api-volume
# lab provisioning SSH key, depending on the provider
install -m 600 <source> ovh-id.rsa
install -m 600 <source> outscale-id.rsa
install -m 600 <source> gcp-id.rsa
install -m 600 <source> gcp_auth.json
```

A declared but missing path does not fail the startup. It fails the first lab
provisioning, later and far from the cause.

---

## 10. Checks

```bash
D=<DOMAIN>

# 1. both APIs answer
curl -sf https://api.$D/health && echo OK
curl -sf https://community-api.$D/health && echo OK

# 2. the fronts serve the config you expect
curl -s https://$D/assets/environment.json | jq
curl -s https://community.$D/assets/environment.json | jq

# 3. the Space is the OAuth/MCP authorization server
curl -s https://api.$D/.well-known/jwks.json | jq '.keys | length'

# 4. which certificate is actually served, on each of the two schemes
#    a workspace subdomain must show the hand-issued wildcard...
echo | openssl s_client -connect $D:443 -servername test.$D 2>/dev/null \
  | openssl x509 -noout -subject -dates
#    ...and api. must show its own CapRover certificate, not the wildcard
echo | openssl s_client -connect api.$D:443 -servername api.$D 2>/dev/null \
  | openssl x509 -noout -subject -dates
```

Then, in the interface:

1. Log into the Space front with the admin account. This exercises front → space-api →
   database.
2. Log into the Community front with the **same** account. This exercises Community →
   `/auth/external/check-credentials` on the Space, so `SPACE_API_KEY`, `SPACE_API_URL`
   and the network between the two apps.
3. Create a user in the Space and check it appears in the Community. This is the only
   test that exercises the shared Redis (`user_queue`).
4. Read the logs: `docker service logs srv-captain--space-api --tail 100`.

---

## Known pitfalls

**#1 — `COMMUNITY_API_KEY` and `SPACE_API_KEY` are the same value.** The Space sends
`COMMUNITY_API_KEY` and the Community compares it against its own `SPACE_API_KEY`
(`hn-space-auth.guard.ts:19`), and the other way round (`cn-community-auth.guard.ts:18`).
One string, three places: both variables **and** the config pushed into every lab
(`cn-lab-manager.service.ts:136`). That is why the template asks for it once, as
`SHARED_SPACE_COMMUNITY_API_KEY`.

**#2 — The Space API's bucket names are still hardcoded per profile.**
`getDbBackupBucket()` returns `constellab-db-backup-prod` when `ENVIRONMENT_PROFILE=prod`
and `constellab-db-backup-pre-prod` otherwise; `getSpaceImageBucket()` does the same with
`constellab-space-image-*` (both in `cn-core-config.service.ts`). The object name is fixed
too — `cn-space.json`, `hn-community.json` — and overwritten on every run.

So a customer instance running as `prod` with **Gencovery's S3 credentials** overwrites
Gencovery's own production backup every night at midnight. That is why the S3 tenant must
belong to the customer: bucket names are scoped per tenant, so separate credentials are
enough to isolate them. Create `constellab-db-backup-prod`,
`constellab-space-image-prod` and `constellab-user-profile-picture` in that tenant.

The Community API no longer has this defect: its dump bucket is `BUCKET_DB_BACKUP`, filled
like the other buckets in the template. Only the Space side still needs the tenant to be
separate for the names to be safe.

**#3 — `ENVIRONMENT_PROFILE` does not accept arbitrary values.** The type is
`'dev' | 'docker' | 'preprod' | 'prod' | 'test'`. Gencovery's pre-prod is set to `pre-prod`
(with a hyphen), which is not in that list; the code then falls into "neither local nor
prod", which happens to be the intended behaviour. On a customer instance, use `prod` —
that is what turns on `secure` cookies and the production buckets. The captcha does not
depend on the profile: it is on when `CAPTCHA_SITE_KEY` holds a value, off when it is blank.

**#4 — The Space's `API_URL` and the Community's `SPACE_API_URL` must name the same host,
scheme included.** No test compares them. A mismatch makes every MCP call return 401 while
both applications look healthy.

**#5 — Four Community variables are missing in pre-prod**: `BUCKET_ICON`,
`BUCKET_ICON_BACKUP`, `BUCKET_AGENTS`, `BUCKET_AGENTS_BACKUP`. They are read lazily, so the
app starts and only fails the first time the feature is used. The template includes them —
do not drop them because pre-prod does not have them.

**#6 — The private bricks' tokens belong to a personal GitHub account.** They are stored in
the Community, per brick (`credentialUsername` / `credentialPassword`), and travel inside
the clone URL to every lab. A customer instance that installs private bricks needs its own
token, scoped to those repositories with **Contents: Read-only**. Details in the platform
map, section _Brick resolution_.

**#7 — The two APIs cannot be deployed independently.** They share the Redis and sync
through it. Restarting Redis, or changing its password without redeploying both, leaves the
queues failing silently.
