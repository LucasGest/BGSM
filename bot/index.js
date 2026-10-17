// Bot de statut du serveur La Survie des BGSM.
// Toutes les 5 minutes : interroge l'API publique mcstatus.io avec l'IP du serveur (rien à installer sur NitroServ),
// renomme un salon vocal (« 🟢 BGSM : 3 joueurs ») et met à jour un message dans un salon texte.
const fs = require('fs')
const path = require('path')
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js')

// ---------- Réglages : variables d'environnement (Render) ou fichier .env (sur ton PC, voir .env.exemple)
const env = Object.assign({}, process.env)
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/).forEach(l => {
    const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) env[m[1]] = m[2]
  })
} catch (e) {}
if (!env.DISCORD_TOKEN) { console.error('DISCORD_TOKEN manquant (variable Render ou fichier .env).'); process.exit(1) }

// ---------- Petite page web : Render (offre gratuite) exige un service web, et une visite régulière le garde éveillé
let dernier = null
require('http').createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end(dernier ? `BGSM : ${dernier}` : 'Bot BGSM en route')
}).listen(env.PORT || 3000)

const ADRESSE = env.SERVEUR || '109.239.152.220:25665'
const SALON_VOCAL = env.SALON_VOCAL_ID       // salon renommé avec le statut (facultatif)
const SALON_TEXTE = env.SALON_TEXTE_ID       // salon où le message de statut est mis à jour (facultatif)
const INTERVALLE = 5 * 60 * 1000             // Discord limite le renommage d'un salon à 2 fois par 10 minutes
const FICHIER_MSG = path.join(__dirname, 'message_id.txt')

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

async function lireStatut() {
  try {
    const r = await fetch(`https://api.mcstatus.io/v2/status/java/${ADRESSE}`)
    const d = await r.json()
    return {
      enLigne: !!d.online,
      joueurs: d.players ? d.players.online : 0,
      max: d.players ? d.players.max : 0,
      noms: d.players && d.players.list ? d.players.list.map(p => p.name_clean) : []
    }
  } catch (e) {
    console.error('API mcstatus injoignable :', e.message)
    return null
  }
}

async function majSalonVocal(s) {
  if (!SALON_VOCAL) return
  const salon = await client.channels.fetch(SALON_VOCAL).catch(() => null)
  if (!salon) return console.error('Salon vocal introuvable (SALON_VOCAL_ID).')
  const nom = s.enLigne ? `🟢 BGSM : ${s.joueurs} joueur${s.joueurs > 1 ? 's' : ''}` : '🔴 BGSM : hors ligne'
  if (salon.name !== nom) await salon.setName(nom).catch(e => console.error('Renommage impossible :', e.message))
}

async function majMessage(s) {
  if (!SALON_TEXTE) return
  const salon = await client.channels.fetch(SALON_TEXTE).catch(() => null)
  if (!salon) return console.error('Salon texte introuvable (SALON_TEXTE_ID).')
  const embed = new EmbedBuilder()
    .setTitle('La Survie des BGSM')
    .setColor(s.enLigne ? 0x3f9d3a : 0xb33a2a)
    .addFields(
      { name: 'Statut', value: s.enLigne ? '🟢 En ligne' : '🔴 Hors ligne', inline: true },
      { name: 'Joueurs', value: s.enLigne ? `${s.joueurs}` : '—', inline: true },
      { name: 'Adresse', value: `\`${ADRESSE}\``, inline: true }
    )
    .setFooter({ text: 'Mis à jour toutes les 5 minutes' })
    .setTimestamp(new Date())
  if (s.enLigne && s.noms.length) embed.addFields({ name: 'Connectés', value: s.noms.join(', ').slice(0, 1000) })

  // On réutilise toujours le même message : son identifiant est gardé dans message_id.txt,
  // et si ce fichier a disparu (Render efface les fichiers à chaque redémarrage), on cherche le dernier message du bot
  let id = null
  try { id = fs.readFileSync(FICHIER_MSG, 'utf8').trim() } catch (e) {}
  let ancien = id ? await salon.messages.fetch(id).catch(() => null) : null
  if (!ancien) {
    const recents = await salon.messages.fetch({ limit: 50 }).catch(() => null)
    ancien = recents ? recents.find(m => m.author.id === client.user.id && m.embeds.length) || null : null
    if (ancien) fs.writeFileSync(FICHIER_MSG, ancien.id)
  }
  if (ancien) await ancien.edit({ embeds: [embed] })
  else {
    const msg = await salon.send({ embeds: [embed] })
    fs.writeFileSync(FICHIER_MSG, msg.id)
  }
}

async function tour() {
  const s = await lireStatut()
  if (!s) return
  await majSalonVocal(s).catch(e => console.error(e.message))
  await majMessage(s).catch(e => console.error(e.message))
  dernier = s.enLigne ? `en ligne, ${s.joueurs} joueur(s)` : 'hors ligne'
  console.log(new Date().toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris' }), dernier)
}

client.once('clientReady', () => {
  console.log(`Connecté en tant que ${client.user.tag}. Serveur suivi : ${ADRESSE}`)
  tour()
  setInterval(tour, INTERVALLE)
})

client.login(env.DISCORD_TOKEN)
