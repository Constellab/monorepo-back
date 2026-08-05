# Chantier MCP + authentification — état

Où on en est sur les deux plans menés à la suite : la dette du serveur MCP / OAuth 2.1
(items 8–14 de [`TECHNICAL_DEBT.md`](TECHNICAL_DEBT.md)), puis le passage aux access tokens
courts avec refresh token pour toute l'application.

Rédigé en français parce que c'est un document de suivi interne ;
[`TECHNICAL_DEBT.md`](TECHNICAL_DEBT.md), qui reste la référence sur les items numérotés, est
en anglais.

---

## Le point de départ

L'access token vivait **7 jours** et n'était persisté nulle part. Un JWT autonome est
irrévocable : `logout` n'effaçait que la copie du navigateur, et une copie volée restait
valable une semaine. Les seuls leviers étaient d'attendre l'expiration ou de changer
`JWT_SECRET`, ce qui déconnecte tout le monde.

En parallèle, le serveur MCP venait d'être livré en v1 avec des raccourcis assumés :
stores OAuth en mémoire, cloisonnement d'audience incomplet, `redirect_uri` non restreint.

---

## Ce qui est fait

### Côté MCP / OAuth

| Item                             | Ce qui a changé                                                                            | Pourquoi ça comptait                                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **9** — cloisonnement d'audience | `BlJwtStrategy` rejette désormais **tout** token portant un `aud`                          | Un token émis pour le MCP pouvait servir de token de session sur l'API entière                                                           |
| **11** (moitié back)             | `redirect_uri` restreint à l'enregistrement dynamique, + bornes sur la taille des requêtes | Sans écran de consentement, un `redirect_uri` libre laissait n'importe qui récupérer un code d'autorisation pour un utilisateur connecté |
| **8** — stores en mémoire        | Codes et clients OAuth déplacés en Redis (création de `BlRedisModule`)                     | Une `Map` en mémoire casse dès qu'il y a plus d'une instance : le code créé par l'une est inconnu de l'autre                             |

Le cloisonnement d'audience a été fait **sans drapeau d'activation**. Une vérification de
sécurité optionnelle est désactivée par défaut, donc inutile.

### Côté authentification de session

| Étape | Ce qui a changé                                                                                       |
| ----- | ----------------------------------------------------------------------------------------------------- |
| **1** | Durée de token par appel dans `BlJwtService`, et trois durées configurables par environnement         |
| **2** | Table `refresh_token` : entité, service, module, cron de purge, migration SQL                         |
| **3** | `POST /auth/refresh`, deux cookies au login, et un `logout` qui **révoque réellement**                |
| **4** | Contrat d'authentification rédigé et transmis à l'équipe front, puis réponse à leur brief en retour   |
| **+** | Cookie marqueur `Session_Active`, pour que les pages rendues côté serveur ne sortent pas déconnectées |

Le modèle retenu est **le standard OAuth 2.1** : l'access token reste un JWT autonome
validé par signature — donc `BlJwtStrategy` n'est pas modifiée et `cn-space-api` reste hors
périmètre — mais il tombe à **15 minutes**. Le refresh token, lui, est une ligne en base,
opaque, rotative à usage unique et révocable.

Deux décisions de conception qui portent l'essentiel :

- **La rotation est atomique par `UPDATE` gardé sur l'ancien hash**, pas sur l'`id`. C'est
  ce qui rend le token à usage unique : le premier `UPDATE` détruit la condition dont le
  second a besoin. Même garantie que le `GETDEL` de Redis, et donc détection du rejeu.
- **Une ligne par session, mise à jour sur place.** Avec un access token de 15 minutes, une
  ligne par rafraîchissement ferait quatre lignes par heure et par session.

### Un bug de sécurité trouvé en route

**Le rate limiting des routes d'auth était décalé d'un facteur 1000** : `ttl: 60` alors que
`@nestjs/throttler` compte en **millisecondes** depuis la v5. La limite réelle était de 10
requêtes par 60 ms, soit ~166/seconde, au lieu des 10 par minute visées. Un commit de 2024
avait migré la _forme_ de la config sans convertir la valeur que la même version majeure
avait redéfinie. Les deux apps étaient concernées.

Deux défauts en dessous :

