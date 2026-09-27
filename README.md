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

Configurez l’adresse de contact dans `script.js`. Le formulaire ouvre le client e-mail de la personne ; les fichiers sélectionnés doivent être ajoutés manuellement au message. Les URLs publiques des projets Academy, des profils sociaux et les éventuels badges nominatifs doivent être ajoutés uniquement lorsque les adresses officielles sont fournies.
