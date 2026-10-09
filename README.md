# PersonalSite — Dr. Michel MAMA TOULOU

Site personnel professionnel consacré aux expertises Data, IA, Cloud et AI Security, à l’accompagnement et à la transmission.

## Structure

Le site est composé de pages HTML statiques, sans framework ni étape de build. Vercel sert la racine du dépôt et `vercel.json` active les URL propres. Les styles partagés sont dans `styles.css`, `premium.css`, `site-platform.css` et `monochrome.css`; les feuilles spécialisées couvrent les certifications, le contact et les expertises. La navigation et les interactions sont dans `script.js`.

Les pages incluent l’accueil, les expertises, À propos, les offres, le coaching, les certifications, les Insights, le contact, les projets et les ressources. `article-modele.html` est un gabarit, pas une page à indexer.

## Expérience du site

Le thème s’appuie sur une palette noir, blanc et gris. Les logos et badges sont désaturés ; les photographies restent en couleur. Le footer inclut les réseaux sociaux et le widget WhatsApp.

La page Coaching présente trois formules mensuelles : Le Cercle (50 €, collectif), Le Cap (75 €, 4 séances individuelles de 30 minutes) et L’Intensif (100 €, 4 séances individuelles de 1 h 30). Le calendrier permet de demander des séances les week-ends ; les réservations sont en attente de confirmation.

Les articles prévoient les likes, les commentaires soumis à modération et le partage. Consultez `BLOG.md` pour publier un article.

## Supabase et e-mails

Les Edge Functions `contact-form`, `blog-engagement` et `coaching-booking` enregistrent les demandes et interactions côté serveur. Les clés secrètes restent dans les secrets Supabase ; la clé publishable seule est utilisée côté navigateur.

Après liaison de la CLI au projet, appliquer les migrations et déployer les fonctions :

```powershell
supabase link --project-ref gdgeghypyljichmzlbxv
supabase db push
supabase functions deploy contact-form --project-ref gdgeghypyljichmzlbxv
supabase functions deploy blog-engagement --project-ref gdgeghypyljichmzlbxv
supabase functions deploy coaching-booking --project-ref gdgeghypyljichmzlbxv
```

Configurer `RESEND_API_KEY` et `SUPABASE_SECRET_KEYS` dans les secrets des fonctions Supabase. Les demandes de coaching sont enregistrées comme demandes en attente ; la confirmation est manuelle. Les commentaires de blog sont publiés après approbation dans Supabase.

## Référencement

`robots.txt` référence `sitemap.xml`. Les pages canoniques et métadonnées sont dans leur `<head>`. Le gabarit d’article est exclu du sitemap.