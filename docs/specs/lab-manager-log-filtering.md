# Filtrage des logs conteneur côté lab manager

**La spec canonique est [`Constellab/lab-manager#11`](https://github.com/Constellab/lab-manager/issues/11)**,
dans le repo où elle est implémentée. Ce fichier ne la duplique pas : deux copies d'un
contrat divergent toujours.

Ce qui suit est ce que la space API doit en savoir, côté consommateur.

## Pourquoi

Le serveur MCP de la space API expose les logs de conteneur à un modèle pour diagnostiquer
un data lab qui ne démarre pas (#78). Aujourd'hui `GET /docker-containers/{name}/logs`
renvoie le blob complet sans aucun paramètre (`cn-external-lab-manager-api.service.ts:235`).
Un blob de 50 000 lignes sature la fenêtre de contexte du modèle, et filtrer côté space API
transférerait quand même l'intégralité du blob depuis le lab à chaque itération.

## Ce que la space API appelle

Une route nouvelle, `GET /docker-containers/{name}/logs/search`, et non des query params sur
la route existante — un vieux lab manager les ignorerait en silence et on croirait avoir
filtré. Elle accepte `tail`, `since`, `until`, `pattern`, `patternMode`, `caseSensitive`,
`contextLines`, `errorsOnly`, `maxBytes`, et renvoie le champ `logs` existant enrichi de
`totalLines`, `matchedLines`, `returnedLines`, `truncated`, `truncatedBy` et `window`.

`/logs` et `/logs/error` restent inchangées : la console web les consomme.

## Détection de capacité

`lab_container_logs` appelle `/logs/search` **en optimiste** et branche sur le 404. Pas de
comparaison de version : `CnLabManagerStatus.version` n'est qu'un proxy de la capacité, et
un lab manager patché ou un déploiement custom fait mentir la comparaison.

Sur 404, dégradation vers `tail` seul — un `split('\n').slice(-n)` sur le blob de `/logs`,
sans regex — et `filteredLocally: true` dans la réponse du tool, pour que le modèle sache
que `pattern`, `since` et `contextLines` n'ont pas été appliqués.

## Le piège à connaître

L'ordre des opérations impose `pattern` **avant** `tail` : ce qu'il faut est « les 200
dernières lignes qui matchent », pas « le motif dans les 200 dernières lignes ». Sur un
conteneur qui boucle en erreur depuis une heure, la seconde lecture ne renvoie rien. C'est
détaillé dans l'issue, et c'est la partie la plus facile à implémenter de travers.
