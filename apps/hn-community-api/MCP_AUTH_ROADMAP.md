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

- ~~**Item 12** — RS256 / JWKS~~ → **traité (août 2026).** Les access tokens MCP sont signés
  en RS256, la moitié publique est publiée sur `/.well-known/jwks.json` et annoncée en
  `jwks_uri`. Les tokens de session restent symétriques sur `JWT_SECRET` : ils ne quittent
  jamais l'app qui les émet, donc login et `cli-auth` n'ont pas bougé — contrairement à ce
  que l'item d'origine annonçait. Ce qui reste pour sortir les serveurs de ressources de
  cette app (#74/#77) est la **distribution** des clés, plus la signature.
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

## La bascule : la Community n'émet plus rien (#77)

C'est le point d'arrivée du chantier parent. **Le serveur d'autorisation n'est plus ici.**
Il est sur la Space API, il est unique, et cette application n'est plus qu'un Resource
Server (ADR-0001).

Ce qui disparaît d'ici : `/oauth/register`, `/oauth/authorize`, `/oauth/token`,
`/oauth/revoke`, les routes de consentement, le document de métadonnées du serveur
d'autorisation, `/.well-known/jwks.json`, les stores de clients et de codes, le module
`src/app/oauth/`, et les lignes `refresh_token` de type `oauth`.

Ce qui reste, inchangé : le MCP, son guard, ses documents de découverte — qui désignent
désormais la Space API — et **tout le login navigateur**. Les tokens de session, leurs
refresh tokens et leurs lignes en base ne bougent pas d'un octet. Seule l'émission de
tokens machine déménage.

Ce qui change dans la vérification : `BlJwtAsymmetricVerifier` remplace la méthode qui
vivait sur le service de signature, et sa source de clés est `BlJwtRemoteKeyStore`, qui va
chercher le jeu de clés publié par la Space API. Trois propriétés portent la sécurité de ce
morceau :

- **Le fetch est paresseux.** La Space API injoignable ne doit pas empêcher cette
  application de démarrer : ce serait transformer une dépendance qui ne concerne que les
  appels MCP en une dépendance du login navigateur. Le prix est le premier appel MCP après
  un redémarrage, qui paie l'aller-retour.
- **Un échec de fetch refuse, il n'accepte jamais.** Et il ne réessaie pas à chaque appel :
  un cooldown d'une minute, sinon un endpoint non authentifié devient un générateur de
  trafic vers une application déjà en panne.
- **L'algorithme reste épinglé à RS256**, exactement comme quand les clés étaient locales.
  La bascule est une rupture nette, sans fenêtre où les deux algorithmes seraient acceptés —
  cette fenêtre _est_ l'attaque par confusion d'algorithme, et rien de tout ceci n'étant en
  production, il n'y avait rien à migrer.

**Le pilote se rejoue.** Les enregistrements de clients existants sont recréés : ils
pointaient sur un émetteur qui n'existe plus, et l'URL de l'émetteur fait partie de ce qu'un
client enregistre. Un utilisateur qui connecte un client au MCP Community est maintenant
envoyé sur la page de login de la **Space API** — même compte, même mot de passe, autre
hôte. C'est visible, c'est voulu, et c'est inhérent au fait d'avoir un seul serveur
d'autorisation.

**Vérification.** `hn-resource-server.e2e.spec.ts` remplace les deux suites OAuth d'ici : il
substitue le jeu de clés publié (la Space API est une autre application, aucune suite ne
démarre les deux) et assied le reste sur du vrai — le guard, l'audience, l'épinglage
d'algorithme, les documents de découverte, l'absence des endpoints supprimés, et le login
navigateur intact. La substitution passe par `BlTestAuthorizationServer`, la **même** fixture
que la suite de la Space API utilise pour vérifier ses propres tokens : une dérive d'un côté
fait rougir l'autre, sans avoir à démarrer les deux applications ensemble.

Ce que ça ne couvre pas, et qui reste à faire à la main : un vrai client Claude, connecté
aux deux MCP, laissé tourner au-delà de la durée de vie d'un access token. C'est la leçon
notée plus bas — écrit n'est pas exécuté — et elle vaut aussi pour un chemin qui traverse
deux applications qu'aucune suite ne fait tourner ensemble.

### ⚠️ Deux valeurs qui doivent coïncider au caractère près

`SPACE_API_URL` **de la Community** et `API_URL` **de la Space API** — qui devient son
`issuer` OAuth et la racine de son jeu de clés — doivent être **exactement** la même chaîne.
Ce sont deux variables posées indépendamment, dans deux applications, et **aucun test ne peut
les comparer** : aucune suite ne démarre les deux. C'est le seul couplage de la bascule
qu'une relecture doit vérifier à la main.

Ce qu'un décalage produit, dans l'ordre où on le rencontre :

- **Une barre oblique finale, ou http contre https** : le document de découverte de la
  Community désigne un hôte que le client résout quand même, mais le `jwks_uri` fetché ne
  répond pas comme prévu, ou l'`issuer` enregistré par le client ne correspond plus. Le
  client tourne en rond à la découverte.
- **Un hôte franchement différent** : le client est envoyé s'authentifier au mauvais endroit,
  revient avec un token signé par des clés que la Community ne connaît pas, et **tous les
  appels MCP prennent un 401** — alors que les deux applications, prises séparément, ont
  l'air en parfait état. C'est le mode de panne le plus coûteux à diagnostiquer de tout ce
  chantier, parce que rien n'est en erreur nulle part.

Rien ne détecte ça au démarrage non plus : la Community ne fetche le jeu de clés qu'au
premier appel MCP, délibérément (cf. plus haut). Vérifier les deux valeurs côte à côte fait
partie du déploiement, au même titre que la migration SQL.

### ⚠️ Et une troisième, dans l'autre sens : `COMMUNITY_API_URL` de la Space API

La bascule a laissé un trou qui n'est apparu qu'en pré-prod : la Space API doit **connaître**
la Resource de la Community pour accepter d'émettre un token pour elle. La liste des Resources
pour lesquelles un token peut être frappé appartient à l'émetteur, et rien dans la
configuration de la Community ne peut l'y ajouter.

Elle y est maintenant, sous `remoteResources` dans `configureResourceServerModule`
(`cn-app.module.ts`), assemblée depuis **`COMMUNITY_API_URL` de la Space API** et le chemin
`mcp/community-doc`. Deux conséquences au déploiement :

- **`COMMUNITY_API_URL` de la Space API doit être exactement l'`API_URL` de la Community** —
  même schéma, même hôte, à la barre oblique près. La comparaison est faite verbatim sur
  l'identifiant complet. Un décalage donne, au `/authorize`, un redirect
  `error=invalid_target` avec `missing or unknown resource` : le client n'obtient jamais
  d'écran de consentement, et les deux applications ont l'air saines prises séparément. C'est
  le symptôme exact qu'on a eu en pré-prod, et il ne se distingue pas de « l'entrée est
  absente ».
- **`COMMUNITY_API_URL` est désormais lue au démarrage** de la Space API, par
  `getConfigString`, qui **lève** quand la valeur manque. Elle était déjà obligatoire au
  runtime (bricks, lab manager) mais son absence ne se voyait qu'au premier appel ; elle
  empêche maintenant l'application de démarrer. Sur un environnement où elle est déjà posée —
  tous ceux qui parlent à la Community — il n'y a rien à faire.

Le chemin, lui, est dupliqué de part et d'autre (`HN_MCP_COMMUNITY_DOC_RESOURCE_PATH` et
`CN_MCP_COMMUNITY_DOC_RESOURCE_PATH`) : deux déployables, aucun n'importe le code de l'autre.
Le changer d'un côté seulement produit le même `invalid_target`.

