# La Survie des BGSM — site du serveur

Site statique du modpack *La Survie des BGSM* (Minecraft 1.21.1, NeoForge), en ligne sur https://surviebgsm.vercel.app/

| Page | Contenu |
|---|---|
| `index.html` | Page d'attente : compte à rebours jusqu'au 17/10/2026 20h00 (Paris), puis redirection vers l'accueil |
| `accueil.html` | Accueil : présentation, comment rejoindre |
| `mods.html` | La liste des ~200 mods, par thème, avec recherche (données : `assets/mods.json`) |
| `serveur.html` | Le but du serveur : l'Étoile brisée, l'histoire en 8 actes, la progression, les événements, le Démiurge |
| `parametrage.html` | Réglages du client : RAM, vidéo, shaders, PC, diagnostic spark |

`assets/mods.json` est généré à partir du dossier `mods` du pack (script `gen_site_mods.py`, hors de ce dépôt).
Pas d'étape de build : Vercel sert les fichiers tels quels (`vercel.json` active les URL sans `.html`).

Avant l'ouverture, les pages du site renvoient vers le compte à rebours. Aperçu : ajouter `?apercu` à l'adresse (valable toute la visite).
