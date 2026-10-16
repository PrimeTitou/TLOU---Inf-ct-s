# The Last of Us : Les Infectés

Transposition numérique de la double page « Les Infectés » (p. 40-41) du guide officiel *The Last of Us*, BradyGames *Signature Series*, de Michael Owen et Kenny Sims.

Projet de direction artistique, BUT MMI 3 · Thierry Vannoye.

## Le site

- Le guide posé dans une rue de Boston envahie par la végétation, en parallaxe.
- Les quatre stades de l'infection (coureur, rôdeur, claqueur, colosse), textes et mise en page repris du livre.
- **Mode écoute** : maintenir `Espace` (ou le bouton sur mobile) pour entendre l'infecté de la fiche affichée.
- Musique du jeu en fond, égaliseur dans le bouton son.

## Lancer en local

Site statique (HTML, CSS, JS), sans build. Pour que le son et l'égaliseur marchent pleinement, l'ouvrir via un petit serveur :

```
python -m http.server 8000
```

puis http://localhost:8000

## Déploiement

Sur Vercel : importer le repo, preset **Other**, aucune commande de build, dossier racine `/`.

---

Projet étudiant, non commercial. *The Last of Us* © Sony Interactive Entertainment / Naughty Dog. Guide © BradyGames. Musique : Gustavo Santaolalla.
