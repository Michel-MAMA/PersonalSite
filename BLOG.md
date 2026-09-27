# Publier un article

Le site est statique : les articles sont des pages HTML. Pour en publier un :

1. Copiez `article-modele.html` vers un nouveau fichier, par exemple `article-gouvernance-ia.html`.
2. Remplacez le titre, le résumé, la catégorie, la date, le temps de lecture et le texte entre crochets. Mettez aussi à jour le titre de page et sa description.
3. Dans `blog.html`, dupliquez le bloc `<article class="blog-feature">…</article>`, puis remplacez le lien, le titre, la date, la catégorie et le résumé. Placez le nouvel article en premier.
4. Ouvrez `blog.html` pour vérifier que la carte apparaît et que son lien ouvre le nouvel article.

Le modèle réutilise les styles et la navigation du site. La date affichée doit correspondre à la date réelle de publication.
