# Audit du site — 10 octobre 2026

## Portée et méthode

Revue statique des 24 pages HTML, des sept feuilles de style, des liens internes, des ancres, des métadonnées, des ressources locales, de la configuration Vercel et des fichiers Supabase. Cette revue ne remplace pas une vérification visuelle sur navigateurs réels, un audit Lighthouse ou un essai des flux de réservation et d’e-mail.

## État général

Le site possède une base éditoriale crédible : positionnement Data/IA/Cloud, doctorat, certifications, références clients et plusieurs parcours de conversion. Les pages HTML ont chacune un titre, une description, une URL canonique et un seul H1. Aucun lien de ressource locale ou lien d’ancre vérifié n’est cassé. Les liens externes ouverts dans un nouvel onglet utilisent `noopener`/`noreferrer`. Le sitemap couvre les pages publiques et exclut le modèle d’article.

## Points de friction relevés

1. **Identité visuelle incomplètement monochrome.** Le thème précédent ne remplaçait qu’une partie des couleurs ; des accents subsistaient dans les feuilles spécialisées. Correction : conversion des valeurs colorées des styles vers des gris neutres, sans filtre sur la page entière. Les photos restent en couleur, les logos et badges sont monochromes.
2. **Footer peu structuré.** Les réseaux étaient alignés comme une liste de texte. Correction : zone sombre dédiée « SUIVEZ-MOI », quatre icônes rondes, ligne de contact et adaptation mobile.
3. **Offre coaching difficile à comparer et à réserver.** Correction : trois formules avec prix mensuel et contenu explicites, calendrier de week-end, choix du nombre de séances, contrôle de dix places par créneau collectif et confirmation par e-mail.
4. **Maintenance répétitive.** L’en-tête et le footer sont recopiés dans 24 documents. Une correction globale peut dériver si une page est oubliée. À terme, un générateur de pages ou des fragments partagés réduiraient ce risque sans imposer une refonte de framework.
5. **Publication des fonctionnalités backend.** Les migrations et Edge Functions de contact, blog et coaching sont versionnées dans Git, mais leur présence dans le dépôt ne signifie pas qu’elles sont déployées sur Supabase. Elles doivent être appliquées et déployées, puis les e-mails et la limite de places doivent être vérifiés en conditions réelles.
6. **Validation visuelle restante.** La navigation, les textes alternatifs présents, les ancres et les métadonnées ont été vérifiés dans les sources. Il reste à contrôler les contrastes, le clavier, les vues mobiles/tablettes et la performance avec un navigateur et un outil spécialisé.

## Améliorations appliquées

- Harmonisation monochrome de toutes les feuilles CSS ; photos préservées.
- Typographie système, surfaces sobres, bordures discrètes et coins légèrement arrondis.
- Refonte du footer avec liens accessibles et icônes sociales.
- Offres de coaching lisibles et parcours de demande de réservation.
- README actualisé avec les commandes de déploiement Vercel/Supabase.

## Prochaines étapes prioritaires

1. Déployer `supabase/migrations` et les fonctions `contact-form`, `blog-engagement` et `coaching-booking`.
2. Faire une réservation de test de chaque formule, vérifier l’e-mail administrateur et l’accusé de réception, puis vérifier qu’un créneau collectif bloque à dix réservations.
3. Parcourir les pages sur téléphone et ordinateur, au clavier et avec zoom, puis corriger les éventuels débordements ou contrastes insuffisants.
4. Centraliser header/footer pour éviter leur duplication, puis consolider les pages et contenus proches à partir des données de fréquentation.