Ce que la Space API n'accorde **pas** pour autant : la Resource distante n'a aucun document de
découverte chez elle, et son `BlResourceGuard` ne protège rien avec — un token frappé pour la
Community ne vaut rien sur la Space API. C'est la distinction `servesResource` /
`isKnownResource` dans `BlResourceRegistry`, et elle est vérifiée par les specs de la lib.

---

## Les pièges au déploiement

> ⚠️ **Cette section décrit l'état d'avant la bascule (#77).** Les deux variables
> ci-dessous ne sont plus lues par la Community : elles sont désormais celles de la Space
> API, et peuvent être retirées de son environnement CapRover. Le texte est conservé parce
> qu'il reste exact pour l'application qui les lit maintenant. La seule variable dont la
> Community dépend pour l'OAuth est **`SPACE_API_URL`**, qui était déjà obligatoire pour le
> login, et qui désigne maintenant aussi le serveur d'autorisation et l'hôte du jeu de clés.
>
> La migration SQL de la bascule (`DELETE` des refresh tokens `oauth`, `DROP` de
> `oauth_grant`) se joue **après** le déploiement, pas avant : tant que l'ancien code tourne,
> ces lignes sont encore celles qu'il lit.

### ⚠️ Deux variables d'environnement sont obligatoires

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

**`MCP_JWT_PRIVATE_KEY_BASE64` doit être définie dans CapRover, en pré-prod comme en prod.**

C'est la clé privée RSA qui signe les access tokens MCP, en PEM encodé base64 (le PEM est
multi-lignes et les variables d'environnement perdent les retours à la ligne). En générer
une par environnement, jamais celle du repo :

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 | base64 -w0
```

Même classe de blocage que ci-dessus : absente, `getConfigString` lève et **l'app ne démarre
pas** ; présente mais illisible, `BlJwtKeyStore` lève à la construction de l'injecteur et
l'app ne démarre pas non plus. C'est voulu — l'alternative serait de découvrir le problème
plus tard sous forme d'appels MCP rejetés en silence, ce qui ressemble à un bug côté client.

Ce n'est **pas** `JWT_SECRET`, et les deux ne doivent pas partager de matière : `JWT_SECRET`
signe les tokens de session et ne quitte jamais l'app, alors que la moitié publique de
celle-ci est publiée (ADR-0001).

`MCP_JWT_PREVIOUS_PRIVATE_KEY_BASE64` est **optionnelle** et ne sert qu'à une rotation : la
clé sortante y reste publiée et acceptée le temps que les tokens en vol expirent, puis on la
retire au déploiement suivant. Y remettre la clé courante fait échouer le démarrage — ce
serait croire une rotation en cours alors que rien n'a tourné.

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

## Le trou dans la vérification — comblé

Les e2e ont tourné. **19 assertions au vert sur 2 suites**, et le passage de « écrites »
à « exécutées » a coûté trois corrections que la relecture n'avait pas vues :

- **Deux dépendances déclarées mais absentes de `node_modules`** (`@rekog/mcp-nest`,
  `zod`). Le e2e boote `HnAppModule` en entier, donc il ne démarrait pas du tout. Un
  `bun install --frozen-lockfile` a suffi — le lockfile les épinglait déjà.
- **La suite était structurellement incompatible avec le rate limiting livré à côté
  d'elle.** `/auth/login` est plafonnée à 10/min par IP, la suite s'y connecte 11 fois
  en une vingtaine de secondes depuis la même IP : le 11ᵉ login prenait un 429. Le
  throttler fonctionnait donc exactement comme documenté — c'est la suite qui ne
  pouvait pas passer. Résolu en désactivant le throttler par défaut dans le harnais
  (`overrideGuard`), avec réactivation explicite là où c'est le sujet.
- **Deux suites e2e en parallèle droppent la même base.** `maxWorkers: 1` posé avant
  que ça morde.

Au passage, le rate limiting a enfin une couverture automatisée
(`hn-throttle.e2e.spec.ts`) : le plafond de 10 sur `/auth/login`, le fait qu'il **reste**
fermé une fois déclenché (`blockDuration` retombe sur `ttl`), et le fait que
`/auth/refresh` soit bien sur le plafond global et non sur celui des identifiants. C'est
le défaut du facteur 1000 qui rendait ça nécessaire : il était dans le _sens_ d'une
valeur de configuration, donc aucun test unitaire ne pouvait le voir — un mock aurait
porté le même contresens.

La leçon vaut d'être gardée : **écrit n'est pas exécuté.** Trois défauts réels dormaient
derrière une suite relue et jamais lancée, dont un qui empêchait le harnais de démarrer.
C'est le même écart que celui qu'on a documenté partout ailleurs entre une vérification
contre des mocks et une vérification contre l'infrastructure — et c'est pourquoi les
points 10 et 13 restent marqués « écrits, pas vérifiés » jusqu'au test avec un vrai
client Claude.