- les surcharges par route ne faisaient **rien** — `BlPublicSecure({limit, ttl})` visait une
  clé de throttler inexistante ;
- le correctif évident aurait **cassé la production** : `cn /auth/external/check-credentials`
  est appelée par hn en serveur-à-serveur, donc tous les logins community arrivent d'une
  seule IP. À 10/min, ça devenait un plafond global sur les connexions — et présenté à
  l'utilisateur comme « identifiants incorrects ».

Limites actuelles : 60/min en global, 10/min sur les routes qui vérifient un identifiant,
1000/min sur les routes serveur-à-serveur de cn.

### Comment ça a été vérifié

Le principe appliqué à chaque étape : **un mock ne peut pas détecter un mauvais appel au
driver.** Chaque brique a donc été éprouvée contre l'infrastructure réelle, par des scripts
jetables et non conservés :

- **Redis** — contrat vérifié contre le serveur : `SET … EX`, `GETDEL` atomique, préfixe de
  clés, expiration bien côté serveur.
- **MySQL** — le DDL écrit à la main exécuté pour de vrai, puis `affectedRows` à 1 puis 0 sur
  l'`UPDATE` gardé, et les violations de contrainte constatées.
- **L'authentification** — l'app compilée démarrée contre la base de dev, et le flux complet
  déroulé au curl : les trois cookies, la rotation, le rejeu, le logout.

C'est ce qui a fait ressortir des choses que le typage laissait passer : un `import` valide à
la compilation mais `undefined` à l'exécution, et un test qui ne passait que par chance
(l'access token rafraîchi peut être identique au précédent, si les deux tombent dans la même
seconde).

---

## Ce qui reste

### 1. Point 5 — les tokens MCP (le gros morceau)

C'est là que **les 7 derniers jours disparaissent**. Aujourd'hui `/oauth/token` n'émet qu'un
access token, sans moyen de le renouveler : le raccourcir maintenant obligerait Claude à
redemander une autorisation toutes les heures.

- access token à 1 h, avec `expires_in` issu de la même constante que la signature — les
  deux ne coïncident aujourd'hui que par accident de constante partagée
- refresh token `kind: 'oauth'` émis avec le code, portant `client_id` et `resource`
- branche `grant_type=refresh_token`, avec la **`resource` lue en base et jamais dans la
  requête** — c'est ce qui empêche l'escalade d'audience au rafraîchissement
- `POST /oauth/revoke` (RFC 7009)
- `revocation_endpoint` et `refresh_token` dans les métadonnées de découverte, sinon le
  client ignore ces capacités

Le test qui compte : laisser Claude connecté plus d'une heure et s'en servir. Il doit
rafraîchir silencieusement.

### 2. `previous_token_hash` — débloqué

OAuth 2.1 (§4.14.2) recommande de révoquer **toute la session** quand un refresh token déjà
consommé est présenté : si deux acteurs détiennent des tokens de la même chaîne, l'un des
deux est un voleur. Aujourd'hui on répond 401 sans savoir de quelle session venait le token,
parce que la rotation écrase le hash.

Une colonne, zéro requête de plus. C'était conditionné à la sérialisation côté front — le
front vient de confirmer qu'il sérialise **et** rejoue, donc c'est ouvert.

À faire avec le point 5, les deux touchant le service de refresh token.

### 3. Point 6 — `cli-auth`, en dernier

La dernière poche de 7 jours. Il n'est pas cassé aujourd'hui : le défaut du module JWT est
resté à 7 jours exprès, et seuls login / 2FA / MCP passent leur durée courte.

Direction retenue : le faire **hériter du flux OAuth** plutôt que garder son mécanisme
propre — son flow est déjà un device flow. À noter, son store est encore une `Map` en
mémoire, donc il souffre du problème multi-instances que l'item 8 vient de corriger ailleurs.

### 4. Item 13 — découverte par ressource

Le dernier point MCP ouvert : un document de métadonnées par ressource protégée, au lieu
d'un seul. À grouper avec un `hn-mcp-resource.guard.spec.ts` — ce garde valide signature et
audience à chaque appel MCP et n'a **aucun test**.

### 5. Différés volontairement

- **Item 12** — RS256 / JWKS, nécessaire pour sortir les serveurs de ressources de cette app.
  Le choix de ne pas toucher `BlJwtStrategy` laisse cette trajectoire intacte.
