# Réponse de mise à jour du contenu d'une documentation

**La spec canonique est [`Constellab/monorepo-back#87`](https://github.com/Constellab/monorepo-back/issues/87)**,
où le changement est implémenté. Ce fichier ne la duplique pas : deux copies d'un contrat
divergent toujours.

Ce qui suit est ce que les appelants — l'UI Community et la CLI Python `gws community` —
doivent en savoir.

## Pourquoi

Le serveur assainit désormais le rich text à l'écriture (whitelist de balises inline, schémas
d'URL, `code.language`, forme du `hint`). Il nettoie sans jamais refuser, et remonte la liste
de ce qu'il a retiré. Un refus casserait l'éditeur pour un utilisateur qui n'a rien fait de
mal ; un silence laisserait un modèle croire qu'il a écrit ce qu'il a écrit.

Cet avertissement doit voyager avec la réponse. La documentation y est donc emballée au lieu
d'être renvoyée nue.

## Ce qui change

`PUT documentation/content/:id` renvoyait l'entité `HnDocumentation` à la racine. Elle est
maintenant sous `documentation`, accompagnée de `warnings` :

```
// avant
{ id, title, content, path, completePath, order, ... }

// après
{
  documentation: { id, title, content, path, completePath, order, ... },
  warnings: string[],
  revision: string
}
```

`documentation` porte exactement les mêmes champs qu'avant, inchangés. `warnings` est un
tableau de phrases prêtes à lire, une par retrait, vide quand le contenu était déjà valide —
ce qui est le cas normal depuis l'éditeur.

Aucune autre route ne change. La lecture n'est pas touchée : le contenu déjà en base qui ne
respecte pas les règles n'est ni réparé ni refusé.

## Le verrou optimiste (#88)

Le corps de la requête accepte un champ **optionnel** `revision`, à côté du rich text : la
revision à laquelle l'appelant a lu le contenu. Si le document a changé depuis, l'écriture est
refusée avec un **409**, et le message nomme les deux revisions. Ne rien envoyer conserve le
comportement historique — le dernier qui écrit gagne — donc rien ne casse pour un appelant qui
n'en a jamais entendu parler.

`revision` dans la réponse est celle du contenu qui **vient d'être stocké**, pas de celui qui a
été envoyé : l'assainisseur a pu le nettoyer, et c'est contre le contenu réellement en base que
la prochaine écriture se verrouille. Un appelant qui chaîne deux éditions la reprend telle
quelle plutôt que de relire la page.

Sans ce verrou, un push CLI écrase silencieusement une édition MCP concurrente, exactement là
où les deux chemins d'écriture se rencontrent — et le modèle qui l'a écrite s'entend dire que
l'enregistrement a réussi.

## Ce que les appelants doivent faire

**L'UI** lit `documentation` là où elle lisait la racine. Elle peut ignorer `warnings` ; les
afficher n'est utile que si l'éditeur laisse passer du contenu collé depuis l'extérieur. Elle
peut ignorer `revision` aussi : l'éditeur a déjà son propre verrou côté client.

**La CLI `gws community`** lit `documentation` de même. Elle peut en plus se voir refuser du
contenu qu'elle acceptait, là où sa propre validation était plus laxiste : `warnings` est
l'endroit où le dire à l'utilisateur, sans quoi le nettoyage est invisible. C'est aussi elle
qui a le plus à gagner à envoyer `revision` : c'est le seul endroit où un push écrase une
édition faite entre-temps ailleurs.

**Le futur MCP** (#89) renvoie `warnings` au modèle telles quelles, et envoie la `revision`
que `community_doc_read_blocks` lui a donnée.

## Le piège à connaître

L'ancienne forme et la nouvelle n'ont aucun champ en commun à la racine. Un appelant non mis à
jour ne reçoit donc pas une erreur mais des `undefined` : un titre vide, un contenu absent, et
un enregistrement qui a pourtant réussi côté serveur. C'est la raison pour laquelle ce
changement doit être déployé de front avec ses appelants, et non derrière un drapeau.
