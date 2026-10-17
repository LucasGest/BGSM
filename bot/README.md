# Bot de statut — La Survie des BGSM

Affiche l'état du serveur Minecraft dans Discord, toutes les 5 minutes :
- renomme un salon vocal : `🟢 BGSM : 3 joueurs` / `🔴 BGSM : hors ligne` ;
- met à jour un message de statut dans un salon texte (joueurs connectés, adresse).

Le statut vient de l'API publique mcstatus.io : rien à installer sur le serveur Minecraft.

## Variables

| Variable | Rôle |
|---|---|
| `DISCORD_TOKEN` | Token du bot (secret) |
| `SERVEUR` | Adresse du serveur, `109.239.152.220:25665` |
| `SALON_VOCAL_ID` | Salon vocal renommé avec le statut |
| `SALON_TEXTE_ID` | Salon texte du message de statut |

Sur ton PC : copie `.env.exemple` en `.env`, remplis-le, lance `lancer.bat`.

## Render (offre gratuite)

- Type : **Web Service**, runtime Node, build `npm install`, start `npm start`, plan Free.
- Variables : les 4 ci-dessus dans *Environment*.
- L'offre gratuite endort le service après 15 min sans visite : une sonde gratuite (UptimeRobot, toutes les 5 min) sur l'adresse `https://<ton-service>.onrender.com` le garde éveillé.
