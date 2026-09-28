# PersonalSite — Dr. Michel MAMA TOULOU

Site personnel statique consacré aux expertises Data, AI, Cloud, AI Security, transformation et transmission.

## Stack et développement

Le site utilise des fichiers HTML indépendants, `styles.css`, des feuilles spécialisées et `script.js`. Il n’y a ni framework, ni dépendances NPM, ni commande de build : Vercel sert les fichiers de la racine avec les URLs propres configurées dans `vercel.json`.

## Pages

- Accueil, Expertises et À propos
- AI Security, Agentic AI, Technology stack, Frameworks et Industries
- Réalisations (trames éditoriales sans références ou résultats inventés)
- Accompagnements, Coaching, Reconversion, Entreprises, Formations, AI Transformation et AI Productivity
- Academy et Ressources (projets/ressources indiqués en développement ou à venir)
- Certifications, Insights/Blog et Conférences
- Contact

Les pages partagent une identité visuelle dans `styles.css`, `premium.css` et `site-platform.css`. La navigation et les interactions se trouvent dans `script.js`. Les pages restent éditables directement en HTML pour garder l’accès au contenu sans JavaScript.

## Blog

Consultez `BLOG.md` pour publier une page article et l’ajouter à la liste. Ajoutez également la nouvelle URL dans `sitemap.xml` et renseignez catégorie, date réelle, temps de lecture, métadonnées et liens associés. La page actuelle inclut recherche et filtres ; un filtre sans article publié affiche un message explicite.

## Déploiement Vercel

Importez `Michel-MAMA/PersonalSite` dans Vercel, avec la racine du dépôt et le framework **Other**. Aucun build n’est nécessaire. `vercel.json` active les URLs sans suffixe `.html`; `robots.txt` référence `sitemap.xml`.

## Avant publication

Le formulaire envoie les demandes vers la fonction Supabase `contact-form`, qui les enregistre dans la table `contact_requests` et dépose les pièces jointes dans le bucket privé `contact-attachments`. Le schéma SQL est dans `supabase/migrations/202609280001_contact_requests.sql`. Pour activer les notifications par e-mail, configurez `RESEND_API_KEY` parmi les secrets de la fonction Supabase après avoir créé et vérifié un domaine d’envoi Resend. La clé Supabase publishable dans `script.js` est prévue pour le navigateur ; ne placez jamais une clé Supabase secrète dans le code client.
