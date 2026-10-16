# Assets

## Déjà en place ✅
| Fichier | Rôle |
|---|---|
| `decor.webp` | La rue de Boston : fond du hero en parallaxe et de la fin |
| `decor-blur.webp` | Version légère et floutée, en fond derrière le guide |
| `coureur.webp`, `rodeur.webp`, `claqueur.webp`, `colosse.webp` | Monstres détourés (fond transparent) |
| `smudge.webp` | Tache grise au pinceau derrière les détourés, comme dans le guide |
| `paper-edge.webp` | Bords gauche/droit de la feuille : déchirés, crasse grise et rouille |
| `grime.webp` | Salissures et rayures posées sur le papier et sur les captures |
| `shot-mask.png` | Masque aux bords rongés des captures |
| `guide-cover.webp` | Couverture du guide BradyGames, sans fond (fin du site) |
| `firefly.webp` | Logo des Lucioles (chargement et fin). Favicon : `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png` à la racine du site |
| 8 captures `coureurs-1.webp` … `colosses-2.webp` | Deux images par infecté |
| `sounds/coureur.mp3`, `rodeur.mp3`, `claqueur.mp3`, `colosse.mp3` | Sons des 4 monstres (tirés de `Sounds/`, volume égalisé, silence du début du rôdeur coupé). On ne les entend qu'en maintenant Espace (mode écoute) : celui de la section affichée monte en fondu |

## Pour remplacer une image
**Captures du jeu** (format 16/9, en `.webp` : dépose tes JPG/PNG puis lance `python convertir-webp.py`). Tant qu'elles manquent, le site affiche des recadrages du décor.
Toutes les captures sont en place ✅ : `intro-1.webp` (le claqueur de l'introduction) et les 8 captures des infectés.

Le plus fidèle : reprendre les captures de la double page du guide (p.40-41).

**Musique** ✅ : `musique.mp3`, le thème de Gustavo Santaolalla (tiré de `Sounds/`), en boucle comme nappe de fond, bien en dessous des infectés (22 %). Elle s'efface presque totalement en mode écoute.
Le vent, le bourdon d'ambiance et le battement de cœur du mode écoute sont générés par le code.

> Pour un nouveau détouré : un PNG à fond transparent, au détourage propre, puis `python convertir-webp.py` (la transparence est conservée).
