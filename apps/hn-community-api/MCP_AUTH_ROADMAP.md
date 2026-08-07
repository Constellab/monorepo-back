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

| Item                              | Ce qui a changé                                                                            | Pourquoi ça comptait                                                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **9** — cloisonnement d'audience  | `BlJwtStrategy` rejette désormais **tout** token portant un `aud`                          | Un token émis pour le MCP pouvait servir de token de session sur l'API entière                                                           |
| **11** (moitié back)              | `redirect_uri` restreint à l'enregistrement dynamique, + bornes sur la taille des requêtes | Sans écran de consentement, un `redirect_uri` libre laissait n'importe qui récupérer un code d'autorisation pour un utilisateur connecté |
| **8** — stores en mémoire         | Codes et clients OAuth déplacés en Redis (création de `BlRedisModule`)                     | Une `Map` en mémoire casse dès qu'il y a plus d'une instance : le code créé par l'une est inconnu de l'autre                             |
| **10** — tokens MCP               | Access token à 1 h, refresh token OAuth rotatif, `POST /oauth/revoke`                      | C'est ici que **les 7 derniers jours disparaissent** : un token MCP volé restait valable une semaine, sans aucun moyen de l'invalider    |
| **13** — découverte par ressource | Un document de métadonnées par ressource protégée (RFC 9728 §3.1)                          | Avec deux MCP, un client appelant l'un se faisait dire de demander l'audience de l'autre                                                 |

Le cloisonnement d'audience a été fait **sans drapeau d'activation**. Une vérification de
sécurité optionnelle est désactivée par défaut, donc inutile.

Le point 10 n'a coûté que du câblage, et c'est le résultat d'une décision prise en
amont : la table `refresh_token`, écrite pour les sessions navigateur, portait déjà
`kind`, `client_id` et `resource`. Le MCP réutilise donc **la même ligne, la même
rotation atomique et le même cron de purge** — pas de second store à écrire, et un seul
endroit où la rotation peut être fausse. Deux invariants portent la sécurité du grant :

- **La `resource` est lue sur la ligne en base, jamais dans la requête.** C'est ce qui
  empêche un client autorisé sur un MCP de s'élever vers un autre au rafraîchissement.
  Une `resource` répétée dans le corps (RFC 8707 §2.2) est traitée comme une assertion à
  vérifier, et refusée si elle diverge — l'ignorer en silence laisserait le client croire
  qu'il détient une audience qu'il n'a pas.
- **`kind: 'oauth'` sépare les deux surfaces dans les deux sens.** Un refresh token de
  session ne devient pas un access token MCP, et réciproquement sur `/auth/refresh`.

Au passage, `expires_in` et la durée de signature étaient deux expressions distinctes qui
ne concordaient que parce que chacune lisait la même constante. Elles viennent maintenant
d'un seul getter. Et `/oauth/token` et `/oauth/revoke` sont passées de `@BlPublic()` à
`@BlPublicSecure()` : c'étaient les dernières routes non authentifiées sans throttler.

### `previous_token_hash`

Une colonne, **aucune requête de plus** : le `findOne` de la rotation devient un OU sur
les deux colonnes de hash, et le cas normal reste une lecture d'index. Si la
correspondance tombe sur `previous_token_hash`, le token a déjà été échangé — donc deux
acteurs détiennent la même chaîne, et **toute la session tombe** (OAuth 2.1 §4.14.2), y
compris le token en circulation.

Deux bornes assumées :

- **Une seule génération.** Un token vieux de deux rotations redevient non attribuable et
  ne reçoit qu'un 401. Remonter toute la chaîne demanderait une ligne par rotation, ce
  que le modèle une-ligne-par-session existe précisément pour éviter. La génération qui
  compte est la dernière, c'est celle qu'un voleur détient.
- **La course n'est pas un rejeu.** Deux requêtes simultanées avec le même token valide
  sont indiscernables d'un double envoi légitime : la seconde perd la course (0 ligne
  affectée) et reçoit un 401, sans tuer la session.

### Découverte par ressource (item 13)

RFC 9728 §3.1 insère le segment `.well-known` **entre l'hôte et le chemin de la
ressource** : le document de `https://hôte/mcp/community-doc` vit à
`https://hôte/.well-known/oauth-protected-resource/mcp/community-doc`. C'est cette
insertion — et pas une concaténation — qui permet à un hôte de servir un document par
ressource.