- **Item 14** — la recherche MCP matche le JSON brut du rich-text.
- **Le rate limiting au reverse proxy** (nginx / CapRover), qui devrait être la protection
  principale, le throttler applicatif n'étant que de la défense en profondeur.

---

## Les limites assumées

Ce sont des choix, pas des oublis — mais ils se perdent vite, d'où leur place ici :

- **Un access token en vol survit à un `logout`**, au plus 15 minutes. C'est inhérent à un
  JWT autonome, et c'est précisément ce qui rend la durée courte nécessaire. On est passé de
  7 jours à 15 minutes, soit trois ordres de grandeur.
- **Aucune protection CSRF.** `SameSite=Lax` est la seule défense.
- **Les compteurs du throttler sont en mémoire**, donc par instance : le plafond réel est
  `limite × nombre de replicas`, et il repart à zéro à chaque redéploiement. Ce sont des
  ordres de grandeur, pas des garanties.
- **La socket WebSocket ragflow vérifie le token une seule fois à la connexion.** Elle
  survit donc à l'expiration de l'access token. Préexistant, inchangé.
- **Les regex CORS ne sont pas ancrées** : `https://x.constellab.community.attaquant.example`
  correspond et reçoit `Allow-Credentials: true`. Préexistant, hors périmètre, mais aggravé
  par l'absence de CSRF — à ouvrir séparément.

---

## Les pièges au déploiement

### ⚠️ Une variable d'environnement est obligatoire

**`OAUTH_ALLOWED_REDIRECT_URIS` doit être définie dans CapRover, en pré-prod comme en prod.**

Elle est lue par `getConfigString`, qui **lève une exception** quand la valeur est absente :
l'app **ne démarre pas** du tout. C'est la même classe de blocage que la migration SQL, pas
une fonctionnalité dégradée.

Elle liste les `redirect_uri` non-loopback qu'un client OAuth peut enregistrer, séparés par
des virgules, comparés **exactement** (schéma, hôte, port, chemin, requête). Les URI loopback
sont toujours acceptées (RFC 8252), donc elle ne sert qu'aux callbacks distants.

Second mode d'échec, plus sournois : si la valeur est **présente mais incomplète**, l'app
démarre normalement et rejette silencieusement l'enregistrement du client MCP avec une erreur
`invalid_redirect_uri`. Attention, les deux fichiers du repo ne disent pas la même chose —
`hn-dev.env` ne contient que le callback `claude.ai`, `hn-test.env` liste `claude.ai` **et**
`claude.com`. À vérifier contre ce que le client Claude utilise réellement avant de
renseigner la prod.

Les trois durées de token (`ACCESS_TOKEN_DURATION_SECONDS`,
`REFRESH_TOKEN_DURATION_SECONDS`, `MCP_ACCESS_TOKEN_DURATION_SECONDS`) sont à l'inverse
**optionnelles** : elles retombent sur les défauts du code, qui restent la source de vérité.
Ce sont des soupapes pour ajuster une durée sans redéployer, pas des réglages à poser.

### Le reste

- **Front avant back.** L'inverse tue toutes les sessions au bout de 15 minutes. Le front
  fonctionne sans dommage contre l'ancien back, l'inverse est faux.
- **La migration SQL est manuelle.** Le `CREATE TABLE refresh_token` doit tourner **avant**
  le démarrage de l'app : le login en dépend, ce n'est pas derrière une fonctionnalité. Le
  repo n'utilise pas les migrations TypeORM malgré ce qu'affirme `CLAUDE.md` — le schéma
  évolue par SQL écrit à la main dans `hn-migration.sql`, appliqué à la main.
- **Une déconnexion unique** pour les sessions existantes, qui portent un cookie de 7 jours
  sans refresh token. Elle s'étale sur jusqu'à 7 jours après le déploiement, donc pas de
  vague de reconnexions.

## Le trou dans la vérification

Les **18 assertions e2e** de `hn-auth.e2e.spec.ts` sont écrites et n'ont **jamais été
exécutées** : le conteneur `community-test-db` (port 3312) que `TESTING.md` documente
n'existe pas sur la machine de dev. C'est le seul endroit où le contrat est testé de bout en
bout, harnais HTTP compris. À lever avant tout déploiement.
