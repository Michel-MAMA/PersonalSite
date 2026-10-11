# PersonalSite — Dr. Michel MAMA TOULOU

Site professionnel consacré aux expertises Data, IA, Cloud et AI Security, à l’accompagnement et à la transmission.

## Organisation

Les 24 pages éditoriales restent des fichiers HTML autonomes à la racine. Les éléments communs (navigation, footer social, widget WhatsApp) sont définis une seule fois dans `components/site-shell.mjs` et insérés au build. Les styles restent dans les feuilles CSS. `script.js` est le point d’entrée ES modules : il initialise la navigation, les effets des cartes et WhatsApp, puis charge les fonctionnalités présentes dans la page.

Le générateur `build.mjs` utilise uniquement les modules intégrés à Node.js. Il transforme les marqueurs des pages en HTML complet, puis copie les CSS, scripts et assets dans `dist/`. Le visiteur reçoit donc du HTML statique complet ; le header et le footer ne dépendent pas d’un chargement asynchrone.

## Développement et déploiement

Construire le site localement :

```powershell
node build.mjs
```

Vercel utilise la commande `node build.mjs` et publie le répertoire `dist/`. Aucun paquet npm ni framework n’est nécessaire. `cleanUrls` active les URL sans extension. `robots.txt` référence le sitemap public.

## JavaScript et vérifications

- `assets/js/navigation.js`, `appearance.js` et `whatsapp.js` : interactions communes.
- `assets/js/contact.js`, `blog.js`, `engagement.js` et `booking.js` : fonctionnalités chargées à la demande.
- `assets/js/api.js` : URL, clé publishable, en-têtes et erreurs des appels Supabase ; les formulaires multipart gardent leur boundary navigateur.
- `assets/js/booking-rules.js` : formules, horaires et validation des séances.
- `components/render-page.mjs` : rendu et validation des marqueurs partagés avant remplacement de `dist/`.

Aucune dépendance à installer. Avec Node.js 22 ou ultérieur :

```powershell
node build.mjs
node --test
node scripts/check-site.mjs
node scripts/serve.mjs
```

Ouvrir ensuite `http://127.0.0.1:4173`. Les modules JavaScript doivent être servis en HTTP ; l’ouverture directe en `file://` n’est pas adaptée. Si npm est disponible, `npm run check` regroupe le build, les tests et la vérification des liens ; `npm run preview` lance le serveur local.

Les tests couvrent les règles de réservation, le rendu partagé, la navigation active et le client API avec réseau simulé. Le contrôle du site vérifie les liens locaux, les ancres et les imports des modules sur toutes les pages générées. Ces contrôles ne déclenchent aucun envoi réel de formulaire ou d’e-mail.

## Pages et contenus

Les pages incluent l’accueil, expertises, À propos, offres, coaching, certifications, Insights/blog, contact, réalisations, ressources et conférences. `article-modele.html` est un gabarit et ne figure pas dans le sitemap. Pour publier un billet, suivre `BLOG.md`, renseigner les métadonnées, puis ajouter son URL au sitemap.

## Coaching

- **Le Cercle** : 50 €/mois, séances collectives le week-end, jusqu’à dix personnes par créneau.
- **Le Cap** : 75 €/mois, quatre séances individuelles de 30 minutes.
- **L’Intensif** : 100 €/mois, quatre séances individuelles de 1 h 30.

Le calendrier collecte des demandes de réservation ; les créneaux restent en attente de confirmation.

## Supabase et e-mails

Les Edge Functions `contact-form`, `blog-engagement` et `coaching-booking` enregistrent les demandes et interactions côté serveur. Les secrets restent dans Supabase ; seule la clé publishable est utilisée côté navigateur.

Après liaison de la CLI au projet, appliquer les migrations et déployer les fonctions :

```powershell
supabase link --project-ref gdgeghypyljichmzlbxv
supabase db push
supabase functions deploy contact-form --project-ref gdgeghypyljichmzlbxv
supabase functions deploy blog-engagement --project-ref gdgeghypyljichmzlbxv
supabase functions deploy coaching-booking --project-ref gdgeghypyljichmzlbxv
```

Configurer `RESEND_API_KEY` et `SUPABASE_SECRET_KEYS` dans les secrets Supabase. Les commentaires sont publiés après modération dans Supabase. Le gabarit coaching enregistre des demandes en attente, sans paiement en ligne.
## Parcours visiteurs

L’accueil et la navigation proposent trois entrées : formation en entreprise, formation/reconversion individuelle et coaching carrière. Les six domaines sont détaillés dans expertises.html. Les liens de contact transmettent un paramètre parcours ou domaine à assets/js/contact-context.js ; les choix restent modifiables. parcours.css contient les styles de ces parcours et les ajustements de lisibilité et de navigation mobile. Les tarifs et le calendrier de coaching sont conservés.

L’observabilité & monitoring est le sixième domaine : métriques, journaux, traces, tableaux de bord, alertes et diagnostic des systèmes Data, IA et Cloud. Elle apparaît dans l’accueil, les formations, la reconversion, les offres entreprises, les expertises, la navigation et le contexte du formulaire.
