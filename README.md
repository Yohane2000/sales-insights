# Sales Insights

Tableau de bord analytique : importez un CSV de ventes, les données sont validées et nettoyées dans le navigateur, puis affichées dans un tableau interactif. Les indicateurs (KPI) et les graphiques arrivent aux étapes suivantes.

> Projet de portfolio — Next.js (App Router), Tailwind CSS, PapaParse.

## Fonctionnalités (étape 1)

- Import d'un fichier CSV par glisser-déposer ou sélecteur, ou chargement d'un jeu de démo
- Détection automatique du séparateur (`,` `;` tabulation)
- En-têtes tolérants (français ou anglais : `prix`/`price`, `ville`/`city`…)
- Nettoyage : doublons, valeurs manquantes, dates invalides, quantités et prix incorrects, formats français (`14/03/2025`, `1 250,50`)
- Rapport de qualité des données (lignes lues, conservées, retirées, raisons)
- Tableau avec recherche, tri par colonne et pagination
- Connexion par e-mail (Supabase Auth) et sauvegarde des jeux de données par utilisateur (Supabase Postgres + RLS)

## Installation

Prérequis : [Node.js](https://nodejs.org) 20 ou plus récent.

```bash
npm install
npm run dev
```

Ouvrez ensuite http://localhost:3000 et cliquez sur « Charger les données de démo ».

Sans configuration Supabase, l'application fonctionne en **mode local** (import, nettoyage et tableau). La connexion et la sauvegarde s'activent une fois Supabase configuré.

## Configurer Supabase (connexion et sauvegarde)

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Ouvrez **SQL Editor > New query**, collez le contenu de `supabase/schema.sql`, puis cliquez sur **Run**. Cela crée les tables `datasets` et `sales` avec la sécurité par utilisateur (RLS).
3. Ouvrez **Project Settings > API** et copiez l'URL du projet et la clé `anon` (publique).
4. Copiez `.env.example` en `.env.local` et collez ces deux valeurs.
5. Relancez `npm run dev`.

Dans **Authentication > Providers > Email**, vous pouvez désactiver « Confirm email » pendant le développement pour vous connecter sans confirmation par e-mail.

## Déployer sur Vercel

1. Poussez le projet sur GitHub.
2. Sur [vercel.com](https://vercel.com), cliquez sur **Add New > Project** et importez le dépôt.
3. Dans **Environment Variables**, ajoutez `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Cliquez sur **Deploy**.
5. Dans Supabase, **Authentication > URL Configuration**, mettez l'adresse Vercel dans **Site URL**.

Chaque `git push` sur la branche principale redéploie automatiquement le site.

## Sécurité

La clé `anon` est publique par conception : la protection des données repose sur les politiques RLS de `supabase/schema.sql`. Ne mettez jamais la clé `service_role` dans le code ni dans les variables `NEXT_PUBLIC_*`.

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Compile pour la production |
| `npm run start` | Lance la version compilée |
| `npm run generate-demo` | Régénère `public/demo-sales.csv` |
| `npm run test:clean` | Vérifie la logique de nettoyage |

## Format du CSV attendu

| Colonne | Exemple |
| --- | --- |
| date | `2025-03-14` ou `14/03/2025` |
| produit | `Riz parfumé 5kg` |
| categorie | `Alimentation` |
| quantite | `3` |
| prix | `3500` |
| ville | `Dakar` |

## Structure

```
app/            pages Next.js (layout, page principale, styles)
components/     FileUploader, DataQualityReport, DataTable, AuthPanel, SavedDatasets
lib/            schema, parseCsv, cleanData, format, supabase, datasets
public/         demo-sales.csv
supabase/       schema.sql (tables et politiques de sécurité)
scripts/        génération des données de démo, tests
```

## Choix techniques

- **Traitement côté navigateur** : les données ne quittent jamais l'ordinateur de l'utilisateur.
- **Logique séparée de l'interface** : `lib/cleanData.js` ne dépend pas de React, ce qui permet de la tester simplement.

## Prochaines étapes

1. KPI : chiffre d'affaires, panier moyen, nombre de ventes
2. Graphiques (Recharts) : évolution, catégories, villes
3. Filtres, export CSV, mode sombre
4. Tests, Lighthouse, déploiement sur Vercel