La note d'origine dans `TECHNICAL_DEBT.md` affirmait que `HnMcpResourceGuard` n'avait
besoin d'aucun changement. **C'était faux** : il annonçait une URL `resource_metadata`
fixe, donc tous les MCP pointaient vers le même document et la découverte par ressource
n'avait aucun point d'entrée. Le garde annonce maintenant le document de la ressource
réellement appelée.

Deux choses conservées volontairement : le document **sans chemin**, qui répond pour la
ressource principale (les clients antérieurs au découpage le demandent, et un document de
découverte qui renvoie 404 fait abandonner tout le flux), et le document du serveur
d'autorisation, qui reste global — il n'y a qu'un serveur d'autorisation.

Le garde avait par ailleurs **zéro test** alors qu'il valide signature et audience à
chaque appel MCP. C'est réparé.

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

Tous les items MCP numérotés sont traités, sauf les deux différés (12 et 14). Ce qui
suit est donc de la vérification et un chantier de fond.

### 1. La vérification des points 10 et 13

Le code est écrit et couvert en unitaire, mais **jamais éprouvé contre un vrai client**.
Le test qui compte : laisser Claude connecté plus d'une heure et s'en servir. Il doit
rafraîchir silencieusement. Tant que ça n'est pas fait, considérer ces deux points comme
« écrits », pas comme « vérifiés » — c'est la distinction que le reste de ce chantier a
appris à faire.

Deux choses à regarder en particulier, parce qu'un test unitaire ne peut pas les voir :

- **la route joker** `.well-known/oauth-protected-resource/*splat` est une syntaxe
  Express 5 ; un motif mal formé ne casse pas à la compilation, il casse au démarrage.
  Le motif a été validé contre `path-to-regexp` directement, pas seulement relu.
- **quel document Claude demande réellement** — le sans-chemin, le par-ressource, ou les
  deux. C'est ce qui dira si la forme sans chemin peut disparaître un jour.

### 2. Point 6 — `cli-auth`, en dernier

La dernière poche de 7 jours. Il n'est pas cassé aujourd'hui : le défaut du module JWT est
resté à 7 jours exprès, et seuls login / 2FA / MCP passent leur durée courte.

Direction retenue : le faire **hériter du flux OAuth** plutôt que garder son mécanisme
propre — son flow est déjà un device flow. À noter, son store est encore une `Map` en
mémoire, donc il souffre du problème multi-instances que l'item 8 vient de corriger ailleurs.

### 3. Différés volontairement

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
- **Idem côté MCP** : un access token en vol survit à `/oauth/revoke`, au plus 1 heure.
  Même cause, même raison de garder la durée courte. Un access token présenté à
  `/oauth/revoke` est donc un no-op, et l'endpoint répond quand même 200 (RFC 7009 §2.2
  l'exige).
- **Une réponse de rotation perdue déconnecte.** Depuis `previous_token_hash`, un client
  qui rejoue le token dont il n'a pas reçu le remplaçant ne prend plus un 401 mais perd
  toute sa session. C'est la recommandation OAuth 2.1 appliquée telle quelle, et le cas
  n'a rien de malveillant — il est simplement indiscernable du vol. Tolérable parce que le
  front sérialise ses rafraîchissements, à revoir si des déconnexions inexpliquées
  apparaissent.
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
- **Le `CREATE TABLE` inclut maintenant `previous_token_hash`.** Une base qui a déjà joué
  l'ancienne version — donc le local et la dev, où le flux a été validé au curl — a besoin
  de l'`ALTER` laissé en commentaire juste en dessous, index compris : sans l'index, le OU
  de la rotation devient un scan de table à chaque rafraîchissement. La prod n'a jamais vu
  la table, elle prend directement le `CREATE TABLE` complet.
- **Une déconnexion unique** pour les sessions existantes, qui portent un cookie de 7 jours
  sans refresh token. Elle s'étale sur jusqu'à 7 jours après le déploiement, donc pas de
  vague de reconnexions.

## Le trou dans la vérification

Les **18 assertions e2e** de `hn-auth.e2e.spec.ts` sont écrites et n'ont **jamais été
exécutées** : le conteneur `community-test-db` (port 3312) que `TESTING.md` documente
n'existe pas sur la machine de dev. C'est le seul endroit où le contrat est testé de bout en
bout, harnais HTTP compris. À lever avant tout déploiement.
