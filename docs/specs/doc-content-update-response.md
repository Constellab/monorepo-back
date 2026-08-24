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
  warnings: string[]
}
```

`documentation` porte exactement les mêmes champs qu'avant, inchangés. `warnings` est un
tableau de phrases prêtes à lire, une par retrait, vide quand le contenu était déjà valide —
ce qui est le cas normal depuis l'éditeur.

Aucune autre route ne change. La lecture n'est pas touchée : le contenu déjà en base qui ne
respecte pas les règles n'est ni réparé ni refusé.

## Ce que les appelants doivent faire

**L'UI** lit `documentation` là où elle lisait la racine. Elle peut ignorer `warnings` ; les
afficher n'est utile que si l'éditeur laisse passer du contenu collé depuis l'extérieur.

**La CLI `gws community`** lit `documentation` de même. Elle peut en plus se voir refuser du
contenu qu'elle acceptait, là où sa propre validation était plus laxiste : `warnings` est
l'endroit où le dire à l'utilisateur, sans quoi le nettoyage est invisible.

**Le futur MCP** (#89) renvoie `warnings` au modèle telles quelles.

## Le piège à connaître

L'ancienne forme et la nouvelle n'ont aucun champ en commun à la racine. Un appelant non mis à
jour ne reçoit donc pas une erreur mais des `undefined` : un titre vide, un contenu absent, et
un enregistrement qui a pourtant réussi côté serveur. C'est la raison pour laquelle ce
changement doit être déployé de front avec ses appelants, et non derrière un drapeau.
