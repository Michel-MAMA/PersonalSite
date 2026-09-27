# Publier un article

Le site est statique : chaque article est une page HTML.

1. Copiez `article-modele.html` vers un nouveau fichier, par exemple `article-gouvernance-ia.html`.
2. Remplacez titre, résumé, catégorie, date réelle, temps de lecture et texte. Mettez à jour la description, les métadonnées Open Graph/Twitter, le canonical et le JSON-LD `BlogPosting`.
3. Dans `blog.html`, dupliquez le bloc `<article class="blog-feature">…</article>`, remplacez liens, titre, date, catégorie, résumé et `data-search`. Choisissez `data-category` parmi `data`, `ai`, `agentic-ai`, `ai-security`, `cloud`, `architecture`, `career` ou `certifications`.
4. Ajoutez l’URL propre de l’article à `sitemap.xml`. N’ajoutez pas le modèle `article-modele.html` : il est en `noindex`.
5. Si d’autres articles de la même catégorie sont publiés, liez-les depuis une zone « Explorer les sujets liés ».

Les filtres et la recherche de la page Insights lisent les attributs `data-category` et `data-search` des cartes. Les résultats vides indiquent qu’aucun article de cette catégorie n’est publié.
