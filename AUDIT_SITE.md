# Audit du site — 10 octobre 2026

## Portée et méthode

Revue statique des 24 pages HTML, des sept feuilles de style, des liens internes, des ancres, des métadonnées, des ressources locales, de la configuration Vercel et des fichiers Supabase. Elle ne remplace pas une vérification visuelle sur navigateurs réels, un audit Lighthouse ou un essai des flux e-mail en production.

## État général

Le site possède une base éditoriale crédible : positionnement Data/IA/Cloud, doctorat, certifications, références clients et plusieurs parcours de conversion. Les 24 documents ont chacun un titre, une description, une URL canonique et un seul H1. Aucun lien de ressource locale ou lien d’ancre vérifié n’est cassé. Les liens externes ouverts dans un nouvel onglet utilisent `noopener`/`noreferrer`. Le sitemap référence les pages publiques et exclut le modèle d’article.

## Points de friction et corrections

1. **Palette auparavant incomplètement monochrome.** Des accents subsistaient dans les feuilles spécialisées. Correction : harmonisation des couleurs codées dans les styles vers des gris neutres, sans filtre global. Les photos restent en couleur ; logos et badges sont désaturés.
2. **Footer et navigation répliqués dans 24 pages.** Cela rendait les changements globaux fragiles. Correction : source unique dans `components/site-shell.mjs`, état de navigation généré selon la page, HTML partagé inséré au build.
3. **Dépendance inutile à Google Fonts.** Correction : typographie système pour réduire les requêtes externes et améliorer le premier affichage.
4. **Offre coaching difficile à comparer et à réserver.** Correction : trois forfaits mensuels, calendrier de week-end, choix des séances, limite de dix places pour les créneaux collectifs et courriels via Resend.
5. **Publication des fonctionnalités backend.** Les migrations et fonctions contact/blog/coaching sont versionnées, mais leur présence dans Git ne signifie pas qu’elles sont déployées sur Supabase. Elles doivent être appliquées et déployées, puis les e-mails et la capacité du collectif vérifiés en conditions réelles.
6. **Validation visuelle restante.** La navigation, les textes alternatifs, les ancres et les métadonnées ont été contrôlés dans les sources. Il reste à examiner contrastes, clavier, vues mobiles/tablettes et performance sur navigateur réel.

## Améliorations appliquées

- Charte noir/blanc/gris avec contrastes francs, détails discrets et coins légèrement arrondis.
- Photos préservées en couleur, logos et badges en niveaux de gris.
- Footer social accessible, widget WhatsApp et focus clavier visible.
- Shell partagé généré en HTML statique, sans dépendance de rendu côté client.
- Suppression des requêtes Google Fonts.
- README et commandes de déploiement actualisés.

## Étapes restantes

1. Déployer les migrations et Edge Functions Supabase.
2. Réserver une séance pour chaque formule et vérifier l’e-mail administrateur, l’accusé de réception et la limite de dix personnes.
3. Parcourir le site sur téléphone et ordinateur, au clavier et avec zoom ; corriger les écarts observés.
4. Envisager une consolidation des contenus ou pages proches à partir des statistiques de fréquentation.
## Refactorisation du 11 octobre 2026

- JavaScript séparé en modules ES : interactions communes, contact, blog, réactions et réservation. Les fonctionnalités spécifiques sont chargées à la demande.
- Client Supabase centralisé, avec maintien du multipart pour les pièces jointes.
- Règles de réservation isolées et testées : week-ends, mois, horaires, doublons et répartition sur quatre semaines.
- Navigation : une seule destination exacte porte aria-current, les boutons référencent leur sous-menu et la fermeture synchronise les états accessibles.
- Disponibilités coaching : les réponses obsolètes sont ignorées après modification ou retrait d’un créneau ; les erreurs de validation sont réinitialisées à la modification.
- Build : validation des marqueurs avant remplacement du répertoire dist. Serveur d’aperçu HTTP local sans dépendance.
- Vérifications : neuf tests automatisés, syntaxe JavaScript et liens/ancres/imports des 24 pages générées. Aucun envoi réel aux services Supabase.
- Limite : le navigateur intégré n’a pas démarré (erreur de sandbox Windows). La validation visuelle et les essais backend réels restent à effectuer.

## Parcours et lisibilité — 11 octobre 2026

- Accueil et offres organisés autour de trois besoins : formation en entreprise, formation/reconversion individuelle et coaching carrière.
- Cinq domaines explicités : Data Engineering, AI Engineering, Data & AI Governance, AI Security et Cloud Computing.
- Coaching élargi aux candidatures, entretiens, blocages de progression et trajectoires professionnelles. Tarifs et réservation conservés.
- Menu simplifié, FAQ, textes plus lisibles, champs et commandes adaptés aux écrans tactiles. Choix du parcours transmis au contact sans empêcher les modifications.
- Logos clients présentés en grille fixe ; correction du masquage transparent de l’ancien bandeau et du contraste du footer.
- Validation : douze tests automatisés, build et contrôle des 24 pages, essais dans Edge à 390/768/1440 px sur huit pages ; vérification complémentaire à 320/1024 px des pages d’accueil, contact et coaching. Aucun débordement horizontal observé. Les douze logos sont chargés et visibles.
- Navigation mobile, sélection des formules et contexte de contact vérifiés. Soumission testée avec réponse Supabase simulée, sans envoi réel. Captures inspectées dans .qa/. Modifications locales ; aucun déploiement effectué.
